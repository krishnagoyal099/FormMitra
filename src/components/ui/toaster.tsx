// src/components/ui/toaster.tsx
"use client";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 sm:max-w-[400px]">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "group relative flex w-full items-start gap-3 overflow-hidden rounded-lg border p-4 pr-8 shadow-lg backdrop-blur",
            "bg-background/95",
            toast.variant === "destructive" && "border-destructive/50"
          )}
        >
          {toast.variant === "destructive" ? (
            <AlertTriangle className="mt-0.5 h-5 w-5 text-destructive" />
          ) : (
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-500" />
          )}
          <div className="flex-1">
            {toast.title && <p className="text-sm font-semibold">{toast.title}</p>}
            {toast.description && <p className="mt-1 text-sm text-muted-foreground">{toast.description}</p>}
          </div>
          <button
            onClick={() => dismiss(toast.id)}
            className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground opacity-70 transition-opacity hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

