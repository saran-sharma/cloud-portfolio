import { portfolio } from "@/data/portfolio";
import { SectionHeader } from "@/components/SectionHeader";
import { Reveal } from "@/components/Reveal";
import { Briefcase } from "lucide-react";

export const Experience = () => (
  <section id="experience" className="relative py-24 bg-surface/40">
    <div className="container">
      <SectionHeader
        eyebrow="Experience"
        title={<>A timeline of <span className="gradient-text">impact</span>.</>}
      />

      <div className="mx-auto mt-14 max-w-4xl">
        <div className="relative">
          <div className="absolute left-4 top-2 bottom-2 w-px bg-gradient-to-b from-primary via-primary/40 to-transparent md:left-1/2" />

          {portfolio.experience.map((exp, i) => (
            <Reveal key={exp.company} delay={i * 100} className="relative mb-10 md:grid md:grid-cols-2 md:gap-10">
              <div className="absolute left-4 top-5 -translate-x-1/2 md:left-1/2">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-primary text-primary-foreground shadow-glow">
                  <Briefcase className="h-4 w-4" />
                </div>
              </div>

              <div className="ml-12 md:ml-0 md:pr-12 md:text-right">
                <div className="font-mono text-xs text-primary">{exp.period}</div>
                <div className="mt-1 text-sm text-muted-foreground">{exp.location}</div>
              </div>

              <div className="ml-12 mt-3 md:ml-0 md:mt-0 md:pl-12">
                <div className="glass rounded-2xl p-6 hover-lift">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <h3 className="text-lg font-semibold">{exp.role}</h3>
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    <span className="text-foreground">{exp.company}</span> · {exp.client}
                  </div>
                  <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                    {exp.bullets.map((b) => (
                      <li key={b} className="flex gap-2">
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  </section>
);
