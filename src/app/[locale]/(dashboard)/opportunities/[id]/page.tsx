// src/app/(dashboard)/opportunities/[id]/page.tsx
import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ClipboardList, FileCheck, CalendarClock, ArrowRight, Loader2 } from "lucide-react";

import { OpportunityAnalyzer } from "@/components/opportunities/opportunity-analyzer";

export default async function OpportunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const opp = await prisma.opportunity.findFirst({
    where: { id, userId: session.user.id, deletedAt: null },
    include: { docRequirements: true },
  });

  if (!opp) notFound();

  const requirements = (opp.eligibilityRequirements as Array<{ criterion: string; isMandatory: boolean }>) ?? [];
  const deadlines = (opp.deadlines as Array<{ label: string; date: string | null; type: string }>) ?? [];
  const steps = (opp.applicationSteps as Array<{ order: number; title: string; description: string }>) ?? [];

  if (opp.status === "DRAFT" || opp.status === "PROCESSING") {
    return <OpportunityAnalyzer oppId={opp.id} />;
  }

  if (opp.status === "FAILED") {
    const retryAnalysis = async () => {
      "use server";
      const { analyzeOpportunityAction } = await import("../actions");
      await analyzeOpportunityAction(opp.id);
    };

    return (
      <div className="space-y-8">
        <PageHeader title={opp.title} description="Analysis Failed" />
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div>
                <p className="text-destructive font-medium">We encountered an error while analyzing this opportunity.</p>
                <p className="text-sm text-muted-foreground mt-1">The AI service may have timed out. Please try again.</p>
              </div>
              <form action={retryAnalysis}>
                <Button variant="destructive" type="submit">Retry Analysis</Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={opp.title}
        description={`Analyzed ${opp.type.replace("_", " ").toLowerCase()}`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" asChild><Link href={`/opportunities/${id}/eligibility`}>Eligibility</Link></Button>
            <Button asChild><Link href={`/opportunities/${id}/action-plan`}>Action Plan <ArrowRight className="h-4 w-4 ml-2" /></Link></Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><FileCheck className="h-4 w-4" /> Eligibility Requirements</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {requirements.map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <span className="font-medium">•</span>
                  <span>{r.criterion}</span>
                  {!r.isMandatory && <Badge variant="secondary" className="ml-auto">Optional</Badge>}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><ClipboardList className="h-4 w-4" /> Application Steps</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {steps.map((s) => (
                <div key={s.order} className="flex gap-4">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary text-secondary-foreground text-sm font-bold">{s.order}</div>
                  <div>
                    <p className="font-medium">{s.title}</p>
                    <p className="text-sm text-muted-foreground">{s.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><CalendarClock className="h-4 w-4" /> Deadlines</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {deadlines.length === 0 ? <p className="text-sm text-muted-foreground">No specific deadlines extracted.</p> : deadlines.map((d, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>{d.label}</span>
                  <span className="font-medium">{d.date ? new Date(d.date).toLocaleDateString() : "N/A"}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Required Documents</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {opp.docRequirements.map((d) => (
                <div key={d.id} className="flex items-center justify-between text-sm">
                  <span>{d.requirement}</span>
                  <Badge variant={d.status === "MATCHED" ? "success" : d.status === "MISSING" ? "destructive" : "secondary"}>
                    {d.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
