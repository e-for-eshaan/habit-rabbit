export const EXERCISE_GROUPS = [
  "Shoulder",
  "Back",
  "Chest",
  "Arms Biceps",
  "Arms Triceps",
  "Legs",
  "Abs",
] as const;

export function labelToId(label: string): string {
  return label
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}
