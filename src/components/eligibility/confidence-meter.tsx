// src/components/eligibility/confidence-meter.tsx
"use client";
import { cn } from "@/lib/utils/cn";

export function ConfidenceMeter({ value }: { value: number }) {
  const v = Math.round(value * 100);
  const color = v >= 80 ? "text-emerald-500" : v >= 50 ? "text-amber-500" : "text-rose-500";
  const bg = v >= 80 ? "bg-emerald-500" : v >= 50 ? "bg-amber-500" : "bg-rose-500";

  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full", bg)} style={{ width: `${v}%` }} />
      </div>
      <span className={cn("text-sm font-medium", color)}>{v}%</span>
    </div>
  );
}

