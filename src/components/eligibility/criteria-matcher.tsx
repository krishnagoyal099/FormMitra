// src/components/eligibility/criteria-matcher.tsx
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface Criterion {
  criterion: string;
  verdict: "PASS" | "FAIL" | "UNCLEAR";
  explanation: string;
}

export function CriteriaMatcher({ criteria }: { criteria: Criterion[] }) {
  return (
    <div className="space-y-3">
      {criteria.map((c, i) => (
        <div key={i} className="flex items-start gap-3 rounded-lg border p-3">
          {c.verdict === "PASS" && <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />}
          {c.verdict === "FAIL" && <XCircle className="mt-0.5 h-4 w-4 text-rose-500" />}
          {c.verdict === "UNCLEAR" && <AlertCircle className="mt-0.5 h-4 w-4 text-amber-500" />}
          <div>
            <p className="text-sm font-medium">{c.criterion}</p>
            <p className="text-sm text-muted-foreground">{c.explanation}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

