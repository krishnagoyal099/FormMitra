// src/lib/email/templates/deadline-reminder.tsx
// Email sent by the daily cron job when a deadline is approaching (≤ 3 days away).

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";
import { siteConfig } from "@/config/site";
import type { SendDeadlineReminderOptions } from "../nodemailer";

/**
 * Renders the "Deadline Approaching" reminder email as a React tree.
 * Resend serializes this component to HTML automatically.
 */
export function DeadlineReminderEmail({
  userName,
  opportunityTitle,
  opportunityId,
  deadlineLabel,
  deadlineDate,
  daysRemaining,
}: SendDeadlineReminderOptions) {
  const appUrl = siteConfig.url;
  const opportunityUrl = `${appUrl}/opportunities/${opportunityId}`;

  const formattedDate = new Date(deadlineDate).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const urgencyColor =
    daysRemaining <= 1 ? "#ef4444" : daysRemaining <= 2 ? "#f97316" : "#eab308";

  const urgencyLabel =
    daysRemaining === 0
      ? "TODAY"
      : daysRemaining === 1
        ? "TOMORROW"
        : `IN ${daysRemaining} DAYS`;

  return (
    <Html lang="en">
      <Head />
      <Preview>
        ⏰ Deadline {urgencyLabel.toLowerCase()} — {deadlineLabel} for{" "}
        {opportunityTitle}
      </Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Urgency Banner */}
          <Section style={{ ...styles.urgencyBanner, backgroundColor: urgencyColor }}>
            <Text style={styles.urgencyText}>⏰ DEADLINE {urgencyLabel}</Text>
          </Section>

          {/* Header */}
          <Section style={styles.header}>
            <table width="100%" cellPadding="0" cellSpacing="0" border={0}>
              <tr>
                <td align="left" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <Img
                    src={`${appUrl}/logo.svg`}
                    width="32"
                    height="32"
                    alt={`${siteConfig.name} logo`}
                    style={{ filter: "brightness(0) invert(1)" }}
                  />
                  <Text style={styles.logo}>{siteConfig.name}</Text>
                </td>
              </tr>
            </table>
          </Section>

          {/* Main Content */}
          <Section style={styles.content}>
            <Heading style={styles.heading}>
              Don&apos;t miss your deadline
            </Heading>

            <Text style={styles.greeting}>Hi {userName},</Text>

            <Text style={styles.paragraph}>
              You have a critical deadline coming up for one of your opportunities.
              Make sure you are prepared and have all required documents ready.
            </Text>

            {/* Deadline Card */}
            <Section style={styles.card}>
              <Text style={styles.cardLabel}>OPPORTUNITY</Text>
              <Text style={styles.cardTitle}>{opportunityTitle}</Text>
              <Hr style={styles.cardDivider} />

              <Section style={styles.deadlineRow}>
                <Section style={styles.deadlineLeft}>
                  <Text style={styles.cardLabel}>DEADLINE TYPE</Text>
                  <Text style={styles.deadlineType}>{deadlineLabel}</Text>
                </Section>
                <Section style={styles.deadlineRight}>
                  <Text style={styles.cardLabel}>TIME REMAINING</Text>
                  <Text style={{ ...styles.daysCount, color: urgencyColor }}>
                    {daysRemaining === 0
                      ? "Today!"
                      : daysRemaining === 1
                        ? "1 day"
                        : `${daysRemaining} days`}
                  </Text>
                </Section>
              </Section>

              <Hr style={styles.cardDivider} />
              <Text style={styles.cardLabel}>DATE</Text>
              <Text style={styles.dateText}>{formattedDate}</Text>
            </Section>

            <Text style={styles.paragraph}>
              Head to your opportunity dashboard to review your action plan and
              ensure nothing has been missed before the deadline.
            </Text>

            <Button href={opportunityUrl} style={styles.button}>
              Review My Action Plan →
            </Button>
          </Section>

          <Hr style={styles.divider} />

          {/* Footer */}
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              You received this reminder because you have an active opportunity on{" "}
              {siteConfig.name}. Deadline reminders are sent 3 days, 1 day, and on
              the day of the deadline.
            </Text>
            <Text style={styles.footerText}>
              © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Inline Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = {
  body: {
    backgroundColor: "#0f0f12",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', sans-serif",
    margin: "0",
    padding: "0",
  },
  container: {
    backgroundColor: "#1a1a24",
    borderRadius: "12px",
    margin: "40px auto",
    maxWidth: "580px",
    overflow: "hidden",
    border: "1px solid #2a2a38",
  },
  urgencyBanner: {
    padding: "10px 40px",
    textAlign: "center" as const,
  },
  urgencyText: {
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: "700",
    letterSpacing: "0.1em",
    margin: "0",
  },
  header: {
    background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
    padding: "24px 40px",
  },
  logo: {
    color: "#ffffff",
    fontSize: "22px",
    fontWeight: "700",
    margin: "0",
  },
  content: {
    padding: "40px",
  },
  heading: {
    color: "#f4f4f8",
    fontSize: "24px",
    fontWeight: "700",
    lineHeight: "1.3",
    margin: "0 0 16px",
  },
  greeting: {
    color: "#a1a1b0",
    fontSize: "16px",
    margin: "0 0 12px",
  },
  paragraph: {
    color: "#c4c4d4",
    fontSize: "15px",
    lineHeight: "1.6",
    margin: "0 0 20px",
  },
  card: {
    backgroundColor: "#24243a",
    borderRadius: "10px",
    border: "1px solid #3a3a50",
    padding: "24px",
    margin: "0 0 24px",
  },
  cardLabel: {
    color: "#6b7280",
    fontSize: "11px",
    fontWeight: "600",
    letterSpacing: "0.08em",
    margin: "0 0 4px",
    textTransform: "uppercase" as const,
  },
  cardTitle: {
    color: "#f4f4f8",
    fontSize: "17px",
    fontWeight: "600",
    margin: "0 0 16px",
    lineHeight: "1.4",
  },
  cardDivider: {
    borderColor: "#3a3a50",
    margin: "12px 0",
  },
  deadlineRow: {
    margin: "0",
  },
  deadlineLeft: {
    display: "inline-block" as unknown as undefined,
    verticalAlign: "top" as const,
    width: "50%",
  },
  deadlineRight: {
    display: "inline-block" as unknown as undefined,
    verticalAlign: "top" as const,
    width: "50%",
  },
  deadlineType: {
    color: "#f4f4f8",
    fontSize: "15px",
    fontWeight: "600",
    margin: "0",
  },
  daysCount: {
    fontSize: "24px",
    fontWeight: "800",
    margin: "0",
  },
  dateText: {
    color: "#f4f4f8",
    fontSize: "15px",
    fontWeight: "500",
    margin: "0",
  },
  button: {
    backgroundColor: "#4f46e5",
    borderRadius: "8px",
    color: "#ffffff",
    display: "block",
    fontSize: "15px",
    fontWeight: "600",
    padding: "14px 28px",
    textAlign: "center" as const,
    textDecoration: "none",
  },
  divider: {
    borderColor: "#2a2a38",
    margin: "0",
  },
  footer: {
    padding: "24px 40px",
  },
  footerText: {
    color: "#6b7280",
    fontSize: "12px",
    lineHeight: "1.6",
    margin: "0 0 4px",
  },
};
