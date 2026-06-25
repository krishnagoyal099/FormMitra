// src/components/dashboard/sidebar.tsx
"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { LayoutDashboard, FolderLock, FileSearch, Settings } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useUser } from "@clerk/nextjs";

export function Sidebar() {
  const t = useTranslations("Navigation");
  const pathname = usePathname();
  const { user, isLoaded } = useUser();

  const NAV = [
    { href: "/dashboard", label: t("dashboard"), icon: LayoutDashboard },
    { href: "/documents", label: t("documents"), icon: FolderLock },
    { href: "/opportunities", label: t("opportunities"), icon: FileSearch },
    { href: "/settings", label: t("settings"), icon: Settings },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-black/5 bg-[#F7F7F7]/80 backdrop-blur-md lg:flex">
      <div className="flex h-20 items-center gap-3 border-b border-black/5 px-6 font-semibold text-black tracking-tight">
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
                active ? "bg-black/10 text-black" : "text-black/60 hover:bg-black/5 hover:text-black"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-black/5 p-4">
        <div className="rounded-md bg-black/5 p-3 border border-black/5">
          {isLoaded && user ? (
            <>
              <p className="text-sm font-medium truncate text-black">{user.fullName ?? "User"}</p>
              <p className="text-xs text-black/50 truncate">{user.primaryEmailAddress?.emailAddress}</p>
            </>
          ) : (
            <p className="text-sm font-medium text-black/50">Loading...</p>
          )}
        </div>
      </div>
    </aside>
  );
}
