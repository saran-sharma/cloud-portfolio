import { portfolio } from "@/data/portfolio";
import { SectionHeader } from "@/components/SectionHeader";
import { Reveal } from "@/components/Reveal";
import { BadgeCheck } from "lucide-react";

export const Certifications = () => (
  <section id="certifications" className="relative py-24">
    <div className="container">
      <SectionHeader
        eyebrow="Certifications"
        title={<>Verified <span className="gradient-text">expertise</span>.</>}
      />
      <div className="mx-auto mt-14 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {portfolio.certifications.map((c, i) => (
          <Reveal key={c.code} delay={i * 70} className="glass group relative overflow-hidden rounded-2xl p-6 hover-lift">
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-primary opacity-20 blur-2xl transition-opacity group-hover:opacity-40" />
            <BadgeCheck className="h-8 w-8 text-primary" />
            <div className="mt-4 font-mono text-xs uppercase tracking-wider text-accent">{c.code}</div>
            <div className="mt-1 font-semibold">{c.name}</div>
            <div className="mt-1 text-xs text-muted-foreground">{c.issuer}</div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);
