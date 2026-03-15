"use client";

import type { Section } from "@/types";
import { getUpdatesCountByDay, getHeatLevel } from "@/lib/calendarHeatmap";
import type { CalendarRange } from "@/store/useSectionsStore";
import { getDaysInRange, getCalendarGrid, toDateKey } from "@/lib/dateRange";
import {
  formatIndianDate,
  formatCalendarRangeLabel,
  rangeSpansMultipleYears,
  WEEKDAY_NAMES,
} from "@/lib/formatIndianDate";
import { cn } from "@/lib/utils";

type CalendarGridProps = {
  section: Section;
  range: CalendarRange;
  className?: string;
};

function cellTooltipText(dateKey: string | null, count: number, emptyDayName?: string): string {
  if (dateKey) {
    const { date, day } = formatIndianDate(dateKey);
    const updatesLabel = count === 1 ? "1 update" : `${count} updates`;
    return `${day}\n${date}\n${updatesLabel}`;
  }
  if (emptyDayName) {
    return `${emptyDayName}\n—\n0 updates`;
  }
  return "";
}

function Cell({
  dateKey,
  count,
  level,
  emptyDayName,
}: {
  dateKey: string | null;
  count: number;
  level: number;
  emptyDayName?: string;
}) {
  const isPlaceholder = !dateKey;
  const title = cellTooltipText(dateKey, count, emptyDayName);

  return (
    <div
      className={cn(
        "aspect-square rounded-sm border border-stone-200/60 dark:border-stone-600/60",
        isPlaceholder && "invisible",
        isPlaceholder && "invisible",
        !isPlaceholder && level === 0 && "heat-0",
        !isPlaceholder && level === 1 && "heat-1",
        !isPlaceholder && level === 2 && "heat-2",
        !isPlaceholder && level === 3 && "heat-3",
        !isPlaceholder && level === 4 && "heat-4",
        !isPlaceholder && level === 5 && "heat-5"
      )}
      title={title || undefined}
    />
  );
}

export function CalendarGrid({ section, range, className }: CalendarGridProps) {
  const countsByDay = getUpdatesCountByDay(section.updates, range);

  if (range === "month" || range === "last30") {
    const days = getDaysInRange(range);
    const grid = getCalendarGrid(days);
    const includeYear = rangeSpansMultipleYears(days);
    const startLabel = days[0] ? formatCalendarRangeLabel(toDateKey(days[0]), includeYear) : "";
    const endLabel = days.length
      ? formatCalendarRangeLabel(toDateKey(days[days.length - 1]!), includeYear)
      : "";
    return (
      <div className={cn("flex flex-col gap-0.5", className)}>
        <div
          className="grid gap-0.5 w-full max-w-[280px]"
          style={{ gridTemplateColumns: "repeat(7, minmax(0, 1fr))" }}
        >
          {grid.map((row, r) =>
            row.map((d, c) => {
              if (!d) {
                return (
                  <Cell
                    key={`e-${r}-${c}`}
                    dateKey={null}
                    count={0}
                    level={0}
                    emptyDayName={WEEKDAY_NAMES[c]}
                  />
                );
              }
              const dateKey = toDateKey(d);
              const count = countsByDay[dateKey] ?? 0;
              const level = getHeatLevel(count, countsByDay);
              return <Cell key={dateKey} dateKey={dateKey} count={count} level={level} />;
            })
          )}
        </div>
        <div className="flex justify-between text-fluid-xs text-stone-500 dark:text-stone-400">
          <span>{startLabel}</span>
          <span>{endLabel}</span>
        </div>
      </div>
    );
  }

  const days = getDaysInRange(range);
  const includeYear = rangeSpansMultipleYears(days);
  const startLabel = days[0] ? formatCalendarRangeLabel(toDateKey(days[0]), includeYear) : "";
  const endLabel = days.length
    ? formatCalendarRangeLabel(toDateKey(days[days.length - 1]!), includeYear)
    : "";
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div
        className="grid gap-0.5"
        style={{
          gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))`,
        }}
      >
        {days.map((d) => {
          const dateKey = toDateKey(d);
          const count = countsByDay[dateKey] ?? 0;
          const level = getHeatLevel(count, countsByDay);
          return <Cell key={dateKey} dateKey={dateKey} count={count} level={level} />;
        })}
      </div>
      <div className="flex justify-between text-fluid-xs text-stone-500 dark:text-stone-400">
        <span>{startLabel}</span>
        <span>{endLabel}</span>
      </div>
    </div>
  );
}
