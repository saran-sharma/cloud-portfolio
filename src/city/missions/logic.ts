/**
 * Pure logic and synthetic data for the Saran City missions.
 * Everything here is invented for demonstration. No real tenant, resource name,
 * endpoint, identity or figure from any employer or client is used.
 */

/* ------------------------------------------------------------------ */
/* Mission 01: Build the data pipeline                                 */
/* ------------------------------------------------------------------ */

export type PipelineNodeId = "source" | "adf" | "adls" | "dbx" | "delta" | "fabric";

export type PipelineNode = {
  id: PipelineNodeId;
  title: string;
  stage: string;
  summary: string;
  tools: string[];
  /** Position on the board, in percent. Deliberately not in flow order. */
  x: number;
  y: number;
};

export const PIPELINE_NODES: PipelineNode[] = [
  { id: "dbx", title: "Azure Databricks", stage: "Transformation", summary: "Runs PySpark to clean, join and reshape raw data at scale.", tools: ["Azure Databricks", "PySpark", "Apache Spark"], x: 18, y: 27 },
  { id: "source", title: "Source Systems", stage: "Source", summary: "Databases, files and APIs that produce the data. They are read, not changed.", tools: ["SQL databases", "Files", "REST APIs"], x: 50, y: 27 },
  { id: "fabric", title: "Microsoft Fabric", stage: "Consumption", summary: "Serves the curated tables to analysts and reports through OneLake.", tools: ["Microsoft Fabric", "OneLake", "SQL endpoint"], x: 82, y: 27 },
  { id: "delta", title: "Delta Lake", stage: "Curated storage", summary: "A table format on the lake with transactions, schema enforcement and history.", tools: ["Delta Lake", "MERGE", "Time travel"], x: 18, y: 73 },
  { id: "adls", title: "ADLS Gen2", stage: "Storage", summary: "The data lake. Raw data lands here first, organised in folders and layers.", tools: ["ADLS Gen2", "Hierarchical namespace", "Bronze layer"], x: 50, y: 73 },
  { id: "adf", title: "Azure Data Factory", stage: "Ingestion", summary: "Orchestrates and copies data from sources into the lake on a schedule or trigger.", tools: ["Azure Data Factory", "Pipelines", "Triggers"], x: 82, y: 73 },
];

/** The correct flow, in order. */
export const PIPELINE_LINKS: [PipelineNodeId, PipelineNodeId][] = [
  ["source", "adf"],
  ["adf", "adls"],
  ["adls", "dbx"],
  ["dbx", "delta"],
  ["delta", "fabric"],
];

const LINK_NOTES: Record<string, string> = {
  "source>adf": "Ingestion: Data Factory reads from the source systems.",
  "adf>adls": "Storage: Data Factory lands the raw data in the lake.",
  "adls>dbx": "Transformation: Databricks reads the raw data from the lake.",
  "dbx>delta": "Curated storage: results are written as Delta tables.",
  "delta>fabric": "Consumption: Fabric serves the curated Delta tables.",
};

export const PIPELINE_STAGES = [
  { id: "ingestion", title: "Ingestion", text: "Data is copied from source systems on a schedule or event.", needs: [0] },
  { id: "storage", title: "Storage", text: "Raw data lands in the lake, untouched, so it can be replayed.", needs: [1] },
  { id: "transformation", title: "Transformation", text: "Spark cleans and reshapes the data into reliable tables.", needs: [2, 3] },
  { id: "consumption", title: "Consumption", text: "Curated tables are served to reports and analysts.", needs: [4] },
];

export const pipelineNode = (id: PipelineNodeId) => PIPELINE_NODES.find((node) => node.id === id) as PipelineNode;

const linkKey = (from: PipelineNodeId, to: PipelineNodeId) => `${from}>${to}`;

export type LinkResult = { status: "correct" | "duplicate" | "wrong"; message: string };

export function evaluateLink(from: PipelineNodeId, to: PipelineNodeId, existing: [PipelineNodeId, PipelineNodeId][]): LinkResult {
  if (from === to) return { status: "wrong", message: "A component can't connect to itself." };
  if (existing.some(([a, b]) => a === from && b === to)) return { status: "duplicate", message: "Those two are already connected." };
  if (LINK_NOTES[linkKey(from, to)]) return { status: "correct", message: LINK_NOTES[linkKey(from, to)] };
  if (LINK_NOTES[linkKey(to, from)]) {
    return { status: "wrong", message: `Data flows the other way: ${pipelineNode(to).title} feeds ${pipelineNode(from).title}.` };
  }
  const next = PIPELINE_LINKS.find(([a]) => a === from);
  if (!next) return { status: "wrong", message: `${pipelineNode(from).title} is the last stage here, so there is nothing further to feed.` };
  return { status: "wrong", message: `${pipelineNode(from).title} feeds ${pipelineNode(next[1]).title} next, not ${pipelineNode(to).title}.` };
}

export const isPipelineComplete = (links: [PipelineNodeId, PipelineNodeId][]) =>
  PIPELINE_LINKS.every(([from, to]) => links.some(([a, b]) => a === from && b === to));

export const nextHint = (links: [PipelineNodeId, PipelineNodeId][]) => {
  const next = PIPELINE_LINKS.find(([from, to]) => !links.some(([a, b]) => a === from && b === to));
  return next ? `Try connecting ${pipelineNode(next[0]).title} to ${pipelineNode(next[1]).title}.` : "Every link is connected.";
};

/* ------------------------------------------------------------------ */
/* Mission 02: Investigate the platform (cost)                         */
/* ------------------------------------------------------------------ */

export type CostResource = { id: string; type: string; product: string | null; cost: number };

/** Synthetic cost units (CU). Not money, not real figures. */
export const COST_RESOURCES: CostResource[] = [
  { id: "res-sim-001", type: "Data Factory compute", product: "Ingestion Service", cost: 9200 },
  { id: "res-sim-002", type: "Storage account (lake)", product: "Ingestion Service", cost: 7400 },
  { id: "res-sim-003", type: "Spark pool", product: "Analytics Service", cost: 14800 },
  { id: "res-sim-004", type: "SQL pool", product: "Analytics Service", cost: 12300 },
  { id: "res-sim-005", type: "Log workspace", product: "Observability", cost: 6100 },
  { id: "res-sim-006", type: "App Service plan", product: "Customer Portal", cost: 8700 },
  { id: "res-sim-007", type: "VM scale set", product: "Customer Portal", cost: 10200 },
  { id: "res-sim-008", type: "Storage account (backup)", product: null, cost: 3200 },
  { id: "res-sim-009", type: "Key Vault and networking", product: null, cost: 2600 },
  { id: "res-sim-010", type: "Function app", product: "Observability", cost: 4900 },
  { id: "res-sim-011", type: "Container registry", product: null, cost: 2700 },
];

export const COST_PRODUCTS = ["Ingestion Service", "Analytics Service", "Observability", "Customer Portal"];

export const mappedTotal = () => COST_RESOURCES.filter((resource) => resource.product).reduce((sum, resource) => sum + resource.cost, 0);
export const unmappedResources = () => COST_RESOURCES.filter((resource) => !resource.product);
export const SUBSCRIPTION_TOTAL = COST_RESOURCES.reduce((sum, resource) => sum + resource.cost, 0);
export const costGap = () => SUBSCRIPTION_TOTAL - mappedTotal();

export const COST_CAUSES = [
  { id: "stale-map", text: "A resource was renamed and the product mapping table was not updated.", correct: true },
  { id: "shared", text: "Shared platform services have no allocation rule.", correct: true },
  { id: "untagged", text: "A new resource was created without a product tag.", correct: true },
  { id: "saving", text: "A saving was realized and removed from the report.", correct: false },
  { id: "double", text: "The subscription total counts every resource twice.", correct: false },
];

export type CostFindings = {
  explained: number;
  missed: string[];
  falsePositives: string[];
  causesCorrect: boolean;
  solved: boolean;
};

export function evaluateCostFindings(flagged: string[], causes: string[]): CostFindings {
  const unmapped = unmappedResources().map((resource) => resource.id);
  const hits = flagged.filter((id) => unmapped.includes(id));
  const correctCauses = COST_CAUSES.filter((cause) => cause.correct).map((cause) => cause.id);
  const causesCorrect = correctCauses.every((id) => causes.includes(id)) && causes.every((id) => correctCauses.includes(id));
  const missed = unmapped.filter((id) => !flagged.includes(id));
  const falsePositives = flagged.filter((id) => !unmapped.includes(id));
  return {
    explained: hits.reduce((sum, id) => sum + (COST_RESOURCES.find((resource) => resource.id === id)?.cost ?? 0), 0),
    missed,
    falsePositives,
    causesCorrect,
    solved: missed.length === 0 && falsePositives.length === 0 && causesCorrect,
  };
}

export const COST_PIPELINE = [
  { title: "Source data", text: "Platform health metrics, resource-level cost data and the occupancy configuration are collected." },
  { title: "SQL processing", text: "SQL in the reporting layer joins cost to resources and aggregates by subscription." },
  { title: "Cost mapping", text: "A mapping table assigns each resource to a product, so cost can be allocated." },
  { title: "Reconciliation", text: "Product totals are compared with the subscription total. Gaps are investigated, not assumed to be savings." },
  { title: "Dashboards", text: "Operational health and cost views read from the reconciled dataset." },
];

/* ------------------------------------------------------------------ */
/* Mission 03: AI incident intelligence                                */
/* ------------------------------------------------------------------ */

export const INCIDENT = {
  id: "SIM-INC-2041",
  title: "Nightly ingestion finished late and a freshness check failed",
  severity: "P2 (simulated)",
  service: "Simulated data platform",
  started: "02:10",
  impact: "The curated metrics refresh is delayed. Dashboards show yesterday's numbers.",
};

export type LogLine = { time: string; level: "INFO" | "WARN" | "ERROR"; source: string; message: string };

export const INCIDENT_LOGS: LogLine[] = [
  { time: "01:58", level: "INFO", source: "activity", message: "Role assignment changed on the storage scope (change record CHG-SIM-17)." },
  { time: "02:00", level: "INFO", source: "pipeline-sim-ingest", message: "Run started: nightly ingestion." },
  { time: "02:02", level: "WARN", source: "spark-sim", message: "Executor 4 lost. Task retried on another executor." },
  { time: "02:04", level: "ERROR", source: "storage-sim-lake", message: "Write failed: 403 AuthorizationPermissionMismatch on /bronze/orders." },
  { time: "02:04", level: "WARN", source: "storage-sim-lake", message: "429 ServerBusy returned, retry succeeded." },
  { time: "02:05", level: "INFO", source: "storage-sim-lake", message: "Read succeeded: /curated/customers." },
  { time: "02:09", level: "ERROR", source: "storage-sim-lake", message: "Write failed: 403 AuthorizationPermissionMismatch on /bronze/payments." },
  { time: "02:10", level: "ERROR", source: "pipeline-sim-ingest", message: "Run failed after 3 retries. Freshness check raised." },
  { time: "02:12", level: "WARN", source: "storage-sim-lake", message: "429 ServerBusy returned, retry succeeded." },
  { time: "02:14", level: "INFO", source: "storage-sim-lake", message: "Read succeeded: /bronze/orders (previous partition)." },
];

export type KqlQuery = { id: string; title: string; kql: string; columns: string[]; rows: string[][]; takeaway: string };

export const INCIDENT_QUERIES: KqlQuery[] = [
  {
    id: "q-status",
    title: "Failures over time",
    kql: "StorageBlobLogs\n| where TimeGenerated > ago(3h) and StatusCode >= 400\n| summarize failures = count() by bin(TimeGenerated, 30m)",
    columns: ["Window", "Failures"],
    rows: [["01:30", "0"], ["02:00", "74"], ["02:30", "74"]],
    takeaway: "Failures start in the 02:00 window and nothing before it.",
  },
  {
    id: "q-type",
    title: "Failures by status",
    kql: "StorageBlobLogs\n| where TimeGenerated > ago(3h) and StatusCode >= 400\n| summarize count() by StatusText",
    columns: ["StatusText", "Count"],
    rows: [["AuthorizationPermissionMismatch", "148"], ["ServerBusy", "3"]],
    takeaway: "Almost every failure is a permission error. Throttling is rare.",
  },
  {
    id: "q-change",
    title: "Changes near the start",
    kql: "AzureActivity\n| where TimeGenerated > ago(3h)\n| where OperationNameValue has 'roleAssignments'\n| project TimeGenerated, OperationNameValue, Caller",
    columns: ["Time", "Operation", "Caller"],
    rows: [["01:58", "roleAssignments/delete", "svc-sim-change"]],
    takeaway: "A role assignment was removed two minutes before the first failure.",
  },
];

export type Hypothesis = { id: string; title: string; confidence: "Low" | "Medium" | "High" };

export const HYPOTHESES: Hypothesis[] = [
  { id: "h-throttle", title: "The storage account was throttling requests.", confidence: "Low" },
  { id: "h-permission", title: "A role assignment change removed the pipeline's write permission.", confidence: "High" },
  { id: "h-spark", title: "The Spark cluster became unstable.", confidence: "Medium" },
];

export const CORRECT_HYPOTHESIS = "h-permission";

export type Relation = "supports" | "contradicts" | "neutral";

export const EVIDENCE: { id: string; text: string; relations: Record<string, Relation> }[] = [
  { id: "e1", text: "148 writes failed with AuthorizationPermissionMismatch from 02:00.", relations: { "h-throttle": "contradicts", "h-permission": "supports", "h-spark": "neutral" } },
  { id: "e2", text: "Only 3 throttling responses, and each retry succeeded.", relations: { "h-throttle": "contradicts", "h-permission": "neutral", "h-spark": "neutral" } },
  { id: "e3", text: "A role assignment on the storage scope was removed at 01:58.", relations: { "h-throttle": "neutral", "h-permission": "supports", "h-spark": "neutral" } },
  { id: "e4", text: "One executor was lost, but the task retried and succeeded.", relations: { "h-throttle": "neutral", "h-permission": "neutral", "h-spark": "contradicts" } },
  { id: "e5", text: "Reads from the same account kept succeeding.", relations: { "h-throttle": "contradicts", "h-permission": "supports", "h-spark": "neutral" } },
];

export type Validation = { ready: boolean; correct: boolean; message: string };

export function validateHypothesis(selected: string | null, queriesRun: number, logsViewed: boolean): Validation {
  if (!selected) return { ready: false, correct: false, message: "Choose the hypothesis you want to confirm." };
  if (queriesRun < 2 || !logsViewed) {
    return { ready: false, correct: false, message: "An engineer verifies against raw data first. Read the logs and run at least two queries." };
  }
  if (selected === CORRECT_HYPOTHESIS) {
    return { ready: true, correct: true, message: "Validated. The evidence points to a permission change, and it was confirmed against the raw logs and the change record, not taken from the AI summary." };
  }
  const contradicting = EVIDENCE.filter((item) => item.relations[selected] === "contradicts");
  return {
    ready: true,
    correct: false,
    message: `Not supported. ${contradicting.length} piece${contradicting.length === 1 ? "" : "s"} of evidence contradict this hypothesis, for example: "${contradicting[0]?.text ?? "the logs do not match"}"`,
  };
}

/* ------------------------------------------------------------------ */
/* Mission 04: Azure storage modernization                             */
/* ------------------------------------------------------------------ */

export type Tier = "Hot" | "Cool" | "Archive";
export type StorageAction = "Migrate to StorageV2 / ADLS Gen2" | "Keep as is";

export type StorageAccount = {
  id: string;
  name: string;
  kind: "Gen1 (legacy)" | "StorageV2";
  currentTier: Tier;
  sizeGb: number;
  daysSinceAccess: number;
  deps: { adf: number; synapse: number; databricks: number };
  lifecycle: string;
  recentReads: number[];
};

export const STORAGE_ACCOUNTS: StorageAccount[] = [
  { id: "sa1", name: "stsimlegacy01", kind: "Gen1 (legacy)", currentTier: "Hot", sizeGb: 1240, daysSinceAccess: 410, deps: { adf: 0, synapse: 0, databricks: 0 }, lifecycle: "None", recentReads: [0, 0, 0, 0, 0, 0] },
  { id: "sa2", name: "stsimlegacy02", kind: "Gen1 (legacy)", currentTier: "Hot", sizeGb: 880, daysSinceAccess: 12, deps: { adf: 3, synapse: 1, databricks: 2 }, lifecycle: "None", recentReads: [60, 72, 80, 90, 85, 96] },
  { id: "sa3", name: "stsimraw03", kind: "StorageV2", currentTier: "Hot", sizeGb: 2100, daysSinceAccess: 95, deps: { adf: 2, synapse: 0, databricks: 1 }, lifecycle: "None", recentReads: [30, 22, 14, 8, 4, 2] },
  { id: "sa4", name: "stsimcurated04", kind: "StorageV2", currentTier: "Hot", sizeGb: 640, daysSinceAccess: 5, deps: { adf: 2, synapse: 2, databricks: 3 }, lifecycle: "Move to Cool after 90 days", recentReads: [88, 92, 90, 95, 97, 99] },
  { id: "sa5", name: "stsimexport05", kind: "Gen1 (legacy)", currentTier: "Cool", sizeGb: 320, daysSinceAccess: 240, deps: { adf: 1, synapse: 0, databricks: 0 }, lifecycle: "None", recentReads: [10, 6, 3, 1, 0, 0] },
  { id: "sa6", name: "stsimarchive06", kind: "StorageV2", currentTier: "Cool", sizeGb: 3600, daysSinceAccess: 520, deps: { adf: 0, synapse: 0, databricks: 0 }, lifecycle: "Move to Archive after 365 days", recentReads: [0, 0, 0, 0, 0, 0] },
];

export function recommendTier(daysSinceAccess: number): Tier {
  if (daysSinceAccess <= 30) return "Hot";
  if (daysSinceAccess <= 180) return "Cool";
  return "Archive";
}

export const expectedAction = (account: StorageAccount): StorageAction =>
  account.kind === "Gen1 (legacy)" ? "Migrate to StorageV2 / ADLS Gen2" : "Keep as is";

export const dependencyCount = (account: StorageAccount) => account.deps.adf + account.deps.synapse + account.deps.databricks;

export type StorageChoice = { tier?: Tier; action?: StorageAction };

export function evaluateStorage(choices: Record<string, StorageChoice>) {
  const results = STORAGE_ACCOUNTS.map((account) => {
    const choice = choices[account.id] ?? {};
    const tierOk = choice.tier === recommendTier(account.daysSinceAccess);
    const actionOk = choice.action === expectedAction(account);
    return { id: account.id, answered: Boolean(choice.tier && choice.action), tierOk, actionOk, correct: tierOk && actionOk };
  });
  return { results, allCorrect: results.every((result) => result.correct) };
}

export const TIER_TRADEOFFS: Record<Tier, { storage: string; access: string; latency: string; use: string }> = {
  Hot: { storage: "Highest", access: "Lowest", latency: "Milliseconds", use: "Data used often" },
  Cool: { storage: "Lower", access: "Higher", latency: "Milliseconds", use: "Data read now and then" },
  Archive: { storage: "Lowest", access: "Highest", latency: "Hours to rehydrate", use: "Data kept but rarely needed" },
};

/* ------------------------------------------------------------------ */
/* Mission 05: PIM automation                                          */
/* ------------------------------------------------------------------ */

export const PIM_STAGES = [
  { id: "identity", title: "User identity", text: "A synthetic user, user-sim-007, wants to do a task that needs elevated access.", payload: "user: user-sim-007\nroles held: none (standing access is minimal)" },
  { id: "auth", title: "Authentication", text: "The automation signs in with a managed identity, so no password or secret is stored anywhere.", payload: "identity: managed identity (simulated)\ntoken: issued for the scope it needs, short-lived" },
  { id: "eligible", title: "Eligible assignments", text: "The workflow reads which roles this user is eligible to activate. Eligible is not the same as active.", payload: "3 eligible assignments found (see the table below)" },
  { id: "discovery", title: "Role discovery", text: "Each eligible role is matched to its policy: maximum duration, justification and whether approval is needed.", payload: "policy lookup: duration, justification, approval" },
  { id: "activation", title: "Activation workflow", text: "The request is checked against policy. It is activated, blocked or sent for approval. Policy is never bypassed.", payload: "checks: justification, duration, approval" },
  { id: "audit", title: "Audit report", text: "Every attempt, including blocked ones, is recorded and can be exported as a CSV for review.", payload: "output: CSV with time, role, duration, outcome" },
];

export type PimRole = { id: string; name: string; maxHours: number; approval: boolean };

export const PIM_ROLES: PimRole[] = [
  { id: "reader", name: "Platform Reader (sim)", maxHours: 8, approval: false },
  { id: "storage-op", name: "Storage Operator (sim)", maxHours: 4, approval: false },
  { id: "kv-review", name: "Key Vault Reviewer (sim)", maxHours: 2, approval: true },
];

export type AuditEntry = { id: number; step: string; role: string; hours: number; outcome: "Activated" | "Blocked" | "Pending approval"; reason: string };

export function evaluateActivation(request: { roleId: string; hours: number; justification: string }, sequence: number): AuditEntry {
  const role = PIM_ROLES.find((item) => item.id === request.roleId);
  const base = { id: sequence, step: `T+${String(sequence).padStart(2, "0")}`, role: role?.name ?? "Unknown role", hours: request.hours };
  if (!role) return { ...base, outcome: "Blocked", reason: "The role is not in this user's eligible assignments." };
  if (request.justification.trim().length < 12) return { ...base, outcome: "Blocked", reason: "A justification of at least 12 characters is required." };
  if (!Number.isFinite(request.hours) || request.hours < 1) return { ...base, outcome: "Blocked", reason: "Choose a duration of at least 1 hour." };
  if (request.hours > role.maxHours) return { ...base, outcome: "Blocked", reason: `Policy allows at most ${role.maxHours} hours for this role.` };
  if (role.approval) return { ...base, outcome: "Pending approval", reason: "This role needs an approver. It is not active yet." };
  return { ...base, outcome: "Activated", reason: "Within policy. Access ends automatically." };
}

export function auditToCsv(entries: AuditEntry[]): string {
  const escape = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
  const header = ["step", "user", "role", "hours", "outcome", "reason"].join(",");
  const rows = entries.map((entry) => [entry.step, "user-sim-007", entry.role, entry.hours, entry.outcome, entry.reason].map(escape).join(","));
  return [header, ...rows].join("\n");
}

/* ------------------------------------------------------------------ */
/* Mission 06: Copilot Studio and MCP                                  */
/* ------------------------------------------------------------------ */

export type McpStageId = "copilot" | "mcp" | "auth" | "function" | "api" | "tool";

export const MCP_STAGES: { id: McpStageId; title: string; text: string; detail: string }[] = [
  { id: "copilot", title: "Copilot Studio", text: "The assistant receives the user's request and decides a tool is needed.", detail: "request: \"Summarize open tickets for team-sim\"" },
  { id: "mcp", title: "MCP integration", text: "The Model Context Protocol lets the assistant discover and call tools in a standard way.", detail: "tools/call: summarize_tickets" },
  { id: "auth", title: "Authentication", text: "The call carries a token from an app registration. The server checks that it is valid and has the scope it needs.", detail: "token check: signature, expiry, scope" },
  { id: "function", title: "Azure Function", text: "The function hosts the tool. It runs the logic and calls downstream systems.", detail: "function: summarize_tickets (simulated)" },
  { id: "api", title: "API workflow", text: "The function calls an enterprise API, with its own authorization, to get the data.", detail: "GET /tickets?team=team-sim (simulated)" },
  { id: "tool", title: "Enterprise tool", text: "The system of record returns data that is passed back up the chain.", detail: "result: 12 tickets, 3 high priority (synthetic)" },
];

export type McpScenarioId = "authorized" | "expired-token" | "missing-scope" | "unknown-tool";

export const MCP_SCENARIOS: { id: McpScenarioId; title: string; text: string; blockedAt: McpStageId | null; code: string; reason: string }[] = [
  { id: "authorized", title: "Authorized request", text: "A valid token with the right scope.", blockedAt: null, code: "200", reason: "Tool result returned." },
  { id: "expired-token", title: "Expired token", text: "The token's lifetime has ended.", blockedAt: "auth", code: "401", reason: "Token expired. The client must obtain a new one." },
  { id: "missing-scope", title: "Missing scope", text: "A valid token without permission for this tool.", blockedAt: "auth", code: "403", reason: "Token is valid but lacks the required scope. Authorization failed." },
  { id: "unknown-tool", title: "Unknown tool", text: "The request names a tool that is not registered.", blockedAt: "mcp", code: "404", reason: "Tool not registered with the MCP server." },
];

export type McpStep = { stage: McpStageId; status: "ok" | "blocked" | "skipped"; message: string };

export function runMcpScenario(id: McpScenarioId): { steps: McpStep[]; code: string; reason: string } {
  const scenario = MCP_SCENARIOS.find((item) => item.id === id) as (typeof MCP_SCENARIOS)[number];
  let blocked = false;
  const steps = MCP_STAGES.map((stage): McpStep => {
    if (blocked) return { stage: stage.id, status: "skipped", message: "Not reached." };
    if (scenario.blockedAt === stage.id) {
      blocked = true;
      return { stage: stage.id, status: "blocked", message: `${scenario.code}: ${scenario.reason}` };
    }
    return { stage: stage.id, status: "ok", message: stage.detail };
  });
  return { steps, code: scenario.code, reason: scenario.reason };
}

export const mcpComplete = (ran: McpScenarioId[]) => ran.includes("authorized") && ran.some((id) => id !== "authorized");
