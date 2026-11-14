import { useEffect, useState } from "react";
import { PIM_ROLES, PIM_STAGES, auditToCsv, evaluateActivation, type AuditEntry } from "@/city/missions/logic";

export const PimMission = ({ onComplete }: { onComplete: () => void }) => {
  const [stageId, setStageId] = useState(PIM_STAGES[0].id);
  const [inspected, setInspected] = useState<string[]>([PIM_STAGES[0].id]);
  const [roleId, setRoleId] = useState(PIM_ROLES[0].id);
  const [hours, setHours] = useState(2);
  const [justification, setJustification] = useState("");
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [report, setReport] = useState(false);
  const [latest, setLatest] = useState<AuditEntry | null>(null);

  const stage = PIM_STAGES.find((item) => item.id === stageId) ?? PIM_STAGES[0];
  const role = PIM_ROLES.find((item) => item.id === roleId) ?? PIM_ROLES[0];
  const activated = audit.some((entry) => entry.outcome === "Activated");
  const done = inspected.length === PIM_STAGES.length && activated && report;

  useEffect(() => {
    if (done) onComplete();
  }, [done, onComplete]);

  const pick = (id: string) => {
    setStageId(id);
    setInspected((list) => (list.includes(id) ? list : [...list, id]));
  };

  const activate = () => {
    const entry = evaluateActivation({ roleId, hours, justification }, audit.length + 1);
    setAudit((list) => [...list, entry]);
    setLatest(entry);
  };

  const download = () => {
    if (typeof URL === "undefined" || typeof URL.createObjectURL !== "function") return;
    const url = URL.createObjectURL(new Blob([auditToCsv(audit)], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "pim-audit-sample.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="sc-mission-body">
      <p className="sc-note">A simulation with a synthetic identity. It never connects to a real tenant or role.</p>

      <section className="sc-section" aria-labelledby="pim-stages">
        <h3 id="pim-stages">1. Inspect the workflow <span className="sc-count">{inspected.length} of {PIM_STAGES.length} stages</span></h3>
        <ol className="sc-flow" aria-label="Workflow stages">
          {PIM_STAGES.map((item, index) => (
            <li key={item.id}>
              <button type="button" className={`${stageId === item.id ? "is-on" : ""} ${inspected.includes(item.id) ? "is-seen" : ""}`} aria-pressed={stageId === item.id} onClick={() => pick(item.id)}>
                <span>{index + 1}</span> {item.title}
              </button>
            </li>
          ))}
        </ol>
        <div className="sc-inspector is-wide">
          <h4>{stage.title}</h4>
          <p>{stage.text}</p>
          <pre><code>{stage.payload}</code></pre>
        </div>
      </section>

      <section className="sc-section" aria-labelledby="pim-eligible">
        <h3 id="pim-eligible">2. Eligible assignments for user-sim-007</h3>
        <div className="sc-table-wrap">
          <table className="sc-table">
            <thead><tr><th>Role</th><th className="is-num">Max hours</th><th>Approval</th></tr></thead>
            <tbody>
              {PIM_ROLES.map((item) => <tr key={item.id}><td>{item.name}</td><td className="is-num">{item.maxHours}</td><td>{item.approval ? "Required" : "Not required"}</td></tr>)}
            </tbody>
          </table>
        </div>
      </section>

      <section className="sc-section" aria-labelledby="pim-activate">
        <h3 id="pim-activate">3. Request an activation</h3>
        <p>Try a valid request, and try one that policy should stop, such as no justification or too long a duration.</p>
        <div className="sc-form">
          <label>Role
            <select value={roleId} onChange={(event) => setRoleId(event.target.value)}>
              {PIM_ROLES.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
          <label>Duration (hours, up to {role.maxHours})
            <input type="number" min={1} max={12} value={hours} onChange={(event) => setHours(Number(event.target.value))} />
          </label>
          <label className="is-wide">Justification
            <input type="text" value={justification} onChange={(event) => setJustification(event.target.value)} placeholder="Why is this access needed?" />
          </label>
        </div>
        <div className="sc-actions"><button type="button" className="sc-btn" onClick={activate}>Request activation</button></div>
        {latest && <p className={`sc-message ${latest.outcome === "Activated" ? "is-good" : latest.outcome === "Blocked" ? "is-bad" : "is-info"}`} role="status" aria-live="polite">{latest.outcome}: {latest.reason}</p>}
      </section>

      <section className="sc-section" aria-labelledby="pim-audit">
        <h3 id="pim-audit">4. Review the audit report</h3>
        <div className="sc-actions">
          <button type="button" className="sc-btn" disabled={audit.length === 0} onClick={() => setReport(true)}>Generate report</button>
          {report && <button type="button" className="sc-btn is-quiet" onClick={download}>Download sample CSV</button>}
          {audit.length === 0 && <span className="sc-note">Make at least one request first.</span>}
        </div>
        {report && (
          <div className="sc-table-wrap">
            <table className="sc-table">
              <thead><tr><th>Step</th><th>Role</th><th className="is-num">Hours</th><th>Outcome</th><th>Reason</th></tr></thead>
              <tbody>{audit.map((entry) => <tr key={entry.id}><td>{entry.step}</td><td>{entry.role}</td><td className="is-num">{entry.hours}</td><td>{entry.outcome}</td><td>{entry.reason}</td></tr>)}</tbody>
            </table>
          </div>
        )}
      </section>

      {done && <p className="sc-message is-good" role="status">Workflow reviewed. Every attempt, allowed or not, is recorded, and policy was never bypassed.</p>}
      {!done && <p className="sc-note">To complete: inspect all six stages, get one activation approved by policy, and generate the audit report.</p>}
    </div>
  );
};
