import { isNil } from "lodash";

import { labelToId } from "@/lib/fitnessConstants";
import type { DayLog, Exercise, FitnessState } from "@/types/fitness";

function buildExercise(group: string, label: string, idOverride?: string): Exercise {
  return { id: idOverride ?? labelToId(label), label, group };
}

const DEFAULT_EXERCISES: Exercise[] = [
  ...[
    "Side lateral raises",
    "Front lateral raises",
    "Shoulder press",
    "Face pull",
    "Shrugs",
    "Upright row",
  ].map((label) => buildExercise("Shoulder", label)),
  ...[
    "Lat pull-down",
    "Unilateral cable row",
    "Romanian deadlift",
    "Pull ups",
    "Real deltoids",
    "Low back extension",
    "Stiff arm pulldown",
    "Barbell deadlift",
  ].map((label) => buildExercise("Back", label)),
  ...[
    "Pec-deck fly",
    "DM press (barbell press)",
    "Incline DM press (barbell press)",
    "Cable cross",
    "Bench dips",
    "Incline smith machine bench press",
    "Incline push ups",
  ].map((label) => buildExercise("Chest", label)),
  ...["DM curl (barbell curl)", "Hammer DM", "Preacher curl", "Forearms"].map((label) =>
    buildExercise("Arms Biceps", label)
  ),
  ...[
    ["Overhead DM", undefined],
    ["Pulley push-down", undefined],
    ["Bench dips", "bench-dips-triceps"],
    ["Dumbbell skullcrushers", undefined],
  ].map(([label, id]) => buildExercise("Arms Triceps", label as string, id as string | undefined)),
  ...[
    "Squat",
    "Bulgarian Split squat",
    "Leg press",
    "Leg extension",
    "Leg curl",
    "Calf raises",
  ].map((label) => buildExercise("Legs", label)),
  ...[
    "Leg raises",
    "Planks",
    "Russian twists",
    "Hanging leg raises",
    "Hollow body hold",
    "Standing ab crunch",
  ].map((label) => buildExercise("Abs", label)),
];

export function getDefaultFitnessState(): FitnessState {
  return { exercises: [...DEFAULT_EXERCISES], dayLogs: [], nfPersonalBestSeconds: 0 };
}

function isValidDateKey(s: unknown): s is string {
  if (typeof s !== "string") return false;
  const d = new Date(s + "T12:00:00");
  return !Number.isNaN(d.getTime());
}

export function isValidOptionalNfStreakStartedAt(value: unknown): boolean {
  if (value === undefined) return true;
  if (typeof value !== "string") return false;
  return !Number.isNaN(Date.parse(value));
}

export function isValidOptionalNfPersonalBestSeconds(value: unknown): boolean {
  if (value === undefined) return true;
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) return false;
  return Number.isInteger(value);
}

export function isValidOptionalNfMilestoneCongratsShownKeys(value: unknown): boolean {
  if (value === undefined) return true;
  if (!Array.isArray(value)) return false;
  return value.every((x) => typeof x === "string" && x.length > 0 && x.length < 200);
}

function hasValidDayLog(log: unknown): log is DayLog {
  if (isNil(log) || typeof log !== "object") return false;
  const l = log as Record<string, unknown>;
  const hasSelectedGroups =
    l.selectedGroups === undefined ||
    (Array.isArray(l.selectedGroups) &&
      l.selectedGroups.every((g: unknown) => typeof g === "string"));
  const hasNf = l.nfCompleted === undefined || typeof l.nfCompleted === "boolean";
  return (
    isValidDateKey(l.dateKey) &&
    Array.isArray(l.exerciseIds) &&
    l.exerciseIds.every((id: unknown) => typeof id === "string") &&
    typeof l.swimmingSessions === "number" &&
    typeof l.runningSessions === "number" &&
    hasSelectedGroups &&
    hasNf
  );
}

export function hasValidFitnessState(data: unknown): data is FitnessState {
  if (isNil(data) || typeof data !== "object") return false;
  const o = data as Record<string, unknown>;
  if (!Array.isArray(o.exercises)) return false;
  const hasDayLogs = Array.isArray(o.dayLogs) && (o.dayLogs as unknown[]).every(hasValidDayLog);
  if (hasDayLogs) {
    if (!isValidOptionalNfStreakStartedAt(o.nfStreakStartedAt)) return false;
    if (!isValidOptionalNfPersonalBestSeconds(o.nfPersonalBestSeconds)) return false;
    if (!isValidOptionalNfMilestoneCongratsShownKeys(o.nfMilestoneCongratsShownKeys)) return false;
    for (const ex of o.exercises as unknown[]) {
      if (
        isNil(ex) ||
        typeof (ex as Record<string, unknown>).id !== "string" ||
        typeof (ex as Record<string, unknown>).label !== "string" ||
        typeof (ex as Record<string, unknown>).group !== "string"
      )
        return false;
    }
    return true;
  }
  const weekLogs = o.weekLogs;
  if (!Array.isArray(weekLogs)) return false;
  for (const ex of o.exercises as unknown[]) {
    if (
      isNil(ex) ||
      typeof (ex as Record<string, unknown>).id !== "string" ||
      typeof (ex as Record<string, unknown>).label !== "string" ||
      typeof (ex as Record<string, unknown>).group !== "string"
    )
      return false;
  }
  for (const log of weekLogs as unknown[]) {
    const l = log as Record<string, unknown>;
    if (
      isNil(log) ||
      typeof l.weekStart !== "string" ||
      !Array.isArray(l.exerciseIds) ||
      typeof l.swimmingSessions !== "number" ||
      typeof l.runningSessions !== "number"
    )
      return false;
  }
  return (
    isValidOptionalNfStreakStartedAt(o.nfStreakStartedAt) &&
    isValidOptionalNfPersonalBestSeconds(o.nfPersonalBestSeconds) &&
    isValidOptionalNfMilestoneCongratsShownKeys(o.nfMilestoneCongratsShownKeys)
  );
}

export function migrateWeekLogsToDayLogs(data: Record<string, unknown>): FitnessState {
  const exercises = data.exercises as FitnessState["exercises"];
  const weekLogs = (data.weekLogs ?? []) as Array<{
    weekStart: string;
    exerciseIds: string[];
    swimmingSessions: number;
    runningSessions: number;
  }>;
  const dayLogs: DayLog[] = weekLogs.map((w) => ({
    dateKey: w.weekStart,
    exerciseIds: w.exerciseIds ?? [],
    swimmingSessions: w.swimmingSessions ?? 0,
    runningSessions: w.runningSessions ?? 0,
    nfCompleted: false,
  }));
  return { exercises, dayLogs };
}
