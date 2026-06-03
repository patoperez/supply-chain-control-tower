# Supply Chain Control Tower — Interactive Case Study

A scrollytelling presentation of an end-to-end supply-chain analysis: a distribution
network's stock-out problem, traced from messy raw data to root-cause findings, an
interactive control-tower dashboard, and an explainable stock-out risk model.

**🔗 Live site:** https://supply-chain-control-tower.pages.dev
&nbsp;·&nbsp; **The analysis & data pipeline:** [supply-chain-analysis](https://github.com/patoperez/supply-chain-analysis)

> **All data is 100% synthetic** — no real, proprietary, or confidential information
> appears anywhere. It is fabricated to demonstrate method on realistically messy data.

---

## What this is

This repo is the **presentation layer**. The analytical work — generating the synthetic
network, cleaning it, the root-cause findings, and the risk model — lives in the
[supply-chain-analysis](https://github.com/patoperez/supply-chain-analysis) repo, which
exports static JSON consumed here. **Python owns the data; this app owns the presentation.**

The page is a single scroll through seven beats:

1. **Hook** — the network and the headline stakes (~$1.5M est. lost sales).
2. **Raw data** — the actual mess, every quality issue highlighted.
3. **Cleaning** — the before/after audit; ~98% of rows retained.
4. **Findings** — lost-sales Pareto by CEDIS, late-delivery day-of-week pattern, forecast accuracy.
5. **Dashboard** — an interactive control tower; region/brand/date filters recompute every KPI and chart live.
6. **Prediction** — the explainable stock-out risk model (a transparent score, not a black box).
7. **Recommendation** — three prioritized actions and a concrete first step.

## Built with

- **Next.js** (App Router) + **TypeScript**, shipped as a **static export** (`output: "export"`).
- **Tailwind CSS v4** (CSS-first `@theme` design tokens).
- **Recharts** for the charts.
- Self-hosted variable fonts via `next/font` (Fraunces · Spline Sans · Spline Sans Mono).
- No backend: the dashboard recomputes in the browser from a pre-aggregated JSON payload;
  with no filter applied, every number equals the analysis exactly.

## Run locally

```bash
cd web
npm install
npm run dev        # http://localhost:3000
npm run build      # static export to web/out/
```

## Deploy (Cloudflare Pages)

Static export — connect the repo and set:

| Setting | Value |
|---|---|
| Root directory | `web` |
| Build command | `npm run build` |
| Build output directory | `out` |
| `NODE_VERSION` | `20` |

The build emits a fully static site to `web/out/`; the data in `web/public/data/` is
served as static JSON.

## Repository structure

```
web/
├── src/
│   ├── app/          # the single case-study page + layout
│   ├── components/   # sections (the 7 beats), charts, ui
│   ├── lib/          # types, data loaders, dashboard filter/recompute logic
│   └── styles/       # globals.css (Tailwind v4 @theme design tokens)
└── public/data/      # static JSON exported by the analysis pipeline
```

## Design

A "Control Room Editorial" system: dark and instrument-like, airy in the narrative and
dense in the dashboard. Colors are semantic (green = healthy, amber = at-risk, red =
stock-out/late, blue = neutral data); every number is set in a mono typeface; motion is
restrained and respects `prefers-reduced-motion`.
