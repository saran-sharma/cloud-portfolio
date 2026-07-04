import { portfolio } from "@/data/portfolio";
import { SectionHeader } from "@/components/SectionHeader";
import { Reveal } from "@/components/Reveal";
import { ArrowUpRight } from "lucide-react";

export const Projects = () => (
  <section id="projects" className="relative py-24 bg-surface/40">
    <div className="container">
      <SectionHeader
        eyebrow="Featured work"
        title={<>Projects with <span className="gradient-text">measurable</span> impact.</>}
        subtitle="A selection of platform, migration and AI-ops initiatives shipped in production."
      />

      <div className="mx-auto mt-14 grid max-w-6xl gap-6 md:grid-cols-2">
        {portfolio.projects.map((p, i) => (
          <Reveal key={p.title} delay={i * 80} className="group glass overflow-hidden rounded-2xl hover-lift">
            <div className="relative aspect-[16/10] overflow-hidden">
              <img
                src={p.image}
                alt={`${p.title} preview`}
                loading="lazy"
                width={1280}
                height={800}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">{p.title}</h3>
                <ArrowUpRight className="h-5 w-5 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{p.summary}</p>
              <div className="mt-3 font-mono text-xs text-accent">→ {p.impact}</div>
              <div className="mt-4 flex flex-wrap gap-2">
                {p.tags.map((t) => (
                  <span key={t} className="rounded-md border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);
