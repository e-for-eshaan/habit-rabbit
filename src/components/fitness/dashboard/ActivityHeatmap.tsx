"use client";

import { format } from "date-fns";
import { isNil } from "lodash";
import { Check, X } from "lucide-react";
import { useMemo, useState } from "react";

import { CARDIO_RUN_COLOR, CARDIO_SWIM_COLOR, getPastelAccentVar } from "@/constants/colors";
import { toDateKey } from "@/lib/dateRange";
import { EXERCISE_GROUPS } from "@/lib/fitnessConstants";
import { getActivityHeatLevel } from "@/lib/fitnessDashboard";
import { cn } from "@/lib/utils";
import type { DayLog, Exercise, FitnessState } from "@/types/fitness";
import type { ActivityDayBreakdown } from "@/types/fitnessDashboard";

const HEATMAP_GAP = 1;
const HEATMAP_COLS = 7;

const EMPTY_BREAKDOWN: ActivityDayBreakdown = {
  exercises: 0,
  swimming: 0,
  running: 0,
};

type ActivityHeatmapProps = {
  fitnessState: Pick<FitnessState, "exercises" | "dayLogs">;
  activityByDay: Record<string, number>;
  activityBreakdownByDay: Record<string, ActivityDayBreakdown>;
  grid: (Date | null)[][];
  className?: string;
};

export function ActivityHeatmap({
  fitnessState,
  activityByDay,
  activityBreakdownByDay,
  grid,
  className,
}: ActivityHeatmapProps) {
  const accent = getPastelAccentVar(2);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const hasAny = Object.values(activityByDay).some((c) => c > 0);
  const flatCells = useMemo(() => grid.flat(), [grid]);
  const cellFlexBasis = `calc((100% - ${(HEATMAP_COLS - 1) * HEATMAP_GAP}px) / ${HEATMAP_COLS})`;

  return (
    <div
      className={cn(
        "flex min-h-full min-w-0 flex-col rounded-xl border border-border-subtle bg-surface-elevated/30 p-card",
        className
      )}
      style={{ borderLeftWidth: 3, borderLeftColor: accent }}
    >
      <h3 className="mb-tight text-body-sm font-medium text-muted sm:mb-inline sm:text-body">
        Activity (last 12 weeks)
      </h3>
      {!hasAny ? (
        <p className="flex flex-1 items-center text-body-sm text-muted-fg sm:text-body lg:min-h-[120px]">
          Log activity to see your calendar.
        </p>
      ) : (
        <div className="flex min-h-0 flex-1 flex-row items-start gap-inline">
          <div
            className="flex w-full max-w-[98px] shrink-0 flex-wrap content-start gap-px sm:max-w-[112px] md:max-w-[126px] lg:max-w-[140px]"
            style={{ flex: "1 1 0" }}
            role="grid"
            aria-label="Activity heatmap, last 12 weeks"
          >
            {flatCells.map((d, i) => {
              if (!d) {
                return (
                  <div
                    key={`empty-${i}`}
                    className="rounded-[1px] border border-border-subtle opacity-0"
                    style={{
                      flex: `0 0 ${cellFlexBasis}`,
                      aspectRatio: "1",
                    }}
                    aria-hidden
                  />
                );
              }
              const dateKey = toDateKey(d);
              const count = activityByDay[dateKey] ?? 0;
              const level = getActivityHeatLevel(count, activityByDay);
              const selected = selectedDateKey === dateKey;
              const total = count;
              const breakdown = activityBreakdownByDay[dateKey] ?? EMPTY_BREAKDOWN;
              const hasSwim = breakdown.swimming > 0;
              const hasRun = breakdown.running > 0;
              const swimRunParts = [hasSwim ? "swim" : "", hasRun ? "run" : ""].filter(Boolean);
              const swimRunLabel = swimRunParts.length > 0 ? `, ${swimRunParts.join(", ")}` : "";
              const heatBg = heatmapCellBackground(level);
              return (
                <button
                  key={dateKey}
                  type="button"
                  onClick={() => setSelectedDateKey((prev) => (prev === dateKey ? null : dateKey))}
                  className="relative min-w-0 cursor-pointer overflow-hidden rounded-[1px] border border-border-subtle p-0 transition-[filter] hover:brightness-110 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-lime-400/80 focus-visible:ring-offset-1 focus-visible:ring-offset-zinc-950"
                  style={{
                    flex: `0 0 ${cellFlexBasis}`,
                    aspectRatio: "1",
                  }}
                  aria-label={`${formatActivityDetailDate(dateKey)}, ${total === 0 ? "no activity" : `${total} sessions`}${swimRunLabel}`}
                  aria-pressed={selected}
                >
                  <span
                    className="grid size-full min-h-0 min-w-0 grid-cols-2 grid-rows-2"
                    aria-hidden
                  >
                    <span
                      className="min-h-0 min-w-0"
                      style={{
                        backgroundColor: hasSwim ? CARDIO_SWIM_COLOR : heatBg,
                      }}
                    />
                    <span
                      className="min-h-0 min-w-0"
                      style={{
                        backgroundColor: hasRun ? CARDIO_RUN_COLOR : heatBg,
                      }}
                    />
                    <span className="min-h-0 min-w-0" style={{ backgroundColor: heatBg }} />
                    <span className="min-h-0 min-w-0" style={{ backgroundColor: heatBg }} />
                  </span>
                  {selected ? (
                    <span
                      className="pointer-events-none absolute bottom-0.5 right-0.5 size-1.5 rounded-full bg-lime-400 ring-1 ring-zinc-950/70 sm:size-2"
                      aria-hidden
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
          {selectedDateKey !== null && (
            <ActivityDayDetailPanel
              dateKey={selectedDateKey}
              breakdown={activityBreakdownByDay[selectedDateKey] ?? EMPTY_BREAKDOWN}
              exercises={fitnessState.exercises}
              dayLog={fitnessState.dayLogs.find((l) => l.dateKey === selectedDateKey)}
              onClose={() => setSelectedDateKey(null)}
            />
          )}
        </div>
      )}
    </div>
  );
}

function ActivityDayDetailPanel({
  dateKey,
  breakdown,
  exercises,
  dayLog,
  onClose,
}: {
  dateKey: string;
  breakdown: ActivityDayBreakdown;
  exercises: Exercise[];
  dayLog: DayLog | undefined;
  onClose: () => void;
}) {
  const groupRows = useMemo(
    () => buildActivityDetailGroupRows(dayLog, exercises),
    [dayLog, exercises]
  );
  const hasSwim = breakdown.swimming > 0;
  const hasRun = breakdown.running > 0;
  const hasAny = groupRows.length > 0 || hasSwim || hasRun;
  return (
    <div className="min-w-0 w-fit max-w-48 shrink-0 rounded-lg border border-border-subtle bg-surface/80 px-2 py-1.5 ring-1 ring-border-subtle sm:max-w-56 sm:px-2.5 sm:py-2">
      <div className="mb-tight flex items-start justify-between gap-tight">
        <p className="text-caption font-semibold text-foreground sm:text-body-sm">
          {formatActivityDetailDate(dateKey)}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="flex size-3.5 shrink-0 items-center justify-center rounded-sm text-muted-fg hover:bg-surface-elevated hover:text-foreground"
          aria-label="Close day details"
        >
          <X className="size-2.5" strokeWidth={2.5} aria-hidden />
        </button>
      </div>
      {!hasAny ? (
        <p className="text-caption text-muted-fg sm:text-body-sm">No activity logged.</p>
      ) : (
        <ul className="flex flex-col gap-1.5 text-caption text-foreground sm:text-body-sm">
          {groupRows.map((row) => (
            <li
              key={row.label}
              className="flex items-center justify-between gap-2"
              aria-label={`${row.label}: ${row.count} exercises`}
            >
              <span className="min-w-0 truncate text-muted-fg">{row.label}</span>
              <span className="shrink-0 tabular-nums font-medium">{row.count}</span>
            </li>
          ))}
          {hasSwim && (
            <li className="flex items-center justify-between gap-2" aria-label="Swimming: done">
              <span className="text-muted-fg">Swimming</span>
              <Check className="size-3.5 shrink-0 text-emerald-400" strokeWidth={2.5} aria-hidden />
            </li>
          )}
          {hasRun && (
            <li className="flex items-center justify-between gap-2" aria-label="Running: done">
              <span className="text-muted-fg">Running</span>
              <Check className="size-3.5 shrink-0 text-emerald-400" strokeWidth={2.5} aria-hidden />
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

function formatActivityDetailDate(dateKey: string): string {
  const d = new Date(`${dateKey}T12:00:00`);
  if (Number.isNaN(d.getTime())) return dateKey;
  return format(d, "EEE, d MMMM");
}

function heatmapCellBackground(level: number): string {
  return `var(--heat-${level})`;
}

function buildActivityDetailGroupRows(
  dayLog: DayLog | undefined,
  exercises: Exercise[]
): { label: string; count: number }[] {
  if (isNil(dayLog) || dayLog.exerciseIds.length === 0) return [];
  const byId = new Map(exercises.map((e) => [e.id, e]));
  const countsByGroup: Record<string, number> = {};
  for (const id of dayLog.exerciseIds) {
    const ex = byId.get(id);
    if (ex) countsByGroup[ex.group] = (countsByGroup[ex.group] ?? 0) + 1;
  }
  const canonical = new Set<string>(EXERCISE_GROUPS as unknown as string[]);
  const ordered: { label: string; count: number }[] = [];
  for (const g of EXERCISE_GROUPS) {
    const c = countsByGroup[g];
    if (c > 0) ordered.push({ label: g, count: c });
  }
  const extras = Object.keys(countsByGroup)
    .filter((g) => !canonical.has(g))
    .sort();
  for (const g of extras) {
    const c = countsByGroup[g];
    if (c > 0) ordered.push({ label: g, count: c });
  }
  return ordered;
}
