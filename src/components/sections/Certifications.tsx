import { GraduationCap } from "lucide-react";
import { portfolio } from "@/data/portfolio";
import { Reveal } from "@/components/Reveal";
import { SectionHeader } from "@/components/SectionHeader";

export const Certifications = () => (
  <section id="certifications" className="section-space page-shell credentials-section">
    <SectionHeader eyebrow="Credentials" title={<>Certifications <em>and study.</em></>} index="05" />
    <div className="credentials-grid">
      <Reveal>
        <h3 className="credentials-heading">Certifications</h3>
        <ul className="cert-list">
          {portfolio.certifications.map((cert) => (
            <li key={cert.name}>
              <span>{cert.name}</span>
              <span className="cert-meta">{cert.issuer}{cert.date ? `, ${cert.date}` : ""}</span>
            </li>
          ))}
        </ul>
      </Reveal>
      <Reveal className="credential" delay={80}>
        <GraduationCap size={28} strokeWidth={1.3} aria-hidden="true" />
        <div>
          <p className="credential-kind">Postgraduate study, 2025 - 2027</p>
          <h3>M.Tech in Cloud Computing</h3>
          <p>BITS Pilani WILP, in progress.</p>
          <p className="education-foundation">{portfolio.education[1].degree}, {portfolio.education[1].school}, {portfolio.education[1].period}</p>
        </div>
      </Reveal>
    </div>
  </section>
);
