export const EXERCISE_GROUPS = [
  "Shoulder",
  "Back",
  "Chest",
  "Arms Biceps",
  "Arms Triceps",
  "Legs",
  "Abs",
] as const;

export type ExerciseGroupName = (typeof EXERCISE_GROUPS)[number];

/** Stable accent index (0–5) per muscle group; Legs uses the yellow slot. */
export const GROUP_PASTEL_KEY: Record<ExerciseGroupName, number> = {
  Shoulder: 0,
  Back: 1,
  Chest: 2,
  "Arms Biceps": 3,
  "Arms Triceps": 4,
  Legs: 5,
  Abs: 2,
};

export function getGroupPastelKey(group: string): number {
  const k = GROUP_PASTEL_KEY[group as ExerciseGroupName];
  return k ?? 0;
}

export type SectionDef = { name: string; groups: readonly string[] };

export const SECTIONS: SectionDef[] = [
  { name: "Chest & Arms", groups: ["Chest", "Arms Biceps", "Arms Triceps"] },
  { name: "Shoulder & Back", groups: ["Shoulder", "Back"] },
  { name: "Legs", groups: ["Legs"] },
  { name: "Abs", groups: ["Abs"] },
];

export function labelToId(label: string): string {
  return label
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}
