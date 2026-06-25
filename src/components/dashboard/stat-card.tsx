// src/components/dashboard/stat-card.tsx
import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function StatCard({ icon: Icon, label, value, hint }: {
  icon: LucideIcon; label: string; value: string | number; hint?: string;
}) {
  return (
    <Card className="p-5 rounded-xl border bg-card">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-muted-foreground font-mono tracking-tight uppercase">{label}</p>
        <Icon className="h-4 w-4 text-muted-foreground/60" />
      </div>
      <p className="mt-2 text-4xl font-bold tracking-tighter font-mono text-foreground">{value}</p>
      {hint && <p className={cn("mt-2 text-xs text-muted-foreground/80")}>{hint}</p>}
    </Card>
  );
}
