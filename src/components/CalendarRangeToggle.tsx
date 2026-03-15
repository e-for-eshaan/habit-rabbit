"use client";

import type { CalendarRange } from "@/store/useSectionsStore";
import { cn } from "@/lib/utils";

const RANGE_LABELS: Record<CalendarRange, string> = {
  week: "Week",
  month: "Month",
  last7: "Last 7 days",
  last30: "Last 30 days",
};

type CalendarRangeToggleProps = {
  range: CalendarRange;
  onRangeChange: (range: CalendarRange) => void;
};

export function CalendarRangeToggle({ range, onRangeChange }: CalendarRangeToggleProps) {
  return (
    <div className="flex flex-wrap gap-1 rounded-lg border border-stone-300 bg-stone-100 p-1 dark:border-stone-600 dark:bg-stone-800">
      {(["week", "month", "last7", "last30"] as const).map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => onRangeChange(r)}
          className={cn(
            "rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
            range === r
              ? "bg-white text-stone-900 shadow dark:bg-stone-700 dark:text-stone-100"
              : "text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
          )}
        >
          {RANGE_LABELS[r]}
        </button>
      ))}
    </div>
  );
}
