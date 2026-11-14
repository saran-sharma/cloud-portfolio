import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/city/hooks/use-reduced-motion";
import {
  MCP_SCENARIOS,
  MCP_STAGES,
  mcpComplete,
  runMcpScenario,
  type McpScenarioId,
  type McpStageId,
  type McpStep,
} from "@/city/missions/logic";

export const McpMission = ({ onComplete }: { onComplete: () => void }) => {
  const reduced = useReducedMotion();
  const [inspectId, setInspectId] = useState<McpStageId>("copilot");
  const [scenarioId, setScenarioId] = useState<McpScenarioId>("authorized");
  const [steps, setSteps] = useState<McpStep[]>([]);
  const [visible, setVisible] = useState(0);
  const [running, setRunning] = useState(false);
  const [ran, setRan] = useState<McpScenarioId[]>([]);
  const timers = useRef<number[]>([]);

  const inspect = MCP_STAGES.find((stage) => stage.id === inspectId) ?? MCP_STAGES[0];
  const scenario = MCP_SCENARIOS.find((item) => item.id === scenarioId) ?? MCP_SCENARIOS[0];
  const done = mcpComplete(ran);

  useEffect(() => {
    if (done) onComplete();
  }, [done, onComplete]);

  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), []);

  const send = () => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    const result = runMcpScenario(scenarioId);
    setSteps(result.steps);
    setRunning(true);
    const finish = () => {
      setRunning(false);
      setRan((list) => (list.includes(scenarioId) ? list : [...list, scenarioId]));
    };
    if (reduced) {
      setVisible(result.steps.length);
      finish();
      return;
    }
    setVisible(0);
    result.steps.forEach((_, index) => {
      timers.current.push(window.setTimeout(() => setVisible(index + 1), 380 * (index + 1)));
    });
    timers.current.push(window.setTimeout(finish, 380 * (result.steps.length + 1)));
  };

  return (
    <div className="sc-mission-body">
      <p className="sc-note">A simulation. There are no real keys, tokens, tenants or endpoints involved.</p>

      <section className="sc-section" aria-labelledby="mcp-components">
        <h3 id="mcp-components">1. Inspect the integration components</h3>
        <ol className="sc-flow" aria-label="Request path">
          {MCP_STAGES.map((stage, index) => {
            const step = steps.find((item) => item.stage === stage.id);
            const shown = step && steps.indexOf(step) < visible;
            return (
              <li key={stage.id}>
                <button type="button" aria-pressed={inspectId === stage.id} className={`${inspectId === stage.id ? "is-on" : ""} ${shown ? `is-${step?.status}` : ""}`} onClick={() => setInspectId(stage.id)}>
                  <span>{index + 1}</span> {stage.title}
                </button>
              </li>
            );
          })}
        </ol>
        <div className="sc-inspector is-wide">
          <h4>{inspect.title}</h4>
          <p>{inspect.text}</p>
          <pre><code>{inspect.detail}</code></pre>
        </div>
      </section>

      <section className="sc-section" aria-labelledby="mcp-send">
        <h3 id="mcp-send">2. Send a simulated request</h3>
        <p>Run the authorized request, then at least one that should fail, to see where each one stops. {ran.length} of {MCP_SCENARIOS.length} scenarios run.</p>
        <fieldset className="sc-radios">
          <legend className="sr-only">Scenario</legend>
          {MCP_SCENARIOS.map((item) => (
            <label key={item.id} className={scenarioId === item.id ? "is-on" : ""}>
              <input type="radio" name="mcp-scenario" checked={scenarioId === item.id} onChange={() => setScenarioId(item.id)} />
              <span><strong>{item.title}</strong>{item.text}</span>
            </label>
          ))}
        </fieldset>
        <div className="sc-actions"><button type="button" className="sc-btn" onClick={send} disabled={running}>{running ? "Running..." : "Send request"}</button></div>

        {steps.length > 0 && (
          <ol className="sc-trace" aria-label="Request trace" aria-live="polite">
            {steps.slice(0, visible).map((step) => (
              <li key={step.stage} className={`is-${step.status}`}>
                <b>{MCP_STAGES.find((stage) => stage.id === step.stage)?.title}</b>
                <span>{step.status === "ok" ? "OK" : step.status === "blocked" ? "Stopped" : "Skipped"}</span>
                <code>{step.message}</code>
              </li>
            ))}
          </ol>
        )}
        {steps.length > 0 && visible === steps.length && (
          <p className={`sc-message ${scenario.blockedAt ? "is-bad" : "is-good"}`} role="status">
            {scenario.blockedAt ? `Request stopped: ${scenario.code}. ${scenario.reason}` : "Request succeeded. The tool result travelled back up the chain."}
          </p>
        )}
      </section>

      {done ? <p className="sc-message is-good" role="status">Integration understood. Authentication proves who is calling, authorization decides what they may do, and each can fail independently.</p> : <p className="sc-note">To complete: run the authorized request and at least one failing scenario.</p>}
    </div>
  );
};
