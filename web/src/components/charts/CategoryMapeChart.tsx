"use client";

import {
  Bar,
  CartesianGrid,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CategoryMape } from "@/lib/types";
import { AXIS_TICK, CHART, pct } from "./theme";
import { TooltipBox, type TipProps } from "./Tooltip";
import { useReducedMotion } from "./useReducedMotion";

function MapeTip({ active, payload }: TipProps<CategoryMape>) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <TooltipBox title={d.category}>
      <p className="text-info">{pct(d.mape, 1)} MAPE</p>
    </TooltipBox>
  );
}

export default function CategoryMapeChart({ data }: { data: CategoryMape[] }) {
  const reduced = useReducedMotion();

  return (
    // 0-baseline x-axis keeps the bars near-equal — honestly showing the spread
    // is only ~2pp, not a dramatic gap.
    <ResponsiveContainer width="100%" height={200}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 12, bottom: 4, left: 4 }}
      >
        <CartesianGrid stroke={CHART.grid} horizontal={false} />
        <XAxis
          type="number"
          domain={[0, 0.25]}
          tickFormatter={(v: number) => pct(v)}
          tick={AXIS_TICK}
          axisLine={{ stroke: CHART.border }}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="category"
          tick={AXIS_TICK}
          axisLine={false}
          tickLine={false}
          width={76}
        />
        <Tooltip content={<MapeTip />} cursor={{ fill: CHART.panel2, opacity: 0.45 }} />
        <Bar
          dataKey="mape"
          fill={CHART.info}
          radius={[0, 3, 3, 0]}
          barSize={14}
          isAnimationActive={!reduced}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
