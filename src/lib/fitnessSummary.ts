import type { DayLog, Exercise, FitnessState } from "@/types/fitness";

export const FITNESS_SECTION_ID = "fitness";
export const SYNCED_UPDATE_PREFIX = "Fitness: ";

function getExerciseLabel(exercises: Exercise[], id: string): string {
  const ex = exercises.find((e) => e.id === id);
  return ex?.label ?? id;
}

function groupExerciseIdsByGroup(
  exerciseIds: string[],
  exercises: Exercise[]
): Record<string, string[]> {
  const byGroup: Record<string, string[]> = {};
  for (const id of exerciseIds) {
    const ex = exercises.find((e) => e.id === id);
    const group = ex?.group ?? "Other";
    if (!byGroup[group]) byGroup[group] = [];
    byGroup[group].push(getExerciseLabel(exercises, id));
  }
  return byGroup;
}

export function formatDayLogAsUpdateText(log: DayLog, state: FitnessState): string {
  const parts: string[] = [];
  const swim = log.swimmingSessions ?? 0;
  const run = log.runningSessions ?? 0;
  if (swim > 0) parts.push(`Swim ${swim}`);
  if (run > 0) parts.push(`Run ${run}`);
  if (log.exerciseIds.length > 0) {
    const byGroup = groupExerciseIdsByGroup(log.exerciseIds, state.exercises);
    const groupParts = Object.entries(byGroup).map(
      ([group, labels]) => `${group}: ${labels.join(", ")}`
    );
    parts.push(groupParts.join("; "));
  }
  if (parts.length === 0) return "";
  return SYNCED_UPDATE_PREFIX + parts.join(", ");
}

export function hasActivity(log: DayLog): boolean {
  return (
    log.exerciseIds.length > 0 || (log.swimmingSessions ?? 0) > 0 || (log.runningSessions ?? 0) > 0
  );
}
