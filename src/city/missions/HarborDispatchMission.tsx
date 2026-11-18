import { useEffect, useRef, useState } from "react";
import { Anchor, ArrowRight, Check, CopyMinus, PackageCheck, RotateCcw, ShieldAlert } from "lucide-react";
import { XP } from "@/city/state/game-state";
import { DISPATCH_ROUTES, MANIFEST, inspectShipment, summarizeManifest, type DispatchRoute, type ManifestEntry } from "./harbor-dispatch";

const lanes = ["release", "quarantine", "duplicate"] as const;
const icons = { release: PackageCheck, quarantine: ShieldAlert, duplicate: CopyMinus };
const serial = (value: number) => String(value).padStart(2, "0");

export const HarborDispatchMission = ({ onComplete }: { onComplete: () => void }) => {
  const [ledger, setLedger] = useState<ManifestEntry[]>([]);
  const [choice, setChoice] = useState<DispatchRoute | null>(null);
  const [retried, setRetried] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const nextButton = useRef<HTMLButtonElement>(null);
  const focusHeading = useRef(false);
  const shipment = MANIFEST[ledger.length];
  const decision = shipment ? inspectShipment(shipment, ledger) : null;
  const matched = choice !== null && decision?.route === choice;
  const totals = summarizeManifest(ledger);
  const published = ledger.filter((entry) => entry.route === "release");

  useEffect(() => {
    if (matched) nextButton.current?.focus({ preventScroll: true });
  }, [matched]);

  useEffect(() => {
    if (!focusHeading.current) return;
    focusHeading.current = false;
    heading.current?.focus();
  }, [ledger.length]);

  const choose = (route: DispatchRoute) => {
    if (!decision || matched) return;
    if (route !== decision.route) setRetried(true);
    setChoice(route);
  };

  const advance = () => {
    if (!shipment || !decision || !matched) return;
    focusHeading.current = true;
    setLedger([...ledger, { shipment, route: decision.route, firstPass: !retried }]);
    setChoice(null);
    setRetried(false);
    if (ledger.length + 1 === MANIFEST.length) onComplete();
  };

  const replay = () => {
    focusHeading.current = true;
    setLedger([]);
    setChoice(null);
    setRetried(false);
  };

  return (
    <div className="sc-harbor">
      <header className="sc-harbor-bar">
        <p><Anchor size={20} aria-hidden="true" /> <span>Data Docks / Night shift</span></p>
        <span className="sc-harbor-stamp">{shipment ? "Gate open" : "Manifest closed"}</span>
      </header>
      <div className="sc-harbor-body">
        {shipment ? (
          <>
            <section className="sc-harbor-ticket" aria-labelledby="sc-harbor-ticket">
              <p className="sc-harbor-label">Inbound record {serial(ledger.length + 1)} / {serial(MANIFEST.length)}</p>
              <h2 id="sc-harbor-ticket" ref={heading} tabIndex={-1}>{shipment.id}</h2>
              <dl className="sc-harbor-fields">
                <div><dt>Berth</dt><dd className={!shipment.berth ? "is-missing" : undefined}>{shipment.berth || "Missing"}</dd></div>
                <div><dt>Pallets</dt><dd className={shipment.pallets === null ? "is-missing" : undefined}>{shipment.pallets ?? "Missing"}</dd></div>
              </dl>
              <p className="sc-harbor-label">Published ledger</p>
              <p className="sc-harbor-ledger">{published.length ? published.map((entry) => entry.shipment.id).join(" / ") : "No records published yet."}</p>
            </section>
            <section className="sc-harbor-desk" aria-labelledby="sc-harbor-desk-title">
              <h2 id="sc-harbor-desk-title">Choose a routing lane</h2>
              <p>A record needs a berth and a pallet count. Check its ID against the published ledger before releasing it.</p>
              <div className="sc-harbor-lanes">
                {lanes.map((route) => {
                  const Icon = icons[route];
                  const info = DISPATCH_ROUTES[route];
                  return (
                    <button
                      key={route}
                      type="button"
                      className="sc-harbor-lane"
                      data-route={route}
                      data-choice={choice === route ? (matched ? "confirmed" : "retry") : undefined}
                      disabled={matched}
                      onClick={() => choose(route)}
                    >
                      <Icon size={20} aria-hidden="true" />
                      <span><strong>{info.label}</strong><small>{info.detail}</small></span>
                      <span className="sc-harbor-lane-index" aria-hidden="true">{info.lane}</span>
                    </button>
                  );
                })}
              </div>
              <p className="sc-harbor-feedback" data-match={matched} role="status">
                {choice && decision ? `${matched ? "Route confirmed." : "Try another lane."} ${decision.reason}` : "Inspect the record and choose a lane."}
              </p>
              {matched && (
                <button ref={nextButton} type="button" className="sc-btn is-quiet" onClick={advance}>
                  {ledger.length + 1 === MANIFEST.length ? "Close manifest" : "Next record"} <ArrowRight size={17} aria-hidden="true" />
                </button>
              )}
            </section>
          </>
        ) : (
          <section className="sc-harbor-report" aria-labelledby="sc-harbor-report-title">
            <p className="sc-harbor-label"><Check size={16} aria-hidden="true" /> Shift report</p>
            <h2 id="sc-harbor-report-title" ref={heading} tabIndex={-1}>Manifest reconciled</h2>
            <p>{ledger.length} of {MANIFEST.length} inbound records accounted for. The published shipment totals {totals.publishedPallets} pallets without counting any resends twice.</p>
            <dl className="sc-harbor-totals">
              <div><dt>Released</dt><dd>{totals.release}</dd></div>
              <div><dt>Quarantined</dt><dd>{totals.quarantine}</dd></div>
              <div><dt>Deduplicated</dt><dd>{totals.duplicate}</dd></div>
              <div><dt>First-pass routes</dt><dd>{totals.firstPass}/{MANIFEST.length}</dd></div>
            </dl>
            <ol className="sc-harbor-audit" aria-label="Routing audit">
              {ledger.map(({ shipment: item, route }, index) => (
                <li key={index}><span>{serial(index + 1)}</span> <b>{item.id}</b> <span>{DISPATCH_ROUTES[route].label}</span></li>
              ))}
            </ol>
            <p className="sc-note">Your first completed shift earns {XP.mission} exploration XP. Replays are for practice.</p>
            <button type="button" className="sc-btn is-quiet" onClick={replay}><RotateCcw size={16} aria-hidden="true" /> Replay shift</button>
          </section>
        )}
      </div>
    </div>
  );
};
