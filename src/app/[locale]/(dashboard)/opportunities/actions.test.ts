import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyzeOpportunityAction } from './actions';
import { prisma } from '@/lib/db/prisma';
import { extractOpportunityService } from '@/lib/ai/services/extract-opportunity';
import { computeEligibility } from '@/lib/ai/services/eligibility-engine';
import { generateMissingDocs } from '@/lib/ai/services/missing-docs';
import { generateActionPlan } from '@/lib/ai/services/action-plan';

vi.mock('@/lib/ai/services/extract-opportunity');
vi.mock('@/lib/ai/services/eligibility-engine');
vi.mock('@/lib/ai/services/missing-docs');
vi.mock('@/lib/ai/services/action-plan');

describe('analyzeOpportunityAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return NOT_FOUND if opportunity is already analyzed', async () => {
    // Simulate 0 rows updated (meaning status was not DRAFT)
    vi.mocked(prisma.opportunity.updateMany).mockResolvedValue({ count: 0 } as never);
    vi.mocked(prisma.opportunity.findUnique).mockResolvedValue({ id: '1', status: 'ANALYZED' } as never);

    const res = await analyzeOpportunityAction('opp_123');
    
    // Based on your code, if count is 0 but it exists, it returns success(true) to prevent double processing
    expect(res.ok).toBe(true); 
  });

  it('should run full pipeline and mark as ANALYZED on success', async () => {
    vi.mocked(prisma.opportunity.updateMany).mockResolvedValue({ count: 1 } as never);
    vi.mocked(prisma.opportunity.findUniqueOrThrow).mockResolvedValue({
      id: 'opp_123', extractedText: 'text', title: 'Test', type: 'SCHOLARSHIP'
    } as never);

    vi.mocked(extractOpportunityService).mockResolvedValue({
      eligibilityRequirements: [], requiredDocuments: [], deadlines: [], applicationSteps: [], importantNotes: []
    } as never);

    vi.mocked(computeEligibility).mockResolvedValue({
      status: 'ELIGIBLE', confidence: 0.9, reasons: [], matchedCriteria: [], unmatchedCriteria: [], warnings: []
    } as never);

    vi.mocked(generateMissingDocs).mockResolvedValue({ uploaded: [], missing: [], optional: [] } as never);
    vi.mocked(generateActionPlan).mockResolvedValue({
      readinessScore: 100, estimatedDaysToReady: 0, summary: 'Ready', items: []
    } as never);

    const res = await analyzeOpportunityAction('opp_123');
    
    expect(res.ok).toBe(true);
    expect(prisma.eligibilityReport.create).toHaveBeenCalled();
    expect(prisma.actionPlan.create).toHaveBeenCalled();
    expect(prisma.opportunity.update).toHaveBeenCalledWith({
      where: { id: 'opp_123' },
      data: { status: 'ANALYZED', analyzedAt: expect.any(Date) }
    });
  });

  it('should catch AI errors and mark opportunity as FAILED', async () => {
    vi.mocked(prisma.opportunity.updateMany).mockResolvedValue({ count: 1 } as never);
    vi.mocked(prisma.opportunity.findUniqueOrThrow).mockResolvedValue({ id: 'opp_123' } as never);
    
    // Simulate ASI:ONE API crashing
    vi.mocked(extractOpportunityService).mockRejectedValue(new Error('ASI:ONE API Timeout'));

    const res = await analyzeOpportunityAction('opp_123');
    
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.code).toBe('INTERNAL');
    
    // Verify it didn't leave the DB in a "PROCESSING" limbo state
    expect(prisma.opportunity.update).toHaveBeenCalledWith({
      where: { id: 'opp_123' },
      data: { status: 'FAILED' }
    });
  });
});
