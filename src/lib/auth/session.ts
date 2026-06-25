import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";

/**
 * Returns the currently authenticated Clerk user ID.
 * Redirects to /login if there is no active session.
 * Return shape { id } is intentionally compatible with all existing callers.
 */
export async function requireUser(): Promise<{ id: string }> {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  // Auto-sync fallback in case the Clerk Webhook failed or was delayed
  try {
    const dbUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!dbUser) {
      const clerkUser = await currentUser();
      if (clerkUser) {
        await prisma.user.create({
          data: {
            id: userId,
            email: clerkUser.emailAddresses[0]?.emailAddress ?? `${userId}@placeholder.com`,
            name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null,
            image: clerkUser.imageUrl,
          }
        });
      }
    }
  } catch (err) {
    console.error("Failed to auto-sync user:", err);
  }

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