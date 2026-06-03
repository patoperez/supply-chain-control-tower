/**
 * Runtime loader for the heavy daily-aggregate payload. Kept separate from
 * lib/data.ts (which statically imports the small JSON) so importing this from a
 * Client Component does NOT pull the other datasets into the client bundle.
 */

import { withBasePath } from "./basePath";
import type { DailyAggRow, DailyAggregates, Region } from "./types";

/** Expand the columnar daily-aggregate payload into typed row objects. */
export function parseDailyAggregates(payload: DailyAggregates): DailyAggRow[] {
  const i = Object.fromEntries(payload.columns.map((c, idx) => [c, idx]));
  return payload.rows.map((r) => ({
    date: r[i.date] as string,
    region: r[i.region] as Region,
    brand: r[i.brand] as string,
    act: r[i.act] as number,
    fcst: r[i.fcst] as number,
    ape_sum: r[i.ape_sum] as number,
    ape_n: r[i.ape_n] as number,
    ordered: r[i.ordered] as number,
    received: r[i.received] as number,
    lines: r[i.lines] as number,
    late: r[i.late] as number,
    stockouts: r[i.stockouts] as number,
    lost: r[i.lost] as number,
  }));
}

/** Fetch + parse the daily aggregate at runtime (client-side). */
export async function loadDailyAggregates(
  signal?: AbortSignal,
): Promise<DailyAggRow[]> {
  const res = await fetch(withBasePath("/data/daily_aggregates.json"), {
    signal,
  });
  if (!res.ok) {
    throw new Error(`Failed to load daily_aggregates.json (${res.status})`);
  }
  const payload = (await res.json()) as DailyAggregates;
  return parseDailyAggregates(payload);
}
