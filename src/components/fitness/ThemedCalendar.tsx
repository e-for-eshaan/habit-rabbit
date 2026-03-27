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
import { useState } from "react";

import { cn } from "@/lib/utils";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type ThemedCalendarProps = {
  value: Date;
  onSelect: (date: Date) => void;
  maxDate: Date;
  className?: string;
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

export function ThemedCalendar({ value, onSelect, maxDate, className }: ThemedCalendarProps) {
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(value));
  const monthStart = startOfMonth(viewMonth);
  const grid = getMonthGrid(monthStart);

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
    <div
      className={cn(
        "rounded-xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-600 dark:bg-stone-800/80",
        className
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={goPrevMonth}
          aria-label="Previous month"
          className="rounded-lg p-2 text-stone-600 hover:bg-stone-200 dark:text-stone-400 dark:hover:bg-stone-700"
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
        <span className="text-base font-semibold text-stone-800 dark:text-stone-200 sm:text-lg">
          {format(monthStart, "MMMM yyyy")}
        </span>
        <button
          type="button"
          onClick={goNextMonth}
          disabled={!canGoNext()}
          aria-label="Next month"
          className="rounded-lg p-2 text-stone-600 hover:bg-stone-200 disabled:opacity-40 disabled:hover:bg-transparent dark:text-stone-400 dark:hover:bg-stone-700"
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
      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="py-1 text-center text-sm font-medium text-stone-500 dark:text-stone-400"
          >
            {day}
          </div>
        ))}
        {grid.map((day) => {
          const inMonth = isSameMonth(day, monthStart);
          const selected = isSameDay(day, value);
          const today = isToday(day);
          const disabled = isAfter(day, maxDate);
          return (
            <button
              key={day.toISOString()}
              type="button"
              disabled={disabled}
              onClick={() => !disabled && onSelect(day)}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg text-base transition-colors sm:h-9 sm:w-9 sm:text-sm",
                !inMonth && "text-stone-400 dark:text-stone-500",
                inMonth && "text-stone-800 dark:text-stone-200",
                disabled && "cursor-not-allowed opacity-50",
                !disabled && inMonth && "hover:bg-stone-200 dark:hover:bg-stone-700",
                selected &&
                  "bg-stone-800 text-white hover:bg-stone-700 dark:bg-stone-200 dark:text-stone-800 dark:hover:bg-stone-300",
                today && !selected && "ring-1 ring-stone-400 dark:ring-stone-500"
              )}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}
