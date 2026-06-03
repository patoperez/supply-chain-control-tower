"use client";

import {
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { RiskLevel } from "@/lib/types";
import { AXIS_TICK, CHART } from "./theme";
import { TooltipBox, type TipProps } from "./Tooltip";
import { useReducedMotion } from "./useReducedMotion";

export interface RiskPoint {
  sku: string;
  cd: string;
  days_of_cover: number;
  risk_score: number;
  risk_level: RiskLevel;
}

// Color encodes the risk STATE (semantic): healthy / at-risk / high-risk.
const LEVEL_COLOR: Record<RiskLevel, string> = {
  High: CHART.danger,
  Medium: CHART.warn,
  Low: CHART.accent,
};

function RiskTip({ active, payload }: TipProps<RiskPoint>) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <TooltipBox title={`${d.sku} · ${d.cd}`}>
      <p style={{ color: LEVEL_COLOR[d.risk_level] }}>
        {d.risk_level} · score {d.risk_score}
      </p>
      <p className="text-dim">{d.days_of_cover}d cover</p>
    </TooltipBox>
  );
}

export default function RiskScatterChart({ data }: { data: RiskPoint[] }) {
  const reduced = useReducedMotion();
  return (
    <ResponsiveContainer width="100%" height={300}>
      <ScatterChart margin={{ top: 8, right: 12, bottom: 4, left: 4 }}>
        <CartesianGrid stroke={CHART.grid} />
        <XAxis
          type="number"
          dataKey="days_of_cover"
          domain={[0, "dataMax"]}
          tickFormatter={(v: number) => `${v}d`}
          tick={AXIS_TICK}
          axisLine={{ stroke: CHART.border }}
          tickLine={false}
        />
        <YAxis
          type="number"
          dataKey="risk_score"
          domain={[0, 100]}
          tick={AXIS_TICK}
          axisLine={false}
          tickLine={false}
          width={32}
        />
        <Tooltip
          content={<RiskTip />}
          cursor={{ strokeDasharray: "3 3", stroke: CHART.dim }}
        />
        <ReferenceLine y={60} stroke={CHART.danger} strokeDasharray="3 3" strokeOpacity={0.4} />
        <ReferenceLine y={35} stroke={CHART.warn} strokeDasharray="3 3" strokeOpacity={0.4} />
        <Scatter data={data} isAnimationActive={!reduced}>
          {data.map((d, i) => (
            <Cell key={i} fill={LEVEL_COLOR[d.risk_level]} fillOpacity={0.85} />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
}
