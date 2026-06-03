/**
 * Data loading. The web app reads ONLY the static JSON the Python pipeline
 * exported to `web/public/data/` — never Python, never a server.
 *
 * Strategy: the small datasets are imported at build time (baked into the
 * static export, available to both Server and Client Components). The large
 * daily aggregate (~hundreds of KB) is fetched at runtime so it stays out of
 * the JS bundle.
 */

import type {
  CleaningAudit,
  Dimensions,
  Findings,
  Kpis,
  RawSampleRow,
  RiskScore,
} from "./types";

import kpisJson from "../../public/data/kpis.json";
import findingsJson from "../../public/data/findings.json";
import dimensionsJson from "../../public/data/dimensions.json";
import riskJson from "../../public/data/risk_scores.json";
import auditJson from "../../public/data/cleaning_audit.json";
import rawSampleJson from "../../public/data/raw_sample.json";

// The JSON is pipeline-generated and validated, so we assert the matching type
// (via `unknown` — never `any`). The shapes are guaranteed by lib/types.ts.
export const kpis = kpisJson as unknown as Kpis;
export const findings = findingsJson as unknown as Findings;
export const dimensions = dimensionsJson as unknown as Dimensions;
export const riskScores = riskJson as unknown as RiskScore[];
export const cleaningAudit = auditJson as unknown as CleaningAudit;
export const rawSample = rawSampleJson as unknown as RawSampleRow[];

// The runtime daily-aggregate loader lives in lib/aggregates.ts so Client
// Components can use it without bundling the static datasets above.
