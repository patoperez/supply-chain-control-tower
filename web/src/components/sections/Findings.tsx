import { findings, kpis } from "@/lib/data";
import CategoryMapeChart from "@/components/charts/CategoryMapeChart";
import ParetoChart from "@/components/charts/ParetoChart";
import WeekdayLateChart from "@/components/charts/WeekdayLateChart";
import { mxn, pct } from "@/components/charts/theme";
import CountUp from "@/components/ui/CountUp";
import MountOnView from "@/components/ui/MountOnView";

// Section 4 — The Findings (the analytical heart). Proportional emphasis:
// Pareto is the hero, late-by-weekday a real secondary, MAPE-by-category is
// supporting texture (NOT staged as dramatic). Every number ties to JSON;
// lost sales is always labeled an estimate.

export default function Findings() {
  const pareto = findings.pareto_by_cedis;
  const top3Cities = pareto.slice(0, 3).map((p) => p.city);
  const top3Pct = (pareto[2].cumulative_share * 100).toFixed(0);

  const weekday = findings.late_by_weekday;
  const overallLate = 1 - kpis.on_time_delivery;
  const rate = (day: string) =>
    weekday.find((w) => w.weekday === day)?.late_rate ?? 0;

  const mapePct = (kpis.mape * 100).toFixed(1);
  const mapeSorted = [...findings.mape_by_category].sort((a, b) => b.mape - a.mape);
  const topCat = mapeSorted[0];

  const paretoAria = `Estimated lost sales by distribution center with cumulative share. ${pareto
    .map((p) => `${p.city} ${mxn(p.lost_sales_mxn)} (${pct(p.share)})`)
    .join("; ")}. Top three cumulative ${top3Pct} percent.`;
  const weekdayAria = `Late-delivery rate by order weekday. ${weekday
    .map((w) => `${w.weekday} ${pct(w.late_rate, 1)}`)
    .join("; ")}. Network average ${pct(overallLate, 1)}.`;
  const mapeAria = `Forecast error (MAPE) by product category. ${mapeSorted
    .map((c) => `${c.category} ${pct(c.mape, 1)}`)
    .join("; ")}.`;

  const h3 = "text-xl font-medium leading-snug text-bright sm:text-2xl";
  const sub = "mt-2 text-sm leading-relaxed text-dim";

  return (
    <section id="findings" className="px-6 py-24 sm:px-10 sm:py-32">
      <div className="mx-auto max-w-5xl">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-dim">
          04 · The Findings
        </p>
        <h2 className="mt-5 max-w-2xl font-display text-4xl font-medium leading-tight text-bright sm:text-5xl">
          Where the sales leaked &mdash; and why.
        </h2>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-body">
          An estimated{" "}
          <CountUp
            value={kpis.lost_sales_mxn / 1_000_000}
            decimals={2}
            prefix="$"
            suffix="M"
            className="font-mono text-danger"
          />{" "}
          <span className="text-dim">(est.)</span>{" "}in sales never converted &mdash;
          demand that arrived to empty shelves. Three questions: where did the loss
          concentrate, when do deliveries fail, and how good is the forecast?
        </p>

        {/* Hero finding — Pareto */}
        <figure
          aria-labelledby="f-pareto"
          className="mt-12 rounded-lg border border-border bg-panel p-6 sm:p-8"
        >
          <figcaption>
            <h3 id="f-pareto" className={h3}>
              Three CEDIS &mdash; {top3Cities.join(", ")} &mdash; drive{" "}
              <span className="text-info">{top3Pct}%</span> of lost sales.
            </h3>
            <p className={sub}>
              Lost sales concentrate sharply. Fixing the top three distribution
              centers first captures most of the recoverable upside &mdash; that is
              where to act.
            </p>
          </figcaption>
          <div className="mt-6" role="img" aria-label={paretoAria}>
            <MountOnView minHeight={320}>
              <ParetoChart data={pareto} />
            </MountOnView>
          </div>
        </figure>

        {/* Secondary row: weekday (wider) + MAPE (narrower, understated) */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <figure
            aria-labelledby="f-weekday"
            className="rounded-lg border border-border bg-panel p-6 sm:p-7 lg:col-span-2"
          >
            <figcaption>
              <h3 id="f-weekday" className={h3}>
                Orders placed{" "}
                <span className="text-warn">Thursday&ndash;Saturday</span> slip the
                most.
              </h3>
              <p className={sub}>
                Friday orders run late {pct(rate("Friday"), 1)} of the time vs{" "}
                {pct(rate("Tuesday"), 1)}{" "}on Tuesday &mdash; a weekend dispatch
                backlog. The dashed line marks the {pct(overallLate, 1)} network
                average.
              </p>
            </figcaption>
            <div className="mt-6" role="img" aria-label={weekdayAria}>
              <MountOnView minHeight={260}>
                <WeekdayLateChart data={weekday} avg={overallLate} />
              </MountOnView>
            </div>
          </figure>

          <figure
            aria-labelledby="f-mape"
            className="rounded-lg border border-border bg-panel p-6 sm:p-7 lg:col-span-1"
          >
            <figcaption>
              <h3 id="f-mape" className={h3}>
                Forecast error is ~{mapePct}% across the board.
              </h3>
              <p className={sub}>
                Only ~2&nbsp;points higher for the event-driven categories
                ({topCat.category}, Beverages) &mdash; worth noting, not a headline.
              </p>
            </figcaption>
            <div className="mt-6" role="img" aria-label={mapeAria}>
              <MountOnView minHeight={200}>
                <CategoryMapeChart data={mapeSorted} />
              </MountOnView>
            </div>
          </figure>
        </div>
      </div>
    </section>
  );
}
