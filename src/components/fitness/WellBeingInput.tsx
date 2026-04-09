"use client";

import { Flame, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import type { DayLog } from "@/types/fitness";

import { FitnessCheckbox } from "./FitnessCheckbox";

const WELLBEING_LEFT_ACCENT = "#a78bfa";

type WellBeingInputProps = {
  dayLog: DayLog;
  nfStreak: number;
  onNfChange: (checked: boolean) => void;
  locked?: boolean;
  className?: string;
};

export function WellBeingInput({
  dayLog,
  nfStreak,
  onNfChange,
  locked = false,
  className,
}: WellBeingInputProps) {
  const nfChecked = dayLog.nfCompleted === true;

  return (
    <div
      className={cn(
        "flex flex-col gap-inline rounded-xl border border-border-subtle bg-surface-elevated/25 p-inline sm:gap-stack sm:p-card",
        className
      )}
      style={{ borderLeftWidth: 3, borderLeftColor: WELLBEING_LEFT_ACCENT }}
    >
      <h2 className="flex w-full items-center gap-inline text-title font-semibold tracking-tight text-foreground sm:text-display">
        <Sparkles size={22} className="shrink-0 text-violet-300/90" aria-hidden />
        Well-being
      </h2>
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <FitnessCheckbox
          id="nf-checkbox"
          checked={nfChecked}
          onChange={onNfChange}
          disabled={locked}
          label="NF"
          labelClassName="text-foreground"
        />
        <span
          className="flex shrink-0 items-center gap-1 text-body-sm font-medium tabular-nums text-orange-400 sm:text-body"
          aria-label={nfStreak > 0 ? `NF streak ${nfStreak} days` : "No NF streak"}
        >
          <Flame size={18} className="shrink-0" aria-hidden />
          {nfStreak}
        </span>
      </div>
    </div>
  );
}
