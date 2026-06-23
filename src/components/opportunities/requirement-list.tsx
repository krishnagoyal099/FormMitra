// src/components/opportunities/requirement-list.tsx
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, HelpCircle } from "lucide-react";

interface Requirement {
  name: string;
  isOptional: boolean;
  status: string;
}

export function RequirementList({ requirements }: { requirements: Requirement[] }) {
  return (
    <div className="space-y-2">
      {requirements.map((req, i) => (
        <div key={i} className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            {req.status === "MATCHED" && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
            {req.status === "MISSING" && <XCircle className="h-4 w-4 text-rose-500" />}
            {req.status === "PENDING" && <HelpCircle className="h-4 w-4 text-amber-500" />}
            <span>{req.name}</span>
          </div>
          {req.isOptional && <Badge variant="secondary" className="text-xs">Optional</Badge>}
        </div>
      ))}
    </div>
  );
}

