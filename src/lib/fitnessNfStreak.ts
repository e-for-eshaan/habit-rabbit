import { subDays } from "date-fns";

import { toDateKey } from "@/lib/dateRange";
import type { DayLog } from "@/types/fitness";

export function computeNfStreak(dayLogs: DayLog[], endDateKey: string): number {
  const byDate = new Map(dayLogs.map((l) => [l.dateKey, l]));
  let d = new Date(endDateKey + "T12:00:00");
  if (Number.isNaN(d.getTime())) return 0;

  let streak = 0;
  while (true) {
    const key = toDateKey(d);
    const log = byDate.get(key);
    if (log?.nfCompleted === true) {
      streak += 1;
      d = subDays(d, 1);
    } else {
      break;
    }
  }
  return streak;
}
