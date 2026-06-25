// src/components/marketing/how-it-works.tsx
import { getTranslations } from "next-intl/server";
import { Upload, BrainCircuit, ClipboardCheck, Send } from "lucide-react";

export async function HowItWorks() {
  const t = await getTranslations("Marketing");

  const STEPS = [
    { icon: Upload,          num: "01", title: t("step1Title"), desc: t("step1Desc") },
    { icon: BrainCircuit,   num: "02", title: t("step2Title"), desc: t("step2Desc") },
    { icon: ClipboardCheck, num: "03", title: t("step3Title"), desc: t("step3Desc") },
    { icon: Send,            num: "04", title: t("step4Title"), desc: t("step4Desc") },
  ];

  return (
    <section className="relative z-10 w-full py-24 border-t border-black/5">
      <div className="grid grid-cols-1 md:grid-cols-4 w-full">
        <div className="col-span-1 px-6 md:px-8 border-r border-transparent mb-12 md:mb-0">
          <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-black">{t("workflowTitle")}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 w-full mt-12 md:mt-24">
        {STEPS.map((s) => (
          <div key={s.num} className="col-span-1 px-6 md:px-8 flex flex-col mb-12 md:mb-0 border-r border-transparent">
            <div className="text-7xl font-mono text-black/10 mb-8 font-bold">{s.num}</div>
            <h3 className="font-mono text-2xl font-bold tracking-tight text-black mb-4">{s.title}</h3>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
