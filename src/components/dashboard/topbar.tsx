// src/components/dashboard/topbar.tsx
"use client";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { UserButton } from "@clerk/nextjs";

export function Topbar() {
  const t = useTranslations("Navigation");
  const pathname = usePathname();

  // Map path segments to translation keys
  const TITLE_MAP: Record<string, string> = {
    "/dashboard": t("dashboard"),
    "/documents": t("documents"),
    "/opportunities": t("opportunities"),
    "/settings": t("settings"),
  };

  // Strip locale prefix (e.g. /hi/dashboard → /dashboard) for matching
  const strippedPath = pathname.replace(/^\/(en|hi)/, "") || "/";
  const title =
    Object.entries(TITLE_MAP).find(([k]) => strippedPath === k || strippedPath.startsWith(k + "/"))?.[1] ??
    t("dashboard");

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center gap-4 px-6 md:px-8 bg-[#F7F7F7]/80 backdrop-blur-md border-b border-black/5">
      <h1 className="text-xl font-bold tracking-tight text-black font-mono">{title}</h1>
      <div className="ml-auto flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/50" />
          <Input
            placeholder="Search…"
            className="h-10 w-64 pl-10 bg-black/5 border-black/10 text-black placeholder:text-black/40 focus-visible:ring-1 focus-visible:ring-black/20 rounded-md"
          />
        </div>
        <LanguageSwitcher />
        <Button variant="ghost" size="icon" className="text-black hover:bg-black/10 rounded-md">
          <Bell className="h-5 w-5" />
        </Button>
        <UserButton />
      </div>
    </header>
  );
}
