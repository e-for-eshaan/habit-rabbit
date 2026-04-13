"use client";

import { Sparkles } from "lucide-react";
import { useLayoutEffect, useState } from "react";

import { formatNfElapsedFromStart } from "@/lib/nfElapsed";
import { cn } from "@/lib/utils";

const WELLBEING_LEFT_ACCENT = "#a78bfa";

type WellBeingInputProps = {
  nfStreakStartedAt: string | undefined;
  onStartStreak: () => void;
  onFailStreak: () => void;
  canMutateNf: boolean;
  className?: string;
};

export function WellBeingInput({
  nfStreakStartedAt,
  onStartStreak,
  onFailStreak,
  canMutateNf,
  className,
}: WellBeingInputProps) {
  const streakActive = Boolean(nfStreakStartedAt);

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
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-3 sm:gap-y-2">
        {!streakActive && (
          <button
            type="button"
            onClick={onStartStreak}
            disabled={!canMutateNf}
            className={cn(
              "min-h-touch w-full rounded-xl px-4 py-2.5 text-body-sm font-semibold tabular-nums ring-1 transition sm:w-auto",
              canMutateNf
                ? "bg-violet-500/20 text-violet-100 ring-violet-400/40 hover:bg-violet-500/30"
                : "cursor-not-allowed bg-surface-elevated/50 text-muted ring-border-subtle"
            )}
            aria-label="Start NF streak"
          >
            Start streak
          </button>
        )}
        {streakActive && nfStreakStartedAt && (
          <>
            <NfStreakElapsedLive startedAtIso={nfStreakStartedAt} />
            <button
              type="button"
              onClick={onFailStreak}
              disabled={!canMutateNf}
              className={cn(
                "min-h-touch w-full rounded-xl px-4 py-2.5 text-body-sm font-semibold ring-1 transition sm:w-auto",
                canMutateNf
                  ? "bg-red-500/15 text-red-200 ring-red-400/35 hover:bg-red-500/25"
                  : "cursor-not-allowed bg-surface-elevated/50 text-muted ring-border-subtle"
              )}
              aria-label="End streak, I failed"
            >
              I failed
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function NfStreakElapsedLive({ startedAtIso }: { startedAtIso: string }) {
  const [label, setLabel] = useState("");

  useLayoutEffect(() => {
    const tick = () => setLabel(formatNfElapsedFromStart(startedAtIso, Date.now()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [startedAtIso]);

  return (
    <span
      className="flex min-h-touch w-full min-w-0 items-center justify-center rounded-xl bg-orange-500/10 px-4 py-2.5 text-body font-medium tabular-nums text-orange-300 ring-1 ring-orange-400/30 sm:flex-1 sm:justify-start sm:py-2"
      aria-live="polite"
      aria-label={`NF streak elapsed ${label}`}
    >
      {label}
    </span>
  );
}
