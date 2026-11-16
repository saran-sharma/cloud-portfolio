import { ArrowRight, MapPin } from "lucide-react";
import { Portrait } from "@/city/components/Portrait";
import { useCity } from "@/city/state/CityProvider";
import { portfolio } from "@/data/portfolio";

const SPECIALTIES = [
  "Azure Data Engineering",
  "Databricks",
  "Microsoft Fabric",
  "Cloud Platform Engineering",
  "Infrastructure Automation",
  "AI Engineering",
];

export const PlayerProfile = () => {
  const { go } = useCity();
  const p = portfolio.profile;
  const job = portfolio.experience[0];
  return (
    <section className="sc-profile" aria-labelledby="sc-profile-title">
      <Portrait className="is-profile" />
      <div className="sc-profile-card">
        <p className="sc-kicker">PLAYER ONE</p>
        <h1 id="sc-profile-title">{p.name.toUpperCase()}</h1>
        <dl className="sc-profile-facts">
          <div><dt>Role</dt><dd>{p.title.toUpperCase()}</dd></div>
          <div><dt>Base</dt><dd><MapPin size={14} aria-hidden="true" /> {p.location.toUpperCase()}</dd></div>
          <div><dt>Current assignment</dt><dd>{job.company.toUpperCase()} · {job.since.replace(/^At\s+\S+\s+/i, "").toUpperCase()}</dd></div>
        </dl>
        <p className="sc-profile-summary">An engineer working across Azure, enterprise data platforms, cloud infrastructure, DevOps automation and AI-enabled engineering.</p>
        <h2>Specialties</h2>
        <ul className="sc-chips" aria-label="Specialties">{SPECIALTIES.map((item) => <li key={item}>{item}</li>)}</ul>
        <div className="sc-actions">
          <button type="button" className="sc-btn is-big" onClick={() => go({ name: "map" })}>Enter Saran Universe <ArrowRight size={18} /></button>
        </div>
        <p className="sc-note">Everything here comes from real professional experience. No levels or stats are invented.</p>
      </div>
    </section>
  );
};
