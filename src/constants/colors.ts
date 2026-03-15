export const PASTEL_COLORS = [
  { bg: "bg-pastel-1", border: "border-pastel-1", light: "bg-pastel-1/20" },
  { bg: "bg-pastel-2", border: "border-pastel-2", light: "bg-pastel-2/20" },
  { bg: "bg-pastel-3", border: "border-pastel-3", light: "bg-pastel-3/20" },
  { bg: "bg-pastel-4", border: "border-pastel-4", light: "bg-pastel-4/20" },
  { bg: "bg-pastel-5", border: "border-pastel-5", light: "bg-pastel-5/20" },
  { bg: "bg-pastel-6", border: "border-pastel-6", light: "bg-pastel-6/20" },
] as const;

export function getPastelStyle(colorKey: number) {
  return PASTEL_COLORS[colorKey % PASTEL_COLORS.length];
}
