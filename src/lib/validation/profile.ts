// src/lib/validation/profile.ts
import { z } from "zod";

export const EducationEntrySchema = z.object({
  level: z.enum(["SECONDARY", "HIGHER_SECONDARY", "DIPLOMA", "BACHELORS", "MASTERS", "DOCTORAL"]),
  institution: z.string().min(1).max(200),
  board: z.string().max(100).optional(),
  startYear: z.number().int().min(1950).max(new Date().getFullYear() + 1),
  endYear: z.number().int().min(1950).max(new Date().getFullYear() + 5),
  percentage: z.number().min(0).max(100).optional(),
  gpa: z.number().min(0).max(10).optional(),
  fieldOfStudy: z.string().max(100).optional(),
});

export const ProfileInputSchema = z.object({
  fullName: z.string().min(2).max(120).regex(/^[\p{L}\s.'-]+$/u),
  dob: z.string().refine((d) => !isNaN(Date.parse(d)) && new Date(d) < new Date(), "Invalid DOB"),
  email: z.string().email(),
  phone: z.string().regex(/^\+?[0-9]{10,15}$/, "Invalid phone"),
  address: z.string().min(5).max(500),
  income: z.number().int().min(0).max(1_000_000_000),
  education: z.array(EducationEntrySchema).max(10).optional().default([]),
});
export type ProfileInput = z.infer<typeof ProfileInputSchema>;