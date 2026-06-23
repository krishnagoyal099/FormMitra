// src/app/(auth)/actions.ts
"use server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";
import { signIn } from "@/lib/auth/config";
import { AuthError } from "next-auth";
import { createErrorResult, createSuccessResult, type ActionResult } from "@/lib/utils/action";

const RegisterSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export async function registerAction(input: unknown): Promise<ActionResult<void>> {
  const parsed = RegisterSchema.safeParse(input);
  if (!parsed.success) return createErrorResult("VALIDATION", "Invalid input.", parsed.error.issues);

  const { name, email, password } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) return createErrorResult("CONFLICT", "Email already in use.");

  const passwordHash = await hashPassword(password);
  try {
    await prisma.user.create({
      data: { name, email: email.toLowerCase(), passwordHash },
    });
  } catch (err: any) {
    if (err.code === "P2002") {
      return createErrorResult("VALIDATION", "This email is already registered.");
    }
    throw err;
  }

  return createSuccessResult(undefined);
}
