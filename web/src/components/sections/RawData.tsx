import { cleaningAudit, rawSample } from "@/lib/data";
import type { RawSampleRow } from "@/lib/types";

// Section 2 — The Raw Data. Shows the actual mess: a sample of raw shipment rows
// with every quality issue flagged. Severity uses the semantic colors (warn =
// recoverable, danger = hard error) and is never color-only — each flagged cell
// also carries an alert icon, and a Flags column names the issue in words.

type Tone = "danger" | "warn";
interface CellFlag {
  tone: Tone;
  label: string;
}

// Derive per-cell flags from the data itself (duplicates detected on
// shipment_id + SKU, so legitimate multi-SKU shipments are NOT flagged).
function buildFlags(rows: RawSampleRow[]): Record<string, CellFlag>[] {
  const keyCount = new Map<string, number>();
  for (const r of rows) {
    const k = `${r.shipment_id}|${r.sku}`;
    keyCount.set(k, (keyCount.get(k) ?? 0) + 1);
  }
  return rows.map((r) => {
    const f: Record<string, CellFlag> = {};
    const iss = r.issues;
    if (iss.includes("sku_typo")) f.sku = { tone: "warn", label: "SKU typo" };
    if (iss.includes("phantom_store"))
      f.store_id = { tone: "danger", label: "unknown store" };
    if (iss.includes("late_delivery"))
      f.actual_delivery = { tone: "danger", label: "late delivery" };
    if ((keyCount.get(`${r.shipment_id}|${r.sku}`) ?? 0) > 1)
      f.shipment_id = { tone: "warn", label: "duplicate" };
    if (r.qty_received === null)
      f.qty_received = { tone: "danger", label: "missing qty" };
    else if (r.qty_received < 0)
      f.qty_received = { tone: "danger", label: "negative qty" };
    if (r.qty_ordered !== null && r.qty_ordered < 0)
      f.qty_ordered = { tone: "danger", label: "negative qty" };
    if (
      iss.includes("incomplete_load") &&
      r.qty_received !== null &&
      r.qty_ordered !== null &&
      r.qty_received < r.qty_ordered
    )
      f.qty_received = { tone: "warn", label: "incomplete load" };
    return f;
  });
}

const COLS: { key: keyof RawSampleRow; label: string }[] = [
  { key: "shipment_id", label: "Shipment" },
  { key: "store_id", label: "Store" },
  { key: "sku", label: "SKU" },
  { key: "qty_ordered", label: "Ordered" },
  { key: "qty_received", label: "Received" },
  { key: "promised_delivery", label: "Promised" },
  { key: "actual_delivery", label: "Actual" },
];

const TONE_CELL: Record<Tone, string> = {
  danger: "bg-danger/10 text-danger",
  warn: "bg-warn/10 text-warn",
};
const TONE_BADGE: Record<Tone, string> = {
  danger: "border-danger/30 bg-danger/10 text-danger",
  warn: "border-warn/30 bg-warn/10 text-warn",
};

function Alert({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className={`inline-block h-3 w-3 shrink-0 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    >
      <path d="M8 2.5 14 13.5 H2 Z" />
      <line x1="8" y1="6.6" x2="8" y2="9.4" strokeLinecap="round" />
      <circle cx="8" cy="11.3" r="0.55" fill="currentColor" stroke="none" />
    </svg>
  );
}

function cellText(r: RawSampleRow, key: keyof RawSampleRow): string {
  const v = r[key];
  if (v === null) return "null";
  return String(v);
}

export default function RawData() {
  const rawRows = cleaningAudit.summary.raw_rows;
  const withIssues = cleaningAudit.summary.rows_with_issues;
  const pct = ((withIssues / rawRows) * 100).toFixed(1);
  const flags = buildFlags(rawSample);

  return (
    <section id="raw-data" className="px-6 py-24 sm:px-10 sm:py-32">
      <div className="mx-auto max-w-5xl">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-dim">
          02 · The Raw Data
        </p>
        <h2 className="mt-5 max-w-2xl font-display text-4xl font-medium leading-tight text-bright sm:text-5xl">
          Real operational data never arrives clean.
        </h2>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-body">
          These are raw shipment records, straight from the source &mdash; the kind
          of messy operational data an analyst actually inherits. Of{" "}
          <span className="font-mono text-bright">{rawRows.toLocaleString()}</span>{" "}
          rows,{" "}
          <span className="font-mono text-warn">{withIssues.toLocaleString()}</span>{" "}
          (<span className="font-mono">{pct}%</span>) carried at least one quality
          issue. A representative sample, every problem flagged:
        </p>

        <div className="mt-10 overflow-x-auto rounded-lg border border-border bg-panel">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <caption className="sr-only">
              Sample of raw shipment rows. Cells with data-quality issues are
              highlighted and named in the Flags column: SKU typos, incomplete
              loads, late deliveries, missing or negative quantities, unknown
              (phantom) stores, and duplicate records.
            </caption>
            <thead>
              <tr className="border-b border-border">
                {COLS.map((c) => (
                  <th
                    key={c.key}
                    scope="col"
                    className="whitespace-nowrap px-4 py-3 font-mono text-[11px] font-normal uppercase tracking-wider text-dim"
                  >
                    {c.label}
                  </th>
                ))}
                <th
                  scope="col"
                  className="whitespace-nowrap px-4 py-3 font-mono text-[11px] font-normal uppercase tracking-wider text-dim"
                >
                  Flags
                </th>
              </tr>
            </thead>
            <tbody>
              {rawSample.map((r, i) => {
                const rowFlags = flags[i];
                const badges = [
                  ...new Map(
                    Object.values(rowFlags).map((f) => [f.label, f]),
                  ).values(),
                ];
                return (
                  <tr
                    key={i}
                    className="border-b border-border/60 last:border-b-0"
                  >
                    {COLS.map((c, ci) => {
                      const flag = rowFlags[c.key];
                      const value = cellText(r, c.key);
                      const Tag = ci === 0 ? "th" : "td";
                      return (
                        <Tag
                          key={c.key}
                          {...(ci === 0 ? { scope: "row" as const } : {})}
                          className={`whitespace-nowrap px-4 py-3 font-mono text-sm font-normal ${
                            flag ? TONE_CELL[flag.tone] : "text-body"
                          }`}
                        >
                          {flag ? (
                            <span className="inline-flex items-center gap-1.5">
                              <Alert />
                              {value}
                            </span>
                          ) : (
                            value
                          )}
                        </Tag>
                      );
                    })}
                    <td className="px-4 py-3">
                      <span className="flex flex-wrap gap-1.5">
                        {badges.map((b) => (
                          <span
                            key={b.label}
                            className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[10px] ${TONE_BADGE[b.tone]}`}
                          >
                            <Alert />
                            {b.label}
                          </span>
                        ))}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Legend — severity, not color-only (each carries the alert icon + words) */}
        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-dim">
          <span className="inline-flex items-center gap-1.5">
            <Alert className="text-warn" />
            <span>
              <span className="text-warn">amber</span> — recoverable (SKU typo,
              incomplete load, duplicate)
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Alert className="text-danger" />
            <span>
              <span className="text-danger">red</span> — hard error (late, missing
              / negative qty, phantom store)
            </span>
          </span>
        </div>

        <p className="mt-8 max-w-2xl text-sm leading-relaxed text-dim">
          Note that one shipment ID can legitimately repeat across its SKUs &mdash;
          which is exactly why duplicates are detected on shipment&nbsp;+&nbsp;SKU,
          not the ID alone. Nothing is discarded yet: next, how each defect is
          detected and resolved &mdash; recovering what we can, dropping only the
          unusable.
        </p>
      </div>
    </section>
  );
}
