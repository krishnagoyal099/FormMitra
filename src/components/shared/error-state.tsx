// src/components/shared/error-state.tsx
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function ErrorState({ title, description, action, className }: {
  title: string; description?: string; action?: React.ReactNode; className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-xl border border-destructive/30 bg-destructive/5 p-12 text-center", className)}>
      <AlertCircle className="h-10 w-10 text-destructive" />
      <p className="mt-4 font-medium text-destructive">{title}</p>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
