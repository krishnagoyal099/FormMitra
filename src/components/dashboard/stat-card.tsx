// src/components/dashboard/stat-card.tsx
import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function StatCard({ icon: Icon, label, value, hint }: {
  icon: LucideIcon; label: string; value: string | number; hint?: string;
}) {
  return (
    <Card className="p-5 bg-white/5 border-white/5 rounded-md">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-white/60 font-mono tracking-tight uppercase">{label}</p>
        <Icon className="h-4 w-4 text-white/40" />
      </div>
      <p className="mt-2 text-4xl font-bold tracking-tighter text-white font-mono">{value}</p>
      {hint && <p className={cn("mt-2 text-xs text-white/40")}>{hint}</p>}
    </Card>
  );
}
