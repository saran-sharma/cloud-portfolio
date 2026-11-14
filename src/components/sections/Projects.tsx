import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { portfolio, type Project } from "@/data/portfolio";
import { SectionHeader } from "@/components/SectionHeader";
import { Reveal } from "@/components/Reveal";
import { ProjectVisual } from "@/components/ProjectVisual";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const CaseStudy = ({ project }: { project: Project }) => {
  const sections: { title: string; body: React.ReactNode }[] = [
    { title: "Why it exists", body: project.why ? <p>{project.why}</p> : null },
    { title: "What I worked on", body: <p>{project.role}</p> },
    {
      title: "Engineering challenges",
      body: project.challenges?.length ? <ul>{project.challenges.map((item) => <li key={item}>{item}</li>)}</ul> : null,
    },
    { title: "Outcomes", body: project.outcomes?.length ? <ul>{project.outcomes.map((item) => <li key={item}>{item}</li>)}</ul> : null },
    { title: "Tools", body: project.tools.length ? <ul className="plain-list">{project.tools.map((tool) => <li key={tool}>{tool}</li>)}</ul> : null },
  ];
  return (
    <DialogContent className="case-study">
      <p className="eyebrow">{project.workType} <span aria-hidden="true">&middot;</span> {project.category}</p>
      <DialogTitle className="case-study-title">{project.title}</DialogTitle>
      <DialogDescription className="case-study-description">{project.what}</DialogDescription>
      <ProjectVisual project={project} />
      <div className="cs-sections">
        {sections.filter((section) => section.body).map((section) => (
          <section className="cs-section" key={section.title}><h3>{section.title}</h3><div>{section.body}</div></section>
        ))}
      </div>
      <p className="case-study-footnote">Internal names, identifiers and financial data are left out of this overview.</p>
    </DialogContent>
  );
};

export const OpenCaseStudy = ({ project, children }: { project: Project; children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children}
      {open && <CaseStudy project={project} />}
    </Dialog>
  );
};

const FeaturedProject = ({ project, index }: { project: Project; index: number }) => (
  <Reveal className={`feature ${index === 0 ? "is-lead" : ""} ${index % 2 === 1 ? "is-flipped" : ""}`}>
    <article id={`work-${project.id}`} className="feature-body">
      <p className="feature-meta"><span>{String(index + 1).padStart(2, "0")}</span> {project.category}</p>
      <h3>{project.title}</h3>
      <p className="feature-summary">{project.summary}</p>
      <dl className="feature-facts">
        <div><dt>My part</dt><dd>{project.myPart}</dd></div>
        <div><dt>Tools</dt><dd>{project.tools.slice(0, 5).join(", ")}</dd></div>
        {project.highlight && <div><dt>Result</dt><dd>{project.highlight}</dd></div>}
      </dl>
      <OpenCaseStudy project={project}>
        <DialogTrigger asChild>
          <button className="project-open" aria-label={`View case study: ${project.title}`}>View case study <ArrowUpRight size={18} /></button>
        </DialogTrigger>
      </OpenCaseStudy>
    </article>
    <div className="feature-visual"><ProjectVisual project={project} /></div>
  </Reveal>
);

const AdditionalProject = ({ project, index }: { project: Project; index: number }) => (
  <Reveal className="more-item">
    <article id={`work-${project.id}`}>
      <p className="feature-meta"><span>{String(index + 1).padStart(2, "0")}</span> {project.workType}</p>
      <h4>{project.title}</h4>
      <p>{project.summary}</p>
      <OpenCaseStudy project={project}>
        <DialogTrigger asChild>
          <button className="project-open" aria-label={`View case study: ${project.title}`}>View case study <ArrowUpRight size={18} /></button>
        </DialogTrigger>
      </OpenCaseStudy>
    </article>
  </Reveal>
);

export const Projects = () => {
  const featured = portfolio.projects.filter((project) => project.tier === "featured");
  const additional = portfolio.projects.filter((project) => project.tier === "additional");
  return (
    <section id="projects" className="section-space projects-section">
      <div className="page-shell">
        <SectionHeader eyebrow="Selected work" title={<>Work I can <em>explain end to end.</em></>} subtitle="Six projects I can walk through in detail, plus three more. Details are anonymized." />
        <div className="feature-list">
          {featured.map((project, index) => <FeaturedProject key={project.id} project={project} index={index} />)}
        </div>
        <div className="more-work">
          <h3 className="more-heading">More engineering work</h3>
          <div className="more-grid">
            {additional.map((project, index) => <AdditionalProject key={project.id} project={project} index={featured.length + index} />)}
          </div>
        </div>
      </div>
    </section>
  );
};
