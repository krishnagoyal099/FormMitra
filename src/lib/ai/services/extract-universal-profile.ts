// src/lib/ai/services/extract-universal-profile.ts
// ─────────────────────────────────────────────────────────────────────────────
// Universal Profile Extraction Service
//
// Orchestrates the end-to-end flow:
//   1. Fetch all of the user's READY documents and their extractedJson
//   2. Map each document's extractedJson → DocumentContext
//   3. Call ASI:ONE to synthesize them into one Universal Profile
//   4. Save the result to Profile.universalProfile
//
// Called from:
//   - POST /api/ai/extract-universal-profile (on-demand, from Settings page)
//   - Automatically after the last document finishes processing (future cron)
// ─────────────────────────────────────────────────────────────────────────────
import { randomUUID } from "crypto";
import { callAsione } from "../asi-one";
import { UniversalProfileExtractionSchema } from "../schemas";
import { buildUniversalProfilePrompt, type DocumentContext } from "../prompts";
import { PROMPT_VERSION } from "../prompts";
import { prisma } from "@/lib/db/prisma";
import { computeProfileCompletion } from "@/lib/schemas/universal-profile";
import type { ServiceContext } from "./service-context";
import { logger } from "@/lib/logger";

/**
 * Runs the universal profile extraction for a user.
 *
 * @param ctx - Service context containing userId and optional AbortSignal
 * @returns The extracted Universal Profile data
 * @throws Error if the user has no processed documents or if AI call fails
 */
export async function extractUniversalProfileService(ctx: ServiceContext) {
  const { userId, signal } = ctx;

  // ── 1. Fetch all READY documents with their extracted data ─────────────────
  const documents = await prisma.document.findMany({
    where: {
      userId,
      status: "READY",
      deletedAt: null,
      // Only include documents that have been through AI extraction
      extractedJson: { not: null },
    },
    select: {
      id: true,
      category: true,
      extractedJson: true,
      issuingAuthority: true,
      issueDate: true,
    },
    orderBy: { uploadedAt: "desc" },
    take: 20, // Cap at 20 documents — more than enough for any scholarship application
  });

  if (documents.length === 0) {
    throw new Error(
      "No processed documents found. Please upload and process your documents first."
    );
  }

  logger.info({ userId, documentCount: documents.length }, "Starting universal profile extraction");

  // ── 2. Map documents to DocumentContext ────────────────────────────────────
  const docContexts: DocumentContext[] = documents
    .filter((doc) => doc.extractedJson !== null)
    .map((doc) => {
      // extractedJson is stored as { category, documentType, confidence, keyFields, ... }
      const json = doc.extractedJson as Record<string, unknown>;
      return {
        category: doc.category,
        documentType: (json.documentType as string) ?? doc.category,
        // keyFields is the structured field map from the classification/extraction step
        extractedFields: (json.keyFields as Record<string, string>) ?? {},
        issuingAuthority: doc.issuingAuthority,
        issueDate: doc.issueDate?.toISOString().split("T")[0] ?? null,
      };
    });

  // ── 3. Build prompt and call AI ────────────────────────────────────────────
  const { system, user } = buildUniversalProfilePrompt(docContexts);
  const operationId = randomUUID();

  const result = await callAsione(
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    UniversalProfileExtractionSchema,
    {
      operationId,
      temperature: 0.1,       // Low temperature — we want precise, deterministic extraction
      maxTokens: 4096,         // Profile JSON can be large
      jsonMode: true,
      signal,
    }
  );

  // ── 4. Compute completeness percentage ─────────────────────────────────────
  const completionPct = computeProfileCompletion(result.data);

  // ── 5. Persist to Profile.universalProfile ─────────────────────────────────
  await prisma.profile.upsert({
    where: { userId },
    update: {
      universalProfile: result.data as unknown as object,
      profileExtractedAt: new Date(),
    },
    create: {
      userId,
      // Required encrypted fields — use empty placeholders if profile doesn't exist yet.
      // In practice this upsert runs AFTER a profile already exists.
      fullNameEncrypted: Buffer.alloc(0),
      fullNameIv: Buffer.alloc(0),
      dobEncrypted: Buffer.alloc(0),
      dobIv: Buffer.alloc(0),
      phoneEncrypted: Buffer.alloc(0),
      phoneIv: Buffer.alloc(0),
      addressEncrypted: Buffer.alloc(0),
      addressIv: Buffer.alloc(0),
      incomeEncrypted: Buffer.alloc(0),
      incomeIv: Buffer.alloc(0),
      education: {},
      universalProfile: result.data as unknown as object,
      profileExtractedAt: new Date(),
    },
  });

  // ── 6. Audit log ───────────────────────────────────────────────────────────
  await prisma.analysisRun.create({
    data: {
      userId,
      type: "DOC_EXTRACT",
      status: "SUCCESS",
      operationId,
      promptVersion: PROMPT_VERSION,
      model: result.model,
      tokensIn: result.tokensIn,
      tokensOut: result.tokensOut,
      latencyMs: result.latencyMs,
      costUsd: result.costUsd,
      resultJson: { completionPct, confidence: result.data.confidence },
      finishedAt: new Date(),
    },
  }).catch(() => {/* swallow audit failure */});

  logger.info(
    { userId, completionPct, confidence: result.data.confidence, latencyMs: result.latencyMs },
    "Universal profile extraction complete"
  );

  return {
    profile: result.data,
    completionPct,
    documentCount: docContexts.length,
  };
}
