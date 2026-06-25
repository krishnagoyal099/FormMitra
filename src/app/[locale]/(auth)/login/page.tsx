// src/app/(auth)/login/page.tsx
"use client";
import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="grid min-h-screen place-items-center p-4 bg-background">
      <SignIn routing="hash" />
    </div>
  );
}
