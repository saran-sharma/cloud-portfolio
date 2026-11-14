import { useEffect, useState } from "react";
import {
  COST_CAUSES,
  COST_PIPELINE,
  COST_PRODUCTS,
  COST_RESOURCES,
  SUBSCRIPTION_TOTAL,
  costGap,
  evaluateCostFindings,
  mappedTotal,
  type CostFindings,
} from "@/city/missions/logic";

const cu = (value: number) => `${value.toLocaleString("en-US")} CU`;

export const CostMission = ({ onComplete }: { onComplete: () => void }) => {
  const [flagged, setFlagged] = useState<string[]>([]);
  const [causes, setCauses] = useState<string[]>([]);
  const [product, setProduct] = useState<string>(COST_PRODUCTS[0]);
  const [openStep, setOpenStep] = useState<number | null>(null);
  const [seenSteps, setSeenSteps] = useState<number[]>([]);
  const [findings, setFindings] = useState<CostFindings | null>(null);

  const gap = costGap();
  const flaggedTotal = flagged.reduce((sum, id) => sum + (COST_RESOURCES.find((resource) => resource.id === id)?.cost ?? 0), 0);
  const productResources = COST_RESOURCES.filter((resource) => resource.product === product);

  useEffect(() => {
    if (findings?.solved) onComplete();
  }, [findings, onComplete]);

  const toggle = (list: string[], id: string) => (list.includes(id) ? list.filter((item) => item !== id) : [...list, id]);

  const submit = () => {
    if (seenSteps.length < 3) {
      setFindings({ explained: flaggedTotal, missed: [], falsePositives: [], causesCorrect: false, solved: false });
      return;
    }
    setFindings(evaluateCostFindings(flagged, causes));
  };

  const needPipeline = findings && !findings.solved && seenSteps.length < 3;

  return (
    <div className="sc-mission-body">
      <div className="sc-tiles">
        <div className="sc-tile"><span>Subscription-level total</span><strong>{cu(SUBSCRIPTION_TOTAL)}</strong></div>
        <div className="sc-tile"><span>Resource-grain total, mapped to products</span><strong>{cu(mappedTotal())}</strong></div>
        <div className="sc-tile is-alert"><span>Gap to explain</span><strong>{cu(gap)}</strong></div>
      </div>
      <p className="sc-note">Synthetic cost units (CU). This is a simulated discrepancy to investigate. It is not a saving and it is not real data.</p>

      <section className="sc-section" aria-labelledby="cost-resources">
        <h3 id="cost-resources">1. Inspect the resource grain</h3>
        <p>Flag every resource with no product mapping. Its cost is in the subscription total but missing from the product view.</p>
        <div className="sc-table-wrap">
          <table className="sc-table">
            <thead><tr><th>Resource</th><th>Type</th><th>Product</th><th className="is-num">Cost</th><th>Flag</th></tr></thead>
            <tbody>
              {COST_RESOURCES.map((resource) => (
                <tr key={resource.id} className={flagged.includes(resource.id) ? "is-flagged" : ""}>
                  <td>{resource.id}</td>
                  <td>{resource.type}</td>
                  <td>{resource.product ?? <em>no mapping</em>}</td>
                  <td className="is-num">{resource.cost.toLocaleString("en-US")}</td>
                  <td>
                    <button type="button" className="sc-btn is-small" aria-pressed={flagged.includes(resource.id)} onClick={() => setFlagged((list) => toggle(list, resource.id))}>
                      {flagged.includes(resource.id) ? "Flagged" : "Flag"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="sc-meter" role="img" aria-label={`Flagged cost ${cu(flaggedTotal)} of a ${cu(gap)} gap`}>
          <span style={{ width: `${Math.min(100, (flaggedTotal / gap) * 100)}%` }} />
        </div>
        <p className="sc-note">Flagged: {cu(flaggedTotal)} of {cu(gap)}.</p>
      </section>

      <section className="sc-section" aria-labelledby="cost-mapping">
        <h3 id="cost-mapping">2. Explore the product-to-resource mapping</h3>
        <div className="sc-chips is-choice" role="group" aria-label="Products">
          {COST_PRODUCTS.map((name) => (
            <button key={name} type="button" aria-pressed={product === name} className={product === name ? "is-on" : ""} onClick={() => setProduct(name)}>{name}</button>
          ))}
        </div>
        <p>{product}: {productResources.map((resource) => resource.id).join(", ")}. Subtotal {cu(productResources.reduce((sum, resource) => sum + resource.cost, 0))}.</p>
      </section>

      <section className="sc-section" aria-labelledby="cost-causes">
        <h3 id="cost-causes">3. Review possible causes</h3>
        <p>Select every cause the data supports.</p>
        <ul className="sc-checks">
          {COST_CAUSES.map((cause) => (
            <li key={cause.id}>
              <label>
                <input type="checkbox" checked={causes.includes(cause.id)} onChange={() => setCauses((list) => toggle(list, cause.id))} />
                <span>{cause.text}</span>
              </label>
            </li>
          ))}
        </ul>
      </section>

      <section className="sc-section" aria-labelledby="cost-pipeline">
        <h3 id="cost-pipeline">4. Discover the reporting pipeline</h3>
        <p>Open at least three stages to see how the numbers are produced.</p>
        <ol className="sc-accordion">
          {COST_PIPELINE.map((step, index) => (
            <li key={step.title}>
              <button
                type="button"
                aria-expanded={openStep === index}
                onClick={() => {
                  setOpenStep(openStep === index ? null : index);
                  setSeenSteps((list) => (list.includes(index) ? list : [...list, index]));
                }}
              >
                <span>{index + 1}</span> {step.title}
              </button>
              {openStep === index && <p>{step.text}</p>}
            </li>
          ))}
        </ol>
      </section>

      <div className="sc-actions">
        <button type="button" className="sc-btn" onClick={submit}>Submit findings</button>
      </div>

      {findings && (
        <div className={`sc-message ${findings.solved ? "is-good" : "is-bad"}`} role="status" aria-live="polite">
          {findings.solved && <>Findings confirmed. The three unmapped resources account for the whole {cu(gap)} gap, and the causes are allocation gaps. Nothing here is a saving: the cost was simply unallocated.</>}
          {needPipeline && <>Open at least three stages of the reporting pipeline first, so the findings are grounded in how the numbers are produced.</>}
          {!findings.solved && !needPipeline && (
            <>
              {findings.missed.length > 0 && <>You have not yet flagged every unmapped resource ({findings.missed.length} remaining). </>}
              {findings.falsePositives.length > 0 && <>{findings.falsePositives.length} flagged resource{findings.falsePositives.length === 1 ? " is" : "s are"} already mapped to a product. </>}
              {!findings.causesCorrect && <>Check the selected causes: pick exactly the ones the data supports.</>}
            </>
          )}
        </div>
      )}
    </div>
  );
};
