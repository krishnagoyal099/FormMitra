// src/components/marketing/how-it-works.tsx
import { Upload, BrainCircuit, ClipboardCheck, Send } from "lucide-react";

const STEPS = [
  { icon: Upload, title: "01. Upload", desc: "Securely upload your IDs, certificates, and resumes to your encrypted vault." },
  { icon: BrainCircuit, title: "02. Analyze", desc: "Paste a link or upload a PDF of the scholarship, internship, or scheme." },
  { icon: ClipboardCheck, title: "03. Verify", desc: "ASI:ONE reasons through the requirements and tells you exactly where you stand." },
  { icon: Send, title: "04. Execute", desc: "Follow the prioritized checklist to close gaps and submit your application." },
];

export function HowItWorks() {
  return (
    <section className="relative z-10 w-full py-24 border-t border-white/5">
      <div className="grid grid-cols-1 md:grid-cols-4 w-full">
        {/* Header spanning one column to match the grid lines */}
        <div className="col-span-1 px-6 md:px-8 border-r border-transparent mb-12 md:mb-0">
          <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-white">The Workflow</h2>
        </div>
        {/* Empty columns for spacing if needed, but here we just map the steps below */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 w-full mt-12 md:mt-24">
        {STEPS.map((s) => (
          <div key={s.title} className="col-span-1 px-6 md:px-8 flex flex-col mb-12 md:mb-0 border-r border-transparent">
            <div className="text-7xl font-mono text-white/10 mb-8 font-bold">{s.title.split('.')[0]}</div>
            <h3 className="font-mono text-2xl font-bold tracking-tight text-white mb-4">{s.title.split('.')[1].trim()}</h3>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

