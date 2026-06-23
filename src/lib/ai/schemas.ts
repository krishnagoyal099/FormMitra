// src/lib/ai/schemas.ts  — ASI:ONE output contracts
import { z } from "zod";

export const ClassifiedDocumentSchema = z.object({
  category: z.enum([
    "ID_PROOF", "ADDRESS_PROOF", "INCOME_PROOF", "EDUCATION",
    "RESUME", "PHOTO", "MEDICAL", "FINANCIAL", "OTHER",
  ]).catch("OTHER"),
  documentType: z.string().catch("Unknown"),     // e.g. "Aadhaar Card", "PAN Card"
  confidence: z.number().min(0).max(1).catch(0.5),
  issuingAuthority: z.string().nullable().catch(null),
  issueDate: z.string().nullable().catch(null),   // ISO
  expiryDate: z.string().nullable().catch(null),
  documentNumberMasked: z.string().nullable().catch(null),
  keyFields: z.record(z.string(), z.string()).catch({}),
  warnings: z.array(z.string()).catch([]),
});
export type ClassifiedDocument = z.infer<typeof ClassifiedDocumentSchema>;

export const OpportunityRequirementsSchema = z.object({
  title: z.string(),
  type: z.enum(["SCHOLARSHIP","INTERNSHIP","ADMISSION","GOVERNMENT_SCHEME","VISA","JOB","OTHER"]).catch("OTHER"),
  provider: z.string().nullable().catch(null),
  eligibilityRequirements: z.array(z.object({
    criterion: z.string(),
    category: z.enum(["AGE","EDUCATION","INCOME","LOCATION","GENDER","CATEGORY","EXPERIENCE","OTHER"]).catch("OTHER"),
    isMandatory: z.boolean().catch(true),
  })),
  requiredDocuments: z.array(z.object({
    name: z.string(),
    category: z.enum(["ID_PROOF","ADDRESS_PROOF","INCOME_PROOF","EDUCATION","RESUME","PHOTO","MEDICAL","FINANCIAL","OTHER"]).catch("OTHER"),
    isOptional: z.boolean().catch(false),
    notes: z.string().optional().catch(undefined),
  })),
  deadlines: z.array(z.object({
    label: z.string(),
    date: z.string().nullable().catch(null),
    type: z.enum(["APPLICATION","DOCUMENT_SUBMISSION","INTERVIEW","RESULT","OTHER"]).catch("OTHER"),
  })),
  applicationSteps: z.array(z.object({
    order: z.number().int().catch(0),
    title: z.string(),
    description: z.string(),
    estimatedMinutes: z.number().int().min(0).catch(0),
  })),
  importantNotes: z.array(z.string()).catch([]),
  keyDatesSummary: z.string().catch(""),
});
export type OpportunityRequirements = z.infer<typeof OpportunityRequirementsSchema>;

export const EligibilityResultSchema = z.object({
  status: z.enum(["ELIGIBLE","POSSIBLY_ELIGIBLE","NOT_ELIGIBLE","UNKNOWN"]).catch("UNKNOWN"),
  confidence: z.number().min(0).max(1).catch(0.5),
  matchedCriteria: z.array(z.string()).catch([]),
  unmatchedCriteria: z.array(z.string()).catch([]),
  missingInformation: z.array(z.string()).catch([]),
  reasons: z.array(z.object({
    criterion: z.string().catch("Unknown"),
    verdict: z.enum(["PASS","FAIL","UNCLEAR"]).catch("UNCLEAR"),
    explanation: z.string().catch(""),
  })),
  warnings: z.array(z.string()).catch([]),
  recommendations: z.array(z.string()).catch([]),
});
export type EligibilityResult = z.infer<typeof EligibilityResultSchema>;

export const MissingDocsResultSchema = z.object({
  uploaded: z.array(z.object({
    requirement: z.string().catch(""),
    documentId: z.string().catch(""),
    documentName: z.string().catch(""),
    matchConfidence: z.number().min(0).max(1).catch(0),
  })),
  missing: z.array(z.object({
    requirement: z.string().catch(""),
    category: z.string().catch("OTHER"),
    howToObtain: z.string().catch(""),
    estimatedDays: z.number().int().min(0).catch(0),
    isOptional: z.boolean().catch(false),
  })),
  optional: z.array(z.object({
    requirement: z.string().catch(""),
    description: z.string().catch(""),
  })),
});
export type MissingDocsResult = z.infer<typeof MissingDocsResultSchema>;

export const ActionPlanResultSchema = z.object({
  readinessScore: z.number().int().min(0).max(100).catch(0),
  estimatedDaysToReady: z.number().int().min(0).catch(0),
  summary: z.string().catch(""),
  items: z.array(z.object({
    order: z.number().int().catch(0),
    title: z.string().catch("Task"),
    description: z.string().catch(""),
    priority: z.enum(["CRITICAL","HIGH","MEDIUM","LOW"]).catch("MEDIUM"),
    estimatedMinutes: z.number().int().min(0).catch(0),
    category: z.enum(["DOCUMENT","PROFILE","VERIFICATION","SUBMISSION","FOLLOW_UP"]).catch("DOCUMENT"),
  })),
});
export type ActionPlanResult = z.infer<typeof ActionPlanResultSchema>;