"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";
import type { Section } from "@/types";
import { getFreqCounts } from "@/lib/updatesPerDay";
import type { FreqRange } from "@/store/useSectionsStore";
import { cn } from "@/lib/utils";

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
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis hide domain={[0, "auto"]} />
          <RechartsTooltip
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
            }}
            formatter={(value: number) => [
              value === 1 ? "1 update" : `${value} updates`,
              "Updates",
            ]}
            labelFormatter={(label) => label}
          />
          <Bar dataKey="count" fill={fillColor} radius={[2, 2, 0, 0]} maxBarSize={24} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
