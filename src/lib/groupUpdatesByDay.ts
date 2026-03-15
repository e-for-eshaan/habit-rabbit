import type { Update } from "@/types";

const dateKey = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const dateLabel = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

export type DayGroup = {
  dateKey: string;
  dateLabel: string;
  updates: Update[];
};

export function groupUpdatesByDay(updates: Update[]): DayGroup[] {
  const sorted = [...updates].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const byDay: Record<string, Update[]> = {};
  for (const u of sorted) {
    const key = dateKey(u.createdAt);
    if (!byDay[key]) byDay[key] = [];
    byDay[key].push(u);
  }
  return Object.entries(byDay).map(([key, list]) => ({
    dateKey: key,
    dateLabel: dateLabel(list[0]!.createdAt),
    updates: list,
  }));
}
