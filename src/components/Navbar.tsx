"use client";

import { useState, useRef, useEffect } from "react";
import { useSectionsStore, selectIsGridCollapsed } from "@/store/useSectionsStore";
import { LayoutToggle } from "@/components/LayoutToggle";
import { ViewModeToggle } from "@/components/ViewModeToggle";
import { CalendarRangeToggle } from "@/components/CalendarRangeToggle";
import { FreqRangeToggle } from "@/components/FreqRangeToggle";
import { SORT_OPTIONS } from "@/constants/sortOptions";
import { cn } from "@/lib/utils";

export function Navbar() {
  const searchQuery = useSectionsStore((s) => s.searchQuery);
  const setSearchQuery = useSectionsStore((s) => s.setSearchQuery);
  const sortBy = useSectionsStore((s) => s.sortBy);
  const sortDir = useSectionsStore((s) => s.sortDir);
  const setSort = useSectionsStore((s) => s.setSort);
  const layoutMode = useSectionsStore((s) => s.layoutMode);
  const setLayoutMode = useSectionsStore((s) => s.setLayoutMode);
  const viewMode = useSectionsStore((s) => s.viewMode);
  const setViewMode = useSectionsStore((s) => s.setViewMode);
  const calendarRange = useSectionsStore((s) => s.calendarRange);
  const setCalendarRange = useSectionsStore((s) => s.setCalendarRange);
  const freqRange = useSectionsStore((s) => s.freqRange);
  const setFreqRange = useSectionsStore((s) => s.setFreqRange);
  const isGridCollapsed = useSectionsStore(selectIsGridCollapsed);
  const collapseAll = useSectionsStore((s) => s.collapseAll);
  const expandAll = useSectionsStore((s) => s.expandAll);

  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? sortBy;
  const currentHasDirection = SORT_OPTIONS.find((o) => o.value === sortBy)?.hasDirection ?? false;

  const handleCollapseAllClick = () => {
    if (isGridCollapsed) expandAll();
    else collapseAll();
  };

  return (
    <header className="sticky top-0 z-10 border-b border-stone-200 bg-background/95 px-4 py-3 backdrop-blur dark:border-stone-700">
      <div className="mx-auto flex max-w-6xl flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="relative flex-1 min-w-[140px] max-w-md">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
              🔍
            </span>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sections & updates..."
              className="w-full rounded-lg border border-stone-300 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-stone-400 dark:border-stone-600 dark:bg-stone-800 dark:focus:ring-stone-500"
              aria-label="Search"
            />
          </div>

          <div className="relative" ref={sortRef}>
            <button
              type="button"
              onClick={() => setSortOpen((o) => !o)}
              className="flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
              aria-expanded={sortOpen}
              aria-haspopup="listbox"
            >
              <span>Sort: {currentSortLabel}</span>
              {currentHasDirection && (
                <span className="text-stone-500" aria-hidden>
                  {sortDir === "desc" ? "↓" : "↑"}
                </span>
              )}
              <span className={cn("text-stone-500", sortOpen && "rotate-180")}>▼</span>
            </button>
            {sortOpen && (
              <div
                className="absolute right-0 top-full z-20 mt-1 w-56 rounded-lg border border-stone-200 bg-white py-1 shadow-lg dark:border-stone-600 dark:bg-stone-800"
                role="listbox"
              >
                {SORT_OPTIONS.map((opt) => (
                  <div key={opt.value} className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSort(opt.value, opt.hasDirection ? sortDir : "asc");
                        if (!opt.hasDirection) setSortOpen(false);
                      }}
                      className={cn(
                        "flex flex-1 items-center justify-between px-3 py-2 text-left text-sm hover:bg-stone-100 dark:hover:bg-stone-700",
                        sortBy === opt.value && "bg-stone-100 dark:bg-stone-700"
                      )}
                    >
                      {opt.label}
                    </button>
                    {opt.hasDirection && sortBy === opt.value && (
                      <button
                        type="button"
                        onClick={() => {
                          const next = sortDir === "asc" ? "desc" : "asc";
                          setSort(sortBy, next);
                        }}
                        className="rounded px-2 py-1.5 text-xs text-stone-500 hover:bg-stone-200 hover:text-stone-700 dark:hover:bg-stone-600 dark:hover:text-stone-300"
                        title={
                          sortDir === "desc"
                            ? "Descending (click for ascending)"
                            : "Ascending (click for descending)"
                        }
                      >
                        {sortDir === "desc" ? "↓" : "↑"}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <ViewModeToggle mode={viewMode} onModeChange={setViewMode} />
          {viewMode === "calendar" && (
            <CalendarRangeToggle range={calendarRange} onRangeChange={setCalendarRange} />
          )}
          {viewMode === "freq" && (
            <FreqRangeToggle range={freqRange} onRangeChange={setFreqRange} />
          )}
          {viewMode === "list" && (
            <LayoutToggle
              mode={layoutMode}
              onModeChange={setLayoutMode}
              isGridCollapsed={isGridCollapsed}
              onCollapseAll={handleCollapseAllClick}
            />
          )}
        </div>
      </div>
    </header>
  );
}
