// src/components/dashboard/readiness-gauge.tsx
"use client";
import { cn } from "@/lib/utils/cn";

export function ReadinessGauge({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, value));
  const color = v >= 80 ? "text-emerald-500" : v >= 50 ? "text-amber-500" : "text-rose-500";
  const bg = v >= 80 ? "bg-emerald-500" : v >= 50 ? "bg-amber-500" : "bg-rose-500";
  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="relative mx-auto h-40 w-40">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="12" className="text-muted/40" />
          <circle
            cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${(v / 100) * 2 * Math.PI * 52} ${2 * Math.PI * 52}`}
            className={cn("transition-all duration-700", color)}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-center">
            <p className={cn("text-3xl font-bold", color)}>{v}%</p>
            <p className="text-xs text-muted-foreground">ready</p>
          </div>
        </div>
      </div>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        {v >= 80 ? "Submission-ready 🎉" : v >= 50 ? "Almost there" : "Action needed"}
      </p>
    </div>
  );
}
