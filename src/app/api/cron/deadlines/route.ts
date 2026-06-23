// src/app/api/cron/deadlines/route.ts
// Secure API route triggered daily by Vercel Cron to send deadline reminder emails.
//
// Security: Vercel automatically sets the `Authorization: Bearer <CRON_SECRET>`
// header on every cron invocation. We reject any request that lacks it.
//
// Cron schedule: Configured in vercel.json (runs daily at 08:00 UTC).

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logger";
import { sendDeadlineReminderEmail } from "@/lib/email/nodemailer";
import { env } from "@/config/env";

// The number of days ahead we want to alert the user.
// e.g. [3, 1, 0] will send reminders 3 days before, 1 day before, and on the day itself.
const REMINDER_THRESHOLDS_DAYS = [3, 1, 0];

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest): Promise<NextResponse> {
  // ── 1. Authorization check ────────────────────────────────────────────────
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    logger.warn("Cron: unauthorized request to /api/cron/deadlines");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── 2. Fetch all active, analyzed opportunities ───────────────────────────
  const opportunities = await prisma.opportunity.findMany({
    where: {
      status: "ANALYZED",
      deletedAt: null,
      deadlines: { not: undefined }, // has extracted deadlines JSON
    },
    select: {
      id: true,
      title: true,
      deadlines: true,
      user: {
        select: { email: true, name: true },
      },
    },
  });

  logger.info({ count: opportunities.length }, "Cron: checking deadlines for opportunities");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let emailsSent = 0;
  let errors = 0;

  // ── 3. Iterate and check each opportunity's deadlines ────────────────────
  for (const opp of opportunities) {
    // The `deadlines` field is stored as JSON (unknown[]) in the DB.
    const deadlines = opp.deadlines as Array<{
      label: string;
      date: string | null;
      type: string;
    }>;

    if (!Array.isArray(deadlines) || deadlines.length === 0) continue;

    for (const deadline of deadlines) {
      // Skip if there is no parseable date.
      if (!deadline.date) continue;

      const deadlineDate = new Date(deadline.date);
      if (isNaN(deadlineDate.getTime())) continue;
      deadlineDate.setHours(0, 0, 0, 0);

      // Calculate how many days away the deadline is.
      const msPerDay = 1000 * 60 * 60 * 24;
      const daysRemaining = Math.round(
        (deadlineDate.getTime() - today.getTime()) / msPerDay
      );

      // Only send if this exact day is one of our thresholds and the deadline hasn't passed.
      if (!REMINDER_THRESHOLDS_DAYS.includes(daysRemaining)) continue;

      try {
        await sendDeadlineReminderEmail({
          to: opp.user.email,
          userName: opp.user.name ?? opp.user.email,
          opportunityTitle: opp.title,
          opportunityId: opp.id,
          deadlineLabel: deadline.label,
          deadlineDate: deadline.date,
          daysRemaining,
        });
        emailsSent++;
      } catch (err) {
        errors++;
        logger.error(
          { err, opportunityId: opp.id, to: opp.user.email },
          "Cron: failed to send deadline reminder"
        );
      }
    }
  }

  logger.info({ emailsSent, errors }, "Cron: deadline check complete");

  return NextResponse.json({
    ok: true,
    opportunitiesChecked: opportunities.length,
    emailsSent,
    errors,
  });
}
