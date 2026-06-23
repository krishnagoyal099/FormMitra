// src/app/api/extension/token/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// POST /api/extension/token  — Generate a Chrome Extension API token
// DELETE /api/extension/token — Revoke a token
// GET /api/extension/token   — List active tokens for the current user
//
// Auth: Requires an active FormMitra NextAuth session.
// The raw token is returned exactly ONCE and never stored.
// We store only the SHA-256 hash — identical to GitHub PAT security model.
// ─────────────────────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { createHash, randomBytes } from "crypto";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const TOKEN_TTL_DAYS = 30;
const MAX_TOKENS_PER_USER = 5;

/** Computes the SHA-256 hex digest of a raw token string. */
function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken, "utf8").digest("hex");
}

/** Generates a cryptographically secure extension token.
 *  Format: `fmt_ext_<32-bytes-as-base64url>`
 *  Total entropy: 256 bits — equivalent to a UUID v4 squared.
 */
function generateRawToken(): string {
  const entropy = randomBytes(32).toString("base64url");
  return `fmt_ext_${entropy}`;
}

// ── POST: Generate a new token ────────────────────────────────────────────────
const CreateTokenSchema = z.object({
  label: z.string().min(1).max(64).default("FormMitra Extension"),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = CreateTokenSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  // Enforce a max-token limit per user to prevent token sprawl
  const activeCount = await prisma.extensionToken.count({
    where: {
      userId: session.user.id,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
  });
  if (activeCount >= MAX_TOKENS_PER_USER) {
    return NextResponse.json(
      { error: `Maximum of ${MAX_TOKENS_PER_USER} active tokens allowed. Revoke an existing token first.` },
      { status: 409 }
    );
  }

  const rawToken = generateRawToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);

  const record = await prisma.extensionToken.create({
    data: {
      userId: session.user.id,
      tokenHash,
      label: parsed.data.label,
      expiresAt,
    },
    select: { id: true, label: true, createdAt: true, expiresAt: true },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "EXTENSION_TOKEN_CREATED",
      entity: "ExtensionToken",
      entityId: record.id,
      metadata: { label: record.label },
    },
  }).catch(() => {/* swallow audit failure */});

  return NextResponse.json({
    // ⚠️ This is the ONLY time the raw token is returned.
    // The client must copy it immediately — it cannot be retrieved again.
    token: rawToken,
    id: record.id,
    label: record.label,
    expiresAt: record.expiresAt.toISOString(),
    createdAt: record.createdAt.toISOString(),
  });
}

// ── GET: List active tokens ───────────────────────────────────────────────────
export async function GET(): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tokens = await prisma.extensionToken.findMany({
    where: {
      userId: session.user.id,
      revokedAt: null,
    },
    select: {
      id: true,
      label: true,
      lastUsedAt: true,
      expiresAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ tokens });
}

// ── DELETE: Revoke a token ────────────────────────────────────────────────────
const RevokeSchema = z.object({ id: z.string().cuid() });

export async function DELETE(req: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = RevokeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid token id" }, { status: 400 });
  }

  // Verify ownership before revoking
  const token = await prisma.extensionToken.findUnique({
    where: { id: parsed.data.id },
    select: { userId: true, revokedAt: true },
  });
  if (!token || token.userId !== session.user.id) {
    return NextResponse.json({ error: "Token not found" }, { status: 404 });
  }
  if (token.revokedAt) {
    return NextResponse.json({ error: "Token is already revoked" }, { status: 409 });
  }

  await prisma.extensionToken.update({
    where: { id: parsed.data.id },
    data: { revokedAt: new Date() },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "EXTENSION_TOKEN_REVOKED",
      entity: "ExtensionToken",
      entityId: parsed.data.id,
    },
  }).catch(() => {/* swallow */});

  return NextResponse.json({ success: true });
}
