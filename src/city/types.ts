export type DistrictId = "data-docks" | "cloud-heights" | "automation-works" | "neon-ai-labs" | "operations-hq" | "headquarters";

export type ScenarioMissionId =
  | "backfill-planner" | "least-privilege" | "terraform-review" | "runbook-builder"
  | "kql-detective" | "agent-review" | "platform-day";

export type MissionId = "pipeline" | "cost" | "incident" | "storage" | "pim" | "mcp" | "engineer" | "harbor-dispatch" | ScenarioMissionId;

export type BadgeId =
  | "data-explorer"
  | "cloud-navigator"
  | "automation-specialist"
  | "ai-explorer"
  | "platform-investigator"
  | "journey-complete";

export type Mode = "game" | "recruiter";

export type Scene =
  | { name: "intro" }
  | { name: "profile" }
  | { name: "map" }
  | { name: "tour" }
  | { name: "district"; id: DistrictId; intro?: boolean }
  | { name: "mission"; id: MissionId };

export type EnvironmentId = "docks" | "heights" | "works" | "labs" | "ops" | "hq";

export type District = {
  id: DistrictId;
  number: string;
  name: string;
  tagline: string;
  intro: string;
  accent: string;
  /** Position on the 1000 x 600 map, in map units. */
  x: number;
  y: number;
  environment: EnvironmentId;
  specialties: string[];
  projectIds: string[];
  missionIds: MissionId[];
  missionHeadline: string;
};

export type MissionInfo = {
  id: MissionId;
  number: string;
  title: string;
  objective: string;
  districtId: DistrictId;
};
