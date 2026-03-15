"use client";

import type { ViewMode } from "@/store/useSectionsStore";
import { cn } from "@/lib/utils";

type ViewModeToggleProps = {
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
};

export function ViewModeToggle({ mode, onModeChange }: ViewModeToggleProps) {
  return (
    <div className="flex rounded-lg border border-stone-300 bg-stone-100 p-1 dark:border-stone-600 dark:bg-stone-800">
      {(["calendar", "list", "freq"] as const).map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => onModeChange(m)}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors",
            mode === m
              ? "bg-white text-stone-900 shadow dark:bg-stone-700 dark:text-stone-100"
              : "text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
          )}
        >
          {m}
        </button>
      ))}
    </div>
  );
}
