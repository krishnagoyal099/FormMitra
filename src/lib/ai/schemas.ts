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

// ─────────────────────────────────────────────────────────────────────────────
// UNIVERSAL PROFILE EXTRACTION — AI output schema for Chrome Extension auto-fill
// ─────────────────────────────────────────────────────────────────────────────
// The AI synthesizes data from ALL of a user's uploaded documents and returns
// this flat, structured object. It is stored as `Profile.universalProfile`
// and served to the Chrome Extension via GET /api/extension/profile.
// All fields use .catch(null) so partial outputs are valid — we never want
// a single missing field to cause the entire extraction to fail.
export const UniversalProfileExtractionSchema = z.object({
  // Personal
  fullName: z.string().nullable().catch(null),
  firstName: z.string().nullable().catch(null),
  middleName: z.string().nullable().catch(null),
  lastName: z.string().nullable().catch(null),
  dateOfBirth: z.string().nullable().catch(null),      // ISO: "YYYY-MM-DD"
  birthYear: z.string().nullable().catch(null),
  birthMonth: z.string().nullable().catch(null),
  birthDay: z.string().nullable().catch(null),
  gender: z.enum(["MALE","FEMALE","OTHER","PREFER_NOT_TO_SAY"]).nullable().catch(null),
  nationality: z.string().nullable().catch(null),
  religion: z.string().nullable().catch(null),

  // Caste & Category
  casteCategory: z.enum(["GENERAL","OBC","SC","ST","EWS","OTHER"]).nullable().catch(null),
  casteName: z.string().nullable().catch(null),
  isSpecialCategory: z.boolean().nullable().catch(null),
  specialCategoryLabel: z.string().nullable().catch(null),

  // Contact
  mobileNumber: z.string().nullable().catch(null),
  alternateMobile: z.string().nullable().catch(null),
  emailAddress: z.string().nullable().catch(null),

  // Permanent Address
  permanentAddressLine1: z.string().nullable().catch(null),
  permanentAddressLine2: z.string().nullable().catch(null),
  permanentVillage: z.string().nullable().catch(null),
  permanentCity: z.string().nullable().catch(null),
  permanentTaluka: z.string().nullable().catch(null),
  permanentDistrict: z.string().nullable().catch(null),
  permanentState: z.string().nullable().catch(null),
  permanentPincode: z.string().nullable().catch(null),
  permanentCountry: z.string().nullable().catch(null),

  // Current Address
  isSameAsPermanent: z.boolean().nullable().catch(null),
  currentAddressLine1: z.string().nullable().catch(null),
  currentAddressLine2: z.string().nullable().catch(null),
  currentVillage: z.string().nullable().catch(null),
  currentCity: z.string().nullable().catch(null),
  currentTaluka: z.string().nullable().catch(null),
  currentDistrict: z.string().nullable().catch(null),
  currentState: z.string().nullable().catch(null),
  currentPincode: z.string().nullable().catch(null),

  // Family
  fatherName: z.string().nullable().catch(null),
  fatherOccupation: z.string().nullable().catch(null),
  fatherMobile: z.string().nullable().catch(null),
  motherName: z.string().nullable().catch(null),
  motherOccupation: z.string().nullable().catch(null),
  motherMobile: z.string().nullable().catch(null),
  guardianName: z.string().nullable().catch(null),
  guardianRelation: z.string().nullable().catch(null),
  annualFamilyIncome: z.number().nullable().catch(null),
  familySize: z.number().int().nullable().catch(null),

  // IDs — Aadhaar MUST be returned masked. Full Aadhaar must never appear.
  aadhaarMasked: z.string().nullable().catch(null),    // "XXXX-XXXX-1234"
  panNumber: z.string().nullable().catch(null),
  samagraId: z.string().nullable().catch(null),
  voterIdMasked: z.string().nullable().catch(null),
  domicileNumber: z.string().nullable().catch(null),
  casteCertificateNumber: z.string().nullable().catch(null),
  incomeCertificateNumber: z.string().nullable().catch(null),

  // Bank
  bankName: z.string().nullable().catch(null),
  bankAccountNumber: z.string().nullable().catch(null),
  bankIfscCode: z.string().nullable().catch(null),
  bankBranchName: z.string().nullable().catch(null),
  bankAccountHolderName: z.string().nullable().catch(null),
  bankAccountType: z.string().nullable().catch(null),
  bankMicrCode: z.string().nullable().catch(null),

  // Academic
  currentInstitutionName: z.string().nullable().catch(null),
  currentInstitutionCode: z.string().nullable().catch(null),
  currentInstitutionDistrict: z.string().nullable().catch(null),
  currentInstitutionState: z.string().nullable().catch(null),
  currentCourseName: z.string().nullable().catch(null),
  currentCourseType: z.string().nullable().catch(null),
  currentCourseYear: z.string().nullable().catch(null),
  currentAcademicYear: z.string().nullable().catch(null),
  currentAdmissionYear: z.string().nullable().catch(null),
  enrollmentNumber: z.string().nullable().catch(null),
  rollNumber: z.string().nullable().catch(null),
  tenthBoardName: z.string().nullable().catch(null),
  tenthSchoolName: z.string().nullable().catch(null),
  tenthRollNumber: z.string().nullable().catch(null),
  tenthPassYear: z.string().nullable().catch(null),
  tenthPercentage: z.number().nullable().catch(null),
  tenthTotalMarks: z.number().nullable().catch(null),
  tenthObtainedMarks: z.number().nullable().catch(null),
  twelfthBoardName: z.string().nullable().catch(null),
  twelfthSchoolName: z.string().nullable().catch(null),
  twelfthRollNumber: z.string().nullable().catch(null),
  twelfthPassYear: z.string().nullable().catch(null),
  twelfthPercentage: z.number().nullable().catch(null),
  twelfthTotalMarks: z.number().nullable().catch(null),
  twelfthObtainedMarks: z.number().nullable().catch(null),
  twelfthStream: z.string().nullable().catch(null),
  graduationDegreeName: z.string().nullable().catch(null),
  graduationUniversity: z.string().nullable().catch(null),
  graduationPassYear: z.string().nullable().catch(null),
  graduationPercentage: z.number().nullable().catch(null),

  // Extraction metadata
  confidence: z.number().min(0).max(1).catch(0),
  extractionNotes: z.array(z.string()).catch([]),
});
export type UniversalProfileExtraction = z.infer<typeof UniversalProfileExtractionSchema>;