// Chart colors — these MIRROR the @theme tokens in styles/globals.css. Recharts
// applies colors as SVG presentation attributes, where CSS var() does NOT
// resolve, so this is the single concrete source for chart colors. Keep in sync
// with tokens. Per DESIGN_SYSTEM: data series use accent/info; warn/danger are
// reserved for risk states.
export const CHART = {
  accent: "#00d9a3",
  info: "#4d9fff",
  warn: "#ffb84d",
  danger: "#ff5e5e",
  grid: "#1c2533",
  border: "#232d3d",
  dim: "#7d8a9c",
  body: "#b8c2cf",
  bright: "#e6edf3",
  panel: "#121821",
  panel2: "#1a2230",
} as const;

// Mono axis ticks (fontFamily is a CSS style, so the token var() resolves here).
export const AXIS_TICK = {
  fill: CHART.dim,
  fontFamily: "var(--font-mono)",
  fontSize: 11,
} as const;

export const pct = (v: number, dp = 0): string => `${(v * 100).toFixed(dp)}%`;
export const mxnK = (v: number): string => `$${Math.round(v / 1000)}k`;
export const mxn = (v: number): string => `$${Math.round(v).toLocaleString()}`;

/** "2024-01-15" → "1/15" for compact time-series axes. */
export const shortDate = (d: string): string => {
  const p = d.split("-");
  return `${Number(p[1])}/${Number(p[2])}`;
};
