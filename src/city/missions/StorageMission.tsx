import { useEffect, useState } from "react";
import {
  STORAGE_ACCOUNTS,
  TIER_TRADEOFFS,
  dependencyCount,
  evaluateStorage,
  recommendTier,
  type StorageAction,
  type StorageChoice,
  type Tier,
} from "@/city/missions/logic";

const TIERS: Tier[] = ["Hot", "Cool", "Archive"];
const ACTIONS: StorageAction[] = ["Migrate to StorageV2 / ADLS Gen2", "Keep as is"];

export const StorageMission = ({ onComplete }: { onComplete: () => void }) => {
  const [selectedId, setSelectedId] = useState(STORAGE_ACCOUNTS[0].id);
  const [inspected, setInspected] = useState<string[]>([STORAGE_ACCOUNTS[0].id]);
  const [choices, setChoices] = useState<Record<string, StorageChoice>>({});
  const [days, setDays] = useState(45);
  const [checked, setChecked] = useState<ReturnType<typeof evaluateStorage> | null>(null);

  const account = STORAGE_ACCOUNTS.find((item) => item.id === selectedId) ?? STORAGE_ACCOUNTS[0];
  const allInspected = inspected.length === STORAGE_ACCOUNTS.length;
  const allAnswered = STORAGE_ACCOUNTS.every((item) => choices[item.id]?.tier && choices[item.id]?.action);
  const comparatorTier = recommendTier(days);

  useEffect(() => {
    if (checked?.allCorrect) onComplete();
  }, [checked, onComplete]);

  const select = (id: string) => {
    setSelectedId(id);
    setInspected((list) => (list.includes(id) ? list : [...list, id]));
  };
  const setChoice = (id: string, patch: StorageChoice) => setChoices((current) => ({ ...current, [id]: { ...current[id], ...patch } }));
  const maxRead = Math.max(...account.recentReads, 1);

  return (
    <div className="sc-mission-body">
      <p className="sc-note">Synthetic sample accounts for an assessment. Nothing here has been migrated, and the real work is not shown.</p>

      <div className="sc-split">
        <div>
          <h3 className="sc-h">1. Inspect the sample accounts <span>{inspected.length} of {STORAGE_ACCOUNTS.length} inspected</span></h3>
          <ul className="sc-account-list">
            {STORAGE_ACCOUNTS.map((item) => (
              <li key={item.id}>
                <button type="button" className={`${selectedId === item.id ? "is-on" : ""} ${inspected.includes(item.id) ? "is-seen" : ""}`} aria-pressed={selectedId === item.id} onClick={() => select(item.id)}>
                  <strong>{item.name}</strong>
                  <span>{item.kind} · {item.sizeGb.toLocaleString("en-US")} GB · {item.currentTier}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <aside className="sc-inspector" aria-label={`Details for ${account.name}`}>
          <p className="sc-label">{account.kind}</p>
          <h3>{account.name}</h3>
          <p>Last accessed {account.daysSinceAccess} days ago. Current tier: {account.currentTier}.</p>
          <h4>Recent reads</h4>
          <div className="sc-bars" role="img" aria-label={`Reads over six months: ${account.recentReads.join(", ")}`}>
            {account.recentReads.map((value, index) => <span key={index} style={{ height: `${Math.max(4, (value / maxRead) * 100)}%` }} />)}
          </div>
          <h4>Dependencies</h4>
          <p>{dependencyCount(account) === 0 ? "No references found in Data Factory, Synapse or Databricks." : `Data Factory ${account.deps.adf}, Synapse ${account.deps.synapse}, Databricks ${account.deps.databricks}. Check each before changing the account.`}</p>
          <h4>Lifecycle policy</h4>
          <p>{account.lifecycle}</p>
        </aside>
      </div>

      <section className="sc-section" aria-labelledby="tier-compare">
        <h3 id="tier-compare">2. Compare Hot, Cool and Archive</h3>
        <label className="sc-range">
          Days since last access: <b>{days}</b>
          <input type="range" min={0} max={400} value={days} onChange={(event) => setDays(Number(event.target.value))} />
        </label>
        <div className="sc-tiers">
          {TIERS.map((tier) => (
            <div key={tier} className={tier === comparatorTier ? "is-rec" : ""}>
              <strong>{tier}{tier === comparatorTier && <em> · suggested</em>}</strong>
              <span>Storage cost: {TIER_TRADEOFFS[tier].storage}</span>
              <span>Access cost: {TIER_TRADEOFFS[tier].access}</span>
              <span>Latency: {TIER_TRADEOFFS[tier].latency}</span>
              <span>{TIER_TRADEOFFS[tier].use}</span>
            </div>
          ))}
        </div>
        <p className="sc-note">Gen1 to Gen2: a Gen1 (legacy) account moves to StorageV2 with the hierarchical namespace enabled, which is ADLS Gen2. Its dependencies are updated first.</p>
      </section>

      <section className="sc-section" aria-labelledby="assess">
        <h3 id="assess">3. Make your assessment</h3>
        <div className="sc-table-wrap">
          <table className="sc-table">
            <thead><tr><th>Account</th><th>Tier</th><th>Modernization</th><th>Result</th></tr></thead>
            <tbody>
              {STORAGE_ACCOUNTS.map((item) => {
                const result = checked?.results.find((entry) => entry.id === item.id);
                return (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>
                      <select aria-label={`Tier for ${item.name}`} value={choices[item.id]?.tier ?? ""} onChange={(event) => setChoice(item.id, { tier: event.target.value as Tier })}>
                        <option value="">Choose</option>
                        {TIERS.map((tier) => <option key={tier} value={tier}>{tier}</option>)}
                      </select>
                    </td>
                    <td>
                      <select aria-label={`Modernization for ${item.name}`} value={choices[item.id]?.action ?? ""} onChange={(event) => setChoice(item.id, { action: event.target.value as StorageAction })}>
                        <option value="">Choose</option>
                        {ACTIONS.map((action) => <option key={action} value={action}>{action}</option>)}
                      </select>
                    </td>
                    <td>{result ? (result.correct ? "Matches" : [!result.tierOk && "Revisit the tier", !result.actionOk && "Revisit the action"].filter(Boolean).join(", ")) : ""}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="sc-actions">
          <button type="button" className="sc-btn" disabled={!allInspected || !allAnswered} onClick={() => setChecked(evaluateStorage(choices))}>Check assessment</button>
          {(!allInspected || !allAnswered) && <span className="sc-note">Inspect every account and answer every row to check.</span>}
        </div>
        {checked && <p className={`sc-message ${checked.allCorrect ? "is-good" : "is-bad"}`} role="status" aria-live="polite">{checked.allCorrect ? "Assessment confirmed. Tiers follow how recently data was used, and only the legacy accounts are candidates to migrate, after their dependencies are handled." : "Some rows need another look. Use last access for the tier, and the account type for modernization."}</p>}
      </section>
    </div>
  );
};
