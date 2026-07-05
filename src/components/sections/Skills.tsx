import { portfolio } from "@/data/portfolio";
import { SectionHeader } from "@/components/SectionHeader";
import { Reveal } from "@/components/Reveal";
import { Cloud, Code2, GitBranch, Boxes, Activity, Terminal, Database } from "lucide-react";

const icons = {
  "Cloud": Cloud,
  "Infrastructure as Code": Code2,
  "CI/CD & Automation": GitBranch,
  "Containers & Platforms": Boxes,
  "Observability & SRE": Activity,
  "Languages & Scripting": Terminal,
  "Data & Analytics": Database,
} as const;

export const Skills = () => (
  <section id="skills" className="relative py-24">
    <div className="container">
      <SectionHeader
        eyebrow="Skills"
        title={<>The <span className="gradient-text">toolbox</span>.</>}
        subtitle="Deep Azure and platform engineering skill set, kept sharp on real production systems."
      />

      <div className="mx-auto mt-14 grid max-w-6xl gap-5 md:grid-cols-2 lg:grid-cols-3">
        {portfolio.skills.map((group, i) => {
          const Icon = icons[group.category as keyof typeof icons] ?? Cloud;
          return (
            <Reveal key={group.category} delay={i * 60} className="group glass rounded-2xl p-6 hover-lift">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-gradient-primary group-hover:text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold">{group.category}</h3>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {group.items.map((s) => (
                  <span
                    key={s}
                    className="rounded-md border border-border bg-secondary/40 px-2.5 py-1 font-mono text-xs text-muted-foreground"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  </section>
);
