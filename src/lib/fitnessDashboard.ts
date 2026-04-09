import { eachDayOfInterval, format, startOfWeek, subDays } from "date-fns";

import { getHeatLevel } from "@/lib/calendarHeatmap";
import { toDateKey } from "@/lib/dateRange";
import type { DayLog, Exercise, FitnessState } from "@/types/fitness";
import type {
  ActivityDayBreakdown,
  DashboardKPIs,
  FitnessDashboardData,
  GroupFreqItem,
  LeastHitItem,
  MissedExerciseItem,
  WeeklyVolumeItem,
  WorkoutDaysPerWeekItem,
} from "@/types/fitnessDashboard";

const LEAST_HIT_COUNT = 8;
const WEEK_COUNT = 12;
const HEATMAP_DAYS = 84;
const MISSED_DAYS_THRESHOLD = 14;

function getWeekStartFromDateKey(dateKey: string): string {
  const d = new Date(dateKey + "T12:00:00");
  const monday = startOfWeek(d, { weekStartsOn: 1 });
  return format(monday, "yyyy-MM-dd");
}

function hasActivity(log: DayLog): boolean {
  return (
    log.exerciseIds.length > 0 || (log.swimmingSessions ?? 0) > 0 || (log.runningSessions ?? 0) > 0
  );
}

function getActivityCount(log: DayLog): number {
  return log.exerciseIds.length + (log.swimmingSessions ?? 0) + (log.runningSessions ?? 0);
}

function computeKPIs(state: FitnessState): DashboardKPIs {
  const today = new Date();
  const todayKey = toDateKey(today);
  const weekStart = getWeekStartFromDateKey(todayKey);
  const thirtyDaysAgo = subDays(today, 29);
  const thirtyDaysAgoKey = toDateKey(thirtyDaysAgo);

  let thisWeekDays = 0;
  let thisWeekSessions = 0;
  let streak = 0;
  let swim30d = 0;
  let run30d = 0;

  const logsByDate = new Map<string, DayLog>();
  for (const log of state.dayLogs) {
    logsByDate.set(log.dateKey, log);
  }

  for (const log of state.dayLogs) {
    if (log.dateKey < thirtyDaysAgoKey) continue;
    if (getWeekStartFromDateKey(log.dateKey) === weekStart) {
      if (hasActivity(log)) thisWeekDays += 1;
      thisWeekSessions += getActivityCount(log);
    }
    swim30d += log.swimmingSessions ?? 0;
    run30d += log.runningSessions ?? 0;
  }

  let d = new Date(today);
  let key = toDateKey(d);
  while (true) {
    const log = logsByDate.get(key);
    if (log && hasActivity(log)) {
      streak += 1;
      d = subDays(d, 1);
      key = toDateKey(d);
    } else {
      break;
    }
  }

  return {
    thisWeekDays,
    thisWeekSessions,
    streak,
    swim30d,
    run30d,
  };
}

function computeWeeklyVolume(state: FitnessState): WeeklyVolumeItem[] {
  const byWeek = new Map<
    string,
    { weekStart: string; label: string; exercises: number; swimming: number; running: number }
  >();
  for (const log of state.dayLogs) {
    const weekStart = getWeekStartFromDateKey(log.dateKey);
    const existing = byWeek.get(weekStart);
    if (existing) {
      existing.exercises += log.exerciseIds.length;
      existing.swimming += log.swimmingSessions ?? 0;
      existing.running += log.runningSessions ?? 0;
    } else {
      byWeek.set(weekStart, {
        weekStart,
        label: weekStart.slice(5, 10),
        exercises: log.exerciseIds.length,
        swimming: log.swimmingSessions ?? 0,
        running: log.runningSessions ?? 0,
      });
    }
  }
  return Array.from(byWeek.values())
    .map((w) => ({ ...w, total: w.exercises + w.swimming + w.running }))
    .sort((a, b) => a.weekStart.localeCompare(b.weekStart))
    .slice(-WEEK_COUNT);
}

function computeActivityHeatmap(state: FitnessState): {
  activityByDay: Record<string, number>;
  activityBreakdownByDay: Record<string, ActivityDayBreakdown>;
} {
  const end = new Date();
  const start = subDays(end, HEATMAP_DAYS - 1);
  const days = eachDayOfInterval({ start, end });
  const activityByDay: Record<string, number> = {};
  const activityBreakdownByDay: Record<string, ActivityDayBreakdown> = {};
  for (const d of days) {
    const key = toDateKey(d);
    activityByDay[key] = 0;
    activityBreakdownByDay[key] = { exercises: 0, swimming: 0, running: 0 };
  }
  for (const log of state.dayLogs) {
    if (log.dateKey in activityByDay) {
      const exercises = log.exerciseIds.length;
      const swimming = log.swimmingSessions ?? 0;
      const running = log.runningSessions ?? 0;
      activityBreakdownByDay[log.dateKey] = { exercises, swimming, running };
      activityByDay[log.dateKey] = exercises + swimming + running;
    }
  }
  return { activityByDay, activityBreakdownByDay };
}

function computeWorkoutDaysPerWeek(state: FitnessState): WorkoutDaysPerWeekItem[] {
  const byWeek = new Map<string, Set<string>>();
  for (const log of state.dayLogs) {
    if (!hasActivity(log)) continue;
    const weekStart = getWeekStartFromDateKey(log.dateKey);
    const set = byWeek.get(weekStart) ?? new Set();
    set.add(log.dateKey);
    byWeek.set(weekStart, set);
  }
  return Array.from(byWeek.entries())
    .map(([weekStart, set]) => ({
      weekStart,
      label: weekStart.slice(5, 10),
      days: set.size,
    }))
    .sort((a, b) => a.weekStart.localeCompare(b.weekStart))
    .slice(-WEEK_COUNT);
}

function computeGroupFrequency(state: FitnessState): GroupFreqItem[] {
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

function computeLeastHit(state: FitnessState, exerciseById: Map<string, Exercise>): LeastHitItem[] {
  const nonMuted = state.exercises.filter((e) => !e.muted);
  const counts = new Map<string, number>();
  for (const ex of nonMuted) counts.set(ex.id, 0);
  for (const log of state.dayLogs) {
    for (const id of log.exerciseIds) {
      if (counts.has(id)) {
        counts.set(id, (counts.get(id) ?? 0) + 1);
      }
    }
  }
  return Array.from(counts.entries())
    .map(([id, days]) => ({ id, days, label: exerciseById.get(id)?.label ?? id }))
    .sort((a, b) => a.days - b.days)
    .slice(0, LEAST_HIT_COUNT);
}

function computeMissedExercises(state: FitnessState): MissedExerciseItem[] {
  const today = new Date();
  const cutoff = subDays(today, MISSED_DAYS_THRESHOLD);
  const cutoffKey = toDateKey(cutoff);
  const lastDoneByExercise = new Map<string, string>();
  for (const log of state.dayLogs) {
    for (const id of log.exerciseIds) {
      const current = lastDoneByExercise.get(id);
      if (!current || log.dateKey > current) {
        lastDoneByExercise.set(id, log.dateKey);
      }
    }
  }
  const result: MissedExerciseItem[] = [];
  for (const ex of state.exercises) {
    if (ex.muted) continue;
    const lastDone = lastDoneByExercise.get(ex.id) ?? null;
    const daysSince = lastDone
      ? Math.floor(
          (today.getTime() - new Date(lastDone + "T12:00:00").getTime()) / (1000 * 60 * 60 * 24)
        )
      : MISSED_DAYS_THRESHOLD + 1;
    if (!lastDone || lastDone < cutoffKey) {
      result.push({
        id: ex.id,
        label: ex.label,
        group: ex.group,
        daysSinceLastDone: daysSince,
        lastDoneDateKey: lastDone,
      });
    }
  }
  return result.sort((a, b) => b.daysSinceLastDone - a.daysSinceLastDone).slice(0, 12);
}

export function computeFitnessDashboard(state: FitnessState): FitnessDashboardData {
  const exerciseById = new Map(state.exercises.map((e) => [e.id, e]));
  const { activityByDay, activityBreakdownByDay } = computeActivityHeatmap(state);
  return {
    kpis: computeKPIs(state),
    weeklyVolume: computeWeeklyVolume(state),
    activityByDay,
    activityBreakdownByDay,
    workoutDaysPerWeek: computeWorkoutDaysPerWeek(state),
    groupFrequency: computeGroupFrequency(state),
    leastHit: computeLeastHit(state, exerciseById),
    missedExercises: computeMissedExercises(state),
  };
}

export function getActivityHeatLevel(count: number, countsByDay: Record<string, number>): number {
  return getHeatLevel(count, countsByDay);
}
