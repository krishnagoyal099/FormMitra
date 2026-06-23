// src/lib/email/templates/analysis-complete.tsx
// Email sent when AI finishes processing an opportunity and the action plan is ready.

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
import type { SendAnalysisCompleteOptions } from "../nodemailer";

/**
 * Renders the "Analysis Complete" email as a React tree.
 * Resend serializes this component to HTML automatically.
 */
export function AnalysisCompleteEmail({
  userName,
  opportunityTitle,
  opportunityId,
  readinessScore,
}: SendAnalysisCompleteOptions) {
  const appUrl = siteConfig.url;
  const opportunityUrl = `${appUrl}/opportunities/${opportunityId}`;

  const readinessColor =
    readinessScore >= 70 ? "#16a34a" : readinessScore >= 40 ? "#d97706" : "#dc2626";

  return (
    <Html lang="en">
      <Head />
      <Preview>
        {`Your AI action plan for "${opportunityTitle}" is ready — ${readinessScore}% readiness score`}
      </Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
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
            <Heading style={styles.heading}>Your Action Plan is Ready ✅</Heading>

            <Text style={styles.greeting}>Hi {userName},</Text>

            <Text style={styles.paragraph}>
              Our AI has finished analyzing your opportunity. Here is a summary of what
              was prepared for you:
            </Text>

            {/* Opportunity Card */}
            <Section style={styles.card}>
              <Text style={styles.cardLabel}>OPPORTUNITY</Text>
              <Text style={styles.cardTitle}>{opportunityTitle}</Text>
              <Hr style={styles.cardDivider} />
              <Text style={styles.cardLabel}>READINESS SCORE</Text>
              <Text style={{ ...styles.readinessScore, color: readinessColor }}>
                {readinessScore}%
              </Text>
              <Text style={styles.readinessHint}>
                {readinessScore >= 70
                  ? "You are well-prepared. Review the action plan and submit."
                  : readinessScore >= 40
                    ? "A few gaps exist. The action plan will guide you through them."
                    : "Some important documents or criteria are missing. Check your action plan."}
              </Text>
            </Section>

            <Text style={styles.paragraph}>
              Open your personalized action plan to see:
            </Text>
            <Text style={styles.bulletList}>
              ✅ Your eligibility assessment{"\n"}
              📋 A step-by-step action plan{"\n"}
              📄 Missing and matched documents{"\n"}
              ⏰ Key deadlines and milestones
            </Text>

            <Button href={opportunityUrl} style={styles.button}>
              View My Action Plan →
            </Button>
          </Section>

          <Hr style={styles.divider} />

          {/* Footer */}
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              You received this email because you created an opportunity on{" "}
              {siteConfig.name}. If you believe this was a mistake, you can ignore
              this email.
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
// Inline Styles (required for email clients which strip external CSS)
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
  header: {
    background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
    padding: "28px 40px",
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
    margin: "0 0 16px",
  },
  readinessScore: {
    fontSize: "36px",
    fontWeight: "800",
    margin: "0 0 6px",
  },
  readinessHint: {
    color: "#9ca3af",
    fontSize: "13px",
    margin: "0",
    lineHeight: "1.5",
  },
  bulletList: {
    color: "#c4c4d4",
    fontSize: "14px",
    lineHeight: "2",
    margin: "0 0 28px",
    whiteSpace: "pre-line" as const,
  },
  button: {
    backgroundColor: "#6366f1",
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
