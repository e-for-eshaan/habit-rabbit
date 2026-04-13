"use client";

import { useEffect, useMemo } from "react";

import { computeFitnessDashboard } from "@/lib/fitnessDashboard";
import { cn } from "@/lib/utils";
import { useFitnessDashboardStore } from "@/store/useFitnessDashboardStore";
import type { FitnessState } from "@/types/fitness";

import { ActivityHeatmap } from "./ActivityHeatmap";
import { getHeatmapGrid } from "./chartUtils";
import { CARDIO_DAYS_PER_WEEK_GOAL, WORKOUT_DAYS_PER_WEEK_GOAL } from "./constants";
import { KPICard } from "./KPICard";
import { LeastHitExercisesChart } from "./LeastHitExercisesChart";
import { MissedExercisesCard } from "./MissedExercisesCard";
import { MuscleGroupCompletionsChart } from "./MuscleGroupCompletionsChart";
import { SwimVsRunChart } from "./SwimVsRunChart";
import { WorkoutCardioDaysChart } from "./WorkoutCardioDaysChart";
import { WorkoutDaysPerWeekChart } from "./WorkoutDaysPerWeekChart";

type FitnessDashboardProps = {
  state: FitnessState;
  className?: string;
};

export function FitnessDashboard({ state, className }: FitnessDashboardProps) {
  const setData = useFitnessDashboardStore((s) => s.setData);
  const dashboard = useMemo(() => computeFitnessDashboard(state), [state]);
  const kpis = dashboard.kpis;
  const weeklyVolume = dashboard.weeklyVolume;
  const weeklyActivityDays = dashboard.weeklyActivityDays;
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

  const workoutCardioYAxisMax = useMemo(() => {
    let peak = 0;
    for (const w of weeklyActivityDays) {
      peak = Math.max(peak, w.workoutDays, w.cardioDays, w.runDays, w.swimDays);
    }
    const fromData = peak + 1;
    const goalMax = Math.max(WORKOUT_DAYS_PER_WEEK_GOAL, CARDIO_DAYS_PER_WEEK_GOAL);
    return Math.min(7, Math.max(fromData, goalMax));
  }, [weeklyActivityDays]);

  const workoutDaysPerWeekYAxisMax = useMemo(() => {
    const peak =
      workoutDaysPerWeek.length === 0 ? 0 : Math.max(0, ...workoutDaysPerWeek.map((w) => w.days));
    const fromData = peak + 1;
    const fromGoals = WORKOUT_DAYS_PER_WEEK_GOAL + 1;
    return Math.min(7, Math.max(fromData, fromGoals));
  }, [workoutDaysPerWeek]);

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
          <WorkoutCardioDaysChart
            weeklyActivityDays={weeklyActivityDays}
            yAxisMax={workoutCardioYAxisMax}
            className="flex h-full min-h-0 flex-1 flex-col"
          />
        </div>

        <div className="flex min-h-0 h-full flex-col sm:col-span-1 md:col-span-2 lg:col-span-3">
          <SwimVsRunChart
            weeklyVolume={weeklyVolume}
            className="flex h-full min-h-0 flex-1 flex-col"
          />
        </div>

        <div className="flex min-h-0 h-full flex-col sm:col-span-1 md:col-span-2 lg:col-span-3">
          <WorkoutDaysPerWeekChart
            workoutDaysPerWeek={workoutDaysPerWeek}
            yAxisMax={workoutDaysPerWeekYAxisMax}
            className="flex h-full min-h-0 flex-1 flex-col"
          />
        </div>

        <div className="sm:col-span-1 md:col-span-2 lg:col-span-3">
          <MuscleGroupCompletionsChart groupFreq={groupFreq} xAxisMax={sharedVerticalBarAxisMax} />
        </div>

        <div className="sm:col-span-1 md:col-span-2 lg:col-span-3">
          <LeastHitExercisesChart leastHit={leastHit} xAxisMax={sharedVerticalBarAxisMax} />
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
