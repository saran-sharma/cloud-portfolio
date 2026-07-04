import { portfolio } from "@/data/portfolio";
import { SectionHeader } from "@/components/SectionHeader";
import { Reveal } from "@/components/Reveal";
import { Cloud, Layers, Boxes, GitBranch, Activity, Sparkles } from "lucide-react";

const icons = { Cloud, Layers, Boxes, GitBranch, Activity, Sparkles } as const;

export const Services = () => (
  <section id="services" className="relative py-24 bg-surface/40">
    <div className="container">
      <SectionHeader
        eyebrow="Services"
        title={<>How I can <span className="gradient-text">help</span>.</>}
        subtitle="From landing zones to AI-assisted operations — pick the layer, I'll bring the paved road."
      />
      <div className="mx-auto mt-14 grid max-w-6xl gap-5 md:grid-cols-2 lg:grid-cols-3">
        {portfolio.services.map((s, i) => {
          const Icon = icons[s.icon as keyof typeof icons] ?? Cloud;
          return (
            <Reveal key={s.title} delay={i * 70} className="glass group rounded-2xl p-6 hover-lift">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
            </Reveal>
          );
        })}
      </div>
    </div>
  </section>
);
