export const PASTEL_VARS = [
  "var(--pastel-1)",
  "var(--pastel-2)",
  "var(--pastel-3)",
  "var(--pastel-4)",
  "var(--pastel-5)",
  "var(--pastel-6)",
] as const;

export const HEATMAP_DAYS = 84;

export const WORKOUT_DAYS_PER_WEEK_GOAL = 4;

export const CARDIO_DAYS_PER_WEEK_GOAL = 3;

export const WORKOUT_CARDIO_GOAL_LINE_GREEN = "rgba(163, 230, 53, 0.45)";
export const WORKOUT_CARDIO_GOAL_LINE_PURPLE = "rgba(139, 92, 246, 0.45)";

export const CHART_TOOLTIP = {
  contentStyle: {
    background: "var(--surface-elevated)",
    border: "1px solid var(--border-subtle)",
    borderRadius: 8,
    fontSize: "var(--chart-label)",
    color: "var(--foreground)",
  },
  labelStyle: { color: "var(--muted)" },
} as const;
