// src/app/(dashboard)/opportunities/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { unstable_after as after } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/rate-limit/redis";
import { OpportunityInputSchema } from "@/lib/validation/opportunity";
import { extractOpportunityService } from "@/lib/ai/services/extract-opportunity";
import { computeEligibility } from "@/lib/ai/services/eligibility-engine";
import { generateMissingDocs } from "@/lib/ai/services/missing-docs";
import { generateActionPlan } from "@/lib/ai/services/action-plan";
import { fetchUploadThingFile } from "@/lib/storage/server";
import { extractTextFromFile } from "@/lib/files/extract-text";
import { logger } from "@/lib/logger";
import { createErrorResult, createSuccessResult, type ActionResult } from "@/lib/utils/action";
import { env } from "@/config/env";

export async function createOpportunityAction(
  input: unknown
): Promise<ActionResult<{ opportunityId: string }>> {
  const user = await requireUser();
  const rl = await checkRateLimit("ai", `create-opp:${user.id}`);
  if (!rl.success) return createErrorResult("RATE_LIMITED", "AI rate limit reached. Slow down.");

  const parsed = OpportunityInputSchema.safeParse(input);
  if (!parsed.success) return createErrorResult("VALIDATION", "Invalid input.", parsed.error.issues);

  const { uploadThingKey, fileName, fileSize, mimeType, title, type, sourceUrl, provider } = parsed.data;

  try {
    const fileBuffer = await fetchUploadThingFile(uploadThingKey);
    const extractedText = await extractTextFromFile(fileBuffer, mimeType);

    const opp = await prisma.opportunity.create({
      data: {
        userId: user.id,
        title, type,
        sourceUrl, provider,
        fileName, uploadThingKey, fileSize,
        fileType: mimeType === "application/pdf" ? "PDF" : mimeType === "image/png" ? "PNG" : "JPG",
        extractedText,
        status: "DRAFT", // Start as DRAFT to indicate processing
      },
    });

    revalidatePath("/dashboard");
    return createSuccessResult({ opportunityId: opp.id });
  } catch (err) {
    logger.error({ err, userId: user.id }, "createOpportunityAction failed");
    return createErrorResult("INTERNAL", "Failed to register opportunity.");
  }
}

export async function analyzeOpportunityAction(oppId: string): Promise<ActionResult<boolean>> {
  const user = await requireUser();
  
  // Atomic row lock: Claim the DRAFT opportunity
  const updatedOpp = await prisma.opportunity.updateMany({
    where: { id: oppId, userId: user.id, status: "DRAFT" },
    data: { status: "PROCESSING" } 
  });

  // If 0 records were updated, it doesn't exist or is already processing/analyzed
  if (updatedOpp.count === 0) {
    const opp = await prisma.opportunity.findUnique({ where: { id: oppId, userId: user.id } });
    if (!opp) return createErrorResult("NOT_FOUND", "Opportunity not found.");
    return createSuccessResult(true);
  }

  // We have successfully claimed the row for processing. Fetch the data to process.
  const opp = await prisma.opportunity.findUniqueOrThrow({ where: { id: oppId } });

  try {
    // 1. Extract requirements via ASI:ONE
    const requirements = await extractOpportunityService(opp.extractedText ?? "", { title: opp.title, type: opp.type });

    await prisma.opportunity.update({
      where: { id: oppId },
      data: {
        eligibilityRequirements: requirements.eligibilityRequirements,
        requiredDocuments: requirements.requiredDocuments,
        deadlines: requirements.deadlines,
        applicationSteps: requirements.applicationSteps,
        importantNotes: requirements.importantNotes,
      },
    });

    // 2. Build DocRequirement rows
    await prisma.docRequirement.createMany({
      data: requirements.requiredDocuments.map((rd) => ({
        opportunityId: oppId,
        requirement: rd.name,
        isOptional: rd.isOptional,
        matchedCategory: rd.category,
        status: "PENDING",
      })),
    });

    // 3. Run Eligibility and Missing Docs engines in parallel
    const [eligibility, missing] = await Promise.all([
      computeEligibility({ userId: user.id, opportunityId: oppId }),
      generateMissingDocs({ userId: user.id, opportunityId: oppId })
    ]);

    // 4. Save Eligibility results
    await prisma.eligibilityReport.create({
      data: {
        userId: user.id,
        opportunityId: oppId,
        status: eligibility.status,
        confidence: eligibility.confidence,
        reasons: eligibility.reasons.map((r) => `${r.criterion}: ${r.explanation}`),
        matchedCriteria: eligibility.matchedCriteria,
        unmatchedCriteria: eligibility.unmatchedCriteria,
        warnings: eligibility.warnings,
        rawModelOutput: eligibility as unknown as object,
      },
    });

    // 5. Save Missing docs results
    await prisma.docRequirement.updateMany({
      where: { opportunityId: oppId, status: "PENDING" },
      data: { status: "MISSING" },
    });
    for (const up of missing.uploaded) {
      await prisma.docRequirement.updateMany({
        where: { opportunityId: oppId, requirement: up.requirement },
        data: { documentId: up.documentId, status: "MATCHED", matchConfidence: up.matchConfidence },
      });
    }

    // 6. Action plan
    const plan = await generateActionPlan({ userId: user.id, opportunityId: oppId });
    await prisma.actionPlan.create({
      data: {
        userId: user.id,
        opportunityId: oppId,
        readinessScore: plan.readinessScore,
        estimatedDaysToReady: plan.estimatedDaysToReady,
        summary: plan.summary,
        items: { create: plan.items.map((it) => ({
          title: it.title,
          description: it.description,
          priority: it.priority,
          order: it.order,
          estimatedMinutes: it.estimatedMinutes,
        })) },
      },
    });

    // Mark as fully analyzed
    await prisma.opportunity.update({
      where: { id: oppId },
      data: { status: "ANALYZED", analyzedAt: new Date() },
    });

    revalidatePath(`/opportunities/${oppId}`);
    return createSuccessResult(true);
  } catch (err) {
    logger.error({ err, oppId }, "analyzeOpportunityAction pipeline failed");
    await prisma.opportunity.update({
      where: { id: oppId },
      data: { status: "FAILED" },
    });
    return createErrorResult("INTERNAL", "Analysis failed.");
  }
}

export async function deleteOpportunityAction(oppId: string): Promise<ActionResult<void>> {
  const user = await requireUser();
  try {
    // Soft delete to preserve DB history
    await prisma.opportunity.update({
      where: { id: oppId, userId: user.id },
      data: { deletedAt: new Date() },
    });
    revalidatePath("/dashboard");
    revalidatePath("/opportunities");
    return createSuccessResult(undefined);
  } catch (err) {
    logger.error({ err, userId: user.id, oppId }, "deleteOpportunityAction failed");
    return createErrorResult("INTERNAL", "Could not delete opportunity.");
  }
}

export async function updateActionItemStatusAction(
  itemId: string, status: "PENDING"|"IN_PROGRESS"|"DONE"|"SKIPPED"
): Promise<ActionResult<void>> {
  const user = await requireUser();
  try {
    const item = await prisma.actionItem.findFirst({
      where: { id: itemId, actionPlan: { userId: user.id } },
      select: { id: true, actionPlanId: true, status: true },
    });
    if (!item) return createErrorResult("NOT_FOUND", "Action item not found.");
    await prisma.actionItem.update({ where: { id: itemId }, data: { status } });
    revalidatePath(`/opportunities`);
    return createSuccessResult(undefined);
  } catch (err) {
    logger.error({ err, userId: user.id, itemId }, "updateActionItemStatusAction failed");
    return createErrorResult("INTERNAL", "Could not update item.");
  }
}
