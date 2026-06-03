import { dimensions, kpis } from "@/lib/data";
import NetworkVisual from "./NetworkVisual";
import CountUp from "@/components/ui/CountUp";

// Section 1 — The Hook. Editorial / airy (the dense instrument-panel feel is
// reserved for the dashboard). Stakes numbers are pulled from the baked-in JSON,
// never hardcoded.

function Stake({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  thousands = false,
  label,
  tone,
}: {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  thousands?: boolean;
  label: string;
  tone: string;
}) {
  return (
    <div>
      <dd className={`font-mono text-3xl font-medium tabular-nums sm:text-4xl ${tone}`}>
        <CountUp
          value={value}
          decimals={decimals}
          prefix={prefix}
          suffix={suffix}
          thousands={thousands}
        />
      </dd>
      <dt className="mt-1 max-w-[14ch] text-sm leading-snug text-dim">{label}</dt>
    </div>
  );
}

export default function Hook() {
  const cedis = dimensions.distribution_centers.length;
  const stores = dimensions.stores.length;
  const skus = dimensions.products.length;
  const days = dimensions.calendar.length;

  return (
    <section
      id="hook"
      className="relative flex min-h-screen flex-col justify-center px-6 py-24 sm:px-10"
    >
      <div className="mx-auto grid w-full min-w-0 max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        {/* Narrative */}
        <div className="min-w-0 max-w-xl">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-dim">
            Supply Chain · Service Analyst Case Study
          </p>
          <h1 className="mt-6 font-display text-5xl font-medium leading-[1.04] text-bright sm:text-6xl">
            A distribution network that couldn&rsquo;t see its own blind spots.
          </h1>
          <p className="mt-6 max-w-prose text-lg leading-relaxed text-body">
            A network of {cedis} distribution centers, {stores} stores, and {skus}{" "}
            products, simulated across {days}{" "}days. Sales were quietly leaking to
            stockouts no one saw coming &mdash; buried under messy, real-world data.
            This is the end-to-end analysis that found the money, then built a
            control tower to keep watch.
          </p>

          <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-6">
            <Stake
              value={kpis.lost_sales_mxn / 1_000_000}
              decimals={2}
              prefix="$"
              suffix="M"
              label="estimated lost sales to stockouts"
              tone="text-danger"
            />
            <Stake
              value={kpis.stockout_rate * 100}
              decimals={1}
              suffix="%"
              label="of CEDIS-days ran short"
              tone="text-warn"
            />
            <Stake
              value={cedis}
              label="distribution centers (CEDIS)"
              tone="text-bright"
            />
          </dl>

          <p className="mt-8 font-mono text-xs text-dim">
            All data is 100% synthetic. Lost sales is a labeled estimate.
          </p>
        </div>

        {/* Signature network visual */}
        <div className="relative min-w-0">
          <div className="mx-auto aspect-square w-full max-w-sm sm:max-w-md">
            <NetworkVisual centers={dimensions.distribution_centers} />
          </div>
          <p className="mt-4 text-center font-mono text-[11px] uppercase tracking-[0.2em] text-dim">
            {cedis} CEDIS · simulated national network
          </p>
        </div>
      </div>
    </section>
  );
}
