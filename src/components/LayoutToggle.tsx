"use client";

import { cn } from "@/lib/utils";

type LayoutMode = "horizontal" | "grid";

type LayoutToggleProps = {
  mode: LayoutMode;
  onModeChange: (mode: LayoutMode) => void;
  isGridCollapsed: boolean;
  onCollapseAll: () => void;
};

export function LayoutToggle({
  mode,
  onModeChange,
  isGridCollapsed,
  onCollapseAll,
}: LayoutToggleProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex rounded-lg border border-stone-300 bg-stone-100 p-1 dark:border-stone-600 dark:bg-stone-800">
        <button
          type="button"
          onClick={() => onModeChange("horizontal")}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            mode === "horizontal"
              ? "bg-white text-stone-900 shadow dark:bg-stone-700 dark:text-stone-100"
              : "text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
          )}
        >
          Horizontal
        </button>
        <button
          type="button"
          onClick={() => onModeChange("grid")}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            mode === "grid"
              ? "bg-white text-stone-900 shadow dark:bg-stone-700 dark:text-stone-100"
              : "text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
          )}
        >
          Grid
        </button>
      </div>
      {mode === "grid" && (
        <button
          type="button"
          onClick={onCollapseAll}
          className="rounded-lg border border-stone-300 bg-stone-100 px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-200 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
        >
          {isGridCollapsed ? "Expand all" : "Collapse all"}
        </button>
      )}
    </div>
  );
}
