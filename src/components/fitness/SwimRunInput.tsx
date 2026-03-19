"use client";

import type { DayLog } from "@/types/fitness";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { FitnessCheckbox } from "./FitnessCheckbox";

type SwimRunInputProps = {
  dayLog: DayLog;
  onSwimmingChange: (value: number) => void;
  onRunningChange: (value: number) => void;
  locked?: boolean;
  className?: string;
};

export function SwimRunInput({
  dayLog,
  onSwimmingChange,
  onRunningChange,
  locked = false,
  className,
}: SwimRunInputProps) {
  const swimChecked = (dayLog.swimmingSessions ?? 0) > 0;
  const runChecked = (dayLog.runningSessions ?? 0) > 0;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-4 rounded-lg border border-stone-200 bg-stone-50/50 p-3 dark:border-stone-600 dark:bg-stone-800/50 sm:gap-6 sm:rounded-xl sm:p-4",
        className
      )}
    >
      <h2 className="flex w-full items-center gap-2 text-base font-semibold text-stone-800 dark:text-stone-200 sm:gap-2.5 sm:text-lg">
        <Heart size={18} className="shrink-0" aria-hidden />
        Cardio
      </h2>
      <FitnessCheckbox
        id="swim-checkbox"
        checked={swimChecked}
        onChange={(checked) => onSwimmingChange(checked ? 1 : 0)}
        disabled={locked}
        label="Swimming"
        labelClassName="text-stone-700 dark:text-stone-300"
      />
      <FitnessCheckbox
        id="run-checkbox"
        checked={runChecked}
        onChange={(checked) => onRunningChange(checked ? 1 : 0)}
        disabled={locked}
        label="Running"
        labelClassName="text-stone-700 dark:text-stone-300"
      />
    </div>
  );
}
