/**
 * Dashboard filter + recompute logic. Runs in the browser against the
 * pre-aggregated (date × region × brand) rows — never raw rows — so the
 * region / brand / date-range filters recompute every KPI instantly.
 *
 * The formulas match METRICS_SPEC.md exactly; with NO filter applied the
 * recomputed KPIs equal kpis.json (the same tie-out verified at export).
 */

import type { DailyAggRow, Region } from "./types";

export interface DashboardFilter {
  regions?: Region[]; // undefined / empty = all regions
  brands?: string[]; // undefined / empty = all brands
  dateFrom?: string; // inclusive "YYYY-MM-DD"; undefined = open start
  dateTo?: string; // inclusive "YYYY-MM-DD"; undefined = open end
}

export interface RecomputedKpis {
  fill_rate: number;
  on_time_delivery: number;
  stockout_events: number;
  lost_sales_mxn: number;
  mape: number;
  actual_demand: number;
  forecast_demand: number;
  shipment_lines: number;
  late_lines: number;
}

export interface DaySeriesPoint {
  date: string;
  actual: number;
  forecast: number;
  stockouts: number;
  lost: number;
}

function hasItems(arr: readonly string[] | undefined): arr is string[] {
  return Array.isArray(arr) && arr.length > 0;
}

function round(value: number, dp: number): number {
  const f = 10 ** dp;
  return Math.round(value * f) / f;
}

/** Apply the region / brand / date-range filter (empty selections = all). */
export function filterRows(
  rows: DailyAggRow[],
  filter: DashboardFilter = {},
): DailyAggRow[] {
  const { regions, brands, dateFrom, dateTo } = filter;
  const regionSet = hasItems(regions) ? new Set(regions) : null;
  const brandSet = hasItems(brands) ? new Set(brands) : null;

  return rows.filter((r) => {
    if (regionSet && !regionSet.has(r.region)) return false;
    if (brandSet && !brandSet.has(r.brand)) return false;
    if (dateFrom && r.date < dateFrom) return false;
    if (dateTo && r.date > dateTo) return false;
    return true;
  });
}

/** Recompute the headline KPIs from a set of daily-aggregate rows. */
export function recomputeKpis(rows: DailyAggRow[]): RecomputedKpis {
  let act = 0;
  let fcst = 0;
  let apeSum = 0;
  let apeN = 0;
  let ordered = 0;
  let received = 0;
  let lines = 0;
  let late = 0;
  let stockouts = 0;
  let lost = 0;

  for (const r of rows) {
    act += r.act;
    fcst += r.fcst;
    apeSum += r.ape_sum;
    apeN += r.ape_n;
    ordered += r.ordered;
    received += r.received;
    lines += r.lines;
    late += r.late;
    stockouts += r.stockouts;
    lost += r.lost;
  }

  return {
    fill_rate: ordered > 0 ? round(received / ordered, 4) : 0,
    on_time_delivery: lines > 0 ? round(1 - late / lines, 4) : 0,
    stockout_events: stockouts,
    lost_sales_mxn: round(lost, 2),
    mape: apeN > 0 ? round(apeSum / apeN, 4) : 0,
    actual_demand: act,
    forecast_demand: fcst,
    shipment_lines: lines,
    late_lines: late,
  };
}

/** Filter + recompute in one call — the dashboard's primary entry point. */
export function recompute(
  rows: DailyAggRow[],
  filter: DashboardFilter = {},
): RecomputedKpis {
  return recomputeKpis(filterRows(rows, filter));
}

/** Daily time series (demand vs forecast, stockouts, lost) for the charts. */
export function seriesByDate(rows: DailyAggRow[]): DaySeriesPoint[] {
  const byDate = new Map<string, DaySeriesPoint>();
  for (const r of rows) {
    let p = byDate.get(r.date);
    if (!p) {
      p = { date: r.date, actual: 0, forecast: 0, stockouts: 0, lost: 0 };
      byDate.set(r.date, p);
    }
    p.actual += r.act;
    p.forecast += r.fcst;
    p.stockouts += r.stockouts;
    p.lost += r.lost;
  }
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}
