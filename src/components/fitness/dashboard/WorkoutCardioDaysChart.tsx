"use client";

import { Segmented } from "antd";
import { isString } from "lodash";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  ACTION_GREEN,
  CARDIO_RUN_COLOR,
  CARDIO_SWIM_COLOR,
  RECHARTS_BAR_TOOLTIP_CURSOR,
} from "@/constants/colors";
import { cn } from "@/lib/utils";
import type { FitnessCardioDisplay } from "@/store/useSectionsStore";
import { useSectionsStore } from "@/store/useSectionsStore";
import type { WeeklyActivityDaysItem } from "@/types/fitnessDashboard";

import { ChartCard } from "./ChartCard";
import { chartSeriesSentenceCase } from "./chartUtils";
import {
  CARDIO_DAYS_PER_WEEK_GOAL,
  CHART_TOOLTIP,
  PASTEL_VARS,
  WORKOUT_CARDIO_GOAL_LINE_GREEN,
  WORKOUT_CARDIO_GOAL_LINE_PURPLE,
  WORKOUT_DAYS_PER_WEEK_GOAL,
} from "./constants";

type WorkoutCardioDaysChartProps = {
  weeklyActivityDays: WeeklyActivityDaysItem[];
  yAxisMax: number;
  className?: string;
};

export function WorkoutCardioDaysChart({
  weeklyActivityDays,
  yAxisMax,
  className,
}: WorkoutCardioDaysChartProps) {
  const cardioDisplay = useSectionsStore((s) => s.fitnessCardioDisplay);
  const setFitnessCardioDisplay = useSectionsStore((s) => s.setFitnessCardioDisplay);

  return (
    <ChartCard
      title="Workout & cardio days"
      pastelKey={2}
      className={cn("flex h-full min-h-0 flex-1 flex-col", className)}
      trailing={
        <Segmented
          size="small"
          value={cardioDisplay}
          onChange={(v) => setFitnessCardioDisplay(v as FitnessCardioDisplay)}
          options={[
            { label: "Combined", value: "combined" },
            { label: "Split", value: "split" },
          ]}
          className={cn(
            "shrink-0 [&]:rounded-md [&]:!p-px",
            "[&_.ant-segmented-item]:!h-7 [&_.ant-segmented-item]:!min-h-0 [&_.ant-segmented-item]:!px-2 [&_.ant-segmented-item]:!py-0",
            "[&_.ant-segmented-item-label]:!text-[11px] [&_.ant-segmented-item-label]:!leading-7 sm:[&_.ant-segmented-item-label]:!text-xs"
          )}
        />
      }
    >
      {weeklyActivityDays.length === 0 ? (
        <p className="text-body-sm text-muted-fg sm:text-body">No weekly data yet.</p>
      ) : (
        <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col">
          <div className="h-[148px] w-full min-h-0 sm:h-[168px] md:h-[192px] lg:min-h-[260px] lg:basis-0 lg:flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={weeklyActivityDays}
                margin={{ top: 4, right: 4, bottom: 4, left: 0 }}
                barCategoryGap="25%"
                barGap={0}
              >
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
                  cursor={RECHARTS_BAR_TOOLTIP_CURSOR}
                  formatter={(value: number, name: string) => [
                    `${chartSeriesSentenceCase(name)}: ${value}`,
                    null,
                  ]}
                  labelFormatter={(label) => label}
                />
                <Bar
                  dataKey="workoutDays"
                  fill={ACTION_GREEN}
                  radius={[2, 2, 0, 0]}
                  name="workout"
                  activeBar={false}
                />
                {cardioDisplay === "combined" ? (
                  <Bar
                    dataKey="cardioDays"
                    fill={PASTEL_VARS[4]}
                    radius={[2, 2, 0, 0]}
                    name="cardio"
                    activeBar={false}
                  />
                ) : null}
                {cardioDisplay === "split" ? (
                  <Bar
                    dataKey="runDays"
                    fill={CARDIO_RUN_COLOR}
                    radius={[2, 2, 0, 0]}
                    name="run"
                    activeBar={false}
                  />
                ) : null}
                {cardioDisplay === "split" ? (
                  <Bar
                    dataKey="swimDays"
                    fill={CARDIO_SWIM_COLOR}
                    radius={[2, 2, 0, 0]}
                    name="swim"
                    activeBar={false}
                  />
                ) : null}
                <ReferenceLine
                  y={WORKOUT_DAYS_PER_WEEK_GOAL}
                  stroke={WORKOUT_CARDIO_GOAL_LINE_GREEN}
                  strokeDasharray="6 4"
                  strokeWidth={1}
                  isFront
                  label={{
                    value: `${WORKOUT_DAYS_PER_WEEK_GOAL}× workout`,
                    position: "left",
                    fill: "rgba(163, 230, 53, 0.85)",
                    fontSize: 10,
                  }}
                />
                <ReferenceLine
                  y={CARDIO_DAYS_PER_WEEK_GOAL}
                  stroke={WORKOUT_CARDIO_GOAL_LINE_PURPLE}
                  strokeDasharray="6 4"
                  strokeWidth={1}
                  isFront
                  label={{
                    value: `${CARDIO_DAYS_PER_WEEK_GOAL}× cardio`,
                    position: "right",
                    fill: "rgba(139, 92, 246, 0.9)",
                    fontSize: 10,
                  }}
                />
                <Legend
                  formatter={(value) => (isString(value) ? chartSeriesSentenceCase(value) : value)}
                  wrapperStyle={{ fontSize: "var(--chart-legend)", color: "var(--muted)" }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </ChartCard>
  );
}
