import { dimensions, findings, riskScores } from "@/lib/data";
import RiskScatterChart, {
  type RiskPoint,
} from "@/components/charts/RiskScatterChart";
import MountOnView from "@/components/ui/MountOnView";
import type { RiskLevel } from "@/lib/types";

// Section 6 — The Prediction. A transparent, explainable stock-out risk score
// (NEVER "ML" / "AI") — its legibility is the strength. Shows the four drivers,
// a worked decomposition, the 7-day risk view (tight critical list), and the
// backward/forward coherence (Guadalajara in both the Pareto and the High list).
// All figures from risk_scores.json.

const LEVEL_TONE: Record<RiskLevel, string> = {
  High: "text-danger",
  Medium: "text-warn",
  Low: "text-accent",
};
const code = (cd: string) => cd.replace("CD-", "");

export default function Prediction() {
  const brandOf = new Map(dimensions.products.map((p) => [p.sku, p.brand]));
  const cityOf = new Map(
    dimensions.distribution_centers.map((c) => [c.cd_id, c.city]),
  );

  const counts: Record<RiskLevel, number> = { High: 0, Medium: 0, Low: 0 };
  for (const r of riskScores) counts[r.risk_level] += 1;
  const total = riskScores.length;

  const high = riskScores.filter((r) => r.risk_level === "High"); // sorted desc
  const top = high[0]; // the worked example (highest score)

  const scatter: RiskPoint[] = riskScores.map((r) => ({
    sku: r.sku,
    cd: code(r.cd_id),
    days_of_cover: r.days_of_cover ?? 0,
    risk_score: r.risk_score,
    risk_level: r.risk_level,
  }));
  const scatterAria = `Risk landscape: ${total} SKU-by-CEDIS points, x-axis days of cover, y-axis risk score 0 to 100. Low days of cover drives high risk. ${counts.High} High, ${counts.Medium} Medium, ${counts.Low} Low.`;

  // Backward/forward coherence
  const gdlPareto = findings.pareto_by_cedis.find((p) => p.cd_id === "CD-GDL");
  const gdlRank =
    findings.pareto_by_cedis.findIndex((p) => p.cd_id === "CD-GDL") + 1;
  const gdlHigh = high.filter((r) => r.cd_id === "CD-GDL").length;
  const gdlSharePct = gdlPareto ? Math.round(gdlPareto.share * 100) : 0;

  const segs = [
    {
      label: "Days of cover",
      detail: `${top.days_of_cover} days`,
      pts: top.cover_pts,
      shade: "bg-info",
    },
    {
      label: "Below safety stock",
      detail: `${top.current_stock.toLocaleString()} < ${top.safety_stock.toLocaleString()}`,
      pts: top.safety_pts,
      shade: "bg-info/70",
    },
    {
      label: "Demand volatility",
      detail: `CV ${top.demand_cv}`,
      pts: top.volatility_pts,
      shade: "bg-info/50",
    },
    {
      label: `${top.rotation} rotation`,
      detail: "fast-mover",
      pts: top.rotation_pts,
      shade: "bg-info/35",
    },
  ];

  const h3 = "font-mono text-xs uppercase tracking-wider text-dim";

  return (
    <section id="prediction" className="px-6 py-24 sm:px-10 sm:py-32">
      <div className="mx-auto max-w-5xl">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-dim">
          06 · The Prediction
        </p>
        <h2 className="mt-5 max-w-2xl font-display text-4xl font-medium leading-tight text-bright sm:text-5xl">
          Now &mdash; see it coming.
        </h2>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-body">
          Everything so far looked backward. The last move is forward: a stock-out
          risk score for every SKU at every CEDIS &mdash; and, deliberately, one you
          can <em className="not-italic text-bright">read</em>. Not a black box; a
          transparent scoring heuristic where every point traces to a cause a planner
          can act on. That legibility is the point, not a limitation.
        </p>

        {/* How it scores + worked example */}
        <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="rounded-lg border border-border bg-panel p-6">
            <h3 className={h3}>How the score works</h3>
            <p className="mt-3 text-sm leading-relaxed text-body">
              A 0&ndash;100 score from four drivers, each adding points:
            </p>
            <ul className="mt-4 space-y-2.5 text-sm text-body">
              <li>
                <span className="text-bright">Days of cover</span>{" "}&mdash; the
                dominant driver. Under 1 day adds 50, tiering to 0 by ~7 days.
              </li>
              <li>
                <span className="text-bright">Below safety stock</span>{" "}&mdash;
                +20 when stock is under the buffer.
              </li>
              <li>
                <span className="text-bright">Demand volatility</span>{" "}(CV)
                &mdash; up to +20 for erratic demand.
              </li>
              <li>
                <span className="text-bright">SKU rotation</span>{" "}&mdash; +10
                high / +5 medium; a fast-mover costs more to lose.
              </li>
            </ul>
            <p className="mt-4 text-sm leading-relaxed text-dim">
              Capped at 100, bucketed{" "}
              <span className="text-accent">Low &lt;35</span> ·{" "}
              <span className="text-warn">Medium 35&ndash;59</span> ·{" "}
              <span className="text-danger">High 60+</span>.
            </p>
          </div>

          {/* Worked example */}
          <div className="rounded-lg border border-border bg-panel p-6">
            <h3 className={h3}>Worked example</h3>
            <p className="mt-3 font-mono text-sm text-bright">
              {top.sku}
              <span className="text-dim"> · {brandOf.get(top.sku)}</span> @{" "}
              {cityOf.get(top.cd_id)}
            </p>

            <div className="mt-4 flex h-3 w-full overflow-hidden rounded-full bg-panel-2">
              {segs.map((s) => (
                <div
                  key={s.label}
                  className={`h-full ${s.shade}`}
                  style={{ width: `${s.pts}%` }}
                />
              ))}
            </div>

            <dl className="mt-4 space-y-2 text-sm">
              {segs.map((s) => (
                <div key={s.label} className="flex items-baseline justify-between gap-3">
                  <dt className="text-body">
                    {s.label}{" "}
                    <span className="text-dim">({s.detail})</span>
                  </dt>
                  <dd className="font-mono tabular-nums text-info">+{s.pts}</dd>
                </div>
              ))}
              <div className="flex items-baseline justify-between gap-3 border-t border-border pt-2">
                <dt className="font-mono text-xs uppercase tracking-wider text-dim">
                  Total
                </dt>
                <dd className="font-mono tabular-nums">
                  <span className="text-bright">{top.risk_score}</span>
                  <span className="text-dim">/100 → </span>
                  <span className="text-danger">{top.risk_level}</span>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* The 7-day risk view */}
        <h3 className="mt-16 font-display text-2xl font-medium text-bright">
          The 7-day risk view
        </h3>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-dim">
          Of {total}{" "}SKU&times;CEDIS positions, the model flags a deliberately tight
          critical list &mdash;{" "}
          <span className="text-danger">{counts.High} High</span>,{" "}
          <span className="text-warn">{counts.Medium} Medium</span>,{" "}
          <span className="text-accent">{counts.Low} Low</span>. Most of the network
          is fine; attention goes where it&rsquo;s earned.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-5">
          {/* Risk landscape scatter */}
          <figure
            aria-labelledby="risk-scatter"
            className="rounded-lg border border-border bg-panel p-5 lg:col-span-2"
          >
            <figcaption id="risk-scatter" className={h3}>
              Risk landscape
            </figcaption>
            <div className="mt-3" role="img" aria-label={scatterAria}>
              <MountOnView minHeight={300}>
                <RiskScatterChart data={scatter} />
              </MountOnView>
            </div>
            <p className="mt-2 font-mono text-[10px] text-dim">
              x: days of cover · y: score · dashed = Medium (35) &amp; High (60)
            </p>
          </figure>

          {/* Critical list */}
          <div className="overflow-x-auto rounded-lg border border-border bg-panel lg:col-span-3">
            <table className="w-full min-w-[440px] text-left">
              <caption className="px-4 pt-4 text-left font-mono text-xs uppercase tracking-wider text-dim">
                Critical list — {counts.High} highest-risk positions
              </caption>
              <thead>
                <tr className="border-b border-border">
                  {["SKU", "CEDIS", "Cover", "Cov", "Saf", "Vol", "Rot", "Score"].map(
                    (h) => (
                      <th
                        key={h}
                        scope="col"
                        className="px-3 py-2.5 font-mono text-[10px] font-normal uppercase tracking-wider text-dim"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {high.map((r) => (
                  <tr
                    key={`${r.sku}-${r.cd_id}`}
                    className="border-b border-border/50 last:border-b-0"
                  >
                    <th
                      scope="row"
                      className="whitespace-nowrap px-3 py-2 text-left font-mono text-xs font-normal text-body"
                    >
                      {r.sku}
                    </th>
                    <td className="px-3 py-2 font-mono text-xs text-dim">
                      {code(r.cd_id)}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs tabular-nums text-body">
                      {r.days_of_cover}d
                    </td>
                    <td className="px-3 py-2 font-mono text-xs tabular-nums text-dim">
                      {r.cover_pts}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs tabular-nums text-dim">
                      {r.safety_pts}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs tabular-nums text-dim">
                      {r.volatility_pts}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs tabular-nums text-dim">
                      {r.rotation_pts}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs font-medium tabular-nums text-danger">
                      {r.risk_score}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Backward/forward coherence */}
        <div className="mt-8 rounded-lg border border-accent/30 bg-accent/[0.06] p-6">
          <p className="font-mono text-xs uppercase tracking-wider text-accent">
            The backward and forward views agree
          </p>
          <p className="mt-3 max-w-3xl leading-relaxed text-body">
            <span className="text-bright">Guadalajara</span> drove{" "}
            <span className="font-mono text-bright">{gdlSharePct}%</span>{" "}of
            historical lost sales &mdash; the #{gdlRank} CEDIS in the Pareto &mdash; and now holds{" "}
            <span className="font-mono text-danger">{gdlHigh}</span> of the{" "}
            {counts.High} highest forward-looking risk scores. The place the analysis
            flagged in hindsight is exactly where the model says to look next. Two
            independent methods, one answer.
          </p>
        </div>
      </div>
    </section>
  );
}
