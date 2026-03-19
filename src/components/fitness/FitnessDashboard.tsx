"use client";

import { useEffect, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  LineChart,
  Line,
  CartesianGrid,
  AreaChart,
  Area,
  Legend,
} from "recharts";
import { subDays, eachDayOfInterval } from "date-fns";
import type { FitnessState } from "@/types/fitness";
import { getPastelStyle } from "@/constants/colors";
import { cn } from "@/lib/utils";
import { useFitnessDashboardStore } from "@/store/useFitnessDashboardStore";
import { computeFitnessDashboard, getActivityHeatLevel } from "@/lib/fitnessDashboard";
import { getCalendarGrid, toDateKey } from "@/lib/dateRange";

const PASTEL_VARS = [
  "var(--pastel-1)",
  "var(--pastel-2)",
  "var(--pastel-3)",
  "var(--pastel-4)",
  "var(--pastel-5)",
  "var(--pastel-6)",
] as const;

const HEATMAP_DAYS = 84;

function getHeatmapGrid(): (Date | null)[][] {
  const end = new Date();
  const start = subDays(end, HEATMAP_DAYS - 1);
  const days = eachDayOfInterval({ start, end });
  return getCalendarGrid(days);
}

type FitnessDashboardProps = {
  state: FitnessState;
  className?: string;
};

export function FitnessDashboard({ state, className }: FitnessDashboardProps) {
  const setData = useFitnessDashboardStore((s) => s.setData);
  const dashboard = useMemo(() => computeFitnessDashboard(state), [state]);
  const kpis = dashboard.kpis;
  const weeklyVolume = dashboard.weeklyVolume;
  const activityByDay = dashboard.activityByDay;
  const workoutDaysPerWeek = dashboard.workoutDaysPerWeek;
  const groupFreq = dashboard.groupFrequency;
  const leastHit = dashboard.leastHit;
  const missedExercises = dashboard.missedExercises;

  useEffect(() => {
    setData(dashboard);
  }, [dashboard, setData]);

  const heatmapGrid = useMemo(() => getHeatmapGrid(), []);

  return (
    <div className={cn("min-w-0 overflow-x-hidden", className)}>
      <h2 className="mb-3 text-sm font-semibold text-stone-800 dark:text-stone-200 sm:mb-4 sm:text-base md:text-lg">
        Dashboard
      </h2>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 md:grid-cols-4 md:gap-3 lg:grid-cols-6 lg:gap-4">
        {kpis && (
          <>
            <div className="sm:col-span-2 md:col-span-4 lg:col-span-6">
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 sm:gap-2 md:gap-3">
                <KPICard
                  label="This week"
                  value={`${kpis.thisWeekDays} days`}
                  sub={kpis.thisWeekSessions > 0 ? `${kpis.thisWeekSessions} sessions` : undefined}
                  pastelKey={0}
                />
                <KPICard
                  label="Streak"
                  value={kpis.streak > 0 ? `${kpis.streak} days` : "—"}
                  pastelKey={1}
                />
                <KPICard label="Swim (30d)" value={String(kpis.swim30d)} pastelKey={2} />
                <KPICard label="Run (30d)" value={String(kpis.run30d)} pastelKey={3} />
              </div>
            </div>
          </>
        )}

        <div className="sm:col-span-1 md:col-span-1 lg:col-span-2">
          <ActivityHeatmap activityByDay={activityByDay} grid={heatmapGrid} />
        </div>

        <div className="sm:col-span-1 md:col-span-3 lg:col-span-4">
          <ChartCard title="Weekly volume (last 12 weeks)" pastelKey={2}>
            {weeklyVolume.length === 0 ? (
              <p className="text-xs text-stone-500 dark:text-stone-400 sm:text-sm">
                No weekly data yet.
              </p>
            ) : (
              <div className="h-[120px] w-full min-w-0 sm:h-[140px] md:h-[160px] lg:h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyVolume} margin={{ top: 4, right: 4, bottom: 4, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--stone-300)" />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis hide domain={[0, "auto"]} />
                    <RechartsTooltip
                      formatter={(value: number) => [value, ""]}
                      labelFormatter={(label) => `Week ${label}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="exercises"
                      stackId="1"
                      stroke={PASTEL_VARS[0]}
                      fill={PASTEL_VARS[0]}
                      name="Exercises"
                    />
                    <Area
                      type="monotone"
                      dataKey="swimming"
                      stackId="1"
                      stroke={PASTEL_VARS[2]}
                      fill={PASTEL_VARS[2]}
                      name="Swim"
                    />
                    <Area
                      type="monotone"
                      dataKey="running"
                      stackId="1"
                      stroke={PASTEL_VARS[3]}
                      fill={PASTEL_VARS[3]}
                      name="Run"
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </ChartCard>
        </div>

        <div className="sm:col-span-1 md:col-span-2 lg:col-span-3">
          <ChartCard title="Swim vs run (last 12 weeks)" pastelKey={3}>
            {weeklyVolume.length === 0 ? (
              <p className="text-xs text-stone-500 dark:text-stone-400 sm:text-sm">No data yet.</p>
            ) : (
              <div className="h-[100px] w-full min-w-0 sm:h-[120px] md:h-[140px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyVolume} margin={{ top: 4, right: 4, bottom: 4, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--stone-300)" />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis hide domain={[0, "auto"]} />
                    <RechartsTooltip
                      formatter={(value: number) => [value, ""]}
                      labelFormatter={(label) => `Week ${label}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="swimming"
                      stroke={PASTEL_VARS[2]}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      name="Swim"
                    />
                    <Line
                      type="monotone"
                      dataKey="running"
                      stroke={PASTEL_VARS[3]}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      name="Run"
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </ChartCard>
        </div>

        <div className="sm:col-span-1 md:col-span-2 lg:col-span-3">
          <ChartCard title="Workout days per week" pastelKey={4}>
            {workoutDaysPerWeek.length === 0 ? (
              <p className="text-xs text-stone-500 dark:text-stone-400 sm:text-sm">No data yet.</p>
            ) : (
              <div className="h-[100px] w-full min-w-0 sm:h-[120px] md:h-[140px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={workoutDaysPerWeek}
                    margin={{ top: 4, right: 4, bottom: 4, left: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--stone-300)" />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis hide domain={[0, 7]} />
                    <RechartsTooltip
                      formatter={(value: number) => [value, "Days"]}
                      labelFormatter={(label) => `Week ${label}`}
                    />
                    <Bar
                      dataKey="days"
                      fill={PASTEL_VARS[4]}
                      radius={[2, 2, 0, 0]}
                      maxBarSize={24}
                      name="Days"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </ChartCard>
        </div>

        <div className="sm:col-span-1 md:col-span-2 lg:col-span-3">
          <ChartCard title="By muscle group (total completions)" pastelKey={1}>
            {groupFreq.every((g) => g.count === 0) ? (
              <p className="text-xs text-stone-500 dark:text-stone-400 sm:text-sm">No data yet.</p>
            ) : (
              <div className="h-[120px] w-full min-w-0 sm:h-[140px] md:h-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={groupFreq}
                    margin={{ top: 4, right: 4, bottom: 4, left: 0 }}
                    layout="vertical"
                  >
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="group"
                      tick={{ fontSize: 9 }}
                      width={72}
                      tickLine={false}
                      axisLine={false}
                    />
                    <RechartsTooltip
                      formatter={(value: number) => [value, "Days"]}
                      labelFormatter={(label) => label}
                    />
                    <Bar
                      dataKey="count"
                      fill={PASTEL_VARS[1]}
                      radius={[0, 2, 2, 0]}
                      maxBarSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </ChartCard>
        </div>

        <div className="sm:col-span-1 md:col-span-2 lg:col-span-3">
          <ChartCard title="Least hit exercises (days done)" pastelKey={0}>
            {leastHit.length === 0 ? (
              <p className="text-xs text-stone-500 dark:text-stone-400 sm:text-sm">
                Complete exercises on a day to see stats.
              </p>
            ) : (
              <div className="h-[120px] w-full min-w-0 sm:h-[140px] md:h-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={leastHit}
                    margin={{ top: 4, right: 4, bottom: 4, left: 0 }}
                    layout="vertical"
                  >
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="label"
                      tick={{ fontSize: 9 }}
                      width={80}
                      tickLine={false}
                      axisLine={false}
                    />
                    <RechartsTooltip
                      formatter={(value: number) => [value, "Days"]}
                      labelFormatter={(label) => label}
                    />
                    <Bar
                      dataKey="days"
                      fill={PASTEL_VARS[0]}
                      radius={[0, 2, 2, 0]}
                      maxBarSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </ChartCard>
        </div>

        {missedExercises.length > 0 && (
          <div className="sm:col-span-2 md:col-span-4 lg:col-span-6">
            <MissedExercisesCard items={missedExercises} pastelKey={5} />
          </div>
        )}
      </div>
    </div>
  );
}

function KPICard({
  label,
  value,
  sub,
  pastelKey,
}: {
  label: string;
  value: string;
  sub?: string;
  pastelKey: number;
}) {
  const style = getPastelStyle(pastelKey);
  return (
    <div
      className={cn(
        "rounded-md border-2 p-2 shadow-sm sm:rounded-lg sm:p-2.5 md:rounded-xl md:p-3",
        style.border,
        style.light
      )}
    >
      <p className="text-[10px] font-medium uppercase tracking-wide text-stone-500 dark:text-stone-400 sm:text-xs">
        {label}
      </p>
      <p className="mt-0.5 text-xs font-semibold text-stone-800 dark:text-stone-200 sm:text-sm md:text-base">
        {value}
      </p>
      {sub && (
        <p className="mt-0.5 text-[10px] text-stone-600 dark:text-stone-400 sm:text-xs">{sub}</p>
      )}
    </div>
  );
}

const HEATMAP_GAP = 1;
const HEATMAP_COLS = 7;

function ActivityHeatmap({
  activityByDay,
  grid,
}: {
  activityByDay: Record<string, number>;
  grid: (Date | null)[][];
}) {
  const style = getPastelStyle(2);
  const hasAny = Object.values(activityByDay).some((c) => c > 0);
  const flatCells = useMemo(() => grid.flat(), [grid]);
  const cellFlexBasis = `calc((100% - ${(HEATMAP_COLS - 1) * HEATMAP_GAP}px) / ${HEATMAP_COLS})`;

  return (
    <div
      className={cn(
        "flex min-h-full min-w-0 flex-col rounded-lg border-2 p-2.5 shadow-sm sm:rounded-xl sm:p-3 md:p-4",
        style.border,
        style.light
      )}
    >
      <h3 className="mb-1.5 text-xs font-medium text-stone-700 dark:text-stone-300 sm:mb-2 sm:text-sm">
        Activity (last 12 weeks)
      </h3>
      {!hasAny ? (
        <p className="text-xs text-stone-500 dark:text-stone-400 sm:text-sm">
          Log activity to see your calendar.
        </p>
      ) : (
        <div
          className="flex w-full max-w-[98px] flex-wrap gap-px sm:max-w-[112px] md:max-w-[126px] lg:max-w-[140px]"
          style={{ flex: "1 1 0" }}
        >
          {flatCells.map((d, i) => {
            if (!d) {
              return (
                <div
                  key={`empty-${i}`}
                  className="rounded-[1px] border border-stone-200/60 dark:border-stone-600/60 opacity-0"
                  style={{
                    flex: `0 0 ${cellFlexBasis}`,
                    aspectRatio: "1",
                  }}
                />
              );
            }
            const dateKey = toDateKey(d);
            const count = activityByDay[dateKey] ?? 0;
            const level = getActivityHeatLevel(count, activityByDay);
            const title = `${dateKey}${count > 0 ? ` · ${count} session${count !== 1 ? "s" : ""}` : ""}`;
            return (
              <div
                key={dateKey}
                title={title}
                className={cn(
                  "min-w-0 rounded-[1px] border border-stone-200/60 dark:border-stone-600/60",
                  level === 0 && "heat-0",
                  level === 1 && "heat-1",
                  level === 2 && "heat-2",
                  level === 3 && "heat-3",
                  level === 4 && "heat-4",
                  level === 5 && "heat-5"
                )}
                style={{
                  flex: `0 0 ${cellFlexBasis}`,
                  aspectRatio: "1",
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function ChartCard({
  title,
  pastelKey,
  children,
}: {
  title: string;
  pastelKey: number;
  children: React.ReactNode;
}) {
  const style = getPastelStyle(pastelKey);
  return (
    <div
      className={cn(
        "min-w-0 rounded-lg border-2 p-2.5 shadow-sm sm:rounded-xl sm:p-3 md:p-4",
        style.border,
        style.light
      )}
    >
      <h3 className="mb-1.5 text-xs font-medium text-stone-700 dark:text-stone-300 sm:mb-2 sm:text-sm">
        {title}
      </h3>
      {children}
    </div>
  );
}

function MissedExercisesCard({
  items,
  pastelKey,
}: {
  items: { id: string; label: string; group: string; daysSinceLastDone: number }[];
  pastelKey: number;
}) {
  const style = getPastelStyle(pastelKey);
  return (
    <div
      className={cn(
        "min-w-0 rounded-lg border-2 p-2.5 shadow-sm sm:rounded-xl sm:p-3 md:p-4",
        style.border,
        style.light
      )}
    >
      <h3 className="mb-1.5 text-xs font-medium text-stone-700 dark:text-stone-300 sm:mb-2 sm:text-sm">
        Haven’t done in 14+ days
      </h3>
      <div className="flex flex-wrap gap-1 sm:gap-1.5 md:gap-2">
        {items.map((item) => (
          <span
            key={item.id}
            className={cn(
              "inline-flex max-w-full items-center rounded border px-1.5 py-0.5 text-[11px] font-medium sm:max-w-none sm:rounded-md sm:px-2 sm:py-1 sm:text-xs",
              "border-stone-300 bg-stone-100 text-stone-700 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300"
            )}
            title={`${item.label} (${item.group}) · ${item.daysSinceLastDone} days ago`}
          >
            <span className="truncate max-w-[80px] sm:max-w-[120px] md:max-w-[160px]">
              {item.label}
            </span>
            <span className="ml-1 shrink-0 text-stone-500 dark:text-stone-400">
              {item.daysSinceLastDone}d
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
