import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { track } from "@vercel/analytics";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "@/App";
import { dailyVariant, OPERATIONS_SCENARIOS, rotateChoices } from "@/city/missions/operations-scenarios";
import { OperationsMission } from "@/city/missions/OperationsMission";
import { STORAGE_KEY } from "@/city/state/game-state";

vi.mock("@vercel/analytics", () => ({ track: vi.fn() }));
vi.setConfig({ testTimeout: 30000 });

beforeEach(() => {
  window.history.replaceState(null, "", "/");
  window.localStorage.clear();
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});

afterEach(() => {
  window.history.replaceState(null, "", "/");
  window.localStorage.clear();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

describe("operations scenarios", () => {
  it("rotates deterministically at midnight UTC with stable choices during play", () => {
    const before = new Date("2026-11-18T23:59:59Z");
    const after = new Date("2026-11-19T00:00:00Z");
    expect(dailyVariant(before, 2)).toBe(dailyVariant(new Date("2026-11-18T00:00:00Z"), 2));
    expect(dailyVariant(after, 2)).not.toBe(dailyVariant(before, 2));
    expect(rotateChoices(["A", "B", "C"], 4)).toEqual(["B", "C", "A"]);
  });

  it("provides two distinct playable scenarios per new mission and a capstone across all six districts", () => {
    expect(Object.keys(OPERATIONS_SCENARIOS)).toHaveLength(7);
    for (const [first, second] of Object.values(OPERATIONS_SCENARIOS)) {
      expect(second.name).not.toBe(first.name);
      expect(second.steps.map((step) => step.evidence)).not.toEqual(first.steps.map((step) => step.evidence));
      for (const scenario of [first, second]) {
        expect(scenario.steps.length).toBeGreaterThanOrEqual(3);
        for (const step of scenario.steps) {
          expect(step.choices.filter((choice) => choice.id === step.answer)).toHaveLength(1);
          expect(new Set(step.choices.map((choice) => choice.label)).size).toBe(3);
        }
      }
    }
    expect(OPERATIONS_SCENARIOS["platform-day"][0].steps.map((step) => step.stage.split(" / ")[0]))
      .toEqual(["Data Docks", "Operations HQ", "Cloud Heights", "Automation Works", "Neon AI Labs", "Headquarters"]);
  });

  it("requires the correct runbook order and allows the alternate scenario after debrief", () => {
    const id = "runbook-builder";
    const scenarios = OPERATIONS_SCENARIOS[id];
    const today = dailyVariant(new Date(), scenarios.length);
    const onComplete = vi.fn();
    render(<OperationsMission id={id} onComplete={onComplete} onExit={vi.fn()} />);
    const first = scenarios[today].steps[0];
    fireEvent.click(screen.getByRole("button", { name: first.choices[1].label }));
    expect(screen.getByText(/^Try another option/)).toBeVisible();
    expect(screen.queryByRole("button", { name: "Next decision" })).not.toBeInTheDocument();

    scenarios[today].steps.forEach((step, index) => {
      const option = step.choices.find((choice) => choice.id === step.answer);
      expect(option).toBeDefined();
      fireEvent.click(screen.getByRole("button", { name: option?.label }));
      fireEvent.click(screen.getByRole("button", { name: index === 2 ? "Open debrief" : "Next decision" }));
    });
    expect(screen.getByRole("heading", { name: "Mission debrief" })).toHaveFocus();
    expect(screen.getByText(/^2 of 3 decisions/)).toBeVisible();
    expect(onComplete).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "Try the practice scenario" }));
    expect(screen.getByText(`Practice scenario / ${scenarios[1 - today].name}`)).toBeVisible();
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});

describe("tour and exploration features", () => {
  it("opens all three tour stops, an existing case study, and the capstone deep link", async () => {
    window.history.replaceState(null, "", "/?tour=1");
    render(<App />);
    expect(screen.getByRole("heading", { name: "The 3-minute tour" })).toBeVisible();
    const stops = screen.getByRole("list", { name: "Tour stops" });
    expect(within(stops).getAllByRole("listitem")).toHaveLength(3);
    const tour = screen.getByRole("region", { name: "The 3-minute tour" });
    expect(within(tour).getByRole("link", { name: "Download resume" })).toHaveAttribute("href", "/resume.pdf");
    expect(screen.getByRole("button", { name: "Continue in Recruiter Mode" })).toBeVisible();
    fireEvent.click(within(stops).getByRole("button", { name: /Read case study: IDEAs/ }));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByRole("heading", { name: /Dataset Onboarding/ })).toBeVisible();
    fireEvent.keyDown(dialog, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Play Platform Day" }));
    expect(await screen.findByText("Decision 1 / 6", {}, { timeout: 10000 })).toBeVisible();
    expect(window.location.search).toBe("?mission=platform-day");
  });

  it("offers a copyable, non-identifying summary and manual fallback", async () => {
    const original = Object.getOwnPropertyDescriptor(navigator, "clipboard");
    const writeText = vi.fn().mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error("Clipboard unavailable"));
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    try {
      window.history.replaceState(null, "", "/?tour=1");
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, missions: ["pipeline"], projects: ["ideas"], email: "private@example.test" }));
      render(<App />);
      fireEvent.click(screen.getByRole("button", { name: /^Progress:/ }));
      const dialog = screen.getByRole("dialog");
      const copy = within(dialog).getByRole("button", { name: "Copy explorer summary" });
      fireEvent.click(copy);
      expect(await within(dialog).findByText("Explorer summary copied.")).toBeVisible();
      const text = writeText.mock.calls[0][0];
      expect(text).toContain("Missions completed: 1 / 15");
      expect(text).toContain("Data Explorer");
      expect(text).not.toContain("private@example.test");
      fireEvent.click(copy);
      expect(await within(dialog).findByRole("textbox", { name: "Explorer summary" })).toHaveValue(text);
    } finally {
      if (original) Object.defineProperty(navigator, "clipboard", original);
      else Reflect.deleteProperty(navigator, "clipboard");
    }
  });

  it("records only a fixed mission ID on first completion, not a replay or saved progress", async () => {
    const id = "least-privilege";
    window.history.replaceState(null, "", `/?mission=${id}`);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, missions: ["pipeline"] }));
    render(<App />);
    const mission = OPERATIONS_SCENARIOS[id][0];
    await screen.findByText("Decision 1 / 3", {}, { timeout: 10000 });

    const finish = () => {
      mission.steps.forEach((step, index) => {
        const label = step.choices.find((choice) => choice.id === step.answer)?.label;
        fireEvent.click(screen.getByRole("button", { name: label }));
        fireEvent.click(screen.getByRole("button", { name: index === 2 ? "Open debrief" : "Next decision" }));
      });
    };
    finish();
    await waitFor(() => expect(track).toHaveBeenCalledExactlyOnceWith("mission_complete", { mission: id }));
    fireEvent.click(screen.getByRole("button", { name: "Replay this scenario" }));
    finish();
    expect(track).toHaveBeenCalledExactlyOnceWith("mission_complete", { mission: id });
  });
});
