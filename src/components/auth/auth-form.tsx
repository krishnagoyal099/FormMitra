// src/components/auth/auth-form.tsx
"use client";
import { ReactNode } from "react";

interface AuthFormProps {
  title: string;
  description: string;
  onSubmitAction: (e: React.FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
  actionLabel: string;
  busy?: boolean;
  footer?: ReactNode;
}

export function AuthForm({ title, description, onSubmitAction, children, actionLabel, busy, footer }: AuthFormProps) {
  return (
    <div className="w-full max-w-md">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <form onSubmit={onSubmitAction} className="space-y-4">
        {children}
        <button
          type="submit"
          disabled={busy}
          className="flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50"
        >
          {busy ? "Please wait..." : actionLabel}
        </button>
      </form>
      {footer && <div className="mt-4 text-center text-sm text-muted-foreground">{footer}</div>}
    </div>
  );
}

