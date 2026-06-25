// src/app/(auth)/register/page.tsx
"use client";
import { SignUp } from "@clerk/nextjs";
import { useParams } from "next/navigation";

export default function RegisterPage() {
  const { locale } = useParams<{ locale: string }>();

  return (
    <div className="grid min-h-screen place-items-center p-4 bg-background">
      <SignUp
        forceRedirectUrl={`/${locale}/dashboard`}
      />
    </div>
  );
}
