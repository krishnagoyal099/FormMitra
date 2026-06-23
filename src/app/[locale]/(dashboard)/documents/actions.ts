// src/app/(dashboard)/documents/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { unstable_after as after } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/rate-limit/redis";
import { classifyDocumentService } from "@/lib/ai/services/classify-document";
import { extractDocumentService } from "@/lib/ai/services/extract-document";
import { computeSHA256 } from "@/lib/files/hash";
import { DocumentUploadAckSchema } from "@/lib/validation/document";
import { logger } from "@/lib/logger";
import { fetchUploadThingFile } from "@/lib/storage/server";
import { extractTextFromFile } from "@/lib/files/extract-text";
import { createErrorResult, createSuccessResult, type ActionResult } from "@/lib/utils/action";

const UploadDocSchema = DocumentUploadAckSchema.extend({
  category: z.string().optional(), // optional hint
});

export async function registerDocumentAction(
  input: z.infer<typeof UploadDocSchema>
): Promise<ActionResult<{ documentId: string; status: string }>> {
  const user = await requireUser();
  const rl = await checkRateLimit("write", `register-doc:${user.id}`);
  if (!rl.success) return createErrorResult("RATE_LIMITED", "Too many uploads. Try again shortly.");

  const parsed = UploadDocSchema.safeParse(input);
  if (!parsed.success) {
    return createErrorResult("VALIDATION", "Invalid upload payload.", parsed.error.issues);
  }
  const { uploadThingKey, fileName, fileSize, mimeType } = parsed.data;

  try {
    // Fetch file → hash → dedupe
    const fileBuffer = await fetchUploadThingFile(uploadThingKey);
    const contentHash = computeSHA256(fileBuffer);

    const existing = await prisma.document.findFirst({
      where: { contentHash, userId: user.id, deletedAt: null },
      select: { id: true },
    });
    if (existing) {
      return createSuccessResult({ documentId: existing.id, status: "DEDUPED" });
    }

    const doc = await prisma.document.create({
      data: {
        userId: user.id,
        fileName,
        fileSize,
        fileType: mimeType === "application/pdf" ? "PDF" : mimeType === "image/png" ? "PNG" : "JPG",
        mimeType,
        uploadThingKey,
        storagePath: `users/${user.id}/${contentHash}`,
        contentHash,
        status: "PROCESSING",
      },
    });

    // Fire processing pipeline (safely detached via after)
    after(() => {
      processDocument(doc.id, fileBuffer).catch((err) => {
        logger.error({ err, docId: doc.id }, "Document processing failed");
      });
    });

    revalidatePath("/documents");
    return createSuccessResult({ documentId: doc.id, status: "PROCESSING" });
  } catch (err) {
    logger.error({ err, userId: user.id }, "registerDocumentAction failed");
    return createErrorResult("INTERNAL", "Failed to register document.");
  }
}

async function processDocument(documentId: string, fileBuffer: Buffer) {
  const doc = await prisma.document.findUniqueOrThrow({ where: { id: documentId } });

  try {
    const extractedText = await extractTextFromFile(fileBuffer, doc.mimeType);
    if (!extractedText || extractedText.trim().length < 20) {
      await prisma.document.update({
        where: { id: documentId },
        data: { status: "FAILED", failedReason: "Insufficient extractable text" },
      });
      return;
    }

    const classification = await classifyDocumentService(extractedText, { userId: doc.userId });
    const extraction = await extractDocumentService(extractedText, classification.category as import("@prisma/client").DocumentCategory);

    await prisma.document.update({
      where: { id: documentId },
      data: {
        extractedText,
        extractedJson: { classification, extraction } as unknown as object,
        category: classification.category as import("@prisma/client").DocumentCategory,
        categoryConfidence: classification.confidence,
        issuingAuthority: classification.issuingAuthority,
        issueDate: classification.issueDate ? new Date(classification.issueDate) : null,
        expiryDate: classification.expiryDate ? new Date(classification.expiryDate) : null,
        documentNumber: extraction.documentNumberMasked,
        status: "READY",
        processedAt: new Date(),
      },
    });
  } catch (err) {
    logger.error({ err, documentId }, "processDocument failed");
    await prisma.document.update({
      where: { id: documentId },
      data: { status: "FAILED", failedReason: (err as Error).message },
    });
  }
}
