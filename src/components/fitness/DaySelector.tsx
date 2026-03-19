"use client";

import { useState } from "react";
import { format, addDays, subDays } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemedCalendar } from "./ThemedCalendar";

type DaySelectorProps = {
  dateKey: string;
  onDateChange: (dateKey: string) => void;
  className?: string;
};

function parseDateKey(key: string): Date {
  return new Date(key + "T12:00:00");
}

function getTodayKey(): string {
  return format(new Date(), "yyyy-MM-dd");
}

const ICON_SIZE = 18;

export function DaySelector({ dateKey, onDateChange, className }: DaySelectorProps) {
  const [accordionOpen, setAccordionOpen] = useState(false);
  const todayKey = getTodayKey();
  const d = parseDateKey(dateKey);
  const labelShort = format(d, "EEE d MMM");
  const labelLong = format(d, "EEEE, d MMM yyyy");
  const isToday = dateKey === todayKey;
  const todayDate = new Date();

  const goPrev = () => {
    const prev = subDays(d, 1);
    onDateChange(format(prev, "yyyy-MM-dd"));
  };

  const goNext = () => {
    const next = addDays(d, 1);
    onDateChange(format(next, "yyyy-MM-dd"));
  };

  const goToday = () => {
    onDateChange(todayKey);
  };

  const handleCalendarSelect = (date: Date) => {
    onDateChange(format(date, "yyyy-MM-dd"));
    setAccordionOpen(false);
  };

  const nextWouldBeFuture = format(addDays(d, 1), "yyyy-MM-dd") > todayKey;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-stone-200 bg-stone-50/50 dark:border-stone-600 dark:bg-stone-800/50 sm:rounded-xl",
        className
      )}
    >
      <div className="flex min-w-0 items-center justify-between gap-1 px-2 py-1.5 sm:gap-2 sm:px-3 sm:py-2">
        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous day"
            className="rounded-md p-1.5 text-stone-600 hover:bg-stone-200 dark:text-stone-400 dark:hover:bg-stone-700 sm:p-2"
          >
            <ChevronLeft size={ICON_SIZE} strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onClick={goToday}
            aria-label="Go to today"
            className={cn(
              "rounded-md px-1.5 py-1 text-xs font-medium sm:rounded-lg sm:px-2 sm:py-1.5 sm:text-sm",
              isToday
                ? "bg-stone-300 text-stone-600 dark:bg-stone-600 dark:text-stone-300"
                : "text-stone-600 hover:bg-stone-200 dark:text-stone-400 dark:hover:bg-stone-700"
            )}
          >
            Today
          </button>
        </div>
        <span
          className="min-w-0 flex-1 truncate text-center text-xs font-medium text-stone-800 dark:text-stone-200 sm:text-sm"
          title={labelLong}
        >
          <span className="sm:hidden">{labelShort}</span>
          <span className="hidden sm:inline">{labelLong}</span>
        </span>
        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
          <button
            type="button"
            onClick={() => setAccordionOpen(!accordionOpen)}
            aria-label={accordionOpen ? "Close calendar" : "Open calendar"}
            aria-expanded={accordionOpen}
            className="rounded-md p-1.5 text-stone-600 hover:bg-stone-200 dark:text-stone-400 dark:hover:bg-stone-700 sm:p-2"
          >
            {accordionOpen ? (
              <X size={ICON_SIZE} strokeWidth={2.5} />
            ) : (
              <Calendar size={ICON_SIZE} strokeWidth={2.5} />
            )}
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={nextWouldBeFuture}
            aria-label="Next day"
            className="rounded-md p-1.5 text-stone-600 hover:bg-stone-200 disabled:opacity-50 disabled:hover:bg-transparent dark:text-stone-400 dark:hover:bg-stone-700 sm:p-2"
          >
            <ChevronRight size={ICON_SIZE} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <div
        className={cn(
          "overflow-hidden border-t border-stone-200 bg-stone-50/80 transition-[max-height,opacity] duration-200 ease-out dark:border-stone-600 dark:bg-stone-800/80",
          accordionOpen ? "max-h-[420px] opacity-100" : "max-h-0 opacity-0"
        )}
        aria-hidden={!accordionOpen}
      >
        <div className="px-3 py-4 sm:px-4">
          <ThemedCalendar
            key={dateKey}
            value={d}
            onSelect={handleCalendarSelect}
            maxDate={todayDate}
          />
        </div>
      </div>
    </div>
  );
}
