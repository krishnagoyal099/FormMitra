// src/components/marketing/cta.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="relative z-10 w-full py-32 border-t border-white/5 bg-white/5">
      <div className="grid grid-cols-1 md:grid-cols-4 w-full h-full">
        <div className="col-span-1 md:col-span-3 px-6 md:px-8 flex flex-col justify-center">
          <h2 className="text-4xl sm:text-6xl md:text-8xl font-medium tracking-tighter text-white mb-6">
            Ready to deploy?
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl leading-relaxed">
            Create your secure profile today and let ASI:ONE handle the underlying infrastructure.
          </p>
        </div>
        <div className="col-span-1 px-6 md:px-8 flex items-center justify-start md:justify-end mt-12 md:mt-0">
          <Button size="lg" asChild className="bg-white text-black hover:bg-white/90 rounded-none px-10 h-16 text-lg w-full md:w-auto">
            <Link href="/register">Initialize</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
