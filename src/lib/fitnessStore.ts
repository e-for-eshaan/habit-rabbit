import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { isNil } from "lodash";
import type { FitnessState, Exercise, WeekLog } from "@/types/fitness";
import { labelToId } from "@/lib/fitnessConstants";

const DATA_DIR = join(process.cwd(), "data");
const FITNESS_STORE_PATH = join(DATA_DIR, "fitness.json");

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

const DEFAULT_STATE: FitnessState = {
  exercises: DEFAULT_EXERCISES,
  weekLogs: [],
};

function isValidWeekStart(s: unknown): s is string {
  if (typeof s !== "string") return false;
  const d = new Date(s + "T12:00:00");
  return !Number.isNaN(d.getTime()) && d.getDay() === 1;
}

function hasValidFitnessState(data: unknown): data is FitnessState {
  if (isNil(data) || typeof data !== "object") return false;
  const o = data as Record<string, unknown>;
  if (!Array.isArray(o.exercises) || !Array.isArray(o.weekLogs)) return false;
  for (const ex of o.exercises as unknown[]) {
    if (
      isNil(ex) ||
      typeof (ex as Record<string, unknown>).id !== "string" ||
      typeof (ex as Record<string, unknown>).label !== "string" ||
      typeof (ex as Record<string, unknown>).group !== "string"
    )
      return false;
  }
  for (const log of o.weekLogs as unknown[]) {
    const l = log as Record<string, unknown>;
    if (
      isNil(log) ||
      !isValidWeekStart(l.weekStart) ||
      !Array.isArray(l.exerciseIds) ||
      typeof l.swimmingSessions !== "number" ||
      typeof l.runningSessions !== "number"
    )
      return false;
  }
  return true;
}

export async function readFitnessStore(): Promise<FitnessState> {
  try {
    const raw = await readFile(FITNESS_STORE_PATH, "utf-8");
    const data = JSON.parse(raw) as unknown;
    if (!hasValidFitnessState(data)) return DEFAULT_STATE;
    return data;
  } catch {
    return DEFAULT_STATE;
  }
}

export async function writeFitnessStore(state: FitnessState): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(FITNESS_STORE_PATH, JSON.stringify(state, null, 2), "utf-8");
}

export function getDefaultExercises(): Exercise[] {
  return [...DEFAULT_EXERCISES];
}
