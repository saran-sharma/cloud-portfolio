import { useEffect, useState } from "react";
import { Download, Github, Linkedin, Mail } from "lucide-react";
import { portfolio } from "@/data/portfolio";
import { useCity } from "@/city/state/CityProvider";

const TABS = ["Profile", "Experience", "Credentials", "Contact"] as const;
type Tab = (typeof TABS)[number];

export const EngineerMission = ({ onComplete }: { onComplete: () => void }) => {
  const { setMode } = useCity();
  const [tab, setTab] = useState<Tab>("Profile");
  const [seen, setSeen] = useState<Tab[]>(["Profile"]);
  const p = portfolio.profile;
  const job = portfolio.experience[0];
  const done = seen.length === TABS.length;

  useEffect(() => {
    if (done) onComplete();
  }, [done, onComplete]);

  const open = (next: Tab) => {
    setTab(next);
    setSeen((list) => (list.includes(next) ? list : [...list, next]));
  };

  return (
    <div className="sc-mission-body">
      <div role="tablist" aria-label="Dossier" className="sc-tabs">
        {TABS.map((name) => (
          <button key={name} type="button" role="tab" id={`tab-${name}`} aria-selected={tab === name} aria-controls={`panel-${name}`} className={`${tab === name ? "is-on" : ""} ${seen.includes(name) ? "is-seen" : ""}`} onClick={() => open(name)}>{name}</button>
        ))}
      </div>
      <p className="sc-note">{seen.length} of {TABS.length} sections read.</p>

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="sc-inspector is-wide">
        {tab === "Profile" && (
          <>
            <h3>{p.name}, {p.title}</h3>
            <p>{portfolio.about.paragraphs[0]}</p>
            <p>{portfolio.about.paragraphs[1]}</p>
            <h4>How I work</h4>
            <ul className="sc-bullets">{portfolio.about.principles.map((item) => <li key={item.title}><strong>{item.title}.</strong> {item.text}</li>)}</ul>
          </>
        )}
        {tab === "Experience" && (
          <>
            <h3>{job.role}, {job.company}</h3>
            <p>{job.location}. {job.since}.</p>
            <ul className="sc-bullets">{job.themes.map((theme) => <li key={theme.title}><strong>{theme.title}.</strong> {theme.text}</li>)}</ul>
          </>
        )}
        {tab === "Credentials" && (
          <>
            <h3>Certifications</h3>
            <ul className="sc-bullets">{portfolio.certifications.map((cert) => <li key={cert.name}>{cert.name}, {cert.issuer}{cert.date ? `, ${cert.date}` : ""}</li>)}</ul>
            <h3>Education</h3>
            <ul className="sc-bullets">{portfolio.education.map((item) => <li key={item.degree}>{item.degree}, {item.school}, {item.period}</li>)}</ul>
          </>
        )}
        {tab === "Contact" && (
          <>
            <h3>Get in touch</h3>
            <p>I'm open to relevant professional opportunities and engineering collaborations.</p>
            <ul className="sc-links">
              <li><a href={`mailto:${p.email}`}><Mail size={16} /> {p.email}</a></li>
              <li><a href={p.linkedin} target="_blank" rel="noreferrer"><Linkedin size={16} /> LinkedIn</a></li>
              <li><a href={p.github} target="_blank" rel="noreferrer"><Github size={16} /> GitHub</a></li>
              <li><a href={p.resumeUrl} download><Download size={16} /> Download resume</a></li>
            </ul>
            <div className="sc-actions"><button type="button" className="sc-btn" onClick={() => setMode("recruiter", "contact")}>Open the contact form in Recruiter Mode</button></div>
          </>
        )}
      </div>

      {done && <p className="sc-message is-good" role="status">You have met the engineer. Recruiter Mode has the same information in a conventional layout, any time.</p>}
    </div>
  );
};
