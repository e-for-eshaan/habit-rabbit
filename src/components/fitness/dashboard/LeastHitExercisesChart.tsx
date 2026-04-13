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
import type { LeastHitItem } from "@/types/fitnessDashboard";

import { ChartCard } from "./ChartCard";
import { CHART_TOOLTIP, PASTEL_VARS } from "./constants";

type LeastHitExercisesChartProps = {
  leastHit: LeastHitItem[];
  xAxisMax: number;
};

export function LeastHitExercisesChart({ leastHit, xAxisMax }: LeastHitExercisesChartProps) {
  return (
    <ChartCard title="Least hit exercises (days done)" pastelKey={0}>
      {leastHit.length === 0 ? (
        <p className="text-body-sm text-muted-fg sm:text-body">
          Complete exercises on a day to see stats.
        </p>
      ) : (
        <div className="h-[176px] w-full min-w-0 sm:h-[168px] md:h-[192px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={leastHit}
              margin={{ top: 4, right: 4, bottom: 4, left: 4 }}
              layout="vertical"
            >
              <XAxis type="number" domain={[0, xAxisMax]} hide />
              <YAxis
                type="category"
                dataKey="label"
                interval={0}
                tick={{ fontSize: "var(--chart-tick)", fill: "var(--chart-axis)" }}
                width={128}
                tickLine={false}
                axisLine={false}
              />
              <RechartsTooltip
                {...CHART_TOOLTIP}
                cursor={RECHARTS_BAR_TOOLTIP_CURSOR}
                formatter={(value: number) => [`${value} days`, null]}
                labelFormatter={(label) => label}
              />
              <Bar
                dataKey="days"
                fill={PASTEL_VARS[0]}
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
