"use client";

import {
  Bar,
  CartesianGrid,
  Cell,
  BarChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { WeekdayLate } from "@/lib/types";
import { AXIS_TICK, CHART, pct } from "./theme";
import { TooltipBox, type TipProps } from "./Tooltip";
import { useReducedMotion } from "./useReducedMotion";

function WeekdayTip({ active, payload }: TipProps<WeekdayLate>) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <TooltipBox title={d.weekday}>
      <p className="text-warn">{pct(d.late_rate, 1)} late</p>
      <p className="text-dim">
        {d.late.toLocaleString()} of {d.shipments.toLocaleString()} shipments
      </p>
    </TooltipBox>
  );
}

export default function WeekdayLateChart({
  data,
  avg,
}: {
  data: WeekdayLate[];
  avg: number;
}) {
  const reduced = useReducedMotion();

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: 4 }}>
        <CartesianGrid stroke={CHART.grid} vertical={false} />
        <XAxis
          dataKey="weekday"
          tickFormatter={(w: string) => w.slice(0, 3)}
          tick={AXIS_TICK}
          axisLine={{ stroke: CHART.border }}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v: number) => pct(v)}
          tick={AXIS_TICK}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <Tooltip
          content={<WeekdayTip />}
          cursor={{ fill: CHART.panel2, opacity: 0.45 }}
        />
        <ReferenceLine
          y={avg}
          stroke={CHART.dim}
          strokeDasharray="3 3"
          strokeWidth={1}
        />
        <Bar dataKey="late_rate" radius={[3, 3, 0, 0]} isAnimationActive={!reduced}>
          {data.map((d, i) => {
            const high = d.late_rate > avg;
            return (
              <Cell
                key={i}
                fill={high ? CHART.warn : CHART.info}
                fillOpacity={high ? 1 : 0.45}
              />
            );
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
