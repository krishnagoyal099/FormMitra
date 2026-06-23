// src/components/marketing/hero.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, FileCheck2, Sparkles, ShieldCheck } from "lucide-react";

export function Hero() {
  return (
    <section className="relative z-10 w-full min-h-[85vh] flex items-center pt-32 pb-24 md:pt-40 md:pb-32">
      <div className="grid grid-cols-1 md:grid-cols-4 w-full h-full">
        {/* Left side spacer / meta info */}
        <div className="col-span-1 hidden md:flex flex-col justify-end pb-8 px-6 md:px-8 border-r border-transparent">
          <Badge variant="outline" className="w-fit mb-6 gap-1.5 py-1.5 border-white/20 bg-background/50 text-white/80">
            <Sparkles className="h-3.5 w-3.5" /> Powered by ASI:ONE
          </Badge>
          <div className="text-xs text-muted-foreground uppercase tracking-widest space-y-1">
            <p>Encrypted at rest</p>
            <p>SOC2-ready</p>
          </div>
        </div>

        {/* Main Title content */}
        <div className="col-span-1 md:col-span-3 flex flex-col justify-end px-6 md:px-8">
          <Badge variant="outline" className="w-fit mb-6 gap-1.5 py-1.5 border-white/20 bg-background/50 text-white/80 md:hidden">
            <Sparkles className="h-3.5 w-3.5" /> Powered by ASI:ONE
          </Badge>
          <h1 className="text-balance text-5xl font-medium tracking-tighter text-white sm:text-7xl md:text-8xl lg:text-9xl">
            Power your<br />applications.
          </h1>
          <p className="mt-8 max-w-3xl text-pretty text-xl text-muted-foreground md:text-2xl leading-relaxed">
           Navigating bureaucracy shouldn&apos;t be a full-time job. AI automatically tracks your documents, checks eligibility, and plans your next move.
          </p>
          <div className="mt-16 flex flex-col sm:flex-row items-start gap-4">
            <Button size="lg" asChild className="gap-2 bg-white text-black hover:bg-white/90 rounded-none px-10 h-14 text-base">
              <Link href="/register">Start free <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="rounded-none px-10 h-14 text-base border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white">
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
