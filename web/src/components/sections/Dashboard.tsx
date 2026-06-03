"use client";

import { useEffect, useMemo, useState } from "react";
import { loadDailyAggregates } from "@/lib/aggregates";
import {
  filterRows,
  recomputeKpis,
  seriesByDate,
  type DashboardFilter,
} from "@/lib/filters";
import type { DailyAggRow, Region } from "@/lib/types";
import DemandForecastChart from "@/components/charts/DemandForecastChart";
import StockoutTrendChart from "@/components/charts/StockoutTrendChart";
import MountOnView from "@/components/ui/MountOnView";
import { mxn, mxnK, pct } from "@/components/charts/theme";

// Section 5 — The Control Tower. The interactive centerpiece: region/brand/date
// filters recompute every visual live from daily_aggregates.json. Dense,
// instrument-panel aesthetic — the deliberate contrast with the airy narrative.
// With NO filter, every number equals kpis.json (same tie-out proven in lib).

function Panel({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-lg border border-border bg-panel ${className}`}>
      <div className="border-b border-border px-4 py-2.5">
        <h3 className="font-mono text-[11px] uppercase tracking-wider text-dim">
          {title}
        </h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-md border px-2.5 py-1 font-mono text-xs transition-colors ${
        active
          ? "border-accent/50 bg-accent/10 text-accent"
          : "border-border bg-panel-2 text-dim hover:border-dim/60 hover:text-body"
      }`}
    >
      {children}
    </button>
  );
}

function Kpi({
  label,
  value,
  tone,
  sub,
}: {
  label: string;
  value: string;
  tone: string;
  sub?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-panel p-4">
      <p className="font-mono text-[10px] uppercase tracking-wider text-dim">
        {label}
      </p>
      <p className={`mt-2 font-mono text-2xl font-medium tabular-nums sm:text-3xl ${tone}`}>
        {value}
      </p>
      {sub ? <p className="mt-0.5 font-mono text-[10px] text-dim">{sub}</p> : null}
    </div>
  );
}

const inputCls =
  "rounded border border-border bg-panel-2 px-2 py-1 font-mono text-xs text-body";

export default function Dashboard() {
  const [rows, setRows] = useState<DailyAggRow[] | null>(null);
  const [error, setError] = useState(false);
  const [regions, setRegions] = useState<Region[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    const ctrl = new AbortController();
    loadDailyAggregates(ctrl.signal)
      .then(setRows)
      .catch((e: Error) => {
        if (e.name !== "AbortError") setError(true);
      });
    return () => ctrl.abort();
  }, []);

  const opts = useMemo(() => {
    if (!rows) return { regions: [] as Region[], brands: [] as string[], min: "", max: "" };
    const rset = new Set<Region>();
    const bset = new Set<string>();
    let min = rows[0].date;
    let max = rows[0].date;
    for (const r of rows) {
      rset.add(r.region);
      bset.add(r.brand);
      if (r.date < min) min = r.date;
      if (r.date > max) max = r.date;
    }
    return {
      regions: [...rset].sort(),
      brands: [...bset].sort(),
      min,
      max,
    };
  }, [rows]);

  const filter: DashboardFilter = useMemo(
    () => ({
      regions: regions.length ? regions : undefined,
      brands: brands.length ? brands : undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    }),
    [regions, brands, dateFrom, dateTo],
  );

  const view = useMemo(() => {
    if (!rows) return null;
    const filtered = filterRows(rows, filter);
    const present = [...new Set(filtered.map((r) => r.region))].sort();
    return {
      kpis: recomputeKpis(filtered),
      series: seriesByDate(filtered),
      health: present.map((rg) => ({
        region: rg,
        ...recomputeKpis(filtered.filter((r) => r.region === rg)),
      })),
      cells: filtered.length,
      total: rows.length,
      empty: filtered.length === 0,
    };
  }, [rows, filter]);

  const active = regions.length > 0 || brands.length > 0 || !!dateFrom || !!dateTo;
  const clear = () => {
    setRegions([]);
    setBrands([]);
    setDateFrom("");
    setDateTo("");
  };
  const toggle = <T,>(list: T[], set: (v: T[]) => void, v: T) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  return (
    <section id="dashboard" className="px-6 py-24 sm:px-10 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-dim">
          05 · The Control Tower
        </p>
        <h2 className="mt-5 max-w-2xl font-display text-4xl font-medium leading-tight text-bright sm:text-5xl">
          Everything above &mdash; live.
        </h2>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-body">
          Filter by region, brand, and date. Every KPI and chart recomputes from
          the same daily aggregate. With no filter applied, the numbers equal the
          analysis exactly &mdash; the same data, made interactive.
        </p>

        <div className="mt-10 min-h-[640px]">
          {error ? (
            <div className="rounded-lg border border-border bg-panel p-8 text-center">
              <p className="font-mono text-sm text-danger">
                Could not load the live data.
              </p>
            </div>
          ) : !view ? (
            <div
              className="flex min-h-[640px] items-center justify-center rounded-lg border border-border bg-panel"
              role="status"
              aria-live="polite"
            >
              <p className="animate-pulse font-mono text-sm text-dim">
                Loading live data&hellip;
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Filters */}
              <div className="rounded-lg border border-border bg-panel p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-start lg:gap-x-8">
                  <fieldset className="min-w-0">
                    <legend className="mb-2 font-mono text-[10px] uppercase tracking-wider text-dim">
                      Region
                    </legend>
                    <div className="flex flex-wrap gap-1.5">
                      {opts.regions.map((r) => (
                        <Chip
                          key={r}
                          active={regions.includes(r)}
                          onClick={() => toggle(regions, setRegions, r)}
                        >
                          {r}
                        </Chip>
                      ))}
                    </div>
                  </fieldset>

                  <fieldset className="min-w-0">
                    <legend className="mb-2 font-mono text-[10px] uppercase tracking-wider text-dim">
                      Brand
                    </legend>
                    <div className="flex flex-wrap gap-1.5">
                      {opts.brands.map((b) => (
                        <Chip
                          key={b}
                          active={brands.includes(b)}
                          onClick={() => toggle(brands, setBrands, b)}
                        >
                          {b}
                        </Chip>
                      ))}
                    </div>
                  </fieldset>

                  <fieldset className="min-w-0">
                    <legend className="mb-2 font-mono text-[10px] uppercase tracking-wider text-dim">
                      Date range
                    </legend>
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="date"
                        aria-label="From date"
                        className={inputCls}
                        value={dateFrom}
                        min={opts.min}
                        max={dateTo || opts.max}
                        onChange={(e) => setDateFrom(e.target.value)}
                      />
                      <span className="font-mono text-xs text-dim">&rarr;</span>
                      <input
                        type="date"
                        aria-label="To date"
                        className={inputCls}
                        value={dateTo}
                        min={dateFrom || opts.min}
                        max={opts.max}
                        onChange={(e) => setDateTo(e.target.value)}
                      />
                    </div>
                  </fieldset>

                  {active ? (
                    <button
                      type="button"
                      onClick={clear}
                      className="self-start rounded-md border border-border bg-panel-2 px-2.5 py-1 font-mono text-xs text-dim transition-colors hover:border-dim/60 hover:text-body lg:ml-auto lg:self-end"
                    >
                      Clear filters
                    </button>
                  ) : null}
                </div>
                <p
                  className="mt-4 border-t border-border pt-3 font-mono text-[11px] text-dim"
                  aria-live="polite"
                >
                  {active ? "Filtered" : "No filter — full network"} ·{" "}
                  <span className="text-body">{view.cells.toLocaleString()}</span>{" "}
                  of {view.total.toLocaleString()} day-cells (date × region × brand)
                </p>
              </div>

              {view.empty ? (
                <div className="rounded-lg border border-border bg-panel p-8 text-center font-mono text-sm text-dim">
                  No data for this filter combination.
                </div>
              ) : (
                <>
                  {/* KPI cards */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                    <Kpi
                      label="Fill rate"
                      value={pct(view.kpis.fill_rate, 1)}
                      tone="text-accent"
                    />
                    <Kpi
                      label="On-time delivery"
                      value={pct(view.kpis.on_time_delivery, 1)}
                      tone="text-accent"
                    />
                    <Kpi
                      label="Stockout events"
                      value={view.kpis.stockout_events.toLocaleString()}
                      tone="text-danger"
                    />
                    <Kpi
                      label="Lost sales"
                      value={mxn(view.kpis.lost_sales_mxn)}
                      tone="text-danger"
                      sub="est."
                    />
                    <Kpi
                      label="Forecast error"
                      value={pct(view.kpis.mape, 1)}
                      tone="text-warn"
                      sub="MAPE"
                    />
                  </div>

                  {/* Charts + region health */}
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <Panel title="Demand vs forecast — units / day" className="lg:col-span-2">
                      <MountOnView minHeight={230}>
                        <DemandForecastChart data={view.series} />
                      </MountOnView>
                    </Panel>

                    <Panel title="Health by region" className="lg:row-span-2">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-border">
                            {["Region", "Fill", "OTD", "SO", "Lost"].map((h) => (
                              <th
                                key={h}
                                scope="col"
                                className="pb-2 font-mono text-[10px] font-normal uppercase tracking-wider text-dim"
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {view.health.map((h) => (
                            <tr
                              key={h.region}
                              className="border-b border-border/50 last:border-b-0"
                            >
                              <th
                                scope="row"
                                className="py-2 pr-2 text-left text-xs font-normal text-body"
                              >
                                {h.region}
                              </th>
                              <td className="py-2 font-mono text-xs tabular-nums text-body">
                                {pct(h.fill_rate, 1)}
                              </td>
                              <td className="py-2 font-mono text-xs tabular-nums text-body">
                                {pct(h.on_time_delivery, 1)}
                              </td>
                              <td className="py-2 font-mono text-xs tabular-nums text-danger">
                                {h.stockout_events}
                              </td>
                              <td className="py-2 font-mono text-xs tabular-nums text-danger">
                                {mxnK(h.lost_sales_mxn)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </Panel>

                    <Panel title="Stockout events / day" className="lg:col-span-2">
                      <MountOnView minHeight={190}>
                        <StockoutTrendChart data={view.series} />
                      </MountOnView>
                    </Panel>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
