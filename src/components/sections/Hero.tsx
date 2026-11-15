import { ArrowRight, ArrowUpRight, Download } from "lucide-react";
import { portfolio } from "@/data/portfolio";
import { usePointerTilt } from "@/hooks/use-pointer-tilt";
import { CitySkyline } from "@/city/components/CitySkyline";
import { useSkyParallax } from "@/city/hooks/use-sky-parallax";
import { characterAlt, characterImage, hasCharacterArt } from "@/city/character";

const specialties = ["Azure", "Databricks", "Fabric", "PySpark", "DevOps", "AI"];

export const Hero = () => {
  const p = portfolio.profile;
  const { ref, interactive, handlers } = usePointerTilt<HTMLElement>();
  const sky = useSkyParallax<HTMLElement>();
  return (
    <section id="top" className="hero" ref={sky}>
      <div className="hero-sky" aria-hidden="true">
        <i className="sc-sun" />
        <CitySkyline />
      </div>
      <div className="hero-inner page-shell">
        <div className="hero-head">
          <p className="hero-eyebrow">Hello, I'm Saran <span aria-hidden="true">&middot;</span> {p.location}</p>
          <h1 className="hero-title">
            <span className="sr-only">Saran S., Data Platform Engineer. </span>
            <span className="line">I build</span>{" "}
            <span className="line is-accent">data platforms.</span>{" "}
            <span className="line is-sub">I automate what</span>{" "}
            <span className="line is-sub">slows them down.</span>
          </h1>
        </div>

        <figure ref={ref} className={`hero-photo ${interactive ? "is-interactive" : ""} ${hasCharacterArt ? "is-art" : ""}`} {...handlers}>
          <div className="photo-stage">
            <img src={characterImage} alt={hasCharacterArt ? characterAlt : `Portrait of ${p.name}`} width={1254} height={1254} loading="eager" decoding="async" draggable={false} />
          </div>
          <div className="photo-ambient" aria-hidden="true" />
          <div className="photo-light" aria-hidden="true" />
          <div className="photo-ruler" aria-hidden="true" />
          <figcaption>
            <strong>{p.name}</strong>
            <span>{p.title}</span>
            <span>{p.location}</span>
          </figcaption>
        </figure>

        <div className="hero-body">
          <p className="hero-lead">I'm a Data Platform Engineer at Capgemini, working across Microsoft Azure, enterprise data platforms, cloud infrastructure, Databricks, Microsoft Fabric and AI-enabled engineering.</p>
          <p>I enjoy solving real engineering problems, from reliable data pipelines and platform operations to infrastructure automation, governance and intelligent workflows.</p>
          <ul className="hero-tech" aria-label="Technology specialties">
            {specialties.map((item) => <li key={item}>{item}</li>)}
          </ul>
          <div className="hero-cta">
            <a className="action-button action-primary" href="#projects">Explore My Work <ArrowRight size={18} /></a>
            <a className="action-button action-secondary" href={p.resumeUrl} download><Download size={17} /> Download Resume</a>
          </div>
          <div className="hero-socials">
            <a href={p.linkedin} target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight size={15} /></a>
            <a href={p.github} target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={15} /></a>
          </div>
        </div>
      </div>
    </section>
  );
};
