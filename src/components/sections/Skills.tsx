import { Activity, ArrowUpRight, Bot, Cloud, Code2, Database, GitBranch, ListChecks, ShieldCheck } from "lucide-react";
import { portfolio } from "@/data/portfolio";
import { SectionHeader } from "@/components/SectionHeader";
import { Reveal } from "@/components/Reveal";

const icons = [Database, ListChecks, Code2, Cloud, GitBranch, ShieldCheck, Bot, Activity];

export const Skills = () => (
  <section id="skills" className="section-space page-shell">
    <SectionHeader eyebrow="Toolkit" title={<>The tools I use, <em>grouped by the job.</em></>} subtitle="Each group links to the work where I've used it." />
    <div className="skills-index">
      {portfolio.skills.map((group, index) => {
        const Icon = icons[index];
        return (
          <Reveal className="skill-row" key={group.category}>
            <div className="skill-label">
              <Icon size={22} strokeWidth={1.4} aria-hidden="true" />
              <div><h3>{group.category}</h3><p>{group.purpose}</p></div>
            </div>
            <ul>{group.items.map((item) => <li key={item}>{item}</li>)}</ul>
            <a href={`#work-${group.projectId}`} className="text-link">Related work <ArrowUpRight size={15} /></a>
          </Reveal>
        );
      })}
    </div>
  </section>
);
