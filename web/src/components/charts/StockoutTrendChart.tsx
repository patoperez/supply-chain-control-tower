"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DaySeriesPoint } from "@/lib/filters";
import { AXIS_TICK, CHART, mxn, shortDate } from "./theme";
import { TooltipBox, type TipProps } from "./Tooltip";
import { useReducedMotion } from "./useReducedMotion";

function StockoutTip({ active, payload }: TipProps<DaySeriesPoint>) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <TooltipBox title={d.date}>
      <p className="text-danger">
        {d.stockouts} stockout{d.stockouts === 1 ? "" : "s"}
      </p>
      {d.lost > 0 && (
        <p className="text-dim">
          {mxn(d.lost)} <span>lost · est.</span>
        </p>
      )}
    </TooltipBox>
  );
}

export default function StockoutTrendChart({
  data,
}: {
  data: DaySeriesPoint[];
}) {
  const reduced = useReducedMotion();
  return (
    <ResponsiveContainer width="100%" height={190}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: 4 }}>
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
          width={30}
          allowDecimals={false}
        />
        <Tooltip
          content={<StockoutTip />}
          cursor={{ fill: CHART.panel2, opacity: 0.45 }}
        />
        <Bar
          dataKey="stockouts"
          fill={CHART.danger}
          radius={[2, 2, 0, 0]}
          isAnimationActive={!reduced}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
