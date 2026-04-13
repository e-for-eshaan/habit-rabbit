"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";

import { cn } from "@/lib/utils";
import type { WorkoutDaysPerWeekItem } from "@/types/fitnessDashboard";

import { ChartCard } from "./ChartCard";
import { CHART_TOOLTIP, PASTEL_VARS, WORKOUT_DAYS_PER_WEEK_GOAL } from "./constants";

type WorkoutDaysPerWeekChartProps = {
  workoutDaysPerWeek: WorkoutDaysPerWeekItem[];
  yAxisMax: number;
  className?: string;
};

export function WorkoutDaysPerWeekChart({
  workoutDaysPerWeek,
  yAxisMax,
  className,
}: WorkoutDaysPerWeekChartProps) {
  return (
    <ChartCard
      title="Workout days per week"
      pastelKey={4}
      className={cn("flex h-full min-h-0 flex-1 flex-col", className)}
    >
      {workoutDaysPerWeek.length === 0 ? (
        <p className="text-body-sm text-muted-fg sm:text-body">No data yet.</p>
      ) : (
        <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col">
          <div className="h-[148px] w-full min-h-0 sm:h-[168px] md:h-[192px] lg:min-h-[260px] lg:basis-0 lg:flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workoutDaysPerWeek} margin={{ top: 4, right: 4, bottom: 4, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: "var(--chart-tick)", fill: "var(--chart-axis)" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis hide domain={[0, yAxisMax]} />
                <RechartsTooltip
                  {...CHART_TOOLTIP}
                  formatter={(value: number) => [`${value} days`, null]}
                  labelFormatter={(label) => label}
                />
                <Bar
                  dataKey="days"
                  fill={PASTEL_VARS[4]}
                  radius={[2, 2, 0, 0]}
                  maxBarSize={24}
                  name="Days active"
                />
                <ReferenceLine
                  y={WORKOUT_DAYS_PER_WEEK_GOAL}
                  stroke="var(--muted-fg)"
                  strokeDasharray="6 4"
                  strokeWidth={1}
                  isFront
                  label={{
                    value: `${WORKOUT_DAYS_PER_WEEK_GOAL}×/wk goal`,
                    position: "right",
                    fill: "var(--muted-fg)",
                    fontSize: 11,
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </ChartCard>
  );
}
