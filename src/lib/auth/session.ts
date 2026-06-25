// src/lib/auth/session.ts
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

/**
 * Returns the currently authenticated Clerk user ID.
 * Redirects to /login if there is no active session.
 * Return shape { id } is intentionally compatible with all existing callers.
 */
export async function requireUser(): Promise<{ id: string }> {
  const { userId } = await auth();
  if (!userId) redirect("/login");
  return { id: userId };
}

/**
 * Requires the user to have the ADMIN role.
 * Currently a stub — Clerk roles can be checked via session claims if needed.
 */
export async function requireAdmin(): Promise<{ id: string }> {
  const user = await requireUser();
  // TODO: wire up Clerk session claims for role check when needed
  return user;
}