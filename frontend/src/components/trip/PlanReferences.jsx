const safeUrl = value => { try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : undefined; } catch { return undefined; } };

export default function PlanReferences({ plan }) {
  return <>
    {plan.planningTips?.length > 0 && <section className="mb-3"><h2 className="h5">Before you go</h2><ul>{plan.planningTips.map((tip,i)=><li key={i}>{tip}</li>)}</ul></section>}
    {plan.sources?.length > 0 && <section className="mb-3"><h2 className="h5">Planning sources</h2><p className="small text-muted">Adapted into an editable plan. Check these guides for current details.</p><ul>{plan.sources.map((source,i)=><li key={i}><a href={safeUrl(source.url)} target="_blank" rel="noreferrer">{source.title}</a></li>)}</ul></section>}
    {plan.imageCredit?.name && <p className="small text-muted">Photo: <a href={safeUrl(plan.imageCredit.url)} target="_blank" rel="noreferrer">{plan.imageCredit.name}</a> · {plan.imageCredit.license}</p>}
  </>;
}
