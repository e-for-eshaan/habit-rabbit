"use client";

import { isEmpty } from "lodash";
import { useEffect, useMemo } from "react";

import { AddHabitFab } from "@/components/AddHabitFab";
import { CalendarGrid } from "@/components/CalendarGrid";
import { DeleteToast } from "@/components/DeleteToast";
import { FreqChart } from "@/components/FreqChart";
import { Navbar } from "@/components/Navbar";
import { SectionCard } from "@/components/SectionCard";
import { getPastelStyle } from "@/constants/colors";
import { filterSectionsBySearch, sortSections } from "@/lib/sectionsFilterSort";
import { cn } from "@/lib/utils";
import { useSectionsStore } from "@/store/useSectionsStore";

export default function Home() {
  const loading = useSectionsStore((s) => s.loading);
  const error = useSectionsStore((s) => s.error);
  const sections = useSectionsStore((s) => s.sections);
  const searchQuery = useSectionsStore((s) => s.searchQuery);
  const sortBy = useSectionsStore((s) => s.sortBy);
  const sortDir = useSectionsStore((s) => s.sortDir);
  const layoutMode = useSectionsStore((s) => s.layoutMode);
  const viewMode = useSectionsStore((s) => s.viewMode);
  const calendarRange = useSectionsStore((s) => s.calendarRange);
  const freqRange = useSectionsStore((s) => s.freqRange);
  const collapsedBySectionId = useSectionsStore((s) => s.collapsedBySectionId);
  const fetchSections = useSectionsStore((s) => s.fetchSections);
  const addUpdate = useSectionsStore((s) => s.addUpdate);
  const editUpdate = useSectionsStore((s) => s.editUpdate);
  const scheduleDeleteUpdate = useSectionsStore((s) => s.scheduleDeleteUpdate);
  const toggleSectionCollapse = useSectionsStore((s) => s.toggleSectionCollapse);

  const filteredAndSortedSections = useMemo(() => {
    const filtered = filterSectionsBySearch(sections, searchQuery);
    return sortSections(filtered, sortBy, sortDir);
  }, [sections, searchQuery, sortBy, sortDir]);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <p className="text-stone-500 dark:text-stone-400">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button
          type="button"
          onClick={() => {
            useSectionsStore.setState({ loading: true });
            fetchSections();
          }}
          className="rounded-lg bg-stone-200 px-4 py-2 text-sm font-medium dark:bg-stone-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (isEmpty(sections)) {
    return (
      <div className="min-h-screen font-sans">
        <Navbar />
        <div className="flex min-h-[60vh] items-center justify-center p-4">
          <p className="text-stone-500 dark:text-stone-400">No habits yet.</p>
        </div>
        <AddHabitFab />
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans">
      <Navbar />

      <main className="mx-auto max-w-7xl p-4">
        {isEmpty(filteredAndSortedSections) ? (
          <p className="py-8 text-center text-stone-500 dark:text-stone-400">
            No sections match your search.
          </p>
        ) : viewMode === "list" ? (
          <div
            className={cn(
              "flex gap-4",
              layoutMode === "horizontal"
                ? "flex-nowrap overflow-x-auto pb-2"
                : "grid grid-cols-1 flex-wrap sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            )}
          >
            {filteredAndSortedSections.map((section) => (
              <div
                key={section.id}
                className={cn(
                  layoutMode === "horizontal" &&
                    "w-[min(380px,85vw)] shrink-0 sm:w-[min(360px,40vw)]"
                )}
              >
                <SectionCard
                  section={section}
                  collapsed={!!collapsedBySectionId[section.id]}
                  onToggleCollapse={toggleSectionCollapse}
                  onAddUpdate={addUpdate}
                  onEditUpdate={editUpdate}
                  onDeleteUpdate={scheduleDeleteUpdate}
                  openDashboardHref={section.id === "fitness" ? "/fitness" : undefined}
                />
              </div>
            ))}
          </div>
        ) : viewMode === "freq" ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredAndSortedSections.map((section) => {
              const style = getPastelStyle(section.colorKey);
              return (
                <div
                  key={section.id}
                  className={cn("rounded-xl border-2 p-4 shadow-sm", style.border, style.light)}
                >
                  <h2 className="mb-3 truncate font-semibold text-stone-800 dark:text-stone-200">
                    {section.title}
                  </h2>
                  <FreqChart section={section} freqRange={freqRange} />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredAndSortedSections.map((section) => {
              const style = getPastelStyle(section.colorKey);
              return (
                <div
                  key={section.id}
                  className={cn("rounded-xl border-2 p-4 shadow-sm", style.border, style.light)}
                >
                  <h2 className="mb-3 truncate font-semibold text-stone-800 dark:text-stone-200">
                    {section.title}
                  </h2>
                  <CalendarGrid section={section} range={calendarRange} />
                </div>
              );
            })}
          </div>
        )}
      </main>
      <DeleteToast />
      <AddHabitFab />
    </div>
  );
}
