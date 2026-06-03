import { findings, kpis, riskScores } from "@/lib/data";

// Section 7 — The Recommendation. The closing argument: three prioritized
// actions, each anchored to a specific finding with its number, then the
// concrete "what I'd do Monday" first step. Lost sales stays an estimate.

export default function Recommendation() {
  const pareto = findings.pareto_by_cedis;
  const top3Pct = (pareto[2].cumulative_share * 100).toFixed(0);
  const top3 = pareto.slice(0, 3).map((p) => p.city);
  const lostM = (kpis.lost_sales_mxn / 1_000_000).toFixed(2);

  const rate = (d: string) =>
    findings.late_by_weekday.find((w) => w.weekday === d)?.late_rate ?? 0;
  const friPct = (rate("Friday") * 100).toFixed(1);
  const tuePct = (rate("Tuesday") * 100).toFixed(1);
  const mapePct = (kpis.mape * 100).toFixed(1);

  const high = riskScores.filter((r) => r.risk_level === "High");
  const highCount = high.length;
  const gdlHigh = high.filter((r) => r.cd_id === "CD-GDL").length;

  const recs = [
    {
      action: "Concentrate replenishment where the loss is.",
      href: "#findings",
      label: "Findings",
      anchor: (
        <>
          Three CEDIS &mdash; {top3.join(", ")} &mdash; drive{" "}
          <span className="text-info">{top3Pct}%</span>{" "}of an estimated{" "}
          <span className="text-danger">${lostM}M</span>{" "}in lost sales.
        </>
      ),
      body: "Review safety stock, reorder points, and inbound lead times for those three centers first. The loss is concentrated, so the earliest fixes capture most of the recoverable upside before touching the long tail.",
    },
    {
      action: "Move the weekend dispatch cutoff earlier.",
      href: "#findings",
      label: "Findings",
      anchor: (
        <>
          Friday orders run late{" "}
          <span className="text-warn">{friPct}%</span>{" "}of the time vs{" "}
          <span className="text-body">{tuePct}%</span>{" "}on Tuesday &mdash; a
          weekend dispatch backlog.
        </>
      ),
      body: "Bring the Thursday/Friday cutoff forward, or add weekend dispatch capacity, so late-week orders clear before the backlog builds. A scheduling change, not a capital one — cheap to pilot.",
    },
    {
      action: "Make the forecast event-aware, and run the risk watchlist weekly.",
      href: "#prediction",
      label: "Findings + Prediction",
      anchor: (
        <>
          Forecast error of <span className="text-warn">{mapePct}%</span>{" "}that
          misses the event surge, and{" "}
          <span className="text-danger">{highCount}</span>{" "}positions already
          flagged High-risk.
        </>
      ),
      body: "Add an event- and payday-aware uplift to the forecast for beverages & snacks, and stand up the High-risk list as a standing weekly report — so planners pre-position stock instead of reacting after the shelf is empty.",
    },
  ];

  return (
    <section id="recommendation" className="px-6 py-24 sm:px-10 sm:py-32">
      <div className="mx-auto max-w-3xl">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-dim">
          07 · The Recommendation
        </p>
        <h2 className="mt-5 font-display text-4xl font-medium leading-tight text-bright sm:text-5xl">
          What I&rsquo;d do Monday morning.
        </h2>
        <p className="mt-5 text-lg leading-relaxed text-body">
          Three moves, in priority order. Each ties back to a finding above &mdash;
          none is generic, and the numbers are the analysis&rsquo;s, not a wishlist.
        </p>

        <ol className="mt-12 space-y-10">
          {recs.map((r, i) => (
            <li
              key={i}
              className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-1 sm:gap-x-8"
            >
              <span className="font-mono text-2xl font-medium tabular-nums text-accent">
                0{i + 1}
              </span>
              <div className="min-w-0">
                <h3 className="text-xl font-medium leading-snug text-bright sm:text-2xl">
                  {r.action}
                </h3>
                <p className="mt-2.5 font-mono text-xs leading-relaxed text-dim">
                  <a
                    href={r.href}
                    className="text-accent/80 underline-offset-2 hover:text-accent hover:underline"
                  >
                    &darr; {r.label}
                  </a>{" "}
                  &mdash; {r.anchor}
                </p>
                <p className="mt-3 leading-relaxed text-body">{r.body}</p>
              </div>
            </li>
          ))}
        </ol>

        {/* The concrete first step */}
        <div className="mt-14 border-l-2 border-accent pl-5 sm:pl-6">
          <p className="text-lg leading-relaxed text-body">
            If I could run only one play first: the{" "}
            <span className="text-bright">Guadalajara replenishment review</span>. It
            is the #2 historical loss{" "}
            <em className="not-italic text-bright">and</em>{" "}
            <span className="font-mono text-danger">{gdlHigh}</span>{" "}of the{" "}
            {highCount}{" "}forward risks &mdash; the one place hindsight and the model
            agree. Highest confidence, first hour.
          </p>
        </div>
      </div>
    </section>
  );
}
