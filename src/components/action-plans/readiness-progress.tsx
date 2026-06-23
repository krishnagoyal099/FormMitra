// src/components/action-plans/readiness-progress.tsx
import { cn } from "@/lib/utils/cn";

export function ReadinessProgress({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
      <div
        className={cn(
          "h-full rounded-full transition-all duration-700",
          v >= 80 ? "bg-emerald-500" : v >= 50 ? "bg-amber-500" : "bg-rose-500"
        )}
        style={{ width: `${v}%` }}
      />
    </div>
  );
}
