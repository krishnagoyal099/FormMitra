// src/components/eligibility/eligibility-report.tsx
import type { Prisma } from "@prisma/client";
import { Card } from "@/components/ui/card";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

export function EligibilityReportView({ report }: { report: Prisma.EligibilityReportGetPayload<Record<string, never>> }) {
  const raw = report.rawModelOutput as {
    reasons?: Array<{ criterion: string; verdict: "PASS"|"FAIL"|"UNCLEAR"; explanation: string }>;
    recommendations?: string[];
    warnings?: string[];
  } | null;

  const reasons = raw?.reasons ?? [];

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <h3 className="font-medium">Criteria breakdown</h3>
        <div className="mt-4 space-y-3">
          {reasons.map((r, i) => (
            <div key={i} className="flex items-start gap-3 rounded-lg border p-3">
              {r.verdict === "PASS" && <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />}
              {r.verdict === "FAIL" && <XCircle className="mt-0.5 h-4 w-4 text-rose-500" />}
              {r.verdict === "UNCLEAR" && <AlertCircle className="mt-0.5 h-4 w-4 text-amber-500" />}
              <div>
                <p className="text-sm font-medium">{r.criterion}</p>
                <p className="text-sm text-muted-foreground">{r.explanation}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {raw?.warnings?.length ? (
        <Card className="p-5 border-amber-500/40">
          <h3 className="font-medium text-amber-600">Warnings</h3>
          <ul className="mt-3 space-y-1 text-sm">
            {raw.warnings.map((w, i) => <li key={i}>• {w}</li>)}
          </ul>
        </Card>
      ) : null}

      {raw?.recommendations?.length ? (
        <Card className="p-5">
          <h3 className="font-medium">Recommendations</h3>
          <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
            {raw.recommendations.map((r, i) => <li key={i}>• {r}</li>)}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}
