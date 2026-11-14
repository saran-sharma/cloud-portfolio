import { portfolio } from "@/data/portfolio";
import { Reveal } from "@/components/Reveal";

export const About = () => (
  <section id="about" className="section-space page-shell">
    <div className="about-layout">
      <Reveal className="about-intro">
        <p className="eyebrow">About me</p>
        <h2 className="about-title">Platforms that are easy to run, <em>and easy to trust.</em></h2>
        <ol className="journey" aria-label="Background">
          {portfolio.about.journey.map((step) => (
            <li key={step.title}>
              <span className="journey-when">{step.when}</span>
              <div><strong>{step.title}</strong><span>{step.detail}</span></div>
            </li>
          ))}
        </ol>
      </Reveal>
      <Reveal delay={80} className="about-copy">
        {portfolio.about.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        <h3 className="about-subhead">How I work</h3>
        <dl className="principles">
          {portfolio.about.principles.map((principle) => (
            <div key={principle.title}><dt>{principle.title}</dt><dd>{principle.text}</dd></div>
          ))}
        </dl>
      </Reveal>
    </div>
  </section>
);
