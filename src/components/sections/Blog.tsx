import { portfolio } from "@/data/portfolio";
import { SectionHeader } from "@/components/SectionHeader";
import { Reveal } from "@/components/Reveal";
import { ArrowUpRight } from "lucide-react";

export const Blog = () => (
  <section id="blog" className="relative py-24 bg-surface/40">
    <div className="container">
      <SectionHeader
        eyebrow="Writing"
        title={<>Notes from the <span className="gradient-text">field</span>.</>}
        subtitle="Long-form posts on Azure platform engineering, SRE and AI-powered operations. Coming soon."
      />
      <div className="mx-auto mt-14 grid max-w-6xl gap-6 md:grid-cols-3">
        {portfolio.blog.map((b, i) => (
          <Reveal key={b.title} delay={i * 80} className="group glass rounded-2xl p-6 hover-lift">
            <div className="flex items-center justify-between text-xs">
              <span className="rounded-md bg-primary/10 px-2 py-1 font-mono text-primary">{b.tag}</span>
              <span className="text-muted-foreground">{b.date}</span>
            </div>
            <h3 className="mt-4 font-semibold group-hover:text-primary transition-colors">{b.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{b.excerpt}</p>
            <div className="mt-4 inline-flex items-center gap-1 text-sm text-primary">
              Read <ArrowUpRight className="h-4 w-4" />
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);
