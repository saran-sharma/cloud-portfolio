import { useEffect, useState } from "react";
import {
  EVIDENCE,
  HYPOTHESES,
  INCIDENT,
  INCIDENT_LOGS,
  INCIDENT_QUERIES,
  validateHypothesis,
  type LogLine,
  type Relation,
} from "@/city/missions/logic";

const STEPS = ["Incident", "Telemetry", "KQL analysis", "AI hypotheses", "Evidence", "Validate"];
const WORKFLOW = ["Telemetry", "KQL analysis", "AI assistance", "Root cause hypothesis", "Engineer validation"];
const SYMBOL: Record<Relation, string> = { supports: "Supports", contradicts: "Contradicts", neutral: "Neutral" };

export const IncidentMission = ({ onComplete }: { onComplete: () => void }) => {
  const [step, setStep] = useState(0);
  const [filter, setFilter] = useState<"ALL" | LogLine["level"]>("ALL");
  const [pinned, setPinned] = useState<number[]>([]);
  const [ran, setRan] = useState<string[]>([]);
  const [focusHypothesis, setFocusHypothesis] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<ReturnType<typeof validateHypothesis> | null>(null);

  useEffect(() => {
    if (verdict?.correct) onComplete();
  }, [verdict, onComplete]);

  const logs = INCIDENT_LOGS.map((line, index) => ({ line, index })).filter(({ line }) => filter === "ALL" || line.level === filter);
  const workflowIndex = Math.min(4, [0, 0, 1, 2, 3, 4][step]);

  return (
    <div className="sc-mission-body">
      <ol className="sc-workflow" aria-label="Investigation workflow">
        {WORKFLOW.map((name, index) => (
          <li key={name} className={index <= workflowIndex ? "is-on" : ""} aria-current={index === workflowIndex ? "step" : undefined}>{name}</li>
        ))}
      </ol>

      <nav className="sc-stepper" aria-label="Investigation steps">
        {STEPS.map((name, index) => (
          <button key={name} type="button" className={index === step ? "is-on" : ""} aria-current={index === step ? "step" : undefined} onClick={() => setStep(index)}>
            <span>{index + 1}</span> {name}
          </button>
        ))}
      </nav>

      {step === 0 && (
        <section className="sc-section">
          <h3>1. Inspect the incident</h3>
          <dl className="sc-facts">
            <div><dt>Incident</dt><dd>{INCIDENT.id}</dd></div>
            <div><dt>Summary</dt><dd>{INCIDENT.title}</dd></div>
            <div><dt>Severity</dt><dd>{INCIDENT.severity}</dd></div>
            <div><dt>Service</dt><dd>{INCIDENT.service}</dd></div>
            <div><dt>Started</dt><dd>{INCIDENT.started}</dd></div>
            <div><dt>Impact</dt><dd>{INCIDENT.impact}</dd></div>
          </dl>
        </section>
      )}

      {step === 1 && (
        <section className="sc-section">
          <h3>2. Examine the telemetry</h3>
          <p>Pin the lines you think matter. {pinned.length} pinned.</p>
          <div className="sc-chips is-choice" role="group" aria-label="Filter by level">
            {(["ALL", "INFO", "WARN", "ERROR"] as const).map((level) => (
              <button key={level} type="button" aria-pressed={filter === level} className={filter === level ? "is-on" : ""} onClick={() => setFilter(level)}>{level}</button>
            ))}
          </div>
          <ul className="sc-log">
            {logs.map(({ line, index }) => (
              <li key={index}>
                <button type="button" aria-pressed={pinned.includes(index)} className={`is-${line.level.toLowerCase()} ${pinned.includes(index) ? "is-pinned" : ""}`} onClick={() => setPinned((list) => (list.includes(index) ? list.filter((item) => item !== index) : [...list, index]))}>
                  <time>{line.time}</time> <b>{line.level}</b> <i>{line.source}</i> {line.message}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {step === 2 && (
        <section className="sc-section">
          <h3>3. Explore KQL pattern analysis</h3>
          <p>Run each query against the synthetic telemetry. {ran.length} of {INCIDENT_QUERIES.length} run.</p>
          {INCIDENT_QUERIES.map((query) => (
            <article key={query.id} className="sc-query">
              <h4>{query.title}</h4>
              <pre><code>{query.kql}</code></pre>
              <button type="button" className="sc-btn is-small" onClick={() => setRan((list) => (list.includes(query.id) ? list : [...list, query.id]))}>Run query</button>
              {ran.includes(query.id) && (
                <>
                  <table className="sc-table">
                    <thead><tr>{query.columns.map((column) => <th key={column}>{column}</th>)}</tr></thead>
                    <tbody>{query.rows.map((row) => <tr key={row.join("|")}>{row.map((cell, index) => <td key={index}>{cell}</td>)}</tr>)}</tbody>
                  </table>
                  <p className="sc-note">{query.takeaway}</p>
                </>
              )}
            </article>
          ))}
        </section>
      )}

      {step === 3 && (
        <section className="sc-section">
          <h3>4. Review AI-generated hypotheses</h3>
          <p className="sc-message is-info">These are suggestions from an AI assistant. They are unverified and need an engineer to check them against evidence.</p>
          <ul className="sc-cards">
            {HYPOTHESES.map((hypothesis) => (
              <li key={hypothesis.id}>
                <span className="sc-label">AI-suggested, unverified</span>
                <p>{hypothesis.title}</p>
                <span className="sc-chip">Stated confidence: {hypothesis.confidence}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {step === 4 && (
        <section className="sc-section">
          <h3>5. Compare the supporting evidence</h3>
          <p>Select a hypothesis to highlight how each piece of evidence relates to it.</p>
          <div className="sc-chips is-choice" role="group" aria-label="Hypotheses">
            {HYPOTHESES.map((hypothesis) => (
              <button key={hypothesis.id} type="button" aria-pressed={focusHypothesis === hypothesis.id} className={focusHypothesis === hypothesis.id ? "is-on" : ""} onClick={() => setFocusHypothesis(focusHypothesis === hypothesis.id ? null : hypothesis.id)}>{hypothesis.title}</button>
            ))}
          </div>
          <div className="sc-table-wrap">
            <table className="sc-table">
              <thead>
                <tr><th>Evidence</th>{HYPOTHESES.map((hypothesis) => <th key={hypothesis.id} className={focusHypothesis === hypothesis.id ? "is-focus" : ""}>{hypothesis.id.replace("h-", "")}</th>)}</tr>
              </thead>
              <tbody>
                {EVIDENCE.map((item) => (
                  <tr key={item.id}>
                    <td>{item.text}</td>
                    {HYPOTHESES.map((hypothesis) => (
                      <td key={hypothesis.id} className={`is-rel-${item.relations[hypothesis.id]} ${focusHypothesis === hypothesis.id ? "is-focus" : ""}`}>{SYMBOL[item.relations[hypothesis.id]]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {step === 5 && (
        <section className="sc-section">
          <h3>6. Validate as the engineer</h3>
          <p>Choose the hypothesis you will stand behind. AI proposed these. You decide.</p>
          <ul className="sc-checks">
            {HYPOTHESES.map((hypothesis) => (
              <li key={hypothesis.id}>
                <label>
                  <input type="radio" name="hypothesis" checked={selected === hypothesis.id} onChange={() => { setSelected(hypothesis.id); setVerdict(null); }} />
                  <span>{hypothesis.title}</span>
                </label>
              </li>
            ))}
          </ul>
          <p className="sc-note">Checked so far: {pinned.length} log line{pinned.length === 1 ? "" : "s"} pinned, {ran.length} quer{ran.length === 1 ? "y" : "ies"} run.</p>
          <div className="sc-actions">
            <button type="button" className="sc-btn" onClick={() => setVerdict(validateHypothesis(selected, ran.length, pinned.length > 0))}>Validate hypothesis</button>
          </div>
          {verdict && <p className={`sc-message ${verdict.correct ? "is-good" : "is-bad"}`} role="status" aria-live="polite">{verdict.message}</p>}
        </section>
      )}

      <div className="sc-actions is-between">
        <button type="button" className="sc-btn is-quiet" onClick={() => setStep((value) => Math.max(0, value - 1))} disabled={step === 0}>Previous</button>
        <button type="button" className="sc-btn is-quiet" onClick={() => setStep((value) => Math.min(STEPS.length - 1, value + 1))} disabled={step === STEPS.length - 1}>Next</button>
      </div>
    </div>
  );
};
