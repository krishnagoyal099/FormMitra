// src/lib/ai/services/extract-opportunity.ts
import { randomUUID } from "crypto";
import { callAsione } from "../asi-one";
import { OpportunityRequirementsSchema, type OpportunityRequirements } from "../schemas";
import { buildOpportunityPrompt } from "../prompts";

export async function extractOpportunityService(
  text: string, 
  meta: { title: string; type: string; sourceUrl?: string | null }
) {
  const { system, user } = buildOpportunityPrompt(text, meta);
  
  // Enable native ASI:ONE web search if a URL is provided and we lack text
  const needsWebSearch = !!meta.sourceUrl && text.trim().length < 50;

  const result = await callAsione<OpportunityRequirements>(
    [{ role: "system", content: system }, { role: "user", content: user }],
    OpportunityRequirementsSchema,
    { 
      operationId: randomUUID(), 
      temperature: 0.2, 
      maxTokens: 4096,
      webSearch: needsWebSearch 
    }
  );
  return result.data;
}
