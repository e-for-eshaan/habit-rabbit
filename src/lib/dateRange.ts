import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getDay,
  startOfMonth,
  startOfWeek,
  subDays,
} from "date-fns";
import { enUS } from "date-fns/locale";

export type CalendarRange = "week" | "month" | "last7" | "last30";

export function getDateRange(
  range: CalendarRange,
  refDate: Date = new Date()
): { start: Date; end: Date } {
  switch (range) {
    case "week": {
      const start = startOfWeek(refDate, { weekStartsOn: 1 });
      const end = endOfWeek(refDate, { weekStartsOn: 1 });
      return { start, end };
    }
    case "month": {
      const start = startOfMonth(refDate);
      const end = endOfMonth(refDate);
      return { start, end };
    }
    case "last7": {
      const end = refDate;
      const start = subDays(end, 6);
      return { start, end };
    }
    case "last30": {
      const end = refDate;
      const start = subDays(end, 29);
      return { start, end };
    }
  }
}

const MONDAY_FIRST_OFFSET = 6;

function mondayColumn(d: Date): number {
  return (getDay(d) + MONDAY_FIRST_OFFSET) % 7;
}

export function getDaysInRange(range: CalendarRange, refDate: Date = new Date()): Date[] {
  const { start, end } = getDateRange(range, refDate);
  return eachDayOfInterval({ start, end });
}

export function getCalendarGrid(days: Date[]): (Date | null)[][] {
  if (days.length === 0) return [];
  const padCount = mondayColumn(days[0]!);
  const totalCells = padCount + days.length;
  const numRows = Math.ceil(totalCells / 7);
  const grid: (Date | null)[][] = [];
  let dayIndex = 0;
  for (let r = 0; r < numRows; r++) {
    const row: (Date | null)[] = [];
    for (let c = 0; c < 7; c++) {
      const cellIndex = r * 7 + c;
      if (cellIndex < padCount || dayIndex >= days.length) {
        row.push(null);
      } else {
        row.push(days[dayIndex] ?? null);
        dayIndex++;
      }
    }
    grid.push(row);
  }
  return grid;
}

export function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function formatChartDateLabel(dateKey: string): string {
  const d = new Date(`${dateKey}T12:00:00`);
  if (Number.isNaN(d.getTime())) return dateKey;
  return format(d, "MMM d", { locale: enUS });
}
