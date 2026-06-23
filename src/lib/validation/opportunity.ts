// src/lib/validation/opportunity.ts
import { z } from "zod";

export const OpportunityTypeSchema = z.enum([
  "SCHOLARSHIP", "INTERNSHIP", "ADMISSION", "GOVERNMENT_SCHEME", "VISA", "JOB", "OTHER",
]);

export const OpportunityInputSchema = z.object({
  title: z.string().min(3).max(200),
  type: OpportunityTypeSchema,
  sourceUrl: z.string().url().optional(),
  provider: z.string().max(200).optional(),
  uploadThingKey: z.string().min(1).optional(),
  fileName: z.string().min(1).max(255).optional(),
  fileSize: z.number().int().positive().max(20 * 1024 * 1024).optional(),
  mimeType: z.enum(["application/pdf", "image/png", "image/jpeg"]).optional(),
}).refine((data) => data.uploadThingKey || data.sourceUrl, {
  message: "You must provide either a Document or a Source URL.",
  path: ["sourceUrl"], // The error will be attached to the sourceUrl field
});
export type OpportunityInput = z.infer<typeof OpportunityInputSchema>;