"use client";

import type { WeekLog } from "@/types/fitness";
import { cn } from "@/lib/utils";

type SwimRunInputProps = {
  weekLog: WeekLog;
  onSwimmingChange: (value: number) => void;
  onRunningChange: (value: number) => void;
  className?: string;
};

export function SwimRunInput({
  weekLog,
  onSwimmingChange,
  onRunningChange,
  className,
}: SwimRunInputProps) {
  const swim = Math.max(0, Math.floor(weekLog.swimmingSessions));
  const run = Math.max(0, Math.floor(weekLog.runningSessions));

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-4 rounded-xl border border-stone-200 bg-stone-50/50 p-4 dark:border-stone-600 dark:bg-stone-800/50",
        className
      )}
    >
      <h2 className="w-full text-lg font-semibold text-stone-800 dark:text-stone-200">
        Swimming & running
      </h2>
      <div className="flex flex-col gap-1">
        <label htmlFor="swim-sessions" className="text-sm text-stone-600 dark:text-stone-400">
          Swimming sessions
        </label>
        <input
          id="swim-sessions"
          type="number"
          min={0}
          value={swim}
          onChange={(e) => onSwimmingChange(Math.max(0, parseInt(e.target.value, 10) || 0))}
          className="w-24 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-800 dark:text-stone-200"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="run-sessions" className="text-sm text-stone-600 dark:text-stone-400">
          Running sessions
        </label>
        <input
          id="run-sessions"
          type="number"
          min={0}
          value={run}
          onChange={(e) => onRunningChange(Math.max(0, parseInt(e.target.value, 10) || 0))}
          className="w-24 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-800 dark:text-stone-200"
        />
      </div>
    </div>
  );
}
