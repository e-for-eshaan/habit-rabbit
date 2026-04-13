"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";

import { CARDIO_RUN_COLOR, CARDIO_SWIM_COLOR } from "@/constants/colors";
import { cn } from "@/lib/utils";
import type { WeeklyVolumeItem } from "@/types/fitnessDashboard";

import { ChartCard } from "./ChartCard";
import { CHART_TOOLTIP } from "./constants";

type SwimVsRunChartProps = {
  weeklyVolume: WeeklyVolumeItem[];
  className?: string;
};

export function SwimVsRunChart({ weeklyVolume, className }: SwimVsRunChartProps) {
  return (
    <ChartCard
      title="Swim vs run"
      pastelKey={3}
      className={cn("flex h-full min-h-0 flex-1 flex-col", className)}
    >
      {weeklyVolume.length === 0 ? (
        <p className="text-body-sm text-muted-fg sm:text-body">No data yet.</p>
      ) : (
        <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col">
          <div className="h-[148px] w-full min-h-0 sm:h-[168px] md:h-[192px] lg:min-h-[260px] lg:basis-0 lg:flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyVolume} margin={{ top: 4, right: 4, bottom: 4, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: "var(--chart-tick)", fill: "var(--chart-axis)" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis hide domain={[0, "auto"]} />
                <RechartsTooltip
                  {...CHART_TOOLTIP}
                  formatter={(value: number, name: string) => [`${name}: ${value}`, null]}
                  labelFormatter={(label) => label}
                />
                <Line
                  type="monotone"
                  dataKey="swimming"
                  stroke={CARDIO_SWIM_COLOR}
                  strokeWidth={2}
                  dot={{ r: 3, fill: CARDIO_SWIM_COLOR }}
                  name="Swim"
                />
                <Line
                  type="monotone"
                  dataKey="running"
                  stroke={CARDIO_RUN_COLOR}
                  strokeWidth={2}
                  dot={{ r: 3, fill: CARDIO_RUN_COLOR }}
                  name="Run"
                />
                <Legend wrapperStyle={{ fontSize: "var(--chart-legend)", color: "var(--muted)" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </ChartCard>
  );
}
