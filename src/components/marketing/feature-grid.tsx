// src/components/marketing/feature-grid.tsx
import Image from "next/image";

const FEATURES = [
  { image: "/lock.svg", title: "Secure Guard", desc: "We fortify your AI deployments with robust security protocols. Our team ensures every model adheres to strict data privacy standards." },
  { image: "/AI-brain.svg", title: "Agent Build", desc: "Tailored AI agents designed for your specific needs. We develop custom logic and workflows that integrate deeply with your existing tools." },
  { image: "/cloud.svg", title: "Cloud Scale", desc: "Infrastructure optimization for high-traffic AI apps. We ensure your systems remain fast, responsive, and ready for any level of demand." },
  { image: "/data.svg", title: "Data Mining", desc: "Transform raw information into actionable intelligence. We build the pipelines and vector stores that power your organization's future." },
];

export function FeatureGrid() {
  return (
    <section className="relative z-10 w-full pb-24 border-t border-white/5 bg-dot-pattern">
      <div className="grid grid-cols-1 md:grid-cols-4 w-full">
        {FEATURES.map((f, i) => (
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
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed pr-4">
              {f.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
