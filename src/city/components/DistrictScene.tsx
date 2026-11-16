import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { portfolio } from "@/data/portfolio";
import { OpenCaseStudy } from "@/components/sections/Projects";
import { trackResumeDownload } from "@/lib/analytics";
import { DialogTrigger } from "@/components/ui/dialog";
import { DistrictEnvironment } from "@/city/components/DistrictEnvironment";
import { MissionBoard } from "@/city/components/MissionBoard";
import { MiniMap } from "@/city/components/MiniMap";
import { PlayerFace } from "@/city/components/PlayerFace";
import { useReducedMotion } from "@/city/hooks/use-reduced-motion";
import { getDistrict } from "@/city/data/districts";
import { XP } from "@/city/state/game-state";
import { useCity } from "@/city/state/CityProvider";
import type { DistrictId } from "@/city/types";

export const DistrictScene = ({ id, intro = true }: { id: DistrictId; intro?: boolean }) => {
  const district = getDistrict(id);
  const { progress, discoverDistrict, openProject, setMode } = useCity();
  const reduced = useReducedMotion();
  const [showIntro, setShowIntro] = useState(intro && !reduced);
  const [unlock, setUnlock] = useState(false);
  const projects = district.projectIds.map((projectId) => portfolio.projects.find((project) => project.id === projectId)).filter(Boolean);

  useEffect(() => {
    if (!showIntro) return;
    const timer = window.setTimeout(() => setShowIntro(false), 1800);
    return () => window.clearTimeout(timer);
  }, [showIntro]);

  useEffect(() => {
    if (showIntro) return;
    if (!discoverDistrict(id)) return;
    setUnlock(true);
    const timer = window.setTimeout(() => setUnlock(false), 2600);
    return () => window.clearTimeout(timer);
  }, [id, discoverDistrict, showIntro]);

  const isHq = id === "headquarters";

  return (
    <section className={`sc-district ${showIntro ? "is-intro" : ""}`} style={{ ["--accent" as string]: district.accent }} aria-labelledby="sc-district-title">
      <DistrictEnvironment id={district.environment} animate={!reduced} />
      <div className="sc-district-shade" aria-hidden="true" />

      {showIntro && (
        <button type="button" className="sc-district-intro" onClick={() => setShowIntro(false)} aria-label={`Skip introduction to ${district.name}`}>
          <span>DISTRICT {district.number}</span>
          <strong>{district.name}</strong>
          <em>{district.tagline}</em>
          <small>Click to skip</small>
        </button>
      )}

      {unlock && (
        <div className="sc-unlock" role="status">
          <span>DISTRICT DISCOVERED</span>
          <b>+{XP.district} XP</b>
        </div>
      )}

      <div className="sc-district-body">
        <header className="sc-district-head">
          <p className="sc-kicker">DISTRICT {district.number}</p>
          <h1 id="sc-district-title">{district.name}</h1>
          <p className="sc-tagline">{district.tagline}</p>
          <p>{district.intro}</p>
        </header>

        <div className="sc-district-grid">
          <div>
            <h2>What I work with here</h2>
            <ul className="sc-chips" aria-label="Technologies and topics">
              {district.specialties.map((item) => <li key={item}>{item}</li>)}
            </ul>

            {isHq && (
              <div className="sc-dossier">
                <PlayerFace className="is-large" />
                <div>
                  <strong>{portfolio.profile.name}</strong>
                  <span>{portfolio.profile.title}</span>
                  <span>{portfolio.experience[0].company}, {portfolio.experience[0].location}. {portfolio.experience[0].since}.</span>
                  <span>{portfolio.certifications[0].name}</span>
                  <span>{portfolio.education[0].degree}, {portfolio.education[0].school}</span>
                  <p className="sc-actions">
                    <a className="sc-btn is-quiet" href={portfolio.profile.resumeUrl} download onClick={() => trackResumeDownload("game_hq")}>Download resume</a>
                    <button type="button" className="sc-btn is-quiet" onClick={() => setMode("recruiter", "contact")}>Contact form</button>
                  </p>
                </div>
              </div>
            )}
          </div>

          <div>
            <h2>{isHq ? "Side project" : "Projects in this district"}</h2>
            <ul className="sc-project-list">
              {projects.map((project) => project && (
                <li key={project.id}>
                  <p className="sc-label">{project.workType}</p>
                  <h3>{project.title}</h3>
                  <p>{project.summary}</p>
                  <p className="sc-note"><b>My part:</b> {project.myPart}</p>
                  <OpenCaseStudy project={project}>
                    <DialogTrigger asChild>
                      <button type="button" className="sc-btn is-quiet" onClick={() => openProject(project.id)}>
                        {progress.projects.includes(project.id) ? "Read again" : `View case study +${XP.project} XP`} <ArrowUpRight size={15} />
                      </button>
                    </DialogTrigger>
                  </OpenCaseStudy>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <MissionBoard district={district} />
      </div>

      <MiniMap current={id} />
    </section>
  );
};
