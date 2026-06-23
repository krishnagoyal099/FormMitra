import Link from "next/link";
import { Opportunity } from "@prisma/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils/format";
import { ArrowRight } from "lucide-react";
import { DeleteOpportunityButton } from "./delete-opportunity-button";

export function OpportunityCard({ opp }: { opp: Opportunity }) {
  return (
    <Card className="card-hover relative flex items-center justify-between overflow-hidden">
      <Link href={`/opportunities/${opp.id}`} className="flex-1 p-5 flex flex-col justify-center">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-lg hover:underline">{opp.title}</h3>
          <Badge variant="outline">{opp.type.replace("_", " ").toLowerCase()}</Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {opp.analyzedAt ? `Analyzed on ${formatDate(opp.analyzedAt)}` : `Status: ${opp.status}`}
        </p>
      </Link>
      
      <div className="p-5 flex items-center gap-3 shrink-0 border-l bg-muted/20">
        <DeleteOpportunityButton oppId={opp.id} />
        <Link href={`/opportunities/${opp.id}`} className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 text-sm font-medium">
          View <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </Card>
  );
}

