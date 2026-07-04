import { portfolio } from "@/data/portfolio";
import { SectionHeader } from "@/components/SectionHeader";

export const TechStack = () => (
  <section id="tech" className="relative py-24">
    <div className="container">
      <SectionHeader
        eyebrow="Tech stack"
        title={<>Everyday <span className="gradient-text">stack</span>.</>}
      />
      <div className="mx-auto mt-12 max-w-5xl">
        <div className="flex flex-wrap justify-center gap-2">
          {portfolio.techStack.map((t) => (
            <span
              key={t}
              className="rounded-full border border-border bg-secondary/40 px-4 py-2 font-mono text-sm text-muted-foreground transition-all hover:border-primary hover:text-primary hover:shadow-glow"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  </section>
);
