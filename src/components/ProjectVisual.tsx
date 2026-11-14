import { ArrowDown, ArrowRight } from "lucide-react";
import type { Project } from "@/data/portfolio";

const Arrow = ({ down = false }: { down?: boolean }) => (
  <span className={`viz-arrow ${down ? "is-down" : ""}`} aria-hidden="true">
    <ArrowRight className="right" size={18} />
    <ArrowDown className="down" size={18} />
  </span>
);

const Node = ({ title, detail, index, key_ = false }: { title: string; detail?: string; index?: number; key_?: boolean }) => (
  <div className={`viz-node ${key_ ? "is-key" : ""}`}>
    <strong>{index !== undefined && <span className="viz-index">{index}</span>}{title}</strong>
    {detail && <span>{detail}</span>}
  </div>
);

const CostVisual = () => (
  <div className="viz-cost">
    <div className="viz-col">
      <h4>Source data</h4>
      <Node title="Platform health metrics" detail="Resource and service reporting" />
      <Node title="Subscription and resource cost" detail="Cost data by resource" />
      <Node title="Occupancy configuration" detail="How cost is allocated" />
    </div>
    <Arrow />
    <div className="viz-col">
      <h4>Processing</h4>
      <Node title="SQL-based analysis" detail="Synapse reporting layer" />
      <Arrow down />
      <Node title="Cost mapping" detail="Resource cost to allocation" key_ />
    </div>
    <Arrow />
    <div className="viz-col">
      <h4>Reporting</h4>
      <Node title="Operational health view" detail="Weekly health reporting" />
      <Node title="Cost analysis view" detail="Monthly cost reporting" />
    </div>
  </div>
);

const incidentSteps = [
  { title: "Operational telemetry", detail: "Logs, alerts and incident context" },
  { title: "KQL pattern analysis", detail: "Recurring errors, timing and correlated signals" },
  { title: "AI-assisted investigation", detail: "A GPT-based agent summarizes evidence and suggests hypotheses" },
  { title: "Engineer validation", detail: "Evidence is checked before any conclusion or action" },
];

const IncidentVisual = () => (
  <div className="viz-incident-wrap">
    <ol className="viz-incident">
      {incidentSteps.map((step, index) => (
        <li key={step.title}>
          <span className="viz-step-no" aria-hidden="true">{index + 1}</span>
          <div><strong>{step.title}</strong><span>{step.detail}</span></div>
        </li>
      ))}
    </ol>
    <p className="viz-loop">If the evidence doesn't hold up, the engineer refines the query and investigates again.</p>
  </div>
);

const StorageVisual = () => (
  <div className="viz-storage">
    <Node title="Discover and audit storage accounts" detail="Inventory, usage and diagnostic settings" key_ />
    <Arrow down />
    <div className="viz-branches">
      <Node title="Gen1 account" detail="Plan migration to StorageV2 and ADLS Gen2" />
      <Node title="StorageV2 account" detail="Review lifecycle and tiering" />
    </div>
    <Arrow down />
    <Node title="Check dependencies" detail="References from Data Factory, Synapse and Databricks" />
    <Arrow down />
    <div className="viz-tier-block">
      <span className="viz-tier-label">Recommend lifecycle and tiering</span>
      <div className="viz-tiers">
        <span className="tier-hot">Hot</span>
        <span className="tier-cool">Cool</span>
        <span className="tier-archive">Archive</span>
      </div>
    </div>
  </div>
);

const pimLanes: { label: string; cells: ({ title: string; detail?: string; index: number } | null)[] }[] = [
  {
    label: "Azure Automation",
    cells: [
      { title: "PowerShell runbook runs", detail: "In an Azure Automation Account", index: 1 },
      { title: "Authenticates with Managed Identity", detail: "No stored credentials", index: 2 },
      null,
    ],
  },
  {
    label: "Entra ID and PIM",
    cells: [
      null,
      { title: "Discovers eligible assignments", detail: "Within the permissions granted", index: 3 },
      { title: "Collects access review data", detail: "User Access Reviews", index: 4 },
    ],
  },
  {
    label: "Output",
    cells: [null, null, { title: "CSV report for review", detail: "Procedure documented as SOPs", index: 5 }],
  },
];

const PimVisual = () => (
  <div className="viz-pim">
    {pimLanes.map((lane) => (
      <div className="viz-lane" key={lane.label}>
        <span className="viz-lane-label">{lane.label}</span>
        <div className="viz-lane-cells">
          {lane.cells.map((cell, index) => (cell ? <Node key={cell.title} {...cell} /> : <span key={index} className="is-empty" aria-hidden="true" />))}
        </div>
      </div>
    ))}
  </div>
);

const dataLayers = [
  { name: "Ingest", tools: "Azure Data Factory pipelines" },
  { name: "Store", tools: "ADLS Gen2 and OneLake" },
  { name: "Transform", tools: "Azure Databricks, PySpark and Delta Lake" },
  { name: "Consume", tools: "Synapse Analytics, Microsoft Fabric and SQL" },
];

const DataVisual = () => (
  <div className="viz-data">
    <ol className="viz-layers">
      {dataLayers.map((layer) => (
        <li key={layer.name}><strong>{layer.name}</strong><span>{layer.tools}</span></li>
      ))}
    </ol>
    <div className="viz-govern"><strong>Governance</strong><span>Microsoft Purview</span></div>
  </div>
);

const McpVisual = () => (
  <div className="viz-mcp">
    <div className="seq-actors">
      <div className="seq-actor"><strong>Copilot Studio agent</strong></div>
      <div className="seq-actor"><strong>MCP server</strong><span>Azure Functions</span></div>
      <div className="seq-actor"><strong>Enterprise API</strong></div>
    </div>
    <ol className="seq-messages">
      <li className="msg col-12 to-right"><span>Tool call</span></li>
      <li className="msg col-2 is-note"><span>Checks the Entra ID token</span></li>
      <li className="msg col-23 to-right"><span>Authorized API request</span></li>
      <li className="msg col-23 to-left is-return"><span>Response</span></li>
      <li className="msg col-12 to-left is-return"><span>Tool result</span></li>
    </ol>
  </div>
);

const MedallionVisual = () => (
  <div className="viz-medallion">
    <div className="viz-bar is-dashed"><strong>Azure Data Factory</strong><span>Orchestrates every load</span></div>
    <div className="viz-grid-3">
      <div className="viz-layer layer-bronze"><strong>Bronze</strong><span>Raw data, loaded incrementally by watermark</span></div>
      <Arrow />
      <div className="viz-layer layer-silver"><strong>Silver</strong><span>Validated and deduplicated, with failures quarantined</span></div>
      <Arrow />
      <div className="viz-layer layer-gold"><strong>Gold</strong><span>Seven-domain governed metrics layer</span></div>
    </div>
    <Arrow down />
    <div className="viz-grid-2">
      <Node title="Serverless SQL views" detail="Governed datasets" />
      <Arrow />
      <Node title="Power BI dashboard" detail="Reads one metrics source" key_ />
    </div>
    <div className="viz-bar"><strong>Reconciliation</strong><span>Every date and metric pair is checked against the accepted dashboard</span></div>
  </div>
);

const OnboardingVisual = () => (
  <div className="viz-onboard">
    <div className="viz-grid-3">
      <Node title="Source datasets" detail="Internal big-data store" />
      <Arrow />
      <div className="viz-node is-key">
        <strong>Config-driven framework</strong>
        <span>Parameter groups and reusable PySpark executors</span>
        <span className="viz-modes" aria-label="Modes"><i>CHECK</i><i>DEPLOY</i></span>
      </div>
    </div>
    <Arrow down />
    <Node title="ADLS Gen2 Delta tables" detail="Schema evolution and deduplication handled in the load" />
    <h4>Promotion path</h4>
    <div className="viz-grid-3 is-promo">
      <Node title="Pre-production" detail="Backfill or restatement runs here first" />
      <Arrow />
      <Node title="Validate and reconcile" detail="Checked against source counts" key_ />
    </div>
    <Arrow down />
    <Node title="Production" detail="Promoted once the checks pass" />
  </div>
);

const visuals = { cost: CostVisual, incident: IncidentVisual, storage: StorageVisual, pim: PimVisual, data: DataVisual, mcp: McpVisual, medallion: MedallionVisual, onboarding: OnboardingVisual };

export const ProjectVisual = ({ project }: { project: Project }) => {
  if (!project.visual) return null;
  const Visual = visuals[project.visual];
  return (
    <figure className="viz-figure">
      <div className={`viz viz-${project.visual}-frame`} role="group" aria-label={`${project.title} architecture`}>
        <Visual />
      </div>
      {project.visualCaption && <figcaption>{project.visualCaption}</figcaption>}
    </figure>
  );
};
