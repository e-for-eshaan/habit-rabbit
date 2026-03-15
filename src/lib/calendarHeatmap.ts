import type { Update } from "@/types";
import { toDateKey } from "./dateRange";
import type { CalendarRange } from "./dateRange";
import { getDaysInRange } from "./dateRange";

const HEAT_LEVELS = 5;

export function getUpdatesCountByDay(
  updates: Update[],
  range: CalendarRange,
  refDate: Date = new Date()
): Record<string, number> {
  const days = getDaysInRange(range, refDate);
  const byDay: Record<string, number> = {};
  for (const d of days) {
    byDay[toDateKey(d)] = 0;
  }
  for (const u of updates) {
    const key = toDateKey(new Date(u.createdAt));
    if (key in byDay) {
      byDay[key] += 1;
    }
  }
  return byDay;
}

export function getHeatLevel(count: number, countsByDay: Record<string, number>): number {
  if (count === 0) return 0;
  const values = Object.values(countsByDay).filter((c) => c > 0);
  const max = values.length ? Math.max(...values) : 0;
  if (max === 0) return 0;
  const uniqueNonZero = [...new Set(values)];
  if (uniqueNonZero.length === 1) return HEAT_LEVELS;
  const min = Math.min(...values);
  const range = max - min;
  if (range === 0) return count > 0 ? HEAT_LEVELS : 0;
  const normalized = (count - min) / range;
  const level = 1 + Math.round(normalized * (HEAT_LEVELS - 1));
  return Math.min(HEAT_LEVELS, Math.max(1, level));
}
