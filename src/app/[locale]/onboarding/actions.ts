// src/app/(onboarding)/actions.ts
"use server";

import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/rate-limit/redis";
import { encryptPII, toStorage } from "@/lib/crypto/pii";
import { createErrorResult, createSuccessResult, type ActionResult } from "@/lib/utils/action";
import { redirect } from "next/navigation";
import { logger } from "@/lib/logger";

const OnboardingSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  dob: z.string().min(1, "Date of birth is required"),
  phone: z.string().min(5, "Phone number is required"),
  address: z.string().min(5, "Address is required"),
  income: z.number().min(0, "Income must be a positive number"),
  level: z.enum(["SECONDARY", "HIGHER_SECONDARY", "DIPLOMA", "BACHELORS", "MASTERS", "DOCTORAL"]),
  institution: z.string().min(2, "Institution name is required"),
  startYear: z.number().int().min(1900).max(2100),
  graduationYear: z.number().int().min(1900).max(2100, "Valid graduation year is required"),
});

export async function saveProfileAction(
  input: z.infer<typeof OnboardingSchema>
): Promise<ActionResult<boolean>> {
  const user = await requireUser();
  const rl = await checkRateLimit("write", `onboarding:${user.id}`);
  if (!rl.success) return createErrorResult("RATE_LIMITED", "Too many requests. Try again later.");

  const parsed = OnboardingSchema.safeParse(input);
  if (!parsed.success) {
    return createErrorResult("VALIDATION", "Invalid form submission", parsed.error.issues);
  }

  let success = false;
  try {
    const { fullName, dob, phone, address, income, level, institution, startYear, graduationYear } = parsed.data;

    const fnStorage = toStorage(encryptPII(fullName));
    const dobStorage = toStorage(encryptPII(dob));
    const phoneStorage = toStorage(encryptPII(phone));
    const addrStorage = toStorage(encryptPII(address));
    const incStorage = toStorage(encryptPII(income.toString()));

    const educationArray = [{
      level,
      institution,
      startYear,
      endYear: graduationYear
    }];

    await prisma.profile.upsert({
      where: { userId: user.id },
      update: {
        fullNameEncrypted: fnStorage.combined,
        fullNameIv: fnStorage.iv,
        dobEncrypted: dobStorage.combined,
        dobIv: dobStorage.iv,
        phoneEncrypted: phoneStorage.combined,
        phoneIv: phoneStorage.iv,
        addressEncrypted: addrStorage.combined,
        addressIv: addrStorage.iv,
        incomeEncrypted: incStorage.combined,
        incomeIv: incStorage.iv,
        education: educationArray,
        profileComplete: true,
      },
      create: {
        userId: user.id,
        fullNameEncrypted: fnStorage.combined,
        fullNameIv: fnStorage.iv,
        dobEncrypted: dobStorage.combined,
        dobIv: dobStorage.iv,
        phoneEncrypted: phoneStorage.combined,
        phoneIv: phoneStorage.iv,
        addressEncrypted: addrStorage.combined,
        addressIv: addrStorage.iv,
        incomeEncrypted: incStorage.combined,
        incomeIv: incStorage.iv,
        education: educationArray,
        profileComplete: true,
      },
    });

    success = true;
  } catch (err) {
    logger.error({ err, userId: user.id }, "Failed to save profile during onboarding");
    return createErrorResult("INTERNAL", "Failed to save profile.");
  }

  // Redirect outside try-catch because redirect() throws an error in Next.js
  if (success) {
    redirect("/dashboard");
  }

  return createSuccessResult(true);
}
