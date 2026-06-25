// src/app/api/ai/analyze-opportunity/route.ts
import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { extractOpportunityService } from "@/lib/ai/services/extract-opportunity";
import { z } from "zod";

const Schema = z.object({
  text: z.string().min(100),
  title: z.string(),
  type: z.string(),
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  try {
    const body = await req.json();
    const parsed = Schema.safeParse(body);
    if (!parsed.success) return new Response("Bad Request", { status: 400 });

    // Stream the raw text to ASI:ONE and pipe back (simplified for MVP)
    const result = await extractOpportunityService(parsed.data.text, { 
      title: parsed.data.title, 
      type: parsed.data.type 
    });

    return Response.json(result);
  } catch (err) {
    console.error(err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
