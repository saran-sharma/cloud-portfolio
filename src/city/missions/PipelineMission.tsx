import { useEffect, useState } from "react";
import { useReducedMotion } from "@/city/hooks/use-reduced-motion";
import {
  PIPELINE_LINKS,
  PIPELINE_NODES,
  PIPELINE_STAGES,
  evaluateLink,
  isPipelineComplete,
  nextHint,
  pipelineNode,
  type PipelineNodeId,
} from "@/city/missions/logic";

type Link = [PipelineNodeId, PipelineNodeId];
type Message = { tone: "info" | "good" | "bad"; text: string };

const center = (id: PipelineNodeId) => {
  const node = pipelineNode(id);
  return { x: node.x * 10, y: node.y * 6 };
};

const linkPath = (from: PipelineNodeId, to: PipelineNodeId) => {
  const a = center(from);
  const b = center(to);
  const midX = (a.x + b.x) / 2;
  const midY = (a.y + b.y) / 2 - 34;
  return `M${a.x},${a.y} Q${midX},${midY} ${b.x},${b.y}`;
};

export const PipelineMission = ({ onComplete }: { onComplete: () => void }) => {
  const reduced = useReducedMotion();
  const [links, setLinks] = useState<Link[]>([]);
  const [selected, setSelected] = useState<PipelineNodeId>("source");
  const [linkFrom, setLinkFrom] = useState<PipelineNodeId | null>(null);
  const [message, setMessage] = useState<Message>({
    tone: "info",
    text: "Select a component to inspect it. Then use Connect to send its data to the next stage.",
  });
  const complete = isPipelineComplete(links);

  useEffect(() => {
    if (complete) onComplete();
  }, [complete, onComplete]);

  const inspect = pipelineNode(selected);

  const choose = (id: PipelineNodeId) => {
    if (linkFrom && linkFrom !== id) {
      const result = evaluateLink(linkFrom, id, links);
      if (result.status === "correct") setLinks((list) => [...list, [linkFrom, id]]);
      setMessage({ tone: result.status === "correct" ? "good" : "bad", text: result.message });
      setLinkFrom(null);
    } else if (linkFrom === id) {
      setLinkFrom(null);
      setMessage({ tone: "info", text: "Connection cancelled." });
    }
    setSelected(id);
  };

  const startLink = () => {
    setLinkFrom(selected);
    setMessage({ tone: "info", text: `Now choose the component that ${inspect.title} sends data to.` });
  };

  return (
    <div className="sc-mission-body">
      <div className="sc-pipeline">
        <div className="sc-board" role="group" aria-label="Pipeline board. Components are not in flow order.">
          <svg className="sc-board-lines" viewBox="0 0 1000 600" aria-hidden="true">
            <defs>
              <marker id="sc-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="#22e6ff" />
              </marker>
            </defs>
            {links.map(([from, to], index) => (
              <g key={`${from}-${to}`}>
                <path d={linkPath(from, to)} className="sc-link" markerEnd="url(#sc-arrow)" />
                {!reduced && (
                  <circle r="7" className="sc-packet">
                    <animateMotion dur="2.4s" begin={`${index * 0.35}s`} repeatCount="indefinite" path={linkPath(from, to)} />
                  </circle>
                )}
              </g>
            ))}
          </svg>
          {PIPELINE_NODES.map((node) => {
            const out = links.some(([from]) => from === node.id);
            const into = links.some(([, to]) => to === node.id);
            return (
              <button
                key={node.id}
                type="button"
                className={`sc-node ${selected === node.id ? "is-selected" : ""} ${linkFrom === node.id ? "is-linking" : ""} ${out || into ? "is-wired" : ""}`}
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
                onClick={() => choose(node.id)}
                aria-pressed={selected === node.id}
              >
                <strong>{node.title}</strong>
                <span>{node.stage}</span>
              </button>
            );
          })}
        </div>

        <aside className="sc-inspector" aria-label="Component details">
          <p className="sc-label">{inspect.stage}</p>
          <h3>{inspect.title}</h3>
          <p>{inspect.summary}</p>
          <ul className="sc-chips" aria-label="Tools">
            {inspect.tools.map((tool) => <li key={tool}>{tool}</li>)}
          </ul>
          <div className="sc-actions">
            <button type="button" className="sc-btn" onClick={startLink} disabled={complete}>Connect from {inspect.title}</button>
            <button type="button" className="sc-btn is-quiet" onClick={() => setMessage({ tone: "info", text: nextHint(links) })}>Hint</button>
            <button type="button" className="sc-btn is-quiet" onClick={() => { setLinks([]); setLinkFrom(null); setMessage({ tone: "info", text: "Connections cleared." }); }}>Clear</button>
          </div>
        </aside>
      </div>

      <p className={`sc-message is-${message.tone}`} role="status" aria-live="polite">{message.text}</p>

      <ol className="sc-stage-row" aria-label="Pipeline stages">
        {PIPELINE_STAGES.map((stage) => {
          const lit = stage.needs.every((index) => links.some(([a, b]) => a === PIPELINE_LINKS[index][0] && b === PIPELINE_LINKS[index][1]));
          return (
            <li key={stage.id} className={lit ? "is-lit" : ""}>
              <strong>{stage.title}</strong>
              <span>{lit ? stage.text : "Not connected yet."}</span>
            </li>
          );
        })}
      </ol>

      {complete && <p className="sc-message is-good" role="status">Pipeline complete. Data now moves from source to consumption: ingested, stored, transformed and served.</p>}
    </div>
  );
};
