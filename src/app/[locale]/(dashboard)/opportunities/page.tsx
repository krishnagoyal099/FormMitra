// src/app/(dashboard)/opportunities/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils/format";
import Link from "next/link";
import { Plus, ArrowRight } from "lucide-react";
import { DeleteOpportunityButton } from "@/components/opportunities/delete-opportunity-button";

export default async function OpportunitiesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const opportunities = await prisma.opportunity.findMany({
    where: { userId: session.user.id, deletedAt: null },
    include: { eligibilityReports: { orderBy: { version: "desc" }, take: 1 } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Opportunities"
        description="Your analyzed scholarships, internships, and schemes."
        action={<Button asChild><Link href="/opportunities/new"><Plus className="h-4 w-4 mr-2" /> Analyze new</Link></Button>}
      />
      {opportunities.length === 0 ? (
        <EmptyState
          title="No opportunities analyzed yet"
          description="Upload a PDF to see your eligibility and action plan."
          action={<Button asChild><Link href="/opportunities/new">Upload your first opportunity</Link></Button>}
        />
      ) : (
        <div className="space-y-4">
          {opportunities.map((opp) => {
            const report = opp.eligibilityReports[0];
            const statusVariant = report?.status === "ELIGIBLE" ? "success" : report?.status === "POSSIBLY_ELIGIBLE" ? "warning" : "destructive";
            return (
              <Card key={opp.id} className="card-hover relative flex items-center justify-between overflow-hidden">
                <Link href={`/opportunities/${opp.id}`} className="flex-1 p-5 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg hover:underline">{opp.title}</h3>
                      <Badge variant="outline">{opp.type.replace("_", " ").toLowerCase()}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">Analyzed on {formatDate(opp.analyzedAt)}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    {report ? (
                      <div className="text-right">
                        <Badge variant={statusVariant as "success" | "warning" | "destructive"}>{report.status.replace("_", " ")}</Badge>
                        <p className="mt-1 text-xs text-muted-foreground">{Math.round(report.confidence * 100)}% confidence</p>
                      </div>
                    ) : (
                      <Badge variant="secondary">Processing</Badge>
                    )}
                  </div>
                </Link>
                <div className="p-5 flex items-center gap-3 shrink-0 border-l bg-muted/10 h-full">
                  <DeleteOpportunityButton oppId={opp.id} />
                  <Link href={`/opportunities/${opp.id}`} className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 text-sm font-medium">
                    View <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
