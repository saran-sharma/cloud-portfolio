import { useEffect, useRef, useState } from "react";
import { ArrowRight, CalendarDays, Check, RotateCcw } from "lucide-react";
import type { ScenarioMissionId } from "@/city/types";
import { dailyVariant, OPERATIONS_SCENARIOS, rotateChoices } from "./operations-scenarios";

type AuditEntry = { action: string; firstPass: boolean };

export const OperationsMission = ({ id, onComplete, onExit }: { id: ScenarioMissionId; onComplete: () => void; onExit: () => void }) => {
  const variants = OPERATIONS_SCENARIOS[id];
  const [today] = useState(() => dailyVariant(new Date(), variants.length));
  const [variant, setVariant] = useState(today);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [selection, setSelection] = useState<string | null>(null);
  const [retried, setRetried] = useState(false);
  const scenario = variants[variant];
  const step = scenario.steps[audit.length];
  const correct = step !== undefined && selection === step.answer;
  const advanceButton = useRef<HTMLButtonElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const moveFocus = useRef(false);

  useEffect(() => {
    if (correct) advanceButton.current?.focus({ preventScroll: true });
  }, [correct]);

  useEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    heading.current?.focus();
  }, [variant, audit.length]);

  const choose = (choice: string) => {
    if (!step || correct) return;
    setSelection(choice);
    if (choice !== step.answer) setRetried(true);
  };

  const advance = () => {
    const option = step?.choices.find((item) => item.id === selection);
    if (!correct || !option) return;
    const next = [...audit, { action: option.label, firstPass: !retried }];
    moveFocus.current = true;
    setAudit(next);
    setSelection(null);
    setRetried(false);
    if (next.length === scenario.steps.length) onComplete();
  };

  const replay = (nextVariant: number) => {
    moveFocus.current = true;
    setVariant(nextVariant);
    setAudit([]);
    setSelection(null);
    setRetried(false);
  };

  return (
    <div className="sc-harbor sc-operations">
      <header className="sc-harbor-bar">
        <p><CalendarDays size={18} aria-hidden="true" /> {variant === today ? "Daily scenario" : "Practice scenario"} / {scenario.name}</p>
        <span className="sc-harbor-stamp">{step ? `Decision ${audit.length + 1} / ${scenario.steps.length}` : "Briefing closed"}</span>
      </header>
      <p className="sc-ops-briefing">{scenario.briefing}</p>
      <div className="sc-harbor-body">
        {step ? (
          <>
            <section className="sc-harbor-ticket" aria-labelledby="sc-ops-evidence">
              <p className="sc-harbor-label">{step.stage}</p>
              <h2 id="sc-ops-evidence">Evidence</h2>
              <pre className="sc-ops-evidence">{step.evidence}</pre>
              {correct && step.result && <>
                <p className="sc-harbor-label sc-ops-result-label">Simulated result</p>
                <pre className="sc-ops-evidence">{step.result}</pre>
              </>}
            </section>
            <section className="sc-harbor-desk" aria-labelledby="sc-ops-question">
              <h2 id="sc-ops-question" ref={heading} tabIndex={-1}>{step.question}</h2>
              <div className="sc-harbor-lanes">
                {rotateChoices(step.choices, variant + audit.length).map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`sc-harbor-lane${id === "kql-detective" && audit.length < 2 ? " sc-ops-query" : ""}`}
                    data-choice={selection === item.id ? (correct ? "confirmed" : "retry") : undefined}
                    disabled={correct}
                    onClick={() => choose(item.id)}
                  >
                    <span className="sc-harbor-lane-index" aria-hidden="true">{String.fromCharCode(65 + index)}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
              <p className="sc-harbor-feedback" data-match={correct} role="status">
                {selection !== null ? `${correct ? "Decision logged." : "Try another option."} ${step.rationale}` : "Review the evidence, then choose a response."}
              </p>
              {correct && (
                <button ref={advanceButton} type="button" className="sc-btn is-quiet" onClick={advance}>
                  {audit.length + 1 === scenario.steps.length ? "Open debrief" : "Next decision"} <ArrowRight size={17} aria-hidden="true" />
                </button>
              )}
            </section>
          </>
        ) : (
          <section className="sc-harbor-report" aria-labelledby="sc-ops-debrief">
            <p className="sc-harbor-label"><Check size={16} aria-hidden="true" /> Decision log</p>
            <h2 id="sc-ops-debrief" ref={heading} tabIndex={-1}>Mission debrief</h2>
            <p>{audit.filter((entry) => entry.firstPass).length} of {audit.length} decisions on the first attempt. Exploration XP is awarded once per mission; practice and daily replays do not grant more.</p>
            <ol className="sc-ops-audit">
              {audit.map((entry, index) => (
                <li key={scenario.steps[index].stage}><b>{scenario.steps[index].stage}</b><span>{entry.action}</span></li>
              ))}
            </ol>
            <div className="sc-ops-actions">
              <button type="button" className="sc-btn is-quiet" onClick={() => replay(variant)}><RotateCcw size={16} aria-hidden="true" /> Replay this scenario</button>
              <button type="button" className="sc-btn is-quiet" onClick={() => replay((variant + 1) % variants.length)}>
                {variant === today ? "Try the practice scenario" : "Return to the daily scenario"}
              </button>
              <button type="button" className="sc-btn is-quiet" onClick={onExit}>3-minute tour</button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
