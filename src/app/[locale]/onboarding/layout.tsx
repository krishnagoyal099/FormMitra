// src/app/(onboarding)/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Onboarding | FormMitra",
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4 md:p-8">
      {children}
    </div>
  );
}
