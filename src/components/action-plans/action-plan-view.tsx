// src/components/action-plans/action-plan-view.tsx
"use client";
import { useTransition } from "react";
import type { Prisma, ActionItemStatus } from "@prisma/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReadinessProgress } from "./readiness-progress";
import { updateActionItemStatusAction } from "@/app/[locale]/(dashboard)/opportunities/actions";
import { CheckCircle2, Circle, Clock, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Plan = Prisma.ActionPlanGetPayload<{ include: { items: true } }>;

export function ActionPlanView({ plan }: { plan: Plan }) {
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  function setStatus(itemId: string, status: ActionItemStatus) {
    startTransition(async () => {
      const res = await updateActionItemStatusAction(itemId, status);
      if (!res.ok) toast({ title: "Update failed", description: res.message, variant: "destructive" });
    });
  }

  const done = plan.items.filter((i) => i.status === "DONE").length;
  const total = plan.items.length || 1;
  const liveScore = Math.round((done / total) * 100);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Readiness score</p>
            <p className="text-4xl font-bold">{Math.max(liveScore, plan.readinessScore)}%</p>
            <p className="mt-1 text-sm text-muted-foreground">Estimated {plan.estimatedDaysToReady} days to fully ready</p>
          </div>
          <div className="max-w-md flex-1">
            <ReadinessProgress value={Math.max(liveScore, plan.readinessScore)} />
          </div>
        </div>
        <p className="mt-4 text-sm">{plan.summary}</p>
      </Card>

      {plan.items.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground border-dashed">
          <CheckCircle2 className="h-10 w-10 mb-4 text-muted-foreground/50" />
          <p className="font-medium text-foreground">No specific action items found.</p>
          <p className="text-sm mt-1">We couldn&apos;t extract any specific application steps or document requirements from the provided source.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {plan.items.map((item) => (
            <Card key={item.id} className="flex items-start gap-4 p-5">
              <button
                disabled={pending}
                onClick={() => setStatus(item.id, item.status === "DONE" ? "PENDING" : "DONE")}
                className="mt-0.5"
                aria-label="Toggle complete"
              >
                {item.status === "DONE"
                  ? <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  : item.status === "IN_PROGRESS"
                  ? <Loader2 className="h-5 w-5 text-amber-500" />
                  : <Circle className="h-5 w-5 text-muted-foreground" />}
              </button>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{item.title}</p>
                  <Badge variant="outline" className="text-xs">{item.priority}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" /> ~{item.estimatedMinutes} min
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
