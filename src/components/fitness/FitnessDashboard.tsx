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

function getLeastHit(state: FitnessState, exerciseById: Map<string, Exercise>) {
  const counts = new Map<string, number>();
  for (const ex of state.exercises) counts.set(ex.id, 0);
  for (const log of state.weekLogs) {
    for (const id of log.exerciseIds) {
      if (counts.has(id)) counts.set(id, (counts.get(id) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([id, weeks]) => ({ id, weeks, label: exerciseById.get(id)?.label ?? id }))
    .sort((a, b) => a.weeks - b.weeks)
    .slice(0, LEAST_HIT_COUNT);
}

function getWeeklyVolume(state: FitnessState) {
  return state.weekLogs
    .map((log) => ({
      weekStart: log.weekStart.slice(0, 10),
      label: log.weekStart.slice(5, 10),
      exercises: log.exerciseIds.length,
      swimming: log.swimmingSessions,
      running: log.runningSessions,
      total: log.exerciseIds.length + log.swimmingSessions + log.runningSessions,
    }))
    .sort((a, b) => a.weekStart.localeCompare(b.weekStart))
    .slice(-12);
}

function getGroupFrequency(state: FitnessState) {
  const byGroup = new Map<string, number>();
  for (const ex of state.exercises) byGroup.set(ex.group, 0);
  for (const log of state.weekLogs) {
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
    <div className={cn("flex flex-col gap-6", className)}>
      <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-200">Dashboard</h2>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div
          className={cn(
            "rounded-xl border-2 p-4 shadow-sm",
            getPastelStyle(0).border,
            getPastelStyle(0).light
          )}
        >
          <h3 className="mb-3 text-sm font-medium text-stone-700 dark:text-stone-300">
            Least hit exercises (weeks done)
          </h3>
          {leastHit.length === 0 ? (
            <p className="text-sm text-stone-500 dark:text-stone-400">
              Complete exercises in a week to see stats.
            </p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {leastHit.map((item, i) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between text-sm text-stone-700 dark:text-stone-300"
                >
                  <span className="truncate">{item.label}</span>
                  <span className="shrink-0 font-medium">{item.weeks}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div
          className={cn(
            "rounded-xl border-2 p-4 shadow-sm",
            getPastelStyle(1).border,
            getPastelStyle(1).light
          )}
        >
          <h3 className="mb-3 text-sm font-medium text-stone-700 dark:text-stone-300">
            By muscle group (total completions)
          </h3>
          {groupFreq.every((g) => g.count === 0) ? (
            <p className="text-sm text-stone-500 dark:text-stone-400">No data yet.</p>
          ) : (
            <div className="h-[180px] w-full">
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
                    formatter={(value: number) => [value, "Weeks"]}
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
          "rounded-xl border-2 p-4 shadow-sm",
          getPastelStyle(2).border,
          getPastelStyle(2).light
        )}
      >
        <h3 className="mb-3 text-sm font-medium text-stone-700 dark:text-stone-300">
          Weekly volume (last 12 weeks)
        </h3>
        {weeklyVolume.length === 0 ? (
          <p className="text-sm text-stone-500 dark:text-stone-400">No weekly data yet.</p>
        ) : (
          <div className="h-[200px] w-full">
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
