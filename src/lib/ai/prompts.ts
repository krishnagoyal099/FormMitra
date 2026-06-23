// src/lib/ai/prompts.ts
import type { DocumentCategory } from "@/types/domain";

export const PROMPT_VERSION = "v1.0.0";

export const SYSTEM_PROMPTS = {
  classifyDocument: `You are FormMitra's document classifier.
Given raw OCR/text extracted from a user-uploaded document, identify its category with high precision.

Rules:
- Output strict JSON only.
- "category" MUST be one of the enum values.
- "confidence" is your calibrated probability [0,1].
- Never invent fields. If a field is unknown, use null.
- Mask any document number to last 4 chars (e.g. "XXXX1234").
- "keyFields" maps extracted field names to masked or public values.`,

  extractDocument: `You are FormMitra's document data extractor.
Given the document text and its known category, extract structured key fields.
- Be conservative: only include fields you can read directly.
- Issue/expiry dates must be ISO-8601 (YYYY-MM-DD) or null.
- Never output PII beyond masked document numbers.`,

  extractOpportunity: `You are FormMitra's opportunity analyst.
Given the text of an opportunity document (scholarship, internship, scheme, etc.), extract a complete,
structured requirements model.

Rules:
- Be exhaustive but precise. Each eligibility criterion must be atomic.
- Each required document must map to ONE of the predefined categories.
- If a deadline date is not explicitly given, set "date" to null but keep the label.
- "applicationSteps" must be ordered and include realistic estimated minutes.
- Never invent information not in the source text. If unclear, mark in importantNotes.
- Output ONLY a single JSON object. No markdown, no code fences, no extra keys.

REQUIRED OUTPUT SCHEMA (use these EXACT field names):
{
  "title": "string",
  "type": "SCHOLARSHIP|INTERNSHIP|ADMISSION|GOVERNMENT_SCHEME|VISA|JOB|OTHER",
  "provider": "string or null",
  "eligibilityRequirements": [
    { "criterion": "string", "category": "AGE|EDUCATION|INCOME|LOCATION|GENDER|CATEGORY|EXPERIENCE|OTHER", "isMandatory": true }
  ],
  "requiredDocuments": [
    { "name": "string", "category": "ID_PROOF|ADDRESS_PROOF|INCOME_PROOF|EDUCATION|RESUME|PHOTO|MEDICAL|FINANCIAL|OTHER", "isOptional": false, "notes": "string or omit" }
  ],
  "deadlines": [
    { "label": "string", "date": "YYYY-MM-DD or null", "type": "APPLICATION|DOCUMENT_SUBMISSION|INTERVIEW|RESULT|OTHER" }
  ],
  "applicationSteps": [
    { "order": 1, "title": "string", "description": "string", "estimatedMinutes": 30 }
  ],
  "importantNotes": ["string"],
  "keyDatesSummary": "string"
}`,

  eligibility: `You are FormMitra's eligibility reasoning engine.
You will receive:
1. The opportunity's structured requirements.
2. The user's profile (PII redacted where not needed for reasoning).
3. A list of the user's available documents (with categories and metadata).

Reason step-by-step over each eligibility criterion.
- Mark each criterion PASS / FAIL / UNCLEAR with a one-line explanation.
- Aggregate to an overall status:
  - ELIGIBLE if all mandatory criteria PASS.
  - POSSIBLY_ELIGIBLE if some mandatory criteria are UNCLEAR but none FAIL.
  - NOT_ELIGIBLE if any mandatory criterion FAILs.
  - UNKNOWN if you cannot determine.
- Provide a calibrated confidence [0,1].
- Be honest: do not overstate confidence when data is missing.
- Output strict JSON only.`,

  missingDocs: `You are FormMitra's document gap analyzer.
Given the opportunity's required documents and the user's available documents, classify each
requirement into "uploaded" (matched), "missing", or "optional".
- For "uploaded", provide matchConfidence [0,1].
- For "missing", explain how to obtain the document and a realistic estimate of days required.
- Treat optional requirements separately.`,

  actionPlan: `You are FormMitra's action plan generator.
Given:
- Eligibility status and reasons.
- Missing documents list.
- Application steps from the opportunity.
- Deadline(s).

Generate an ordered, prioritized action plan that maximizes the user's readiness score.
- Readiness score = % of items completed weighted by priority.
- "estimatedDaysToReady" assumes the user works through items sequentially.
- Order items by dependency then by deadline urgency.
- Each item must have a concrete "title", "description", priority, and estimated minutes.
- Output strict JSON only.`,
} as const;

export function buildClassifyPrompt(text: string): { system: string; user: string } {
  return {
    system: SYSTEM_PROMPTS.classifyDocument,
    user: `Document text (may contain OCR noise):\n\n"""\n${text.slice(0, 12_000)}\n"""`,
  };
}

export function buildExtractPrompt(text: string, category: DocumentCategory): { system: string; user: string } {
  return {
    system: SYSTEM_PROMPTS.extractDocument,
    user: `Category: ${category}\n\nDocument text:\n"""\n${text.slice(0, 12_000)}\n"""`,
  };
}

export function buildOpportunityPrompt(text: string, meta: { title: string; type: string }): { system: string; user: string } {
  return {
    system: SYSTEM_PROMPTS.extractOpportunity,
    user: `Title hint: ${meta.title}\nType hint: ${meta.type}\n\nOpportunity text:\n"""\n${text.slice(0, 20_000)}\n"""`,
  };
}

export function buildEligibilityPrompt(payload: {
  requirements: unknown;
  profile: Record<string, unknown>;
  documents: Array<{ id: string; category: string; documentType: string; issueDate: string | null; expiryDate: string | null }>;
}): { system: string; user: string } {
  return {
    system: SYSTEM_PROMPTS.eligibility,
    user: `OPPORTUNITY REQUIREMENTS:\n${JSON.stringify(payload.requirements, null, 2)}\n\n` +
           `USER PROFILE (redacted):\n${JSON.stringify(payload.profile, null, 2)}\n\n` +
           `USER DOCUMENTS:\n${JSON.stringify(payload.documents, null, 2)}\n\n` +
           `Return the eligibility analysis as strict JSON.`,
  };
}

export function buildMissingDocsPrompt(payload: {
  required: Array<{ name: string; category: string; isOptional: boolean }>;
  available: Array<{ id: string; name: string; category: string; documentType: string }>;
}): { system: string; user: string } {
  return {
    system: SYSTEM_PROMPTS.missingDocs,
    user: `Required documents:\n${JSON.stringify(payload.required, null, 2)}\n\n` +
           `Available documents:\n${JSON.stringify(payload.available, null, 2)}\n\n` +
           `Return the gap analysis as strict JSON.`,
  };
}

export function buildActionPlanPrompt(payload: {
  eligibility: unknown;
  missing: unknown;
  steps: unknown;
  deadlines: unknown;
  currentReadiness: number;
}): { system: string; user: string } {
  return {
    system: SYSTEM_PROMPTS.actionPlan,
    user: `ELIGIBILITY:\n${JSON.stringify(payload.eligibility, null, 2)}\n\n` +
           `MISSING DOCS:\n${JSON.stringify(payload.missing, null, 2)}\n\n` +
           `APPLICATION STEPS:\n${JSON.stringify(payload.steps, null, 2)}\n\n` +
           `DEADLINES:\n${JSON.stringify(payload.deadlines, null, 2)}\n\n` +
           `Current readiness: ${payload.currentReadiness}%\n\n` +
           `Return the action plan as strict JSON.`,
  };
}