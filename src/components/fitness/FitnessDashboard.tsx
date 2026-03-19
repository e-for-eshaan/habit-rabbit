"use client";

import { useMemo } from "react";
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
} from "recharts";
import type { FitnessState, Exercise } from "@/types/fitness";
import { getPastelStyle } from "@/constants/colors";
import { cn } from "@/lib/utils";

const LEAST_HIT_COUNT = 8;
const PASTEL_VARS = [
  "var(--pastel-1)",
  "var(--pastel-2)",
  "var(--pastel-3)",
  "var(--pastel-4)",
  "var(--pastel-5)",
  "var(--pastel-6)",
] as const;

function getWeekStartFromDateKey(dateKey: string): string {
  const d = new Date(dateKey + "T12:00:00");
  const day = d.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + mondayOffset);
  const y = monday.getFullYear();
  const m = String(monday.getMonth() + 1).padStart(2, "0");
  const dd = String(monday.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function getLeastHit(state: FitnessState, exerciseById: Map<string, Exercise>) {
  const nonMuted = state.exercises.filter((e) => !e.muted);
  const counts = new Map<string, number>();
  for (const ex of nonMuted) counts.set(ex.id, 0);
  for (const log of state.dayLogs) {
    for (const id of log.exerciseIds) {
      if (counts.has(id)) {
        const prev = counts.get(id) ?? 0;
        counts.set(id, prev + 1);
      }
    }
  }
  return Array.from(counts.entries())
    .map(([id, days]) => ({ id, days, label: exerciseById.get(id)?.label ?? id }))
    .sort((a, b) => a.days - b.days)
    .slice(0, LEAST_HIT_COUNT);
}

function getWeeklyVolume(state: FitnessState) {
  const byWeek = new Map<
    string,
    { weekStart: string; label: string; exercises: number; swimming: number; running: number }
  >();
  for (const log of state.dayLogs) {
    const weekStart = getWeekStartFromDateKey(log.dateKey);
    const existing = byWeek.get(weekStart);
    if (existing) {
      existing.exercises += log.exerciseIds.length;
      existing.swimming += log.swimmingSessions;
      existing.running += log.runningSessions;
    } else {
      byWeek.set(weekStart, {
        weekStart,
        label: weekStart.slice(5, 10),
        exercises: log.exerciseIds.length,
        swimming: log.swimmingSessions,
        running: log.runningSessions,
      });
    }
  }
  return Array.from(byWeek.values())
    .map((w) => ({ ...w, total: w.exercises + w.swimming + w.running }))
    .sort((a, b) => a.weekStart.localeCompare(b.weekStart))
    .slice(-12);
}

function getGroupFrequency(state: FitnessState) {
  const byGroup = new Map<string, number>();
  for (const ex of state.exercises) byGroup.set(ex.group, 0);
  for (const log of state.dayLogs) {
    for (const id of log.exerciseIds) {
      const ex = state.exercises.find((e) => e.id === id);
      if (ex) byGroup.set(ex.group, (byGroup.get(ex.group) ?? 0) + 1);
    }
  }
  return Array.from(byGroup.entries())
    .map(([group, count]) => ({ group, count }))
    .sort((a, b) => b.count - a.count);
}

type FitnessDashboardProps = {
  state: FitnessState;
  className?: string;
};

export function FitnessDashboard({ state, className }: FitnessDashboardProps) {
  const exerciseById = useMemo(
    () => new Map(state.exercises.map((e) => [e.id, e])),
    [state.exercises]
  );
  const leastHit = useMemo(() => getLeastHit(state, exerciseById), [state, exerciseById]);
  const weeklyVolume = useMemo(() => getWeeklyVolume(state), [state]);
  const groupFreq = useMemo(() => getGroupFrequency(state), [state]);

  return (
    <div className={cn("flex flex-col gap-4 sm:gap-6", className)}>
      <h2 className="text-base font-semibold text-stone-800 dark:text-stone-200 sm:text-lg">
        Dashboard
      </h2>

      <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2">
        <div
          className={cn(
            "rounded-lg border-2 p-3 shadow-sm sm:rounded-xl sm:p-4",
            getPastelStyle(0).border,
            getPastelStyle(0).light
          )}
        >
          <h3 className="mb-2 text-xs font-medium text-stone-700 dark:text-stone-300 sm:mb-3 sm:text-sm">
            Least hit exercises (days done)
          </h3>
          {leastHit.length === 0 ? (
            <p className="text-xs text-stone-500 dark:text-stone-400 sm:text-sm">
              Complete exercises on a day to see stats.
            </p>
          ) : (
            <ul className="flex flex-col gap-1 sm:gap-1.5">
              {leastHit.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between text-xs text-stone-700 dark:text-stone-300 sm:text-sm"
                >
                  <span className="truncate">{item.label}</span>
                  <span className="shrink-0 font-medium">{item.days}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div
          className={cn(
            "rounded-lg border-2 p-3 shadow-sm sm:rounded-xl sm:p-4",
            getPastelStyle(1).border,
            getPastelStyle(1).light
          )}
        >
          <h3 className="mb-2 text-xs font-medium text-stone-700 dark:text-stone-300 sm:mb-3 sm:text-sm">
            By muscle group (total completions)
          </h3>
          {groupFreq.every((g) => g.count === 0) ? (
            <p className="text-xs text-stone-500 dark:text-stone-400 sm:text-sm">No data yet.</p>
          ) : (
            <div className="h-[160px] w-full sm:h-[180px]">
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
                    tick={{ fontSize: 10 }}
                    width={90}
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
        </div>
      </div>

      <div
        className={cn(
          "rounded-lg border-2 p-3 shadow-sm sm:rounded-xl sm:p-4",
          getPastelStyle(2).border,
          getPastelStyle(2).light
        )}
      >
        <h3 className="mb-2 text-xs font-medium text-stone-700 dark:text-stone-300 sm:mb-3 sm:text-sm">
          Weekly volume (last 12 weeks)
        </h3>
        {weeklyVolume.length === 0 ? (
          <p className="text-xs text-stone-500 dark:text-stone-400 sm:text-sm">
            No weekly data yet.
          </p>
        ) : (
          <div className="h-[180px] w-full sm:h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyVolume} margin={{ top: 4, right: 4, bottom: 4, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--stone-300)" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis hide domain={[0, "auto"]} />
                <RechartsTooltip
                  formatter={(value: number) => [value, "Total"]}
                  labelFormatter={(label) => `Week ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke={PASTEL_VARS[2]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
