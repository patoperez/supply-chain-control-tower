"use client";

import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ParetoEntry } from "@/lib/types";
import { AXIS_TICK, CHART, mxn, mxnK, pct } from "./theme";
import { TooltipBox, type TipProps } from "./Tooltip";
import { useReducedMotion } from "./useReducedMotion";

type Row = ParetoEntry & { code: string };

function ParetoTip({ active, payload }: TipProps<Row>) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <TooltipBox title={d.city}>
      <p className="text-info">
        {mxn(d.lost_sales_mxn)} <span className="text-dim">lost · est.</span>
      </p>
      <p className="text-dim">
        {pct(d.share, 1)} share · {pct(d.cumulative_share)} cumulative
      </p>
    </TooltipBox>
  );
}

export default function ParetoChart({ data }: { data: ParetoEntry[] }) {
  const reduced = useReducedMotion();
  const rows: Row[] = data.map((d) => ({ ...d, code: d.cd_id.replace("CD-", "") }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <ComposedChart data={rows} margin={{ top: 8, right: 8, bottom: 4, left: 4 }}>
        <CartesianGrid stroke={CHART.grid} vertical={false} />
        <XAxis
          dataKey="code"
          tick={AXIS_TICK}
          axisLine={{ stroke: CHART.border }}
          tickLine={false}
        />
        <YAxis
          yAxisId="left"
          tickFormatter={mxnK}
          tick={AXIS_TICK}
          axisLine={false}
          tickLine={false}
          width={46}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          domain={[0, 1]}
          tickFormatter={(v: number) => pct(v)}
          tick={AXIS_TICK}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <Tooltip
          content={<ParetoTip />}
          cursor={{ fill: CHART.panel2, opacity: 0.45 }}
        />
        <Bar
          yAxisId="left"
          dataKey="lost_sales_mxn"
          radius={[3, 3, 0, 0]}
          isAnimationActive={!reduced}
        >
          {rows.map((_, i) => (
            <Cell key={i} fill={CHART.info} fillOpacity={i < 3 ? 1 : 0.32} />
          ))}
        </Bar>
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="cumulative_share"
          stroke={CHART.accent}
          strokeWidth={2}
          dot={{ r: 3, fill: CHART.accent, stroke: CHART.accent }}
          isAnimationActive={!reduced}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
