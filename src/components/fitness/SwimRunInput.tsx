"use client";

import { Heart } from "lucide-react";

import { cn } from "@/lib/utils";
import type { DayLog } from "@/types/fitness";

import { FitnessCheckbox } from "./FitnessCheckbox";

const CARDIO_LEFT_ACCENT = "#a3e635";

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
        "flex flex-col gap-inline rounded-xl border border-border-subtle bg-surface-elevated/25 p-inline sm:gap-stack sm:p-card",
        className
      )}
      style={{ borderLeftWidth: 3, borderLeftColor: CARDIO_LEFT_ACCENT }}
    >
      <h2 className="flex w-full items-center gap-inline text-title font-semibold tracking-tight text-foreground sm:text-display">
        <Heart size={22} className="shrink-0 text-red-400/90" aria-hidden />
        Cardio
      </h2>
      <div className="grid min-w-0 grid-cols-2 gap-0">
        <div className="min-w-0 pr-2 sm:pr-3">
          <FitnessCheckbox
            id="swim-checkbox"
            checked={swimChecked}
            onChange={(checked) => onSwimmingChange(checked ? 1 : 0)}
            disabled={locked}
            label="Swimming"
            labelClassName="text-foreground"
          />
        </div>
        <div className="min-w-0 border-l border-border-subtle pl-2 sm:pl-3">
          <FitnessCheckbox
            id="run-checkbox"
            checked={runChecked}
            onChange={(checked) => onRunningChange(checked ? 1 : 0)}
            disabled={locked}
            label="Running"
            labelClassName="text-foreground"
          />
        </div>
      </div>
    </div>
  );
}
