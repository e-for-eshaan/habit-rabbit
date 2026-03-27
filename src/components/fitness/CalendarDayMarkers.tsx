"use client";

import type { FitnessCalendarDaySummary } from "@/types/fitness";

const HEART_PATH =
  "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z";

type CalendarDayMarkersProps = {
  summary: FitnessCalendarDaySummary | undefined;
  markerId: string;
};

export function CalendarDayMarkers({ summary, markerId }: CalendarDayMarkersProps) {
  if (!summary) return null;
  const { running, swimming, groupCount } = summary;
  const showHeart = running || swimming;
  const showBadge = groupCount > 0;
  if (!showHeart && !showBadge) return null;

  const gradId = `cal-heart-${markerId}`;

  return (
    <span className="flex min-h-[14px] items-center justify-center gap-0.5">
      {showHeart && (
        <svg width={11} height={11} viewBox="0 0 24 24" className="shrink-0" aria-hidden>
          {running && swimming ? (
            <>
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="50%" stopColor="#ef4444" />
                  <stop offset="50%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
              <path fill={`url(#${gradId})`} d={HEART_PATH} />
            </>
          ) : (
            <path fill={running ? "#ef4444" : "#3b82f6"} d={HEART_PATH} />
          )}
        </svg>
      )}
      {showBadge && (
        <span className="min-w-[14px] rounded-full bg-zinc-600 px-0.5 py-px text-center text-[9px] font-semibold tabular-nums leading-none text-zinc-100">
          {groupCount}
        </span>
      )}
    </span>
  );
}
