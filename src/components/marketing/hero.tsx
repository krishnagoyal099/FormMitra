// src/components/marketing/hero.tsx
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles } from "lucide-react";

export async function Hero() {
  const t = await getTranslations("Marketing");

  return (
    <section className="relative z-10 w-full min-h-[85vh] flex items-center pt-32 pb-24 md:pt-40 md:pb-32">
      <div className="grid grid-cols-1 md:grid-cols-4 w-full h-full">
        {/* Left side spacer / meta info */}
        <div className="col-span-1 hidden md:flex flex-col justify-end pb-8 px-6 md:px-8 border-r border-transparent">
          <Badge variant="outline" className="w-fit mb-6 gap-1.5 py-1.5 border-black/20 bg-background/50 text-black/80">
            <Sparkles className="h-3.5 w-3.5" /> {t("poweredBy")}
          </Badge>
          <div className="text-xs text-muted-foreground uppercase tracking-widest space-y-1">
            <p>{t("encryptedAtRest")}</p>
            <p>{t("soc2Ready")}</p>
          </div>
        </div>

        {/* Main Title content */}
        <div className="col-span-1 md:col-span-3 flex flex-col justify-end px-6 md:px-8">
          <Badge variant="outline" className="w-fit mb-6 gap-1.5 py-1.5 border-black/20 bg-background/50 text-black/80 md:hidden">
            <Sparkles className="h-3.5 w-3.5" /> {t("poweredBy")}
          </Badge>
          <h1 className="text-balance text-5xl font-medium tracking-tighter text-black sm:text-7xl md:text-8xl lg:text-9xl whitespace-pre-line">
            {t("heroTitle")}
          </h1>
          <p className="mt-8 max-w-3xl text-pretty text-xl text-muted-foreground md:text-2xl leading-relaxed">
            {t("heroSubtitle")}
          </p>
          <div className="mt-16 flex flex-col sm:flex-row items-start gap-4">
            <Button size="lg" asChild className="gap-2 bg-black text-white hover:bg-black/90 rounded-none px-10 h-14 text-base">
              <Link href="/register">{t("startFree")} <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="rounded-none px-10 h-14 text-base border-black/20 bg-transparent text-black hover:bg-black/10 hover:text-black">
              <Link href="/login">{t("signIn")}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
