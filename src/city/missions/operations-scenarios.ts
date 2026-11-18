import type { ScenarioMissionId } from "@/city/types";

type Choice = { id: string; label: string };
export type DecisionPoint = {
  stage: string;
  evidence: string;
  question: string;
  choices: readonly Choice[];
  answer: string;
  rationale: string;
  result?: string;
};
export type Scenario = { name: string; briefing: string; steps: readonly DecisionPoint[] };

const point = (
  stage: string, evidence: string, question: string,
  options: readonly [string, string, string], correct: 0 | 1 | 2, rationale: string,
  result?: string,
): DecisionPoint => ({
  stage, evidence, question, choices: options.map((label, index) => ({ id: String(index), label })),
  answer: String(correct), rationale, result,
});

const backfill = (name: string, missing: string, source: string): Scenario => ({
  name, briefing: `The ${source} dashboard is missing ${missing}. The neighboring partitions have already passed validation.`,
  steps: [
    point("Scope", `Published: neighboring partitions\nMissing: ${missing}\nSource snapshot: retained`, "What should go into the work plan first?",
      ["Replay the entire source", "Record the missing partition and pin the source snapshot", "Clear the existing output"], 1,
      "A bounded range and a fixed input make the job auditable and avoid disturbing successful partitions."),
    point("Rerun", "The first attempt might have written some rows before stopping.", "How should the rerun publish its output?",
      ["Append the entire partition blindly", "Rewrite all historical partitions", "Stage the selected partition and merge on a stable key"], 2,
      "A keyed merge makes repeated attempts produce the same result instead of doubling rows."),
    point("Handoff", "The selected partition has been staged and is ready to publish.", "What evidence closes the backfill?",
      ["Reconcile counts and check uniqueness before marking it complete", "A green job status by itself", "Delete the staging records without comparing them"], 0,
      "Job success is not a data-quality check. Counts and key checks verify the intended partition."),
  ],
});

const identity = (name: string, container: string, principal: string): Scenario => ({
  name, briefing: `${principal} needs to list and read blobs from ${container}, but must not write data or inspect other containers.`,
  steps: [
    point("Data access", `Identity: ${principal}\nTarget: ${container}\nRequired: list and read blobs`, "Which role matches those data permissions?",
      ["Reader", "Storage Blob Data Contributor", "Storage Blob Data Reader"], 2,
      "Storage Blob Data Reader can list and read blobs. Management-plane Reader is not enough; Data Contributor is broader than needed."),
    point("Scope", "The storage account has multiple containers. Only one is in the request.", "Where should the fictional grant be scoped?",
      ["The requested container only", "The entire storage account", "The subscription"], 0,
      "Container scope avoids granting the same read access to unrelated datasets."),
    point("Verification", "The access review ticket still needs a verification note.", "Which check would you record?",
      ["A row count from a different identity", "Read succeeds in scope; writes and reads outside scope are denied", "The service starts without an error"], 1,
      "Verify both the allowed path and the boundaries so the review checks least privilege, not just connectivity."),
  ],
});

const terraform = (name: string, resource: string, field: string): Scenario => ({
  name, briefing: "The change request permits a tag update only. Read the mock plan before you decide whether it can be approved.",
  steps: [
    point("Plan evidence", `~ ${resource}.worker: tags.owner = "platform"\n-/+ ${resource}.worker: ${field} forces replacement\nPlan: 1 to add, 0 to change, 1 to destroy`, "How do you review this plan?",
      ["Approve: the tag value is correct", "Reject: it includes an unapproved replacement", "Approve: add and destroy cancel each other out"], 1,
      "Replacing a resource destroys or recreates it even if the final resource count is unchanged."),
    point("Correction", "The replacement came from an unintended input change, not the approved request.", "What do you ask for next?",
      ["Restore the intended input and generate a fresh plan", "Apply the rejected plan and review later", "Ignore all future drift on the resource"], 0,
      "Correct the input and obtain a new reviewable plan. Do not mask changes or reuse a rejected plan."),
    point("Re-review", `~ ${resource}.worker: tags.owner = "platform"\nPlan: 0 to add, 1 to change, 0 to destroy`, "What decision fits the revised evidence?",
      ["Reject any plan containing ~", "Apply it from the review screen", "Approve the reviewed tag-only plan through the normal workflow"], 2,
      "The revised diff matches the approved scope. Review approval is separate from applying changes."),
  ],
});

const recoverySteps = [
  "Capture failed run details and the last good checkpoint",
  "Retry the affected step from the verified checkpoint",
  "Check freshness and counts downstream, then record the recovery",
] as const;

const runbook = (name: string, job: string, checkpoint: string): Scenario => ({
  name, briefing: `${job} stopped at ${checkpoint}. Put the recovery actions in order. Only one action belongs at each step.`,
  steps: [
    point("01 / Diagnose", "A job alert fired. No one has checked the last successful checkpoint yet.", "Choose the first runbook step.",
      recoverySteps, 0,
      "Preserve the evidence and establish the recovery boundary before changing state."),
    point("02 / Mitigate", `Last good checkpoint: ${checkpoint}\nRepeat attempts are safe only for the affected unit of work.`, "Choose the next step.",
      recoverySteps, 1,
      "A bounded, restartable retry limits impact and preserves completed work."),
    point("03 / Verify", "The retry reports success. The downstream data has not been checked.", "Choose the closing step.",
      recoverySteps, 2,
      "Verify the user-visible outcome and document what changed before closing the incident."),
  ],
});

const detective = (name: string, job: string, other: string, code: string): Scenario => ({
  name, briefing: "Find the repeated failure in Jobs. The rows and query results below are simulated; no database is contacted.",
  steps: [
    point("Select a query", `Jobs | MinuteAgo | Pipeline | Status | Code\n04 | ${job} | Failed | ${code}\n05 | ${job} | Failed | ${code}\n07 | ${other} | Success | OK\n75 | ${other} | Failed | LegacyWarning`, "Which query groups failures by pipeline in the requested 15-minute window?",
      ["Jobs | take 15", "Jobs | where MinuteAgo < 15 and Status == \"Failed\" | summarize Failures=count() by Pipeline", "Jobs | summarize Runs=count() by Status"], 1,
      "Filter time and status before aggregating. A row limit is not a time filter, and grouping by status cannot locate a pipeline.",
      `Pipeline | Failures\n${job} | 2`),
    point("Inspect the result", `Pipeline | Failures\n${job} | 2`, "What would reveal the repeated failure code?",
      [`Jobs | where Pipeline == "${job}" and MinuteAgo < 15 and Status == "Failed" | project Pipeline, Code`, "Jobs | summarize Total=count()", "Jobs | where Status == \"Success\""], 0,
      "Filter to the implicated pipeline and recent failures, then project its error code.",
      `Pipeline | Code\n${job} | ${code}\n${job} | ${code}`),
    point("State the finding", `Both recent failures for ${job} show ${code}. The sample includes no dependency trace.`, "What does this evidence support?",
      ["The whole platform is down", "The underlying cause is confirmed", "This pipeline and code warrant investigation; root cause remains unverified"], 2,
      "A repeated log signal narrows the search but does not prove root cause."),
  ],
});

const agent = (name: string, job: string, suggestion: string, observed: string): Scenario => ({
  name, briefing: `An agent drafted a response for ${job}. You are the reviewer, and nothing is executed or sent.`,
  steps: [
    point("Separate fact from inference", `Agent: "${suggestion}"\nEvidence: ${observed}`, "How should the draft be handled?",
      ["Publish the diagnosis as confirmed", "Request a correction: keep observations, label the cause unverified", "Discard the observed signal"], 1,
      "Keep the reported observation separate from an unsupported root-cause claim."),
    point("Verify before action", "The draft recommends an immediate platform-wide change. The available evidence is from one job.", "What is safe to approve?",
      ["A targeted, read-only check against the affected job's evidence", "An automatic global change", "No review; the agent sounds confident"], 0,
      "Verify the scope with a reversible, evidence-gathering step before requesting any change."),
    point("Write the handoff", "You can now name the affected job and the checks still outstanding.", "Which handoff should be sent for human approval?",
      ["An uncited success announcement", "A confirmed root cause with no evidence", "The observed impact, uncertainty and next verification step"], 2,
      "An honest handoff lets the next reviewer reproduce the checks without inheriting an unsupported conclusion."),
  ],
});

const platform = (name: string, dataset: string, cause: string): Scenario => ({
  name, briefing: `The ${dataset} report is stale. Move through the city from intake to recovery, then hand the incident over.`,
  steps: [
    point("Data Docks / Contain", "One partition is missing; the other partitions have reconciled.", "What keeps the existing data safe?",
      ["Hold the affected partition and keep verified output", "Resend every historical record", "Publish the empty partition as complete"], 0,
      "Contain the impact without damaging previously verified data."),
    point("Operations HQ / Investigate", `Recent failures point to ${cause}. Other pipelines are healthy.`, "What should you verify?",
      ["Whether the entire company is affected", "The failed run and its dependency evidence", "Only the last dashboard refresh timestamp"], 1,
      "Tie the symptom to the failed operation instead of treating a stale dashboard as a diagnosis."),
    point("Cloud Heights / Limit scope", "The recovery worker needs read-only access to the staged input container.", "Which fictional access proposal fits?",
      ["Storage Blob Data Reader on the staged container", "Contributor on the whole account", "Owner on the subscription"], 0,
      "Both role and scope should match the recovery worker's task."),
    point("Automation Works / Recover", "The approved recovery script can restart from a known-good checkpoint.", "Which change should go through review?",
      ["Replace the whole downstream platform", "Retry everything and skip checks", "Recover only the missing partition, then reconcile the result"], 2,
      "Use a bounded replay, and check the data before restoring normal reporting."),
    point("Neon AI Labs / Review", "The agent calls the platform fully healthy. Your checks cover one repaired partition.", "How should the incident draft change?",
      ["Report the verified partition recovery without claiming platform-wide health", "Send the draft unchanged", "Remove all verified outcomes from the draft"], 0,
      "Keep the conclusion within the scope of the checks an engineer actually performed."),
    point("Headquarters / Handoff", `The ${dataset} partition now reconciles and freshness is back within the fictional target.`, "What closes Platform Day?",
      ["Hide the incident once the dashboard turns green", "Record impact, evidence, verified recovery and remaining follow-up", "Call the root cause fixed even if it wasn't verified"], 1,
      "Document validated recovery and remaining uncertainties for the next shift."),
  ],
});

export const OPERATIONS_SCENARIOS: Record<ScenarioMissionId, readonly [Scenario, Scenario]> = {
  "backfill-planner": [backfill("Tide Ledger", "2026-07-14", "berth usage"), backfill("Crane Window", "2026-07-21", "crane telemetry")],
  "least-privilege": [identity("Harbor Observer", "dock-reports", "harbor-reader"), identity("Forecast Reader", "forecast-inputs", "forecast-worker")],
  "terraform-review": [terraform("Signal Tower", "mock_service", "region"), terraform("Relay Room", "mock_worker", "network_id")],
  "runbook-builder": [runbook("Dawn Refresh", "The tides report", "stage-02"), runbook("Signal Retry", "The berth export", "stage-05")],
  "kql-detective": [detective("Late Arrival", "berth-ingest", "tides-export", "InputTimeout"), detective("Missing Column", "crane-load", "berth-archive", "SchemaMismatch")],
  "agent-review": [agent("Evidence Gate", "berth-ingest", "the storage platform is down", "one timed-out read"), agent("Source Check", "crane-load", "a vendor schema change is confirmed", "one missing-column error")],
  "platform-day": [platform("Harbor Blackout", "berth-usage", "a timed-out input read"), platform("Morning Delay", "crane-utilization", "a schema mismatch")],
};

export function dailyVariant(date: Date, count: number) {
  const day = Math.floor(date.getTime() / 86_400_000);
  return ((day % count) + count) % count;
}

export function rotateChoices<T>(items: readonly T[], shift: number) {
  const offset = shift % items.length;
  return [...items.slice(offset), ...items.slice(0, offset)];
}
