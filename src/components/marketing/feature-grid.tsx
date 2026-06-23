// src/components/marketing/feature-grid.tsx
import Image from "next/image";
import { getTranslations } from "next-intl/server";

export async function FeatureGrid() {
  const t = await getTranslations("Marketing");

  const FEATURES = [
    { image: "/lock.svg",     title: t("feature1Title"), desc: t("feature1Desc") },
    { image: "/AI-brain.svg", title: t("feature2Title"), desc: t("feature2Desc") },
    { image: "/cloud.svg",    title: t("feature3Title"), desc: t("feature3Desc") },
    { image: "/data.svg",     title: t("feature4Title"), desc: t("feature4Desc") },
  ];

  return (
    <section className="relative z-10 w-full pb-24 border-t border-white/5 bg-dot-pattern">
      <div className="grid grid-cols-1 md:grid-cols-4 w-full">
        {FEATURES.map((f) => (
          <div key={f.title} className="col-span-1 px-6 md:px-8 flex flex-col pb-12 pt-16 group">
            <div className="w-full flex items-center justify-center mb-12 relative aspect-square">
              <Image
                src={f.image}
                alt={f.title}
                width={600}
                height={600}
                className="w-full h-auto opacity-80 group-hover:opacity-100 group-hover:-translate-y-2 transition-all duration-700 ease-out object-contain"
              />
            </div>
            <h3 className="font-mono text-xl md:text-2xl font-bold tracking-wider text-white mb-4">{f.title}</h3>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed pr-4">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
