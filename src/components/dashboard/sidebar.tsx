// src/components/dashboard/sidebar.tsx
"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { LayoutDashboard, FolderLock, FileSearch, ClipboardList, CheckSquare, Settings } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function Sidebar({ user }: { user: { name?: string | null; email?: string | null } }) {
  const t = useTranslations("Navigation");
  const pathname = usePathname();

  const NAV = [
    { href: "/dashboard", label: t("dashboard"), icon: LayoutDashboard },
    { href: "/documents", label: t("documents"), icon: FolderLock },
    { href: "/opportunities", label: t("opportunities"), icon: FileSearch },
    { href: "/settings", label: t("settings"), icon: Settings },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-white/5 bg-[#1F1F1F]/80 backdrop-blur-md lg:flex">
      <div className="flex h-20 items-center gap-3 border-b border-white/5 px-6 font-semibold text-white tracking-tight">
        <Image src="/logo.svg" alt="FormMitra Logo" width={32} height={32} className="rounded-md" />
        FormMitra
      </div>
      <nav className="flex-1 space-y-2 p-4">
        {NAV.map((item) => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href.split("?")[0]));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/5 p-4">
        <div className="rounded-md bg-white/5 p-3 border border-white/5">
          <p className="text-sm font-medium truncate text-white">{user.name ?? "User"}</p>
          <p className="text-xs text-white/50 truncate">{user.email}</p>
        </div>
      </div>
    </aside>
  );
}
