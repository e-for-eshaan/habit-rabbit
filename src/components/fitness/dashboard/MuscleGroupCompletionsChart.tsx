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
import type { GroupFreqItem } from "@/types/fitnessDashboard";

import { ChartCard } from "./ChartCard";
import { CHART_TOOLTIP, PASTEL_VARS } from "./constants";

type MuscleGroupCompletionsChartProps = {
  groupFreq: GroupFreqItem[];
  xAxisMax: number;
};

export function MuscleGroupCompletionsChart({
  groupFreq,
  xAxisMax,
}: MuscleGroupCompletionsChartProps) {
  return (
    <ChartCard title="By muscle group (total completions)" pastelKey={1}>
      {groupFreq.every((g) => g.count === 0) ? (
        <p className="text-body-sm text-muted-fg sm:text-body">No data yet.</p>
      ) : (
        <div className="h-[176px] w-full min-w-0 sm:h-[168px] md:h-[192px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={groupFreq}
              margin={{ top: 4, right: 4, bottom: 4, left: 4 }}
              layout="vertical"
            >
              <XAxis type="number" domain={[0, xAxisMax]} hide />
              <YAxis
                type="category"
                dataKey="group"
                interval={0}
                tick={{ fontSize: "var(--chart-tick)", fill: "var(--chart-axis)" }}
                width={108}
                tickLine={false}
                axisLine={false}
              />
              <RechartsTooltip
                {...CHART_TOOLTIP}
                cursor={RECHARTS_BAR_TOOLTIP_CURSOR}
                formatter={(value: number) => [`${value} completions`, null]}
                labelFormatter={(label) => label}
              />
              <Bar
                dataKey="count"
                fill={PASTEL_VARS[1]}
                radius={[0, 2, 2, 0]}
                maxBarSize={20}
                activeBar={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
}
