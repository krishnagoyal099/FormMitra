// src/app/(dashboard)/opportunities/[id]/action-plan/page.tsx
import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import { ActionPlanView } from "@/components/action-plans/action-plan-view";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ActionPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const opp = await prisma.opportunity.findFirst({
    where: { id, userId: session.user.id, deletedAt: null },
    include: {
      actionPlans: { orderBy: { version: "desc" }, take: 1, include: { items: { orderBy: { order: "asc" } } } },
    },
  });
  if (!opp) notFound();

  const plan = opp.actionPlans[0];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Action plan"
        description={opp.title}
        action={<Button variant="outline" asChild><Link href={`/opportunities/${id}/eligibility`}>View eligibility →</Link></Button>}
      />
      {!plan ? (
        <EmptyState title="Plan not ready" description="The action plan is still being generated." />
      ) : (
        <ActionPlanView plan={plan} />
      )}
    </div>
  );
}
