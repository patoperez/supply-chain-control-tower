import { cleaningAudit } from "@/lib/data";
import type { AuditAction, AuditStep } from "@/lib/types";
import CountUp from "@/components/ui/CountUp";

// Section 3 — The Cleaning. The before→after audit: every defect detected, then
// resolved by the cheapest honest means — recover in place, flag & keep, or drop.
// The story: most problems get fixed, not thrown away. All figures from JSON.

type Tone = "accent" | "warn" | "danger";

const TONE: Record<Tone, { text: string; border: string; bg: string }> = {
  accent: { text: "text-accent", border: "border-accent/30", bg: "bg-accent" },
  warn: { text: "text-warn", border: "border-warn/30", bg: "bg-warn" },
  danger: { text: "text-danger", border: "border-danger/30", bg: "bg-danger" },
};

function IconCheck({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className={`h-3.5 w-3.5 ${className}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8.5 6.5 12 13 4.5" />
    </svg>
  );
}
function IconFlag({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className={`h-3.5 w-3.5 ${className}`} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 14V2.5" />
      <path d="M4 3h7l-1.6 2.6L11 8.2H4" />
    </svg>
  );
}
function IconCross({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className={`h-3.5 w-3.5 ${className}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M4 4 12 12M12 4 4 12" />
    </svg>
  );
}

const GROUPS: {
  action: AuditAction;
  title: string;
  subtitle: string;
  tone: Tone;
  Icon: (p: { className?: string }) => React.ReactElement;
}[] = [
  { action: "recovered", title: "Recovered", subtitle: "fixed in place — kept", tone: "accent", Icon: IconCheck },
  { action: "flagged", title: "Flagged", subtitle: "real events — kept for follow-up", tone: "warn", Icon: IconFlag },
  { action: "removed", title: "Removed", subtitle: "unusable — dropped", tone: "danger", Icon: IconCross },
];

const shortLabel = (s: AuditStep) => s.label.split("—")[0].trim();

export default function Cleaning() {
  const { summary, steps, validation } = cleaningAudit;
  const raw = summary.raw_rows;
  const cleaned = summary.cleaned_rows;
  const removed = summary.rows_removed;
  const recovered = summary.rows_recovered_in_place;
  const flagged = summary.flagged_incomplete + summary.flagged_late;
  const retentionPct = (summary.retention_pct * 100).toFixed(1);
  const retainedW = (cleaned / raw) * 100;
  const removedW = (removed / raw) * 100;

  const injectedTotal = Object.values(validation).reduce((a, v) => a + v.injected, 0);
  const allMatch = Object.values(validation).every((v) => v.match);

  return (
    <section id="cleaning" className="px-6 py-24 sm:px-10 sm:py-32">
      <div className="mx-auto max-w-5xl">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-dim">
          03 · The Cleaning
        </p>
        <h2 className="mt-5 max-w-2xl font-display text-4xl font-medium leading-tight text-bright sm:text-5xl">
          Most problems get fixed, not thrown away.
        </h2>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-body">
          Every injected defect was detected, then resolved by the cheapest honest
          means: recover in place where the data allows, flag and keep the real
          service events, and drop only what is genuinely unusable.{" "}
          <span className="font-mono text-accent">{recovered.toLocaleString()}</span>{" "}
          issues were repaired without losing a row; just{" "}
          <span className="font-mono text-danger">{removed.toLocaleString()}</span>{" "}
          rows were dropped.
        </p>

        {/* Before → after */}
        <div className="mt-12 rounded-lg border border-border bg-panel p-6 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-widest text-dim">
                Raw intake
              </p>
              <p className="mt-1 font-mono text-4xl font-medium tabular-nums text-bright sm:text-5xl">
                <CountUp value={raw} thousands />
              </p>
              <p className="text-xs text-dim">rows received</p>
            </div>
            <div className="text-center">
              <p className="font-mono text-3xl font-medium tabular-nums text-accent sm:text-4xl">
                <CountUp value={summary.retention_pct * 100} decimals={1} suffix="%" />
              </p>
              <p className="text-xs text-dim">retained</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-[11px] uppercase tracking-widest text-dim">
                Clean output
              </p>
              <p className="mt-1 font-mono text-4xl font-medium tabular-nums text-accent sm:text-5xl">
                <CountUp value={cleaned} thousands />
              </p>
              <p className="text-xs text-dim">rows kept</p>
            </div>
          </div>

          <div className="mt-7">
            <div
              className="flex h-3 w-full overflow-hidden rounded-full bg-panel-2"
              role="img"
              aria-label={`${retentionPct}% of rows retained (${cleaned.toLocaleString()} of ${raw.toLocaleString()}); ${removed} rows removed.`}
            >
              <div className="h-full bg-accent" style={{ width: `${retainedW}%` }} />
              <div
                className="h-full bg-danger"
                style={{ width: `${removedW}%`, minWidth: "4px" }}
              />
            </div>
            <div className="mt-2.5 flex flex-wrap justify-between gap-x-4 gap-y-1 font-mono text-[11px] text-dim">
              <span>
                <span className="text-accent">{recovered.toLocaleString()}</span>{" "}
                recovered ·{" "}
                <span className="text-warn">{flagged.toLocaleString()}</span> flagged
                &amp; kept
              </span>
              <span>
                <span className="text-danger">{removed.toLocaleString()}</span> removed
              </span>
            </div>
          </div>
        </div>

        {/* Three outcomes */}
        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
          {GROUPS.map((g) => {
            const groupSteps = steps.filter((s) => s.action === g.action);
            const total = groupSteps.reduce((a, s) => a + s.detected, 0);
            const t = TONE[g.tone];
            return (
              <div key={g.action} className={`rounded-lg border ${t.border} bg-panel p-5`}>
                <div className="flex items-center gap-2.5">
                  <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full border ${t.border} ${t.text}`}>
                    <g.Icon />
                  </span>
                  <h3 className={`font-mono text-sm font-medium uppercase tracking-wide ${t.text}`}>
                    {g.title}
                  </h3>
                </div>
                <p className={`mt-4 font-mono text-3xl font-medium tabular-nums ${t.text}`}>
                  {total.toLocaleString()}
                </p>
                <p className="text-xs text-dim">{g.subtitle}</p>

                <ul className="mt-4 space-y-3 border-t border-border pt-4">
                  {groupSteps.map((s) => (
                    <li key={s.issue}>
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-sm text-body">{shortLabel(s)}</span>
                        <span className="font-mono text-sm tabular-nums text-bright">
                          {s.detected.toLocaleString()}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs leading-snug text-dim">
                        {s.resolution}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <p className="mt-8 font-mono text-xs text-dim">
          {allMatch ? "✓ " : ""}Detection check: every injected defect was found —{" "}
          {injectedTotal.toLocaleString()}/{injectedTotal.toLocaleString()} matched
          (typos, duplicates, phantom stores, missing/negative quantities).
        </p>
      </div>
    </section>
  );
}
