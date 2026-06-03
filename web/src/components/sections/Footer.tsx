const REPO_URL = "https://github.com/patoperez/supply-chain-analysis";

function GithubMark() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="h-4 w-4 fill-current">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-border px-6 py-16 sm:px-10">
      <div className="mx-auto max-w-3xl space-y-8">
        {/* Synthetic-data disclaimer — prominent */}
        <div className="rounded-lg border border-border bg-panel p-5">
          <p className="font-mono text-xs uppercase tracking-wider text-dim">
            100% synthetic data
          </p>
          <p className="mt-2 text-sm leading-relaxed text-body">
            Every figure in this case study is{" "}
            <span className="text-bright">fabricated</span>. No real, proprietary, or
            confidential information appears anywhere &mdash; the companies, SKUs,
            prices, and quantities are invented to demonstrate method. All randomness
            uses a fixed seed, so the entire dataset is fully reproducible.
          </p>
        </div>

        {/* Methodology */}
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-dim">
            Methodology
          </p>
          <p className="mt-2 text-sm leading-relaxed text-dim">
            A reproducible Python pipeline (pandas / numpy) generates, cleans, and
            analyzes the network, then exports static JSON. This Next.js site reads
            only those files and recomputes the dashboard in the browser &mdash; no
            backend, no database. Python owns the data; the web app owns the
            presentation. Shipped as a static export.
          </p>
        </div>

        {/* Credit + source */}
        <div className="flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-xs text-dim">
            Supply Chain Control Tower &mdash; a Service Analyst case study
          </p>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 self-start rounded-md border border-border bg-panel px-3 py-1.5 font-mono text-xs text-body transition-colors hover:border-dim/60 hover:text-bright"
          >
            <GithubMark />
            Source on GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
