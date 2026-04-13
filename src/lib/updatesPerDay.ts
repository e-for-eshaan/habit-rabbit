import { eachDayOfInterval, subDays } from "date-fns";

import type { FreqRange } from "@/store/useSectionsStore";
import type { Update } from "@/types";

import { formatChartDateLabel, toDateKey } from "./dateRange";

const FREQ_DAYS: Record<FreqRange, number> = {
  "1m": 30,
  "3m": 90,
  "6m": 180,
  "1y": 365,
};

export function getFreqCounts(
  updates: Update[],
  range: FreqRange,
  refDate: Date = new Date()
): { dateKey: string; label: string; count: number }[] {
  const daysCount = FREQ_DAYS[range];
  const end = refDate;
  const start = subDays(end, daysCount - 1);
  const days = eachDayOfInterval({ start, end });
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
  return days.map((d) => {
    const dateKey = toDateKey(d);
    return {
      dateKey,
      label: formatChartDateLabel(dateKey),
      count: byDay[dateKey] ?? 0,
    };
  });
}
