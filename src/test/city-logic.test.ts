import { describe, expect, it } from "vitest";
import { portfolio } from "@/data/portfolio";
import { DISTRICTS, MISSIONS, districtForMission } from "@/city/data/districts";
import {
  BADGES,
  STORAGE_KEY,
  initialProgress,
  earnedBadges,
  loadProgress,
  maxXp,
  parseProgress,
  progressReducer,
  saveProgress,
  totalXp,
  type Progress,
} from "@/city/state/game-state";
import {
  COST_RESOURCES,
  CORRECT_HYPOTHESIS,
  PIPELINE_LINKS,
  STORAGE_ACCOUNTS,
  SUBSCRIPTION_TOTAL,
  auditToCsv,
  costGap,
  evaluateActivation,
  evaluateCostFindings,
  evaluateLink,
  evaluateStorage,
  expectedAction,
  isPipelineComplete,
  mappedTotal,
  mcpComplete,
  recommendTier,
  runMcpScenario,
  validateHypothesis,
  type PipelineNodeId,
} from "@/city/missions/logic";

const projectIds = portfolio.projects.map((project) => project.id);

describe("city configuration", () => {
  it("defines six districts, each with real projects and a mission", () => {
    expect(DISTRICTS).toHaveLength(6);
    expect(new Set(DISTRICTS.map((district) => district.id)).size).toBe(6);
    for (const district of DISTRICTS) {
      expect(district.missionIds.length).toBeGreaterThan(0);
      district.projectIds.forEach((id) => expect(projectIds).toContain(id));
      district.missionIds.forEach((id) => expect(districtForMission(id).id).toBe(district.id));
      expect(district.x).toBeGreaterThan(0);
      expect(district.y).toBeGreaterThan(0);
    }
  });

  it("places every portfolio project in exactly one district", () => {
    const placed = DISTRICTS.flatMap((district) => district.projectIds);
    expect([...placed].sort()).toEqual([...projectIds].sort());
  });

  it("places every mission in one district", () => {
    const placed = DISTRICTS.flatMap((district) => district.missionIds);
    expect(placed).toHaveLength(15);
    expect([...placed].sort()).toEqual(Object.keys(MISSIONS).sort());
  });
});

describe("progress and persistence", () => {
  it("awards exploration XP once per discovery", () => {
    let state: Progress = initialProgress;
    state = progressReducer(state, { type: "discover", id: "data-docks" });
    state = progressReducer(state, { type: "discover", id: "data-docks" });
    state = progressReducer(state, { type: "project", id: projectIds[0] });
    state = progressReducer(state, { type: "complete", id: "pipeline" });
    state = progressReducer(state, { type: "complete", id: "pipeline" });
    expect(totalXp(state)).toBe(50 + 20 + 150);
    expect(progressReducer(state, { type: "intro-seen" }).introSeen).toBe(true);
  });

  it("reaches the maximum XP only when everything is explored", () => {
    let state: Progress = initialProgress;
    DISTRICTS.forEach((district) => (state = progressReducer(state, { type: "discover", id: district.id })));
    projectIds.forEach((id) => (state = progressReducer(state, { type: "project", id })));
    Object.keys(MISSIONS).forEach((id) => (state = progressReducer(state, { type: "complete", id: id as keyof typeof MISSIONS })));
    expect(totalXp(state)).toBe(maxXp(DISTRICTS.length, projectIds.length, Object.keys(MISSIONS).length));
  });

  it("earns each badge from its missions, and the journey badge from all of them", () => {
    let state: Progress = initialProgress;
    expect(earnedBadges(state)).toEqual([]);
    state = progressReducer(state, { type: "complete", id: "pipeline" });
    expect(earnedBadges(state)).toEqual(["data-explorer"]);
    state = progressReducer(state, { type: "complete", id: "incident" });
    expect(earnedBadges(state)).not.toContain("ai-explorer");
    state = progressReducer(state, { type: "complete", id: "mcp" });
    expect(earnedBadges(state)).toContain("ai-explorer");
    (["cost", "storage", "pim"] as const).forEach((id) => (state = progressReducer(state, { type: "complete", id })));
    expect(earnedBadges(state)).not.toContain("journey-complete");
    state = progressReducer(state, { type: "complete", id: "engineer" });
    expect(earnedBadges(state)).toHaveLength(BADGES.length);
  });

  it("saves, restores and resets progress", () => {
    const store = new Map<string, string>();
    const storage = { getItem: (key: string) => store.get(key) ?? null, setItem: (key: string, value: string) => void store.set(key, value) };
    let state = progressReducer(initialProgress, { type: "complete", id: "cost" });
    state = progressReducer(state, { type: "discover", id: "operations-hq" });
    state = progressReducer(state, { type: "intro-seen" });
    saveProgress(state, storage);
    expect(store.has(STORAGE_KEY)).toBe(true);
    expect(loadProgress(projectIds, storage)).toEqual(state);
    const reset = progressReducer(state, { type: "reset" });
    expect(reset.missions).toEqual([]);
    expect(reset.discovered).toEqual([]);
    expect(reset.introSeen).toBe(true);
  });

  it("ignores corrupt or tampered storage", () => {
    expect(parseProgress("not json", projectIds)).toEqual(initialProgress);
    expect(parseProgress(JSON.stringify({ version: 2 }), projectIds)).toEqual(initialProgress);
    const cleaned = parseProgress(JSON.stringify({ version: 1, missions: ["cost", "hack"], discovered: ["nowhere"], projects: ["fake"], announced: [1], introSeen: "yes" }), projectIds);
    expect(cleaned.missions).toEqual(["cost"]);
    expect(cleaned.discovered).toEqual([]);
    expect(cleaned.projects).toEqual([]);
    expect(cleaned.introSeen).toBe(false);
  });
});

describe("mission 01: pipeline", () => {
  const chain = PIPELINE_LINKS;
  it("accepts only the correct order and explains mistakes", () => {
    expect(evaluateLink("source", "adf", []).status).toBe("correct");
    expect(evaluateLink("adf", "source", []).message).toMatch(/other way/);
    expect(evaluateLink("source", "dbx", []).status).toBe("wrong");
    expect(evaluateLink("fabric", "adf", []).status).toBe("wrong");
    expect(evaluateLink("adf", "adf", []).status).toBe("wrong");
    expect(evaluateLink("source", "adf", [["source", "adf"]]).status).toBe("duplicate");
  });
  it("completes only when every link is connected", () => {
    expect(isPipelineComplete(chain.slice(0, 4) as [PipelineNodeId, PipelineNodeId][])).toBe(false);
    expect(isPipelineComplete([...chain])).toBe(true);
  });
});

describe("mission 02: cost investigation", () => {
  it("explains the whole gap with the unmapped resources", () => {
    expect(SUBSCRIPTION_TOTAL - mappedTotal()).toBe(costGap());
    const unmapped = COST_RESOURCES.filter((resource) => !resource.product);
    expect(unmapped.reduce((sum, resource) => sum + resource.cost, 0)).toBe(costGap());
  });
  it("solves only with exactly the right resources and causes", () => {
    const unmapped = COST_RESOURCES.filter((resource) => !resource.product).map((resource) => resource.id);
    const causes = ["stale-map", "shared", "untagged"];
    expect(evaluateCostFindings(unmapped, causes).solved).toBe(true);
    expect(evaluateCostFindings(unmapped.slice(1), causes).solved).toBe(false);
    expect(evaluateCostFindings([...unmapped, "res-sim-001"], causes).falsePositives).toEqual(["res-sim-001"]);
    expect(evaluateCostFindings(unmapped, [...causes, "saving"]).causesCorrect).toBe(false);
  });
});

describe("mission 03: incident", () => {
  it("requires verification before accepting a conclusion", () => {
    expect(validateHypothesis(null, 3, true).ready).toBe(false);
    expect(validateHypothesis(CORRECT_HYPOTHESIS, 1, true).ready).toBe(false);
    expect(validateHypothesis(CORRECT_HYPOTHESIS, 2, false).ready).toBe(false);
    expect(validateHypothesis(CORRECT_HYPOTHESIS, 2, true).correct).toBe(true);
  });
  it("rejects hypotheses the evidence contradicts", () => {
    const verdict = validateHypothesis("h-throttle", 3, true);
    expect(verdict.ready).toBe(true);
    expect(verdict.correct).toBe(false);
    expect(verdict.message).toMatch(/contradict/);
  });
});

describe("mission 04: storage", () => {
  it("recommends tiers from last access", () => {
    expect(recommendTier(5)).toBe("Hot");
    expect(recommendTier(30)).toBe("Hot");
    expect(recommendTier(95)).toBe("Cool");
    expect(recommendTier(181)).toBe("Archive");
  });
  it("marks an assessment correct only when every account matches", () => {
    const right = Object.fromEntries(STORAGE_ACCOUNTS.map((account) => [account.id, { tier: recommendTier(account.daysSinceAccess), action: expectedAction(account) }]));
    expect(evaluateStorage(right).allCorrect).toBe(true);
    expect(evaluateStorage({ ...right, sa1: { tier: "Hot", action: "Keep as is" } }).allCorrect).toBe(false);
    expect(evaluateStorage({}).allCorrect).toBe(false);
  });
});

describe("mission 05: PIM", () => {
  it("enforces policy for activation requests", () => {
    expect(evaluateActivation({ roleId: "reader", hours: 2, justification: "Investigate a failed run" }, 1).outcome).toBe("Activated");
    expect(evaluateActivation({ roleId: "reader", hours: 2, justification: "short" }, 2).outcome).toBe("Blocked");
    expect(evaluateActivation({ roleId: "storage-op", hours: 9, justification: "Needs more time please" }, 3).outcome).toBe("Blocked");
    expect(evaluateActivation({ roleId: "kv-review", hours: 1, justification: "Quarterly access review" }, 4).outcome).toBe("Pending approval");
    expect(evaluateActivation({ roleId: "unknown", hours: 1, justification: "Does not exist here" }, 5).outcome).toBe("Blocked");
  });
  it("exports a synthetic audit CSV", () => {
    const csv = auditToCsv([evaluateActivation({ roleId: "reader", hours: 1, justification: "Review the audit trail" }, 1)]);
    expect(csv.split("\n")[0]).toBe("step,user,role,hours,outcome,reason");
    expect(csv).toContain("user-sim-007");
  });
});

describe("mission 06: Copilot and MCP", () => {
  it("stops each failing scenario at the right stage", () => {
    expect(runMcpScenario("authorized").steps.every((step) => step.status === "ok")).toBe(true);
    const expired = runMcpScenario("expired-token");
    expect(expired.code).toBe("401");
    expect(expired.steps.find((step) => step.status === "blocked")?.stage).toBe("auth");
    expect(expired.steps.at(-1)?.status).toBe("skipped");
    expect(runMcpScenario("unknown-tool").steps.find((step) => step.status === "blocked")?.stage).toBe("mcp");
  });
  it("completes after the authorized request and one failure", () => {
    expect(mcpComplete(["authorized"])).toBe(false);
    expect(mcpComplete(["missing-scope"])).toBe(false);
    expect(mcpComplete(["authorized", "missing-scope"])).toBe(true);
  });
});

describe("no confidential material in synthetic data", () => {
  it("uses only fictional identifiers", () => {
    const sample = JSON.stringify({ COST_RESOURCES, STORAGE_ACCOUNTS });
    expect(sample).not.toMatch(/capgemini|microsoft|@|tenant|subscription-id|[0-9a-f]{8}-[0-9a-f]{4}/i);
  });
});
