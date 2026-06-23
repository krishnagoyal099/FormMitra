// src/lib/schemas/universal-profile.ts
// ─────────────────────────────────────────────────────────────────────────────
// Universal Applicant Profile — the single source of truth for auto-fill.
//
// Design principles:
//  1. ALL fields are nullable — partial profiles are valid and expected.
//  2. Masked PII (Aadhaar) stays masked — the extension never writes full IDs.
//  3. Flat structure for fast O(1) key lookups by the field mapper.
//  4. Field keys are stable identifiers — the Chrome extension's
//     FIELD_KEYWORDS dictionary references them directly.
// ─────────────────────────────────────────────────────────────────────────────
import { z } from "zod";

// ── Personal Identity ─────────────────────────────────────────────────────────
const PersonalIdentitySchema = z.object({
  /** Full name as it appears on official documents. e.g. "PRIYA DEVI SHARMA" */
  fullName: z.string().nullable().default(null),
  /** First / given name. e.g. "Priya" */
  firstName: z.string().nullable().default(null),
  /** Middle name (common in South Indian naming conventions). e.g. "Devi" */
  middleName: z.string().nullable().default(null),
  /** Surname / family name. e.g. "Sharma" */
  lastName: z.string().nullable().default(null),
  /** ISO 8601 date string. e.g. "2002-05-14" */
  dateOfBirth: z.string().nullable().default(null),
  /** Birth year for portals that only ask for the year. e.g. "2002" */
  birthYear: z.string().nullable().default(null),
  /** Birth month as 2-digit string. e.g. "05" */
  birthMonth: z.string().nullable().default(null),
  /** Birth day as 2-digit string. e.g. "14" */
  birthDay: z.string().nullable().default(null),
  gender: z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]).nullable().default(null),
  /** e.g. "Indian" */
  nationality: z.string().nullable().default(null),
  /** e.g. "Hindu", "Muslim", "Christian" */
  religion: z.string().nullable().default(null),
});

// ── Caste & Reservation Category ──────────────────────────────────────────────
const CasteSchema = z.object({
  /** The reservation category for Indian government forms. */
  casteCategory: z.enum(["GENERAL", "OBC", "SC", "ST", "EWS", "OTHER"]).nullable().default(null),
  /** Specific community / sub-caste name. e.g. "Yadav", "Chamar" */
  casteName: z.string().nullable().default(null),
  /** True if the applicant also qualifies under PWD, Sports, NCC, Ex-Serviceman etc. */
  isSpecialCategory: z.boolean().nullable().default(null),
  /** e.g. "PWD", "NCC Cadet", "Ex-Serviceman Ward" */
  specialCategoryLabel: z.string().nullable().default(null),
});

// ── Contact Information ────────────────────────────────────────────────────────
const ContactSchema = z.object({
  /** Primary 10-digit mobile number (without country code). e.g. "9876543210" */
  mobileNumber: z.string().nullable().default(null),
  /** Alternate phone number. */
  alternateMobile: z.string().nullable().default(null),
  /** Email address. e.g. "priya@gmail.com" */
  emailAddress: z.string().nullable().default(null),
});

// ── Permanent Address ──────────────────────────────────────────────────────────
const PermanentAddressSchema = z.object({
  permanentAddressLine1: z.string().nullable().default(null),
  permanentAddressLine2: z.string().nullable().default(null),
  permanentVillage: z.string().nullable().default(null),
  permanentCity: z.string().nullable().default(null),
  permanentTaluka: z.string().nullable().default(null),
  permanentDistrict: z.string().nullable().default(null),
  permanentState: z.string().nullable().default(null),
  permanentPincode: z.string().nullable().default(null),
  permanentCountry: z.string().nullable().default("India"),
});

// ── Current / Correspondence Address ──────────────────────────────────────────
const CurrentAddressSchema = z.object({
  /** If true, current address == permanent address. Extension skips current address fields. */
  isSameAsPermanent: z.boolean().nullable().default(null),
  currentAddressLine1: z.string().nullable().default(null),
  currentAddressLine2: z.string().nullable().default(null),
  currentVillage: z.string().nullable().default(null),
  currentCity: z.string().nullable().default(null),
  currentTaluka: z.string().nullable().default(null),
  currentDistrict: z.string().nullable().default(null),
  currentState: z.string().nullable().default(null),
  currentPincode: z.string().nullable().default(null),
});

// ── Family & Guardian Details ──────────────────────────────────────────────────
const FamilySchema = z.object({
  fatherName: z.string().nullable().default(null),
  fatherOccupation: z.string().nullable().default(null),
  fatherMobile: z.string().nullable().default(null),
  motherName: z.string().nullable().default(null),
  motherOccupation: z.string().nullable().default(null),
  motherMobile: z.string().nullable().default(null),
  /** Guardian name (for students whose parents are deceased / absent). */
  guardianName: z.string().nullable().default(null),
  guardianRelation: z.string().nullable().default(null),
  /** Annual family income in INR. e.g. 150000 */
  annualFamilyIncome: z.number().nullable().default(null),
  /** Number of dependent family members. */
  familySize: z.number().int().nullable().default(null),
});

// ── Identification Numbers ─────────────────────────────────────────────────────
const IdentificationSchema = z.object({
  /**
   * Aadhaar stored as a MASKED value only. e.g. "XXXX-XXXX-1234"
   * The extension will display this for reference but WILL NOT auto-fill it
   * into any input. The user must type the full Aadhaar themselves.
   * This is a deliberate security & regulatory decision (UIDAI guidelines).
   */
  aadhaarMasked: z.string().nullable().default(null),
  /** PAN number — not classified as sensitive, can be auto-filled. e.g. "ABCDE1234F" */
  panNumber: z.string().nullable().default(null),
  /** Samagra ID (Madhya Pradesh residents). */
  samagraId: z.string().nullable().default(null),
  /** Voter ID. e.g. "ABC1234567" */
  voterIdMasked: z.string().nullable().default(null),
  /** Domicile certificate number. */
  domicileNumber: z.string().nullable().default(null),
  /** Caste certificate number. */
  casteCertificateNumber: z.string().nullable().default(null),
  /** Income certificate number. */
  incomeCertificateNumber: z.string().nullable().default(null),
});

// ── Bank Account Details (for disbursement) ────────────────────────────────────
const BankSchema = z.object({
  bankName: z.string().nullable().default(null),
  bankAccountNumber: z.string().nullable().default(null),
  bankIfscCode: z.string().nullable().default(null),
  bankBranchName: z.string().nullable().default(null),
  bankAccountHolderName: z.string().nullable().default(null),
  /** e.g. "SAVINGS", "CURRENT" */
  bankAccountType: z.string().nullable().default(null),
  /** MICR code (sometimes asked on older portals). */
  bankMicrCode: z.string().nullable().default(null),
});

// ── Academic / Education History ───────────────────────────────────────────────
const AcademicSchema = z.object({
  // ── Current Course ──
  currentInstitutionName: z.string().nullable().default(null),
  currentInstitutionCode: z.string().nullable().default(null),
  currentInstitutionDistrict: z.string().nullable().default(null),
  currentInstitutionState: z.string().nullable().default(null),
  currentCourseName: z.string().nullable().default(null),
  /** e.g. "ENGINEERING", "MEDICINE", "ARTS" */
  currentCourseType: z.string().nullable().default(null),
  /** e.g. "2nd Year" */
  currentCourseYear: z.string().nullable().default(null),
  /** Academic year string. e.g. "2024-25" */
  currentAcademicYear: z.string().nullable().default(null),
  /** Year of admission. e.g. "2023" */
  currentAdmissionYear: z.string().nullable().default(null),
  enrollmentNumber: z.string().nullable().default(null),
  rollNumber: z.string().nullable().default(null),

  // ── Class 10 (SSC / Matriculation) ──
  tenthBoardName: z.string().nullable().default(null),
  tenthSchoolName: z.string().nullable().default(null),
  tenthRollNumber: z.string().nullable().default(null),
  tenthPassYear: z.string().nullable().default(null),
  tenthPercentage: z.number().nullable().default(null),
  tenthTotalMarks: z.number().nullable().default(null),
  tenthObtainedMarks: z.number().nullable().default(null),

  // ── Class 12 (HSC / Intermediate) ──
  twelfthBoardName: z.string().nullable().default(null),
  twelfthSchoolName: z.string().nullable().default(null),
  twelfthRollNumber: z.string().nullable().default(null),
  twelfthPassYear: z.string().nullable().default(null),
  twelfthPercentage: z.number().nullable().default(null),
  twelfthTotalMarks: z.number().nullable().default(null),
  twelfthObtainedMarks: z.number().nullable().default(null),
  twelfthStream: z.string().nullable().default(null), // "Science", "Commerce", "Arts"

  // ── Graduation (for PG scholarship applicants) ──
  graduationDegreeName: z.string().nullable().default(null),
  graduationUniversity: z.string().nullable().default(null),
  graduationPassYear: z.string().nullable().default(null),
  graduationPercentage: z.number().nullable().default(null),
});

// ── Root Universal Profile ─────────────────────────────────────────────────────
export const UniversalProfileSchema = PersonalIdentitySchema
  .merge(CasteSchema)
  .merge(ContactSchema)
  .merge(PermanentAddressSchema)
  .merge(CurrentAddressSchema)
  .merge(FamilySchema)
  .merge(IdentificationSchema)
  .merge(BankSchema)
  .merge(AcademicSchema)
  .extend({
    /** Incrementing version to detect stale data in the extension. */
    profileVersion: z.number().int().default(1),
    /** ISO timestamp of when this was last extracted by AI. */
    lastExtractedAt: z.string().nullable().default(null),
    /**
     * Overall confidence [0, 1] in the extracted data.
     * Computed as the mean confidence across all source documents.
     */
    confidence: z.number().min(0).max(1).default(0),
    /** Number of non-null fields / total fields — shown in extension UI. */
    completionPercentage: z.number().min(0).max(100).default(0),
  });

export type UniversalProfile = z.infer<typeof UniversalProfileSchema>;

/**
 * Computes what percentage of the profile's meaningful fields are non-null.
 * Used to show "Profile is 72% complete" in the extension popup.
 */
export function computeProfileCompletion(profile: Partial<UniversalProfile>): number {
  const TRACKED_KEYS: Array<keyof UniversalProfile> = [
    "fullName", "dateOfBirth", "gender", "casteCategory", "mobileNumber",
    "emailAddress", "permanentState", "permanentDistrict", "permanentPincode",
    "fatherName", "motherName", "annualFamilyIncome", "panNumber",
    "bankAccountNumber", "bankIfscCode", "bankName",
    "tenthPercentage", "tenthPassYear", "tenthBoardName",
    "twelfthPercentage", "twelfthPassYear", "twelfthBoardName",
    "currentInstitutionName", "currentCourseName", "currentCourseYear",
  ];
  const filled = TRACKED_KEYS.filter((k) => profile[k] != null).length;
  return Math.round((filled / TRACKED_KEYS.length) * 100);
}

/** Returns an empty profile with all fields null. Used as a safe default. */
export function emptyProfile(): UniversalProfile {
  return UniversalProfileSchema.parse({});
}
