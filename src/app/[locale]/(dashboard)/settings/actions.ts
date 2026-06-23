// src/app/(dashboard)/settings/actions.ts
"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/session";
import { ProfileInputSchema } from "@/lib/validation/profile";
import { encryptPII, toStorage } from "@/lib/crypto/pii";
import { createErrorResult, createSuccessResult, type ActionResult } from "@/lib/utils/action";
import { z } from "zod";

// Coerce numbers from form inputs safely
const Schema = ProfileInputSchema.extend({
  income: z.coerce.number().int().min(0).max(1_000_000_000),
});

export async function updateProfileAction(input: unknown): Promise<ActionResult<void>> {
  const user = await requireUser();
  const parsed = Schema.safeParse(input);
  
  if (!parsed.success) {
    return createErrorResult("VALIDATION", "Invalid profile data.", parsed.error.issues);
  }

  const { fullName, dob, email, phone, address, income, education } = parsed.data;

  const fullNameBlob = toStorage(encryptPII(fullName));
  const dobBlob = toStorage(encryptPII(dob));
  const phoneBlob = toStorage(encryptPII(phone));
  const addressBlob = toStorage(encryptPII(address));
  const incomeBlob = toStorage(encryptPII(income.toString()));

  try {
    await prisma.profile.upsert({
      where: { userId: user.id },
      update: {
        fullNameEncrypted: fullNameBlob.combined,
        fullNameIv: fullNameBlob.iv,
        dobEncrypted: dobBlob.combined,
        dobIv: dobBlob.iv,
        phoneEncrypted: phoneBlob.combined,
        phoneIv: phoneBlob.iv,
        addressEncrypted: addressBlob.combined,
        addressIv: addressBlob.iv,
        incomeEncrypted: incomeBlob.combined,
        incomeIv: incomeBlob.iv,
        education,
        profileComplete: true,
        version: { increment: 1 },
      },
      create: {
        userId: user.id,
        fullNameEncrypted: fullNameBlob.combined,
        fullNameIv: fullNameBlob.iv,
        dobEncrypted: dobBlob.combined,
        dobIv: dobBlob.iv,
        phoneEncrypted: phoneBlob.combined,
        phoneIv: phoneBlob.iv,
        addressEncrypted: addressBlob.combined,
        addressIv: addressBlob.iv,
        incomeEncrypted: incomeBlob.combined,
        incomeIv: incomeBlob.iv,
        education,
        profileComplete: true,
      },
    });

    revalidatePath("/settings");
    revalidatePath("/dashboard");
    return createSuccessResult(undefined);
  } catch (err) {
    return createErrorResult("INTERNAL", "Failed to save profile.");
  }
}
