// src/app/(dashboard)/opportunities/[id]/eligibility/page.tsx
import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import { EligibilityReportView } from "@/components/eligibility/eligibility-report";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function EligibilityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const opp = await prisma.opportunity.findFirst({
    where: { id, userId: session.user.id, deletedAt: null },
    include: { eligibilityReports: { orderBy: { version: "desc" }, take: 1 } },
  });
  if (!opp) notFound();

  const report = opp.eligibilityReports[0];
  const statusColor = report?.status === "ELIGIBLE" ? "success"
    : report?.status === "POSSIBLY_ELIGIBLE" ? "warning" : "destructive";

  return (
    <div className="space-y-8">
      <PageHeader
        title="Eligibility report"
        description={opp.title}
        action={<Button variant="outline" asChild><Link href={`/opportunities/${id}/action-plan`}>View action plan →</Link></Button>}
      />
      {!report ? (
        <Card className="p-8 text-center text-muted-foreground">Eligibility analysis is still running. Please refresh.</Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <Card className="p-6">
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant={statusColor as "success" | "warning" | "destructive"} className="mt-2">
                {report.status.replace("_", " ")}
              </Badge>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">Confidence</p>
                <p className="text-3xl font-bold">{Math.round(report.confidence * 100)}%</p>
              </div>
            </Card>
          </div>
          <div className="lg:col-span-2">
            <EligibilityReportView report={report} />
          </div>
        </div>
      )}
    </div>
  );
}
