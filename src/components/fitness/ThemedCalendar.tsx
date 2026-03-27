"use client";

import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import type { FitnessCalendarDaySummary } from "@/types/fitness";

import { CalendarDayMarkers } from "./CalendarDayMarkers";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type ThemedCalendarProps = {
  value: Date;
  onSelect: (date: Date) => void;
  maxDate: Date;
  className?: string;
  daySummaries?: Record<string, FitnessCalendarDaySummary>;
  onVisibleMonthChange?: (year: number, month1Based: number) => void;
  /** When false, month data is not requested (e.g. calendar panel closed). */
  monthDataEnabled?: boolean;
};

function getMonthGrid(monthStart: Date): Date[] {
  const start = startOfWeek(startOfMonth(monthStart), { weekStartsOn: 0 });
  const end = endOfWeek(endOfMonth(monthStart), { weekStartsOn: 0 });
  const days: Date[] = [];
  let d = start;
  while (d <= end) {
    days.push(d);
    d = addDays(d, 1);
  }
  return days;
}

export function ThemedCalendar({
  value,
  onSelect,
  maxDate,
  className,
  daySummaries,
  onVisibleMonthChange,
  monthDataEnabled = true,
}: ThemedCalendarProps) {
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(value));
  const monthStart = startOfMonth(viewMonth);
  const grid = getMonthGrid(monthStart);
  const visibleYear = monthStart.getFullYear();
  const visibleMonth1Based = monthStart.getMonth() + 1;

  useEffect(() => {
    if (!monthDataEnabled) return;
    onVisibleMonthChange?.(visibleYear, visibleMonth1Based);
  }, [visibleYear, visibleMonth1Based, monthDataEnabled, onVisibleMonthChange]);

  const goPrevMonth = () => {
    setViewMonth(new Date(monthStart.getFullYear(), monthStart.getMonth() - 1));
  };

  const goNextMonth = () => {
    const next = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1);
    if (startOfMonth(next) <= maxDate) setViewMonth(next);
  };

  const canGoNext = () => {
    const next = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1);
    return startOfMonth(next) <= maxDate;
  };

  return (
    <div className={cn("rounded-xl border border-border-subtle bg-surface p-card", className)}>
      <div className="mb-stack flex items-center justify-between">
        <button
          type="button"
          onClick={goPrevMonth}
          aria-label="Previous month"
          className="flex min-h-touch min-w-touch items-center justify-center rounded-lg text-muted hover:bg-surface-elevated hover:text-foreground"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <span className="text-body font-semibold text-foreground sm:text-title">
          {format(monthStart, "MMMM yyyy")}
        </span>
        <button
          type="button"
          onClick={goNextMonth}
          disabled={!canGoNext()}
          aria-label="Next month"
          className="flex min-h-touch min-w-touch items-center justify-center rounded-lg text-muted hover:bg-surface-elevated hover:text-foreground disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
      <div className="grid grid-cols-7 gap-tight">
        {WEEKDAYS.map((day) => (
          <div key={day} className="py-1 text-center text-body-sm font-medium text-muted-fg">
            {day}
          </div>
        ))}
        {grid.map((day) => {
          const inMonth = isSameMonth(day, monthStart);
          const selected = isSameDay(day, value);
          const today = isToday(day);
          const disabled = isAfter(day, maxDate);
          const dateKey = format(day, "yyyy-MM-dd");
          const summary = daySummaries?.[dateKey];
          return (
            <button
              key={day.toISOString()}
              type="button"
              disabled={disabled}
              onClick={() => !disabled && onSelect(day)}
              className={cn(
                "flex min-h-[52px] flex-col items-center justify-start gap-0.5 rounded-lg px-0.5 pt-1 pb-1 text-body transition-colors sm:min-h-[48px] sm:text-body-sm",
                !inMonth && "text-muted-fg",
                inMonth && "text-foreground",
                disabled && "cursor-not-allowed opacity-50",
                !disabled && inMonth && "hover:bg-surface-elevated",
                selected && "bg-lime-400 text-zinc-950 hover:bg-lime-300",
                today && !selected && "ring-1 ring-lime-400/50"
              )}
            >
              <span className="leading-none tabular-nums">{format(day, "d")}</span>
              <CalendarDayMarkers summary={summary} markerId={dateKey.replace(/-/g, "")} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
