"use client";

import { eachDayOfInterval, format, subDays } from "date-fns";
import { isNil } from "lodash";
import { Check, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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

import { CARDIO_RUN_COLOR, CARDIO_SWIM_COLOR, getPastelAccentVar } from "@/constants/colors";
import { getCalendarGrid, toDateKey } from "@/lib/dateRange";
import { EXERCISE_GROUPS } from "@/lib/fitnessConstants";
import { computeFitnessDashboard, getActivityHeatLevel } from "@/lib/fitnessDashboard";
import { cn } from "@/lib/utils";
import { useFitnessDashboardStore } from "@/store/useFitnessDashboardStore";
import type { DayLog, Exercise, FitnessState } from "@/types/fitness";
import type { ActivityDayBreakdown } from "@/types/fitnessDashboard";

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
  const activityBreakdownByDay = dashboard.activityBreakdownByDay;
  const workoutDaysPerWeek = dashboard.workoutDaysPerWeek;
  const groupFreq = dashboard.groupFrequency;
  const leastHit = dashboard.leastHit;
  const missedExercises = dashboard.missedExercises;

  const sharedVerticalBarAxisMax = useMemo(() => {
    const maxGroup = Math.max(0, ...groupFreq.map((g) => g.count));
    const maxLeast = Math.max(0, ...leastHit.map((h) => h.days));
    return Math.max(1, maxGroup, maxLeast);
  }, [groupFreq, leastHit]);

  useEffect(() => {
    setData(dashboard);
  }, [dashboard, setData]);

  const heatmapGrid = useMemo(() => getHeatmapGrid(), []);

  return (
    <div className={cn("min-w-0 overflow-x-hidden", className)}>
      <h2 className="mb-inline text-title font-semibold tracking-tight text-foreground sm:mb-stack sm:text-display">
        Dashboard
      </h2>

      <div className="grid grid-cols-1 items-stretch gap-tight sm:grid-cols-2 sm:gap-inline md:grid-cols-4 md:gap-inline lg:grid-cols-6 lg:gap-stack">
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

        <div className="flex min-h-0 flex-col sm:col-span-1 md:col-span-1 lg:col-span-2">
          <ActivityHeatmap
            className="h-full min-h-0 flex-1"
            fitnessState={state}
            activityByDay={activityByDay}
            activityBreakdownByDay={activityBreakdownByDay}
            grid={heatmapGrid}
          />
        </div>

        <div className="flex min-h-0 flex-col sm:col-span-1 md:col-span-3 lg:col-span-4">
          <ChartCard
            title="Weekly volume (last 12 weeks)"
            pastelKey={2}
            className="flex h-full min-h-0 flex-1 flex-col"
          >
            {weeklyVolume.length === 0 ? (
              <p className="text-body-sm text-muted-fg sm:text-body">No weekly data yet.</p>
            ) : (
              <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col">
                <div className="h-[120px] w-full min-h-0 sm:h-[140px] md:h-[160px] lg:min-h-[220px] lg:basis-0 lg:flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={weeklyVolume}
                      margin={{ top: 4, right: 4, bottom: 4, left: 0 }}
                    >
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
                        stroke={CARDIO_SWIM_COLOR}
                        fill={CARDIO_SWIM_COLOR}
                        name="Swim"
                      />
                      <Area
                        type="monotone"
                        dataKey="running"
                        stackId="1"
                        stroke={CARDIO_RUN_COLOR}
                        fill={CARDIO_RUN_COLOR}
                        name="Run"
                      />
                      <Legend
                        wrapperStyle={{ fontSize: "var(--chart-legend)", color: "var(--muted)" }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
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
              <div className="h-[152px] w-full min-w-0 sm:h-[144px] md:h-[168px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={groupFreq}
                    margin={{ top: 4, right: 4, bottom: 4, left: 4 }}
                    layout="vertical"
                  >
                    <XAxis type="number" domain={[0, sharedVerticalBarAxisMax]} hide />
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
                      formatter={(value: number) => [value, "Completions"]}
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
              <div className="h-[152px] w-full min-w-0 sm:h-[144px] md:h-[168px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={leastHit}
                    margin={{ top: 4, right: 4, bottom: 4, left: 4 }}
                    layout="vertical"
                  >
                    <XAxis type="number" domain={[0, sharedVerticalBarAxisMax]} hide />
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

const HEATMAP_SWIM_COLOR = "#0369a1";
const HEATMAP_RUN_COLOR = "#f87171";

function heatmapCellBackground(level: number): string {
  return `var(--heat-${level})`;
}

const EMPTY_BREAKDOWN: ActivityDayBreakdown = {
  exercises: 0,
  swimming: 0,
  running: 0,
};

function formatActivityDetailDate(dateKey: string): string {
  const d = new Date(`${dateKey}T12:00:00`);
  if (Number.isNaN(d.getTime())) return dateKey;
  return format(d, "EEE, d MMMM");
}

function ActivityHeatmap({
  fitnessState,
  activityByDay,
  activityBreakdownByDay,
  grid,
  className,
}: {
  fitnessState: Pick<FitnessState, "exercises" | "dayLogs">;
  activityByDay: Record<string, number>;
  activityBreakdownByDay: Record<string, ActivityDayBreakdown>;
  grid: (Date | null)[][];
  className?: string;
}) {
  const accent = getPastelAccentVar(2);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const hasAny = Object.values(activityByDay).some((c) => c > 0);
  const flatCells = useMemo(() => grid.flat(), [grid]);
  const cellFlexBasis = `calc((100% - ${(HEATMAP_COLS - 1) * HEATMAP_GAP}px) / ${HEATMAP_COLS})`;

  return (
    <div
      className={cn(
        "flex min-h-full min-w-0 flex-col rounded-xl border border-border-subtle bg-surface-elevated/30 p-card",
        className
      )}
      style={{ borderLeftWidth: 3, borderLeftColor: accent }}
    >
      <h3 className="mb-tight text-body-sm font-medium text-muted sm:mb-inline sm:text-body">
        Activity (last 12 weeks)
      </h3>
      {!hasAny ? (
        <p className="flex flex-1 items-center text-body-sm text-muted-fg sm:text-body lg:min-h-[120px]">
          Log activity to see your calendar.
        </p>
      ) : (
        <div className="flex min-h-0 flex-1 flex-row items-start gap-inline">
          <div
            className="flex w-full max-w-[98px] shrink-0 flex-wrap content-start gap-px sm:max-w-[112px] md:max-w-[126px] lg:max-w-[140px]"
            style={{ flex: "1 1 0" }}
            role="grid"
            aria-label="Activity heatmap, last 12 weeks"
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
                    aria-hidden
                  />
                );
              }
              const dateKey = toDateKey(d);
              const count = activityByDay[dateKey] ?? 0;
              const level = getActivityHeatLevel(count, activityByDay);
              const selected = selectedDateKey === dateKey;
              const total = count;
              const breakdown = activityBreakdownByDay[dateKey] ?? EMPTY_BREAKDOWN;
              const hasSwim = breakdown.swimming > 0;
              const hasRun = breakdown.running > 0;
              const swimRunParts = [hasSwim ? "swim" : "", hasRun ? "run" : ""].filter(Boolean);
              const swimRunLabel = swimRunParts.length > 0 ? `, ${swimRunParts.join(", ")}` : "";
              const heatBg = heatmapCellBackground(level);
              return (
                <button
                  key={dateKey}
                  type="button"
                  onClick={() => setSelectedDateKey((prev) => (prev === dateKey ? null : dateKey))}
                  className="relative min-w-0 cursor-pointer overflow-hidden rounded-[1px] border border-border-subtle p-0 transition-[filter] hover:brightness-110 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-lime-400/80 focus-visible:ring-offset-1 focus-visible:ring-offset-zinc-950"
                  style={{
                    flex: `0 0 ${cellFlexBasis}`,
                    aspectRatio: "1",
                  }}
                  aria-label={`${formatActivityDetailDate(dateKey)}, ${total === 0 ? "no activity" : `${total} sessions`}${swimRunLabel}`}
                  aria-pressed={selected}
                >
                  <span
                    className="grid size-full min-h-0 min-w-0 grid-cols-2 grid-rows-2"
                    aria-hidden
                  >
                    <span
                      className="min-h-0 min-w-0"
                      style={{
                        backgroundColor: hasSwim ? HEATMAP_SWIM_COLOR : heatBg,
                      }}
                    />
                    <span
                      className="min-h-0 min-w-0"
                      style={{
                        backgroundColor: hasRun ? HEATMAP_RUN_COLOR : heatBg,
                      }}
                    />
                    <span className="min-h-0 min-w-0" style={{ backgroundColor: heatBg }} />
                    <span className="min-h-0 min-w-0" style={{ backgroundColor: heatBg }} />
                  </span>
                  {selected ? (
                    <span
                      className="pointer-events-none absolute bottom-0.5 right-0.5 size-1.5 rounded-full bg-lime-400 ring-1 ring-zinc-950/70 sm:size-2"
                      aria-hidden
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
          {selectedDateKey !== null && (
            <ActivityDayDetailPanel
              dateKey={selectedDateKey}
              breakdown={activityBreakdownByDay[selectedDateKey] ?? EMPTY_BREAKDOWN}
              exercises={fitnessState.exercises}
              dayLog={fitnessState.dayLogs.find((l) => l.dateKey === selectedDateKey)}
              onClose={() => setSelectedDateKey(null)}
            />
          )}
        </div>
      )}
    </div>
  );
}

function ActivityDayDetailPanel({
  dateKey,
  breakdown,
  exercises,
  dayLog,
  onClose,
}: {
  dateKey: string;
  breakdown: ActivityDayBreakdown;
  exercises: Exercise[];
  dayLog: DayLog | undefined;
  onClose: () => void;
}) {
  const groupRows = useMemo(
    () => buildActivityDetailGroupRows(dayLog, exercises),
    [dayLog, exercises]
  );
  const hasSwim = breakdown.swimming > 0;
  const hasRun = breakdown.running > 0;
  const hasAny = groupRows.length > 0 || hasSwim || hasRun;
  return (
    <div className="min-w-0 w-fit max-w-48 shrink-0 rounded-lg border border-border-subtle bg-surface/80 px-2 py-1.5 ring-1 ring-border-subtle sm:max-w-56 sm:px-2.5 sm:py-2">
      <div className="mb-tight flex items-start justify-between gap-tight">
        <p className="text-caption font-semibold text-foreground sm:text-body-sm">
          {formatActivityDetailDate(dateKey)}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="flex size-3.5 shrink-0 items-center justify-center rounded-sm text-muted-fg hover:bg-surface-elevated hover:text-foreground"
          aria-label="Close day details"
        >
          <X className="size-2.5" strokeWidth={2.5} aria-hidden />
        </button>
      </div>
      {!hasAny ? (
        <p className="text-caption text-muted-fg sm:text-body-sm">No activity logged.</p>
      ) : (
        <ul className="flex flex-col gap-1.5 text-caption text-foreground sm:text-body-sm">
          {groupRows.map((row) => (
            <li
              key={row.label}
              className="flex items-center justify-between gap-2"
              aria-label={`${row.label}: ${row.count} exercises`}
            >
              <span className="min-w-0 truncate text-muted-fg">{row.label}</span>
              <span className="shrink-0 tabular-nums font-medium">{row.count}</span>
            </li>
          ))}
          {hasSwim && (
            <li className="flex items-center justify-between gap-2" aria-label="Swimming: done">
              <span className="text-muted-fg">Swimming</span>
              <Check className="size-3.5 shrink-0 text-emerald-400" strokeWidth={2.5} aria-hidden />
            </li>
          )}
          {hasRun && (
            <li className="flex items-center justify-between gap-2" aria-label="Running: done">
              <span className="text-muted-fg">Running</span>
              <Check className="size-3.5 shrink-0 text-emerald-400" strokeWidth={2.5} aria-hidden />
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

function buildActivityDetailGroupRows(
  dayLog: DayLog | undefined,
  exercises: Exercise[]
): { label: string; count: number }[] {
  if (isNil(dayLog) || dayLog.exerciseIds.length === 0) return [];
  const byId = new Map(exercises.map((e) => [e.id, e]));
  const countsByGroup: Record<string, number> = {};
  for (const id of dayLog.exerciseIds) {
    const ex = byId.get(id);
    if (ex) countsByGroup[ex.group] = (countsByGroup[ex.group] ?? 0) + 1;
  }
  const canonical = new Set<string>(EXERCISE_GROUPS as unknown as string[]);
  const ordered: { label: string; count: number }[] = [];
  for (const g of EXERCISE_GROUPS) {
    const c = countsByGroup[g];
    if (c > 0) ordered.push({ label: g, count: c });
  }
  const extras = Object.keys(countsByGroup)
    .filter((g) => !canonical.has(g))
    .sort();
  for (const g of extras) {
    const c = countsByGroup[g];
    if (c > 0) ordered.push({ label: g, count: c });
  }
  return ordered;
}

function ChartCard({
  title,
  pastelKey,
  children,
  className,
}: {
  title: string;
  pastelKey: number;
  children: React.ReactNode;
  className?: string;
}) {
  const accent = getPastelAccentVar(pastelKey);
  return (
    <div
      className={cn(
        "min-w-0 rounded-xl border border-border-subtle bg-surface-elevated/30 p-card",
        className
      )}
      style={{ borderLeftWidth: 3, borderLeftColor: accent }}
    >
      <h3 className="mb-tight shrink-0 text-body-sm font-medium text-muted sm:mb-inline sm:text-body">
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
