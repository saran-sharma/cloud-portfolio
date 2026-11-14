import { portfolio } from "@/data/portfolio";

export function getPortfolioResponse(input: string): string {
  const query = input.toLowerCase().trim();
  const matches = (...terms: string[]) => terms.some((term) => query.includes(term));
  const p = portfolio.profile;
  if (matches("project", "fmcp", "ideas")) {
    return portfolio.projects.map((project) => `${project.title} (${project.workType})\n${project.summary}`).join("\n\n");
  }
  if (matches("contact", "email", "phone", "interview", "reach")) return `Contact Saran at ${p.email} or ${p.phone}. Share the role or project context so he can respond with the right detail.`;
  if (matches("resume", "cv", "download")) return "Use the Download resume link below to get the PDF.";
  if (matches("linkedin", "github", "repo")) return "Use the LinkedIn or GitHub links below to open Saran's actual profiles.";
  if (matches("certif", "certified", "az-104", "dp-700", "databricks cert")) return portfolio.certifications.map((cert) => `${cert.name}, ${cert.issuer}${cert.date ? ` (${cert.date})` : ""}`).join("\n");
  if (matches("education", "degree", "bits", "college")) return portfolio.education.map((education) => `${education.degree}, ${education.school} (${education.period})`).join("\n");
  if (matches("experience", "career", "capgemini", "worked")) {
    const experience = portfolio.experience[0];
    return `${experience.role} at ${experience.company}.\n\n${experience.themes.map((theme) => `${theme.title}: ${theme.text}`).join("\n\n")}`;
  }
  if (matches("skill", "stack", "azure", "data", "devops", "terraform", "kql", "ai", "automation", "cloud", "kubernetes")) {
    return portfolio.skills.map((group) => `${group.category}: ${group.items.join(", ")}`).join("\n\n");
  }
  if (matches("about", "who", "background", "hire", "fit")) return `${p.name} is a ${p.title} based in ${p.location}.\n\n${portfolio.about.paragraphs.join("\n\n")}`;
  return "This local guide only knows the public portfolio. I don't have verified information about that. Please contact Saran directly for more detail.";
}
