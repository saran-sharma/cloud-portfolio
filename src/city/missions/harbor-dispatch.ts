export type DispatchRoute = "release" | "quarantine" | "duplicate";

type Shipment = {
  id: string;
  berth: string;
  pallets: number | null;
};

export const MANIFEST: readonly Shipment[] = [
  { id: "HX-204", berth: "B-04", pallets: 18 },
  { id: "HX-205", berth: "", pallets: 12 },
  { id: "HX-204", berth: "B-04", pallets: 18 },
  { id: "HX-206", berth: "B-07", pallets: null },
  { id: "HX-207", berth: "B-02", pallets: 24 },
  { id: "HX-208", berth: "B-03", pallets: 6 },
];

export const DISPATCH_ROUTES = {
  release: { label: "Release", detail: "Send valid, new data downstream.", lane: "01" },
  quarantine: { label: "Quarantine", detail: "Hold incomplete data for repair.", lane: "02" },
  duplicate: { label: "Deduplicate", detail: "Keep one copy in the ledger.", lane: "03" },
} satisfies Record<DispatchRoute, { label: string; detail: string; lane: string }>;

type Decision = { route: DispatchRoute; reason: string };
export type ManifestEntry = { shipment: Shipment; route: DispatchRoute; firstPass: boolean };

export function inspectShipment(shipment: Shipment, ledger: readonly ManifestEntry[]): Decision {
  if (!shipment.berth) {
    return { route: "quarantine", reason: "The berth is missing. Hold this record for repair instead of guessing its destination." };
  }
  if (shipment.pallets === null) {
    return { route: "quarantine", reason: "The pallet count is missing. An unknown count is not the same as zero." };
  }
  if (ledger.some((entry) => entry.route === "release" && entry.shipment.id === shipment.id)) {
    return { route: "duplicate", reason: `${shipment.id} is already in the published ledger. Publishing it again would double-count its pallets.` };
  }
  return { route: "release", reason: `${shipment.id} has a berth and a pallet count, and it has not been published before.` };
}

export function summarizeManifest(ledger: readonly ManifestEntry[]) {
  return ledger.reduce((totals, entry) => {
    totals[entry.route] += 1;
    if (entry.firstPass) totals.firstPass += 1;
    if (entry.route === "release") totals.publishedPallets += entry.shipment.pallets ?? 0;
    return totals;
  }, { release: 0, quarantine: 0, duplicate: 0, firstPass: 0, publishedPallets: 0 });
}
