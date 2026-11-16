import { portfolio } from "@/data/portfolio";
import { SectionHeader } from "@/components/SectionHeader";
import { Reveal } from "@/components/Reveal";

export const Experience = () => (
  <section id="experience" className="section-space experience-section">
    <div className="page-shell">
      <SectionHeader eyebrow="Experience" title={<>What I do <em>day to day.</em></>} index="04" />
      {portfolio.experience.map((experience) => (
        <Reveal className="experience-layout" key={experience.company}>
          <div className="experience-role">
            <p className="experience-current"><span className="status-dot" aria-hidden="true" /> Current role</p>
            <h3>{experience.role}</h3>
            <p className="experience-company">{experience.company}</p>
            <p className="experience-location">{experience.location}</p>
            <p className="experience-since">{experience.since}</p>
            <p className="experience-intro">{experience.intro}</p>
          </div>
          <ul className="experience-themes" data-progress="">
            {experience.themes.map((theme) => (
              <li key={theme.title} data-progress=""><h4>{theme.title}</h4><p>{theme.text}</p></li>
            ))}
          </ul>
        </Reveal>
      ))}
    </div>
  </section>
);
