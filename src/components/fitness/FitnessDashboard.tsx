"use client";

import { eachDayOfInterval, subDays } from "date-fns";
import { useEffect, useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getPastelAccentVar } from "@/constants/colors";
import { getCalendarGrid, toDateKey } from "@/lib/dateRange";
import { computeFitnessDashboard, getActivityHeatLevel } from "@/lib/fitnessDashboard";
import { cn } from "@/lib/utils";
import { useFitnessDashboardStore } from "@/store/useFitnessDashboardStore";
import type { FitnessState } from "@/types/fitness";

const PASTEL_VARS = [
  "var(--pastel-1)",
  "var(--pastel-2)",
  "var(--pastel-3)",
  "var(--pastel-4)",
  "var(--pastel-5)",
  "var(--pastel-6)",
] as const;

const HEATMAP_DAYS = 84;

const CHART_TOOLTIP = {
  contentStyle: {
    background: "var(--surface-elevated)",
    border: "1px solid var(--border-subtle)",
    borderRadius: 8,
    fontSize: "var(--chart-label)",
    color: "var(--foreground)",
  },
  labelStyle: { color: "var(--muted)" },
} as const;

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
      <h2 className="mb-inline text-title font-semibold tracking-tight text-foreground sm:mb-stack sm:text-display">
        Dashboard
      </h2>

      <div className="grid grid-cols-1 gap-tight sm:grid-cols-2 sm:gap-inline md:grid-cols-4 md:gap-inline lg:grid-cols-6 lg:gap-stack">
        {kpis && (
          <>
            <div className="sm:col-span-2 md:col-span-4 lg:col-span-6">
              <div className="grid grid-cols-2 gap-tight sm:grid-cols-4 sm:gap-tight md:gap-inline">
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
              <p className="text-body-sm text-muted-fg sm:text-body">No weekly data yet.</p>
            ) : (
              <div className="h-[120px] w-full min-w-0 sm:h-[140px] md:h-[160px] lg:h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyVolume} margin={{ top: 4, right: 4, bottom: 4, left: 0 }}>
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
                    <Legend
                      wrapperStyle={{ fontSize: "var(--chart-legend)", color: "var(--muted)" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </ChartCard>
        </div>

        <div className="sm:col-span-1 md:col-span-2 lg:col-span-3">
          <ChartCard title="Swim vs run (last 12 weeks)" pastelKey={3}>
            {weeklyVolume.length === 0 ? (
              <p className="text-body-sm text-muted-fg sm:text-body">No data yet.</p>
            ) : (
              <div className="h-[100px] w-full min-w-0 sm:h-[120px] md:h-[140px]">
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
                    <Legend
                      wrapperStyle={{ fontSize: "var(--chart-legend)", color: "var(--muted)" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </ChartCard>
        </div>

        <div className="sm:col-span-1 md:col-span-2 lg:col-span-3">
          <ChartCard title="Workout days per week" pastelKey={4}>
            {workoutDaysPerWeek.length === 0 ? (
              <p className="text-body-sm text-muted-fg sm:text-body">No data yet.</p>
            ) : (
              <div className="h-[100px] w-full min-w-0 sm:h-[120px] md:h-[140px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={workoutDaysPerWeek}
                    margin={{ top: 4, right: 4, bottom: 4, left: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: "var(--chart-tick)", fill: "var(--chart-axis)" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis hide domain={[0, 7]} />
                    <RechartsTooltip
                      {...CHART_TOOLTIP}
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
              <p className="text-body-sm text-muted-fg sm:text-body">No data yet.</p>
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
                      tick={{ fontSize: "var(--chart-tick)", fill: "var(--chart-axis)" }}
                      width={72}
                      tickLine={false}
                      axisLine={false}
                    />
                    <RechartsTooltip
                      {...CHART_TOOLTIP}
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
              <p className="text-body-sm text-muted-fg sm:text-body">
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
                      tick={{ fontSize: "var(--chart-tick)", fill: "var(--chart-axis)" }}
                      width={80}
                      tickLine={false}
                      axisLine={false}
                    />
                    <RechartsTooltip
                      {...CHART_TOOLTIP}
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
  const accent = getPastelAccentVar(pastelKey);
  return (
    <div
      className="rounded-xl border border-border-subtle bg-surface-elevated/30 p-card"
      style={{ borderLeftWidth: 3, borderLeftColor: accent }}
    >
      <p className="text-caption font-medium uppercase tracking-wide text-muted-fg sm:text-body-sm">
        {label}
      </p>
      <p className="mt-0.5 text-body-sm font-semibold text-foreground sm:text-body md:text-title">
        {value}
      </p>
      {sub && <p className="mt-0.5 text-caption text-muted sm:text-body-sm">{sub}</p>}
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
  const accent = getPastelAccentVar(2);
  const hasAny = Object.values(activityByDay).some((c) => c > 0);
  const flatCells = useMemo(() => grid.flat(), [grid]);
  const cellFlexBasis = `calc((100% - ${(HEATMAP_COLS - 1) * HEATMAP_GAP}px) / ${HEATMAP_COLS})`;

  return (
    <div
      className="flex min-h-full min-w-0 flex-col rounded-xl border border-border-subtle bg-surface-elevated/30 p-card"
      style={{ borderLeftWidth: 3, borderLeftColor: accent }}
    >
      <h3 className="mb-tight text-body-sm font-medium text-muted sm:mb-inline sm:text-body">
        Activity (last 12 weeks)
      </h3>
      {!hasAny ? (
        <p className="text-body-sm text-muted-fg sm:text-body">
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
                  className="rounded-[1px] border border-border-subtle opacity-0"
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
                  "min-w-0 rounded-[1px] border border-border-subtle",
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
  const accent = getPastelAccentVar(pastelKey);
  return (
    <div
      className="min-w-0 rounded-xl border border-border-subtle bg-surface-elevated/30 p-card"
      style={{ borderLeftWidth: 3, borderLeftColor: accent }}
    >
      <h3 className="mb-tight text-body-sm font-medium text-muted sm:mb-inline sm:text-body">
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
  const accent = getPastelAccentVar(pastelKey);
  return (
    <div
      className="min-w-0 rounded-xl border border-border-subtle bg-surface-elevated/30 p-card"
      style={{ borderLeftWidth: 3, borderLeftColor: accent }}
    >
      <h3 className="mb-tight text-body-sm font-medium text-muted sm:mb-inline sm:text-body">
        Haven’t done in 14+ days
      </h3>
      <div className="flex flex-wrap gap-px sm:gap-tight md:gap-inline">
        {items.map((item) => (
          <span
            key={item.id}
            className="inline-flex max-w-full items-center rounded-md border border-border-subtle bg-surface px-2 py-1 text-caption font-medium text-foreground sm:max-w-none sm:text-body-sm"
            title={`${item.label} (${item.group}) · ${item.daysSinceLastDone} days ago`}
          >
            <span className="max-w-[80px] truncate sm:max-w-[120px] md:max-w-[160px]">
              {item.label}
            </span>
            <span className="ml-1 shrink-0 text-muted-fg">{item.daysSinceLastDone}d</span>
          </span>
        ))}
      </div>
    </div>
  );
}
