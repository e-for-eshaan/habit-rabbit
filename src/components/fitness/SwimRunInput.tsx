"use client";

import { Heart } from "lucide-react";

import { cn } from "@/lib/utils";
import type { DayLog } from "@/types/fitness";

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
        "flex flex-wrap items-center gap-4 rounded-xl border border-border-subtle bg-surface-elevated/25 p-3 sm:gap-6 sm:p-4",
        className
      )}
    >
      <h2 className="flex w-full items-center gap-2 text-lg font-semibold tracking-tight text-foreground sm:text-xl">
        <Heart size={22} className="shrink-0 text-red-400/90" aria-hidden />
        Cardio
      </h2>
      <FitnessCheckbox
        id="swim-checkbox"
        checked={swimChecked}
        onChange={(checked) => onSwimmingChange(checked ? 1 : 0)}
        disabled={locked}
        label="Swimming"
        labelClassName="text-foreground"
      />
      <FitnessCheckbox
        id="run-checkbox"
        checked={runChecked}
        onChange={(checked) => onRunningChange(checked ? 1 : 0)}
        disabled={locked}
        label="Running"
        labelClassName="text-foreground"
      />
    </div>
  );
}
