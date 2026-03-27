import { eachDayOfInterval, endOfMonth, endOfWeek, format, startOfWeek } from "date-fns";

import type {
  DayLog,
  Exercise,
  FitnessCalendarDaySummary,
  FitnessCalendarMonthResponse,
} from "@/types/fitness";

function toDateKey(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

export function summarizeDayLog(
  log: DayLog | undefined,
  exercises: Exercise[]
): FitnessCalendarDaySummary {
  if (!log) {
    return { running: false, swimming: false, groupCount: 0 };
  }
  const running = (log.runningSessions ?? 0) > 0;
  const swimming = (log.swimmingSessions ?? 0) > 0;
  const groups = new Set<string>();
  for (const id of log.exerciseIds) {
    const ex = exercises.find((e) => e.id === id);
    if (ex) groups.add(ex.group);
  }
  return { running, swimming, groupCount: groups.size };
}

export function buildFitnessCalendarMonthResponse(
  year: number,
  month1Based: number,
  dayLogs: DayLog[],
  exercises: Exercise[]
): FitnessCalendarMonthResponse {
  if (month1Based < 1 || month1Based > 12) {
    return { year, month: month1Based, days: {} };
  }
  const monthIndex = month1Based - 1;
  const monthStart = new Date(year, monthIndex, 1);
  const monthEnd = endOfMonth(monthStart);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const interval = eachDayOfInterval({ start: gridStart, end: gridEnd });
  const byKey = new Map(dayLogs.map((l) => [l.dateKey, l]));
  const days: Record<string, FitnessCalendarDaySummary> = {};
  for (const d of interval) {
    const key = toDateKey(d);
    days[key] = summarizeDayLog(byKey.get(key), exercises);
  }
  return { year, month: month1Based, days };
}
