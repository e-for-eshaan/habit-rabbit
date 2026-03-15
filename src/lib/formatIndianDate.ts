import { format } from "date-fns";

export function formatIndianDate(dateKey: string): { date: string; day: string } {
  const d = new Date(dateKey + "T12:00:00");
  return {
    date: format(d, "do MMMM, yyyy"),
    day: format(d, "EEEE"),
  };
}

export function formatCalendarRangeLabel(dateKey: string, includeYear: boolean): string {
  const d = new Date(dateKey + "T12:00:00");
  return includeYear ? format(d, "do MMMM, yyyy") : format(d, "do MMMM");
}

export function rangeSpansMultipleYears(days: Date[]): boolean {
  if (days.length <= 1) return false;
  const years = new Set(days.map((d) => d.getFullYear()));
  return years.size > 1;
}

export const WEEKDAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;
