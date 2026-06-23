// src/components/shared/language-switcher.tsx
"use client";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { useTransition } from "react";
import { Globe } from "lucide-react";
import { routing, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils/cn";

/**
 * Language switcher dropdown.
 * On selection, redirects to the same page in the new locale.
 * Uses a native <select> for maximum accessibility and zero extra deps.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const t = useTranslations("LanguageSwitcher");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function onSelectChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const nextLocale = event.target.value as Locale;

    startTransition(() => {
      // Strip any existing locale prefix from the current pathname
      let newPath = pathname;
      for (const loc of routing.locales) {
        if (pathname === `/${loc}` || pathname.startsWith(`/${loc}/`)) {
          newPath = pathname.slice(loc.length + 1) || "/";
          break;
        }
      }

      // Push to the new locale-prefixed path
      const target =
        nextLocale === routing.defaultLocale
          ? newPath
          : `/${nextLocale}${newPath === "/" ? "" : newPath}`;

      router.push(target);
    });
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm transition-colors",
        "text-white/70 hover:text-white hover:bg-white/5",
        isPending && "opacity-50 pointer-events-none",
        className
      )}
    >
      <Globe className="h-4 w-4 shrink-0" aria-hidden="true" />
      <label htmlFor="locale-switcher" className="sr-only">
        {t("label")}
      </label>
      <select
        id="locale-switcher"
        value={locale}
        onChange={onSelectChange}
        className="bg-transparent border-none outline-none text-sm cursor-pointer text-white/70 hover:text-white"
        aria-label={t("label")}
      >
        {routing.locales.map((loc) => (
          <option key={loc} value={loc} className="bg-[#1F1F1F] text-white">
            {t(loc)}
          </option>
        ))}
      </select>
    </div>
  );
}

