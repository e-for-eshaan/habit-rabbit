"use client";

import { addDays, format, subDays } from "date-fns";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useState } from "react";

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

const ICON_SIZE = 22;

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
        "overflow-hidden rounded-xl border border-border-subtle bg-surface-elevated/25",
        className
      )}
    >
      <div className="flex min-w-0 items-center justify-between gap-1 px-2 py-2 sm:gap-2 sm:px-3">
        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous day"
            className="rounded-lg p-2 text-muted hover:bg-surface hover:text-foreground"
          >
            <ChevronLeft size={ICON_SIZE} strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onClick={goToday}
            aria-label="Go to today"
            className={cn(
              "rounded-lg px-2.5 py-2 text-sm font-medium",
              isToday
                ? "bg-lime-400/20 text-lime-200 ring-1 ring-lime-400/35"
                : "text-muted hover:bg-surface hover:text-foreground"
            )}
          >
            Today
          </button>
        </div>
        <span
          className="min-w-0 flex-1 truncate text-center text-sm font-medium text-foreground sm:text-base"
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
            className="rounded-lg p-2 text-muted hover:bg-surface hover:text-foreground"
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
            className="rounded-lg p-2 text-muted hover:bg-surface hover:text-foreground disabled:opacity-40 disabled:hover:bg-transparent"
          >
            <ChevronRight size={ICON_SIZE} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <div
        className={cn(
          "overflow-hidden border-t border-border-subtle bg-surface/50 transition-[max-height,opacity] duration-200 ease-out",
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
