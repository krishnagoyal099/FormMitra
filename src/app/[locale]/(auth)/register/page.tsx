// src/app/(auth)/register/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerAction } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";

export default function RegisterPage() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const formData = new FormData(e.currentTarget);
    const input = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    const res = await registerAction(input);
    if (!res.ok) {
      toast({ title: t("registrationFailed"), description: res.message, variant: "destructive" });
      setBusy(false);
      return;
    }
    const signInRes = await signIn("credentials", {
      email: input.email,
      password: input.password,
      redirect: false,
    });

    if (signInRes?.error) {
      toast({ title: "Auto-login failed", description: "Please sign in manually.", variant: "destructive" });
      router.push("/login");
    } else {
      toast({ title: "Account created", description: "Welcome to FormMitra." });
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="grid min-h-screen place-items-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("registerTitle")}</CardTitle>
          <CardDescription>{t("registerDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">{t("nameLabel")}</Label>
              <Input id="name" name="name" placeholder="John Doe" required disabled={busy} />
            </div>
            <div>
              <Label htmlFor="email">{t("emailLabel")}</Label>
              <Input id="email" name="email" type="email" placeholder="m@example.com" required disabled={busy} />
            </div>
            <div>
              <Label htmlFor="password">{t("passwordLabel")}</Label>
              <Input id="password" name="password" type="password" minLength={8} required disabled={busy} />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : t("registerButton")}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              {t("alreadyHaveAccount")}{" "}
              <Link href="/login" className="text-primary underline-offset-4 hover:underline">{t("signInLink")}</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
