import { ArrowRight, BookOpen, Download, Route, Users } from "lucide-react";
import { OpenCaseStudy } from "@/components/sections/Projects";
import { DialogTrigger } from "@/components/ui/dialog";
import { MISSIONS, districtForMission } from "@/city/data/districts";
import { useCity } from "@/city/state/CityProvider";
import type { MissionId } from "@/city/types";
import { portfolio } from "@/data/portfolio";
import { trackResumeDownload } from "@/lib/analytics";

const stops = [
  { mission: "harbor-dispatch", project: "ideas", title: "Keep the data trustworthy", detail: "See how validation and safe reprocessing protect the numbers people use." },
  { mission: "least-privilege", project: "access-review", title: "Give systems only what they need", detail: "Explore how access controls and an auditable workflow fit together." },
  { mission: "agent-review", project: "incident-intelligence", title: "Keep a human in the review loop", detail: "Compare a simulated AI recommendation with the evidence it actually has." },
] as const satisfies readonly { mission: MissionId; project: string; title: string; detail: string }[];

const expansion: readonly MissionId[] = [
  "harbor-dispatch", "backfill-planner", "least-privilege", "terraform-review", "runbook-builder", "kql-detective", "agent-review",
];

export const RecruiterTour = () => {
  const { go, progress, setMode, openProject } = useCity();
  const openMission = (id: MissionId) => go({ name: "mission", id });

  return (
    <section className="sc-mission sc-tour" aria-labelledby="sc-tour-title">
      <header className="sc-mission-head">
        <p className="sc-kicker">SARAN UNIVERSE / VISITOR BRIEFING</p>
        <h1 id="sc-tour-title">The 3-minute tour</h1>
        <p>Three short stops show how I think about data, access and AI. Read the case studies for the work, or play the missions to try the decisions yourself. Nothing is locked.</p>
      </header>
      <ol className="sc-tour-stops" aria-label="Tour stops">
        {stops.map((stop, index) => {
          const project = portfolio.projects.find((item) => item.id === stop.project);
          const done = progress.missions.includes(stop.mission);
          return (
            <li key={stop.mission} className="sc-section">
              <p className="sc-harbor-label">Stop 0{index + 1} {done && " / Mission complete"}</p>
              <h2>{stop.title}</h2>
              <p>{stop.detail}</p>
              <div className="sc-ops-actions">
                {project && (
                  <OpenCaseStudy project={project}>
                    <DialogTrigger asChild>
                      <button type="button" className="sc-btn is-quiet" onClick={() => openProject(project.id)} aria-label={`Read case study: ${project.title}`}>
                        <BookOpen size={16} aria-hidden="true" /> Case study
                      </button>
                    </DialogTrigger>
                  </OpenCaseStudy>
                )}
                <button type="button" className="sc-btn is-quiet" onClick={() => openMission(stop.mission)}>
                  {MISSIONS[stop.mission].title} <ArrowRight size={16} aria-hidden="true" />
                </button>
              </div>
            </li>
          );
        })}
      </ol>
      <div className="sc-ops-actions sc-tour-links">
        <button type="button" className="sc-btn" onClick={() => setMode("recruiter", "projects")}><Users size={16} aria-hidden="true" /> Continue in Recruiter Mode</button>
        <a className="sc-btn is-quiet" href={portfolio.profile.resumeUrl} download onClick={() => trackResumeDownload("game_tour")}><Download size={16} aria-hidden="true" /> Download resume</a>
      </div>
      <section className="sc-section sc-tour-board" aria-labelledby="sc-tour-board-title">
        <p className="sc-harbor-label">Free play</p>
        <h2 id="sc-tour-board-title">Mission board</h2>
        <p>Play any new dispatch. Where a mission has a daily scenario, it switches at midnight UTC. The other scenario is available for practice in the debrief.</p>
        <ul className="sc-tour-missions">
          {expansion.map((id) => {
            const mission = MISSIONS[id];
            const district = districtForMission(id);
            return (
              <li key={id}>
                <button type="button" className="sc-btn is-quiet" onClick={() => openMission(id)}>
                  <span><small>{district.name} / {progress.missions.includes(id) ? "Complete" : "Available"}</small>{mission.title}</span>
                  <ArrowRight size={16} aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
        <div className="sc-tour-capstone">
          <div><p className="sc-harbor-label">Cross-district capstone</p><h3>Platform Day</h3><p>Take one incident from intake to recovery and handoff.</p></div>
          <button type="button" className="sc-btn" onClick={() => openMission("platform-day")}><Route size={16} aria-hidden="true" /> Play Platform Day</button>
        </div>
      </section>
    </section>
  );
};
