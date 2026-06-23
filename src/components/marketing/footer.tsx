// src/components/marketing/footer.tsx
import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Twitter, Linkedin, Youtube, Instagram } from "lucide-react";

export async function Footer() {
  const t = await getTranslations("Marketing");
  return (
    <footer className="relative z-10 w-full pt-24 pb-8 overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-4 w-full mb-24">
        {/* Logo Column */}
        <div className="col-span-1 flex flex-col items-start justify-start px-6 md:px-8 border-r border-transparent">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Image src="/logo.svg" alt="FormMitra Logo" width={64} height={64} className="rounded-xl" />
          </Link>
        </div>

        {/* Quick Links Column */}
        <div className="col-span-1 px-6 md:px-8 border-r border-transparent">
          <h4 className="text-xs font-medium tracking-widest text-muted-foreground uppercase mb-6">Quick Links</h4>
          <ul className="space-y-4 text-sm text-white/80">
            <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
            <li><Link href="/login" className="hover:text-white transition-colors">Sign in</Link></li>
            <li><Link href="/register" className="hover:text-white transition-colors">Get Started</Link></li>
          </ul>
        </div>

        {/* Company Column */}
        <div className="col-span-1 px-6 md:px-8 border-r border-transparent">
          <h4 className="text-xs font-medium tracking-widest text-muted-foreground uppercase mb-6">Company</h4>
          <ul className="space-y-4 text-sm text-white/80">
            <li><Link href="#" className="hover:text-white transition-colors">About Us</Link></li>
            <li><Link href="#" className="hover:text-white transition-colors">Contact Us</Link></li>
            <li><Link href="#" className="hover:text-white transition-colors">Book a Call</Link></li>
          </ul>
        </div>

        {/* Policies Column */}
        <div className="col-span-1 px-6 md:px-8">
          <h4 className="text-xs font-medium tracking-widest text-muted-foreground uppercase mb-6">Policies</h4>
          <ul className="space-y-4 text-sm text-white/80 mb-8">
            <li><Link href="#" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
            <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
          </ul>
          <div className="flex items-center gap-4">
            <Link href="#" className="p-2 border border-white/10 rounded-md hover:bg-white/5 transition-colors"><Twitter className="h-4 w-4 text-white" /></Link>
            <Link href="#" className="p-2 border border-white/10 rounded-md hover:bg-white/5 transition-colors"><Linkedin className="h-4 w-4 text-white" /></Link>
            <Link href="#" className="p-2 border border-white/10 rounded-md hover:bg-white/5 transition-colors"><Youtube className="h-4 w-4 text-white" /></Link>
            <Link href="#" className="p-2 border border-white/10 rounded-md hover:bg-white/5 transition-colors"><Instagram className="h-4 w-4 text-white" /></Link>
          </div>
        </div>
      </div>

      <div className="relative w-full flex items-center justify-center px-4">
        <h2 className="text-[12vw] sm:text-[14vw] font-bold tracking-tighter text-white leading-none pb-8">
          FormMitra
        </h2>
      </div>

      <div className="mt-8 flex flex-col md:flex-row items-center justify-between text-xs text-muted-foreground pt-8 px-6 md:px-8 border-t border-white/10">
        <p>{t("copyright")}</p>
        <p>{t("poweredByFooter")}</p>
      </div>
    </footer>
  );
}

