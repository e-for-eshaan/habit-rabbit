"use client";

import { format, addWeeks, subWeeks } from "date-fns";
import { getDateRange } from "@/lib/dateRange";
import { cn } from "@/lib/utils";

type WeekSelectorProps = {
  weekStartKey: string;
  onWeekChange: (weekStartKey: string) => void;
  className?: string;
};

function parseWeekStart(key: string): Date {
  return new Date(key + "T12:00:00");
}

export function WeekSelector({ weekStartKey, onWeekChange, className }: WeekSelectorProps) {
  const monday = parseWeekStart(weekStartKey);
  const { start, end } = getDateRange("week", monday);
  const label = `${format(start, "d MMM")} – ${format(end, "d MMM yyyy")}`;

  const goPrev = () => {
    const prevMonday = subWeeks(monday, 1);
    onWeekChange(format(prevMonday, "yyyy-MM-dd"));
  };

  const goNext = () => {
    const nextMonday = addWeeks(monday, 1);
    onWeekChange(format(nextMonday, "yyyy-MM-dd"));
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 rounded-xl border border-stone-200 bg-stone-50/50 px-3 py-2 dark:border-stone-600 dark:bg-stone-800/50",
        className
      )}
    >
      <button
        type="button"
        onClick={goPrev}
        className="rounded-lg px-3 py-1.5 text-sm font-medium text-stone-600 hover:bg-stone-200 dark:text-stone-400 dark:hover:bg-stone-700"
      >
        ← Prev
      </button>
      <span className="text-sm font-medium text-stone-800 dark:text-stone-200">{label}</span>
      <button
        type="button"
        onClick={goNext}
        className="rounded-lg px-3 py-1.5 text-sm font-medium text-stone-600 hover:bg-stone-200 dark:text-stone-400 dark:hover:bg-stone-700"
      >
        Next →
      </button>
    </div>
  );
}
