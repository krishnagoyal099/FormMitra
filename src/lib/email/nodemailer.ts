// src/lib/email/nodemailer.ts
// Central email service using Nodemailer with Gmail as the transport.
//
// WHY GMAIL + NODEMAILER:
//   Free public subdomains like .vercel.app cannot be verified for use on
//   dedicated email APIs (Resend, SendGrid, etc.). Gmail's SMTP allows us to
//   send emails to any user in the world using just an App Password, with no
//   custom domain required.
//
// HOW THE TEMPLATE RENDERING WORKS:
//   Nodemailer sends raw HTML strings, not React components. We use
//   `@react-email/render` to convert our existing React Email templates into
//   HTML strings before handing them off to Nodemailer. This keeps all our
//   beautifully designed templates intact with zero changes.

import nodemailer from "nodemailer";
import { render } from "@react-email/render";
import { env } from "@/config/env";
import { logger } from "@/lib/logger";
import { AnalysisCompleteEmail } from "./templates/analysis-complete";
import { DeadlineReminderEmail } from "./templates/deadline-reminder";

// ─────────────────────────────────────────────────────────────────────────────
// Types (identical interface to the old resend.ts — callers don't change)
// ─────────────────────────────────────────────────────────────────────────────

export interface SendAnalysisCompleteOptions {
  /** Recipient's email address. */
  to: string;
  /** User's display name shown in the greeting line of the email. */
  userName: string;
  /** The human-readable title of the opportunity. */
  opportunityTitle: string;
  /** Opportunity database ID used to build the deep-link button. */
  opportunityId: string;
  /** Readiness score (0–100) from the generated action plan. */
  readinessScore: number;
}

export interface SendDeadlineReminderOptions {
  /** Recipient's email address. */
  to: string;
  /** User's display name shown in the greeting line of the email. */
  userName: string;
  /** The human-readable title of the opportunity. */
  opportunityTitle: string;
  /** Opportunity database ID used to build the deep-link button. */
  opportunityId: string;
  /** Human-readable deadline label (e.g., "Application Submission"). */
  deadlineLabel: string;
  /** ISO 8601 date string of the deadline (e.g., "2026-07-15"). */
  deadlineDate: string;
  /** Number of days remaining until the deadline (0 = today). */
  daysRemaining: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Transport (initialized once, reused across all requests)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates a singleton Nodemailer transporter configured for Gmail SMTP.
 * Uses SMTP_USER and SMTP_PASSWORD (a Google App Password, NOT your real
 * Gmail password) from the environment.
 */
function createTransport() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASSWORD,
    },
  });
}

const transporter = createTransport();

// ─────────────────────────────────────────────────────────────────────────────
// Send Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sends the "Your Action Plan is Ready" email.
 * Triggered asynchronously (fire-and-forget via `after()`) after the AI
 * pipeline completes in `analyzeOpportunityAction`.
 */
export async function sendAnalysisCompleteEmail(
  opts: SendAnalysisCompleteOptions
): Promise<void> {
  try {
    // Step 1: Convert the React Email component to a plain HTML string and a plain text string.
    const emailComponent = AnalysisCompleteEmail(opts);
    const html = await render(emailComponent);
    const text = await render(emailComponent, { plainText: true });

    // Step 2: Send the email via Gmail SMTP with both HTML and Text.
    await transporter.sendMail({
      from: `"FormMitra" <${env.SMTP_USER}>`,
      to: opts.to,
      subject: `✅ Your action plan for "${opts.opportunityTitle}" is ready`,
      html,
      text,
    });

    logger.info(
      { to: opts.to, opportunityId: opts.opportunityId },
      "Email: analysis-complete sent via Gmail"
    );
  } catch (err) {
    // Never let an email failure crash the calling server action.
    logger.error({ err, to: opts.to }, "Email: failed to send analysis-complete");
  }
}

/**
 * Sends the "Deadline Approaching" reminder email.
 * Triggered by the daily cron job at `/api/cron/deadlines` when a deadline
 * is 3, 1, or 0 days away.
 */
export async function sendDeadlineReminderEmail(
  opts: SendDeadlineReminderOptions
): Promise<void> {
  try {
    // Step 1: Convert the React Email component to a plain HTML string and a plain text string.
    const emailComponent = DeadlineReminderEmail(opts);
    const html = await render(emailComponent);
    const text = await render(emailComponent, { plainText: true });

    // Step 2: Send the email via Gmail SMTP with both HTML and Text.
    await transporter.sendMail({
      from: `"FormMitra" <${env.SMTP_USER}>`,
      to: opts.to,
      subject: `⏰ Deadline in ${opts.daysRemaining} day${opts.daysRemaining === 1 ? "" : "s"}: ${opts.opportunityTitle}`,
      html,
      text,
    });

    logger.info(
      { to: opts.to, opportunityId: opts.opportunityId },
      "Email: deadline-reminder sent via Gmail"
    );
  } catch (err) {
    logger.error({ err, to: opts.to }, "Email: failed to send deadline-reminder");
  }
}
