import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "@/App";
import { MANIFEST, inspectShipment, summarizeManifest, type ManifestEntry } from "@/city/missions/harbor-dispatch";
import { STORAGE_KEY, loadProgress, totalXp, XP } from "@/city/state/game-state";

describe("harbor dispatch rules", () => {
  it("routes the manifest without double-counting a resend", () => {
    const ledger: ManifestEntry[] = [];
    for (const shipment of MANIFEST) {
      ledger.push({ shipment, route: inspectShipment(shipment, ledger).route, firstPass: true });
    }
    expect(ledger.map(({ route }) => route)).toEqual(["release", "quarantine", "duplicate", "quarantine", "release", "release"]);
    expect(summarizeManifest(ledger)).toEqual({ release: 3, quarantine: 2, duplicate: 1, firstPass: 6, publishedPallets: 48 });
  });

  it("treats a known zero as a valid count and doesn't match quarantined records against the published ledger", () => {
    const incomplete = MANIFEST[1];
    expect(inspectShipment({ ...incomplete, berth: "B-01", pallets: 0 }, [
      { shipment: incomplete, route: "quarantine", firstPass: true },
    ]).route).toBe("release");
  });
});

describe("Harbor Dispatch in Saran Universe", () => {
  beforeEach(() => {
    window.scrollTo = vi.fn();
    window.localStorage.clear();
    window.history.replaceState(null, "", "/");
  });

  afterEach(() => {
    window.history.replaceState(null, "", "/");
    window.localStorage.clear();
  });

  const saved = () => loadProgress([], window.localStorage);

  it("opens from a local link, coaches a retry, reconciles the batch and awards XP only once", async () => {
    window.history.replaceState(null, "", "/?mission=harbor-dispatch");
    render(<App />);
    const desk = await screen.findByRole("region", { name: "Choose a routing lane" }, { timeout: 10000 });
    expect(screen.getByRole("heading", { name: "HX-204" })).toBeVisible();
    fireEvent.click(within(desk).getByRole("button", { name: /^Quarantine/ }));
    expect(within(desk).getByText(/^Try another lane/)).toBeVisible();
    expect(within(desk).queryByRole("button", { name: "Next record" })).not.toBeInTheDocument();

    const finish = () => {
      [/^Release/, /^Quarantine/, /^Deduplicate/, /^Quarantine/, /^Release/, /^Release/].forEach((route, index) => {
        const controls = within(screen.getByRole("region", { name: "Choose a routing lane" }));
        fireEvent.click(controls.getByRole("button", { name: route }));
        const next = controls.getByRole("button", { name: index === 5 ? "Close manifest" : "Next record" });
        expect(next).toHaveFocus();
        fireEvent.click(next);
      });
    };

    finish();
    const report = screen.getByRole("region", { name: "Manifest reconciled" });
    expect(within(report).getByText(/48 pallets/)).toBeVisible();
    expect(within(report).getByText("5/6")).toBeVisible();
    expect(within(report).getByRole("heading")).toHaveFocus();
    expect(totalXp(saved())).toBe(XP.mission);
    fireEvent.click(within(report).getByRole("button", { name: "Replay shift" }));
    expect(screen.getByRole("heading", { name: "HX-204" })).toHaveFocus();
    expect(window.localStorage.getItem(STORAGE_KEY)).toContain("harbor-dispatch");
    finish();
    expect(screen.getByText("6/6")).toBeVisible();
    expect(saved().missions).toEqual(["harbor-dispatch"]);
    expect(totalXp(saved())).toBe(XP.mission);
  }, 30000);

  it("returns to the map from a direct link and can start the featured mission again", async () => {
    window.history.replaceState(null, "", "/?mission=harbor-dispatch");
    render(<App />);
    await screen.findByRole("heading", { name: "HX-204" }, { timeout: 10000 });
    fireEvent.click(screen.getByRole("button", { name: /^City map$/i }));
    expect(screen.getByRole("heading", { name: "Choose a district" })).toBeVisible();
    expect(window.location.search).toBe("");
    fireEvent.click(screen.getByRole("button", { name: "Take the night shift" }));
    expect(await screen.findByRole("heading", { name: "HX-204" }, { timeout: 10000 })).toBeVisible();
    expect(window.location.search).toBe("?mission=harbor-dispatch");
  }, 20000);
});
