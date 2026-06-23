// src/app/(auth)/login/page.tsx
"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function LoginPage() {
  const t = useTranslations("Auth");
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);


  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error || !res?.ok) {
        toast({ title: t("loginFailed"), description: t("invalidCredentials"), variant: "destructive" });
        setBusy(false);
        return;
      }

      // Let the browser follow the callbackUrl via a full navigation so the
      // session cookie is committed before the middleware checks it.
      const params = new URLSearchParams(window.location.search);
      const destination = params.get("callbackUrl") || "/dashboard";
      window.location.href = destination;
    } catch {
      toast({ title: t("loginFailed"), description: t("somethingWentWrong"), variant: "destructive" });
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("loginTitle")}</CardTitle>
          <CardDescription>{t("loginDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">{t("emailLabel")}</Label>
              <Input id="email" name="email" type="email" placeholder="m@example.com" required disabled={busy} />
            </div>
            <div>
              <Label htmlFor="password">{t("passwordLabel")}</Label>
              <Input id="password" name="password" type="password" required disabled={busy} />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : t("loginButton")}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              {t("dontHaveAccount")}{" "}
              <Link href="/register" className="text-primary underline-offset-4 hover:underline">{t("signUpLink")}</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
