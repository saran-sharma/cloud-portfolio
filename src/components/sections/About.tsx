import { portfolio } from "@/data/portfolio";
import { SectionHeader } from "@/components/SectionHeader";
import { Reveal } from "@/components/Reveal";
import { GraduationCap } from "lucide-react";

export const About = () => (
  <section id="about" className="relative py-24">
    <div className="container">
      <SectionHeader
        eyebrow="About"
        title={<>Engineer behind the <span className="gradient-text">platform</span>.</>}
        subtitle="I build the boring, reliable, well-instrumented layer that lets product teams ship fast on Azure."
      />

      <div className="mx-auto mt-14 grid max-w-5xl gap-10 lg:grid-cols-[1.5fr_1fr]">
        <Reveal className="space-y-5 text-muted-foreground leading-relaxed">
          {portfolio.about.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </Reveal>

        <Reveal delay={150} className="glass rounded-2xl p-6">
          <h3 className="flex items-center gap-2 font-semibold">
            <GraduationCap className="h-4 w-4 text-primary" /> Education
          </h3>
          <ul className="mt-4 space-y-4">
            {portfolio.education.map((e) => (
              <li key={e.school} className="border-l-2 border-primary/50 pl-4">
                <div className="font-medium">{e.degree}</div>
                <div className="text-sm text-muted-foreground">{e.school}</div>
                <div className="mt-1 font-mono text-xs text-primary">{e.period}</div>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>

      <div className="mx-auto mt-16 grid max-w-5xl grid-cols-2 gap-4 sm:grid-cols-4">
        {portfolio.about.stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 80} className="glass rounded-2xl p-5 text-center hover-lift">
            <div className="gradient-text text-3xl font-bold sm:text-4xl">{s.value}</div>
            <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);
