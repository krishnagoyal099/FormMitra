// src/app/api/ai/extract-universal-profile/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// POST /api/ai/extract-universal-profile
// Triggers the Universal Profile extraction for the currently logged-in user.
// Called from the Settings page when the user clicks "Sync Profile".
// ─────────────────────────────────────────────────────────────────────────────
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { extractUniversalProfileService } from "@/lib/ai/services/extract-universal-profile";

export async function POST(): Promise<NextResponse> {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await extractUniversalProfileService({ userId });
    return NextResponse.json({
      success: true,
      completionPct: result.completionPct,
      documentCount: result.documentCount,
      confidence: result.profile.confidence,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Extraction failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
