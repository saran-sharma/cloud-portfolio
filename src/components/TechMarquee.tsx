import { portfolio } from "@/data/portfolio";

// Names are looked up in the real skills data, so the ribbon can never show a tool that
// is not already listed in the Toolkit section.
const WANTED = [
  "Azure Synapse Analytics",
  "Azure Data Factory",
  "ADLS Gen2",
  "Azure Databricks",
  "PySpark",
  "Delta Lake",
  "Microsoft Fabric",
  "Power BI",
  "Terraform",
  "Azure DevOps Pipelines",
  "GitHub Actions",
  "Python",
  "SQL",
  "KQL",
  "Azure Monitor",
  "Key Vault",
  "Docker",
  "Model Context Protocol",
];

const known = new Set(portfolio.skills.flatMap((group) => group.items));
const tools = WANTED.filter((name) => known.has(name));
const rowA = tools.filter((_, index) => index % 2 === 0);
const rowB = tools.filter((_, index) => index % 2 === 1);

const Row = ({ items, className }: { items: string[]; className: string }) => (
  <ul className={`tech-row ${className}`}>
    {[...items, ...items].map((name, index) => <li key={`${name}-${index}`} data-dup={index >= items.length ? "" : undefined}>{name}</li>)}
  </ul>
);

/** Two rows of technologies that slide in opposite directions as the ribbon scrolls through the viewport. */
export const TechMarquee = () => (
  <div className="tech-marquee" data-progress aria-hidden="true">
    <Row items={rowA} className="is-left" />
    <Row items={rowB} className="is-right" />
  </div>
);
