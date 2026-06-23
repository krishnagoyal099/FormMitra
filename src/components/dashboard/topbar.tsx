// src/components/dashboard/topbar.tsx
"use client";
import { usePathname } from "next/navigation";
import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const TITLES: Record<string, string> = {
  "/dashboard": "Overview",
  "/documents": "Document Vault",
  "/opportunities": "Opportunities",
  "/settings": "Settings",
};

export function Topbar({ user }: { user: { name?: string | null } }) {
  const pathname = usePathname();
  const title = Object.entries(TITLES).find(([k]) => pathname.startsWith(k))?.[1] ?? "Dashboard";
  return (
    <header className="sticky top-0 z-30 flex h-20 items-center gap-4 px-6 md:px-8 bg-[#1F1F1F]/80 backdrop-blur-md border-b border-white/5">
      <h1 className="text-xl font-bold tracking-tight text-white font-mono">{title}</h1>
      <div className="ml-auto flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
          <Input placeholder="Search…" className="h-10 w-64 pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus-visible:ring-1 focus-visible:ring-white/20 rounded-md" />
        </div>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-md"><Bell className="h-5 w-5" /></Button>
        <div className="grid h-10 w-10 place-items-center rounded-md bg-white text-black text-sm font-bold">
          {(user.name ?? "U").slice(0, 1).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
