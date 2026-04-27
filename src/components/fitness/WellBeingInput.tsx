"use client";

import { Sparkles, Trophy } from "lucide-react";
import { useMemo, useState } from "react";

import { NfMilestoneCongratulationsModal } from "@/components/fitness/NfMilestoneCongratulationsModal";
import { useNfStreakMilestoneState } from "@/components/fitness/useNfStreakMilestoneState";
import { formatNfElapsedFromTotalSeconds } from "@/lib/nfElapsed";
import { cn } from "@/lib/utils";

const WELLBEING_LEFT_ACCENT = "#a78bfa";

type WellBeingInputProps = {
  nfStreakStartedAt: string | undefined;
  nfPersonalBestSeconds?: number;
  nfMilestoneCongratsShownKeys?: string[];
  onStartStreak: () => void;
  onFailStreak: () => void;
  onRecordMilestoneCongrat: (milestoneKey: string) => void;
  canMutateNf: boolean;
  className?: string;
};

export function WellBeingInput({
  nfStreakStartedAt,
  nfPersonalBestSeconds,
  nfMilestoneCongratsShownKeys,
  onStartStreak,
  onFailStreak,
  onRecordMilestoneCongrat,
  canMutateNf,
  className,
}: WellBeingInputProps) {
  const streakActive = Boolean(nfStreakStartedAt);
  const [showFailConfirm, setShowFailConfirm] = useState(false);
  const pbSeconds = nfPersonalBestSeconds ?? 0;
  const pbLabel = pbSeconds > 0 ? formatNfElapsedFromTotalSeconds(pbSeconds) : "—";

  const congrats = useMemo(
    () =>
      streakActive
        ? {
            congratsShownKeys: nfMilestoneCongratsShownKeys,
            onRecordCongrat: onRecordMilestoneCongrat,
          }
        : null,
    [streakActive, nfMilestoneCongratsShownKeys, onRecordMilestoneCongrat]
  );

  const { liveLabel, isPr, milestoneStatus, milestoneModal, closeMilestoneModal } =
    useNfStreakMilestoneState(nfStreakStartedAt, pbSeconds, congrats);

  return (
    <div
      className={cn(
        "flex flex-col gap-inline rounded-xl border border-border-subtle bg-surface-elevated/25 p-inline sm:gap-stack sm:p-card",
        className
      )}
      style={{ borderLeftWidth: 3, borderLeftColor: WELLBEING_LEFT_ACCENT }}
    >
      <NfMilestoneCongratulationsModal payload={milestoneModal} onClose={closeMilestoneModal} />
      <h2 className="flex w-full items-center gap-inline text-title font-semibold tracking-tight text-foreground sm:text-display">
        <Sparkles size={22} className="shrink-0 text-violet-300/90" aria-hidden />
        Well-being
      </h2>
      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex w-full min-w-0 flex-nowrap items-stretch gap-3">
          {!streakActive && (
            <>
              <div className="flex min-h-touch min-w-0 flex-1 items-center rounded-xl bg-surface-elevated/20 px-3 py-2.5 text-body-sm text-muted ring-1 ring-border-subtle">
                No active streak
              </div>
              <button
                type="button"
                onClick={onStartStreak}
                disabled={!canMutateNf}
                className={cn(
                  "min-h-touch shrink-0 whitespace-nowrap rounded-xl px-4 py-2.5 text-body-sm font-semibold tabular-nums ring-1 transition",
                  canMutateNf
                    ? "bg-violet-500/20 text-violet-100 ring-violet-400/40 hover:bg-violet-500/30"
                    : "cursor-not-allowed bg-surface-elevated/50 text-muted ring-border-subtle"
                )}
                aria-label="Start NF streak"
              >
                Start streak
              </button>
            </>
          )}
          {streakActive && nfStreakStartedAt && (
            <>
              <NfStreakElapsedView liveLabel={liveLabel} isPr={isPr} />
              {showFailConfirm ? (
                <div className="flex min-h-touch shrink-0 flex-nowrap items-stretch gap-2">
                  <button
                    type="button"
                    onClick={() => setShowFailConfirm(false)}
                    className="rounded-xl px-3 py-2.5 text-body-sm font-semibold text-muted ring-1 ring-border-subtle transition hover:bg-surface-elevated hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onFailStreak();
                      setShowFailConfirm(false);
                    }}
                    disabled={!canMutateNf}
                    className={cn(
                      "whitespace-nowrap rounded-xl px-3 py-2.5 text-body-sm font-semibold ring-1 transition",
                      canMutateNf
                        ? "bg-red-500/25 text-red-100 ring-red-400/45 hover:bg-red-500/35"
                        : "cursor-not-allowed bg-surface-elevated/50 text-muted ring-border-subtle"
                    )}
                  >
                    End streak
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowFailConfirm(true)}
                  disabled={!canMutateNf}
                  className={cn(
                    "min-h-touch shrink-0 whitespace-nowrap rounded-xl px-4 py-2.5 text-body-sm font-semibold ring-1 transition",
                    canMutateNf
                      ? "bg-red-500/15 text-red-200 ring-red-400/35 hover:bg-red-500/25"
                      : "cursor-not-allowed bg-surface-elevated/50 text-muted ring-border-subtle"
                  )}
                  aria-label="End streak, I failed"
                >
                  I failed
                </button>
              )}
            </>
          )}
        </div>
        <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-body-xs tabular-nums text-muted-fg">
          <span>
            Personal best · <span className="text-muted">{pbLabel}</span>
          </span>
          {milestoneStatus.kind === "next" && (
            <span>
              Milestone ·{" "}
              <span className="text-muted">
                {milestoneStatus.timeToGo} to go ({milestoneStatus.milestoneName})
              </span>
            </span>
          )}
          {milestoneStatus.kind === "all" && (
            <span>
              Milestone · <span className="text-muted">all milestones reached</span>
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

function NfStreakElapsedView({ liveLabel, isPr }: { liveLabel: string; isPr: boolean }) {
  return (
    <span
      className="flex min-h-touch min-w-0 flex-1 items-center justify-between gap-2 rounded-xl bg-orange-500/10 px-3 py-2.5 text-body font-medium tabular-nums text-orange-300 ring-1 ring-orange-400/30 sm:px-4 sm:py-2"
      aria-live="polite"
      aria-label={`NF streak elapsed ${liveLabel}`}
    >
      <span className="min-w-0 truncate">{liveLabel}</span>
      {isPr && (
        <span className="flex shrink-0 items-center gap-1 text-body-xs font-semibold uppercase tracking-wide text-amber-300">
          <Trophy className="size-4 shrink-0 text-amber-400" aria-hidden />
          PR
        </span>
      )}
    </span>
  );
}
