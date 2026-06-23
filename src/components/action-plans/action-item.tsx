// src/components/action-plans/action-item.tsx
"use client";
import { ActionItem } from "@prisma/client";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

interface Props {
  item: ActionItem;
  onToggleAction: (id: string, status: ActionItem["status"]) => void;
  disabled?: boolean;
}

export function ActionItemRow({ item, onToggleAction, disabled }: Props) {
  const isDone = item.status === "DONE";
  
  return (
    <div className="flex items-start gap-4 rounded-xl border bg-card p-5">
      <button
        disabled={disabled}
        onClick={() => onToggleAction(item.id, isDone ? "PENDING" : "DONE")}
        className="mt-0.5"
        aria-label="Toggle complete"
      >
        {isDone ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
        ) : (
          <Circle className="h-5 w-5 text-muted-foreground" />
        )}
      </button>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className={cn("font-medium", isDone && "line-through text-muted-foreground")}>
            {item.title}
          </p>
          <Badge variant="outline" className="text-xs">{item.priority}</Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
        <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" /> ~{item.estimatedMinutes} min
        </p>
      </div>
    </div>
  );
}
