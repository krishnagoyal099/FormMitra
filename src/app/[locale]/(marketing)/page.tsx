import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { Hero } from "@/components/marketing/hero";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { CTA } from "@/components/marketing/cta";
import { Footer } from "@/components/marketing/footer";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/shared/language-switcher";

export default function LandingPage() {
  return (
    <>
      <header className="fixed top-0 inset-x-0 w-full z-50 bg-[#F7F7F7]/80 backdrop-blur-md border-b border-black/5">
        <div className="w-full flex h-20 items-center justify-between px-6 md:px-8">
          <Link href="/" className="flex items-center gap-3 font-semibold text-black text-xl tracking-tight">
            <Image src="/logo.svg" alt="FormMitra Logo" width={40} height={40} className="rounded-md" />
            FormMitra
          </Link>
          <nav className="flex items-center gap-4">
            <LanguageSwitcher />
            <Button variant="ghost" asChild className="text-black hover:text-black hover:bg-black/10 text-sm"><Link href="/login">Sign in</Link></Button>
            <Button asChild className="bg-black text-white hover:bg-black/90 rounded-none px-6"><Link href="/register">Get started</Link></Button>
          </nav>
        </div>
      </header>
      
      <main className="flex-1 w-full pt-20">
        <Hero />
        <FeatureGrid />
        <HowItWorks />
        <CTA />
      </main>

      <Footer />
    </>
  );
}