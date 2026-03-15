"use client";

import type { FreqRange } from "@/store/useSectionsStore";
import { cn } from "@/lib/utils";

type FreqRangeToggleProps = {
  range: FreqRange;
  onRangeChange: (range: FreqRange) => void;
};

export function FreqRangeToggle({ range, onRangeChange }: FreqRangeToggleProps) {
  return (
    <div className="flex flex-wrap gap-1 rounded-lg border border-stone-300 bg-stone-100 p-1 dark:border-stone-600 dark:bg-stone-800">
      {(["1m", "3m", "6m", "1y"] as const).map((r) => (
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
          {r}
        </button>
      ))}
    </div>
  );
}
