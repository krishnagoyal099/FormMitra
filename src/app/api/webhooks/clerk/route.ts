// src/app/api/webhooks/clerk/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// POST /api/webhooks/clerk
//
// Receives user lifecycle events from Clerk and syncs them to the Prisma DB.
// Currently handled events:
//   - user.created  → creates the Prisma User row (Clerk userId is the PK)
//   - user.updated  → updates email/name if they change in Clerk
//   - user.deleted  → soft-deletes the Prisma User row
//
// Auth: Verified by svix HMAC signature using CLERK_WEBHOOK_SECRET.
//       This endpoint is intentionally excluded from Clerk session middleware
//       (see middleware.ts — isPublicApiRoute).
// ─────────────────────────────────────────────────────────────────────────────
import { Webhook } from "svix";
import { headers } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logger";

/** Shape of Clerk's user.* webhook event data (relevant fields only). */
interface ClerkUserEventData {
  id: string;
  email_addresses: Array<{
    email_address: string;
    verification: { status: string } | null;
  }>;
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
}

interface ClerkWebhookEvent {
  type: "user.created" | "user.updated" | "user.deleted";
  data: ClerkUserEventData;
}

/**
 * Extracts the primary (verified or first) email from Clerk's email_addresses array.
 */
function getPrimaryEmail(data: ClerkUserEventData): string {
  const verified = data.email_addresses.find(
    (e) => e.verification?.status === "verified"
  );
  return (verified ?? data.email_addresses[0])?.email_address ?? "";
}

/**
 * Builds a display name from Clerk's first_name + last_name fields.
 */
function getDisplayName(data: ClerkUserEventData): string | null {
  const parts = [data.first_name, data.last_name].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : null;
}

export async function POST(req: Request): Promise<Response> {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    logger.error("CLERK_WEBHOOK_SECRET is not set — webhook cannot be verified");
    return new Response("Webhook secret not configured", { status: 500 });
  }

  // ── 1. Read and verify the webhook signature ───────────────────────────────
  const rawBody = await req.text();
  const headerList = await headers();

  const svixHeaders = {
    "svix-id": headerList.get("svix-id") ?? "",
    "svix-timestamp": headerList.get("svix-timestamp") ?? "",
    "svix-signature": headerList.get("svix-signature") ?? "",
  };

  let event: ClerkWebhookEvent;
  try {
    const wh = new Webhook(webhookSecret);
    event = wh.verify(rawBody, svixHeaders) as ClerkWebhookEvent;
  } catch (err) {
    logger.warn({ err }, "Clerk webhook signature verification failed");
    return new Response("Invalid webhook signature", { status: 400 });
  }

  // ── 2. Handle each event type ─────────────────────────────────────────────
  const { type, data } = event;
  const clerkId = data.id;

  try {
    if (type === "user.created") {
      const email = getPrimaryEmail(data);
      if (!email) {
        logger.warn({ clerkId }, "user.created event has no email — skipping");
        return new Response("OK", { status: 200 });
      }

      await prisma.user.create({
        data: {
          id: clerkId,           // Clerk userId IS the Prisma primary key
          email: email.toLowerCase(),
          name: getDisplayName(data),
          image: data.image_url,
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: clerkId,
          action: "USER_REGISTERED",
          entity: "User",
          entityId: clerkId,
          metadata: { source: "clerk_webhook" },
        },
      });

      logger.info({ clerkId, email }, "New user synced from Clerk");
    }

    if (type === "user.updated") {
      const email = getPrimaryEmail(data);
      await prisma.user.update({
        where: { id: clerkId },
        data: {
          ...(email ? { email: email.toLowerCase() } : {}),
          name: getDisplayName(data),
          image: data.image_url,
        },
      });
      logger.info({ clerkId }, "User updated from Clerk");
    }

    if (type === "user.deleted") {
      // Soft-delete to preserve referential integrity (documents, opportunities, etc.)
      await prisma.user.update({
        where: { id: clerkId },
        data: { deletedAt: new Date() },
      });
      logger.info({ clerkId }, "User soft-deleted from Clerk");
    }
  } catch (err) {
    logger.error({ err, clerkId, type }, "Clerk webhook DB operation failed");
    // Return 500 so Clerk will retry the webhook
    return new Response("Internal Server Error", { status: 500 });
  }

  return new Response("OK", { status: 200 });
}
