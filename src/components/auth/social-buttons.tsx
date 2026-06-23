// src/components/auth/social-buttons.tsx
"use client";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Github, Mail } from "lucide-react";
import { useState } from "react";

export function SocialButtons() {
  const [busy, setBusy] = useState<string | null>(null);

  const handleSignIn = async (provider: string) => {
    setBusy(provider);
    await signIn(provider, { callbackUrl: "/dashboard" });
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      <Button variant="outline" onClick={() => handleSignIn("google")} disabled={!!busy}>
        {busy === "google" ? "Loading..." : <><Mail className="mr-2 h-4 w-4" /> Google</>}
      </Button>
      <Button variant="outline" onClick={() => handleSignIn("github")} disabled={!!busy}>
        {busy === "github" ? "Loading..." : <><Github className="mr-2 h-4 w-4" /> GitHub</>}
      </Button>
    </div>
  );
}

