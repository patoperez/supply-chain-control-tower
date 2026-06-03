"use client";

import type { DistributionCenter } from "@/lib/types";

// Signature motif: CEDIS as nodes positioned by real lat/lon (a recognizable
// national layout), routes as faint static lines, each node a gently pulsing
// halo. Pure inline SVG; the pulse is CSS (see .ng-halo in globals.css) and is
// disabled under prefers-reduced-motion.

const VIEW = 320;
const PAD = 46;

// A restrained hub-and-corridor topology (Mexico City as the central hub).
const EDGES: [string, string][] = [
  ["CD-MX", "CD-GDL"],
  ["CD-MX", "CD-MTY"],
  ["CD-MX", "CD-PUE"],
  ["CD-MX", "CD-MER"],
  ["CD-MX", "CD-TIJ"],
  ["CD-GDL", "CD-MTY"],
  ["CD-MTY", "CD-TIJ"],
];

// Per-node label placement — Mexico City & Puebla sit ~0.4° apart, so their
// labels are pushed in opposite directions to keep them legible.
type Anchor = "start" | "middle" | "end";
const LABELS: Record<string, { dx: number; dy: number; anchor: Anchor }> = {
  "CD-TIJ": { dx: 0, dy: 15, anchor: "middle" },
  "CD-MTY": { dx: 12, dy: 4, anchor: "start" },
  "CD-MER": { dx: 0, dy: 15, anchor: "middle" },
  "CD-GDL": { dx: -11, dy: 4, anchor: "end" },
  "CD-MX": { dx: -10, dy: -8, anchor: "end" },
  "CD-PUE": { dx: 10, dy: 14, anchor: "start" },
};
const DEFAULT_LABEL = { dx: 0, dy: 15, anchor: "middle" as Anchor };

export default function NetworkVisual({
  centers,
}: {
  centers: DistributionCenter[];
}) {
  const lats = centers.map((c) => c.lat);
  const lons = centers.map((c) => c.lon);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  const span = (lo: number, hi: number) => (hi - lo === 0 ? 1 : hi - lo);

  const pos = new Map<string, { x: number; y: number }>();
  for (const c of centers) {
    pos.set(c.cd_id, {
      x: PAD + ((c.lon - minLon) / span(minLon, maxLon)) * (VIEW - 2 * PAD),
      // flip Y so higher latitude renders upward
      y:
        VIEW - PAD - ((c.lat - minLat) / span(minLat, maxLat)) * (VIEW - 2 * PAD),
    });
  }

  const maxCap = Math.max(...centers.map((c) => c.capacity));
  const radiusOf = (cap: number) => 4 + (cap / maxCap) * 4; // 4–8 by capacity

  const edges = EDGES.filter(([a, b]) => pos.has(a) && pos.has(b));
  const label = `Map of the simulated distribution network: ${centers.length} distribution centers across Mexico (${centers
    .map((c) => c.city)
    .join(", ")}), linked by shipment routes between them.`;

  return (
    <svg
      viewBox={`0 0 ${VIEW} ${VIEW}`}
      role="img"
      aria-label={label}
      className="h-full w-full"
    >
      {/* Routes — faint, static */}
      <g className="stroke-accent" strokeOpacity={0.16} strokeWidth={1}>
        {edges.map(([a, b]) => {
          const pa = pos.get(a)!;
          const pb = pos.get(b)!;
          return <line key={`${a}-${b}`} x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} />;
        })}
      </g>

      {/* Nodes — pulsing halo + solid core + city label */}
      {centers.map((c, i) => {
        const p = pos.get(c.cd_id)!;
        const r = radiusOf(c.capacity);
        return (
          <g key={c.cd_id}>
            <circle
              cx={p.x}
              cy={p.y}
              r={r * 1.4}
              className="ng-halo fill-accent"
              style={{ animationDelay: `${i * 0.55}s` }}
            />
            <circle cx={p.x} cy={p.y} r={r} className="fill-accent" />
            {(() => {
              const lbl = LABELS[c.cd_id] ?? DEFAULT_LABEL;
              return (
                <text
                  x={p.x + lbl.dx}
                  y={p.y + lbl.dy}
                  textAnchor={lbl.anchor}
                  className="fill-dim font-mono text-[9px] tracking-wide"
                >
                  {c.city}
                </text>
              );
            })()}
          </g>
        );
      })}
    </svg>
  );
}
