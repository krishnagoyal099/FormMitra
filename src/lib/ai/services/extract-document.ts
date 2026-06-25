// src/lib/ai/services/extract-document.ts
import { randomUUID } from "crypto";
import { callAsione } from "../asi-one";
import { ClassifiedDocumentSchema, type ClassifiedDocument } from "../schemas";
import { buildExtractPrompt } from "../prompts";
import type { DocumentCategory } from "@/types/domain";

export async function extractDocumentService(text: string, category: DocumentCategory) {
  const { system, user } = buildExtractPrompt(text, category);
  const result = await callAsione<ClassifiedDocument>(
    [{ role: "system", content: system }, { role: "user", content: user }],
    ClassifiedDocumentSchema,
    { operationId: randomUUID(), temperature: 0.1, maxTokens: 1024 }
  );
  return result.data;
}
