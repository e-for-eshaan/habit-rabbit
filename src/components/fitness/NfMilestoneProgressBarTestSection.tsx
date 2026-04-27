"use client";

import { useMemo, useState } from "react";

import { NfMilestoneProgressBar } from "@/components/fitness/NfMilestoneProgressBar";
import { buildNfMilestoneBar, type NextNfMilestone, NF_MILESTONES } from "@/lib/nfMilestones";
import { cn } from "@/lib/utils";

export function NfMilestoneProgressBarTestSection({ className }: { className?: string }) {
  const [shuffleKey, setShuffleKey] = useState(0);
  const rows = useMemo(() => {
    return NF_MILESTONES.map((milestone, index) => {
      const segmentStart = index === 0 ? 0 : NF_MILESTONES[index - 1]!.totalSeconds;
      const segmentEnd = milestone.totalSeconds;
      const elapsed = randomElapsedInSegment(segmentStart, segmentEnd);
      const next: NextNfMilestone = {
        label: milestone.label,
        totalSeconds: milestone.totalSeconds,
        remainingSeconds: milestone.totalSeconds - elapsed,
      };
      return {
        key: String(milestone.totalSeconds),
        title: milestone.label,
        milestoneBar: buildNfMilestoneBar(elapsed, next),
      };
    });
  }, [shuffleKey]);

  return (
    <section
      className={cn(
        "mt-stack flex flex-col gap-4 rounded-xl border border-dashed border-amber-500/35 bg-amber-500/5 p-card",
        className
      )}
      aria-label="Milestone progress bar test gallery"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-title font-semibold tracking-tight text-foreground">
          Milestone bar test (dev)
        </h2>
        <button
          type="button"
          onClick={() => setShuffleKey((k) => k + 1)}
          className="rounded-lg bg-amber-500/20 px-3 py-2 text-body-sm font-semibold text-amber-100 ring-1 ring-amber-400/40 hover:bg-amber-500/30"
        >
          Shuffle random progress
        </button>
      </div>
      <p className="text-body-xs text-muted-fg">
        One bar per milestone segment from streak start through six months, each with random elapsed
        in-range for that leg.
      </p>
      <div className="flex flex-col gap-6">
        {rows.map((row) => (
          <div
            key={row.key}
            className="flex flex-col gap-2 border-b border-border-subtle pb-6 last:border-b-0 last:pb-0"
          >
            <p className="text-body-sm font-medium text-muted">
              <span className="text-foreground">{row.title}</span>
              <span className="text-muted-fg"> · synthetic</span>
            </p>
            <NfMilestoneProgressBar milestoneBar={row.milestoneBar} />
          </div>
        ))}
      </div>
    </section>
  );
}

function randomElapsedInSegment(segmentStart: number, segmentEnd: number): number {
  const span = segmentEnd - segmentStart;
  if (span <= 1) {
    return segmentStart;
  }
  const offset = Math.floor(Math.random() * (span - 1));
  return segmentStart + offset;
}
