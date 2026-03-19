export const EXERCISE_GROUPS = [
  "Shoulder",
  "Back",
  "Chest",
  "Arms Biceps",
  "Arms Triceps",
  "Legs",
  "Abs",
] as const;

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
