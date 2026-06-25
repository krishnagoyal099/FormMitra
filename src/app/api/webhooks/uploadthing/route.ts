// src/app/api/webhooks/uploadthing/route.ts
// Removed unused import
import {NextRequest, NextResponse} from "next/server";

export async function POST(_req: NextRequest) {
  // In a real app, you'd verify the webhook and maybe trigger background processing
  // For MVP, we rely on onUploadComplete in core.ts
  return NextResponse.json({ ok: true });
}
