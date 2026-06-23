// src/app/(dashboard)/dashboard/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import { getTranslations } from "next-intl/server";
import { StatCard } from "@/components/dashboard/stat-card";
import { ReadinessGauge } from "@/components/dashboard/readiness-gauge";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { FolderOpen, FileSearch, ClipboardCheck, Calendar } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DeleteOpportunityButton } from "@/components/opportunities/delete-opportunity-button";

export default async function DashboardPage() {
  const t = await getTranslations("Dashboard");
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const [docCount, oppCount, planCount, upcoming] = await Promise.all([
    prisma.document.count({ where: { userId, deletedAt: null } }),
    prisma.opportunity.count({ where: { userId, deletedAt: null } }),
    prisma.actionPlan.count({ where: { userId, opportunity: { deletedAt: null } } }),
    prisma.opportunity.findMany({
      where: { userId, deletedAt: null },
      include: { actionPlans: { orderBy: { version: "desc" }, take: 1 } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const avgReadiness = (() => {
    const plans = upcoming.flatMap((o: typeof upcoming[number]) => o.actionPlans);
    if (!plans.length) return 0;
    return Math.round(plans.reduce((a: number, p: typeof plans[number]) => a + p.readinessScore, 0) / plans.length);
  })();

  return (
    <div className="space-y-8">
      <PageHeader
        title={t("welcome", { name: session.user.name?.split(" ")[0] ?? "there" })}
        description={t("subtitle")}
        action={<Button asChild><Link href="/opportunities/new">{t("analyzeNew")}</Link></Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FolderOpen}    label={t("documents")}    value={docCount}            hint={t("documentsHint")} />
        <StatCard icon={FileSearch}    label={t("opportunities")} value={oppCount}            hint={t("opportunitiesHint")} />
        <StatCard icon={ClipboardCheck} label={t("actionPlans")}  value={planCount}           hint={t("actionPlansHint")} />
        <StatCard icon={Calendar}      label={t("avgReadiness")}  value={`${avgReadiness}%`} hint={t("avgReadinessHint")} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold">{t("recentOpportunities")}</h2>
          {upcoming.length === 0 ? (
            <EmptyState
              title={t("noOpportunitiesTitle")}
              description={t("noOpportunitiesDesc")}
              action={<Button asChild><Link href="/opportunities/new">{t("uploadOpportunity")}</Link></Button>}
            />
          ) : (
            <div className="space-y-3">
              {upcoming.map((opp: typeof upcoming[number]) => {
                const plan = opp.actionPlans[0];
                return (
                  <div key={opp.id} className="card-hover flex items-stretch rounded-xl border bg-card overflow-hidden">
                    <Link
                      href={`/opportunities/${opp.id}`}
                      className="flex-1 p-5 flex items-start justify-between gap-4 hover:bg-muted/30"
                    >
                      <div>
                        <p className="font-medium hover:underline">{opp.title}</p>
                        <p className="text-sm text-muted-foreground">{opp.type.replace("_"," ").toLowerCase()}</p>
                      </div>
                      {plan && (
                        <div className="text-right">
                          <p className="text-2xl font-bold">{plan.readinessScore}%</p>
                          <p className="text-xs text-muted-foreground">ready</p>
                        </div>
                      )}
                    </Link>
                    <div className="p-4 flex items-center justify-center shrink-0 border-l bg-muted/10">
                      <DeleteOpportunityButton oppId={opp.id} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div>
          <h2 className="mb-4 text-lg font-semibold">{t("overallReadiness")}</h2>
          <ReadinessGauge value={avgReadiness} />
        </div>
      </div>
    </div>
  );
}