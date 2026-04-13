"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";

import { RECHARTS_BAR_TOOLTIP_CURSOR } from "@/constants/colors";
import { getFreqCounts } from "@/lib/updatesPerDay";
import { cn } from "@/lib/utils";
import type { FreqRange } from "@/store/useSectionsStore";
import type { Section } from "@/types";

type FreqChartProps = {
  section: Section;
  freqRange: FreqRange;
  className?: string;
};

const PASTEL_VARS = [
  "var(--pastel-1)",
  "var(--pastel-2)",
  "var(--pastel-3)",
  "var(--pastel-4)",
  "var(--pastel-5)",
  "var(--pastel-6)",
] as const;

export function FreqChart({ section, freqRange, className }: FreqChartProps) {
  const data = getFreqCounts(section.updates, freqRange);
  const fillColor = PASTEL_VARS[section.colorKey % PASTEL_VARS.length];

  return (
    <div className={cn("h-[120px] w-full", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <XAxis
            dataKey="label"
            tick={{ fontSize: "var(--chart-tick)", fill: "var(--chart-axis)" }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis hide domain={[0, "auto"]} />
          <RechartsTooltip
            cursor={RECHARTS_BAR_TOOLTIP_CURSOR}
            contentStyle={{
              fontSize: "var(--chart-label)",
              borderRadius: 8,
              background: "var(--surface-elevated)",
              border: "1px solid var(--border-subtle)",
              color: "var(--foreground)",
            }}
            labelStyle={{ color: "var(--muted)" }}
            formatter={(value: number) => [
              value === 1 ? "1 update" : `${value} updates`,
              "Updates",
            ]}
            labelFormatter={(label) => label}
          />
          <Bar
            dataKey="count"
            fill={fillColor}
            radius={[2, 2, 0, 0]}
            maxBarSize={24}
            activeBar={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
