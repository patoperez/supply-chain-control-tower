"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DaySeriesPoint } from "@/lib/filters";
import { AXIS_TICK, CHART, shortDate } from "./theme";
import { TooltipBox, type TipProps } from "./Tooltip";
import { useReducedMotion } from "./useReducedMotion";

function DemandTip({ active, payload }: TipProps<DaySeriesPoint>) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <TooltipBox title={d.date}>
      <p className="text-accent">{d.actual.toLocaleString()} actual</p>
      <p className="text-info">{d.forecast.toLocaleString()} forecast</p>
    </TooltipBox>
  );
}

export default function DemandForecastChart({
  data,
}: {
  data: DaySeriesPoint[];
}) {
  const reduced = useReducedMotion();
  return (
    <ResponsiveContainer width="100%" height={230}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: 4 }}>
        <CartesianGrid stroke={CHART.grid} vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={shortDate}
          tick={AXIS_TICK}
          axisLine={{ stroke: CHART.border }}
          tickLine={false}
          minTickGap={36}
        />
        <YAxis
          tick={AXIS_TICK}
          axisLine={false}
          tickLine={false}
          width={44}
          tickFormatter={(v: number) =>
            v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`
          }
        />
        <Tooltip
          content={<DemandTip />}
          cursor={{ stroke: CHART.dim, strokeDasharray: "3 3" }}
        />
        <Line
          type="monotone"
          dataKey="forecast"
          stroke={CHART.info}
          strokeWidth={1.5}
          strokeDasharray="4 3"
          dot={false}
          isAnimationActive={!reduced}
        />
        <Line
          type="monotone"
          dataKey="actual"
          stroke={CHART.accent}
          strokeWidth={2}
          dot={false}
          isAnimationActive={!reduced}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
