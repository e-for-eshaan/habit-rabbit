"use client";

import { isEmpty } from "lodash";
import { useEffect, useMemo } from "react";

import { AddHabitFab } from "@/components/AddHabitFab";
import { CalendarGrid } from "@/components/CalendarGrid";
import { DeleteToast } from "@/components/DeleteToast";
import { FreqChart } from "@/components/FreqChart";
import { Navbar } from "@/components/Navbar";
import { SectionCard } from "@/components/SectionCard";
import { HomePageSkeleton } from "@/components/skeletons";
import { ViewChartPanel } from "@/components/ViewChartPanel";
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
  const loadRemainingUpdatesForChartView = useSectionsStore(
    (s) => s.loadRemainingUpdatesForChartView
  );

  const filteredAndSortedSections = useMemo(() => {
    const filtered = filterSectionsBySearch(sections, searchQuery);
    return sortSections(filtered, sortBy, sortDir);
  }, [sections, searchQuery, sortBy, sortDir]);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  useEffect(() => {
    if (viewMode === "list") return;
    void loadRemainingUpdatesForChartView();
  }, [viewMode, loadRemainingUpdatesForChartView]);

  if (loading) {
    return <HomePageSkeleton />;
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-stack px-page py-section">
        <p className="text-center text-body text-red-400">{error}</p>
        <button
          type="button"
          onClick={() => {
            useSectionsStore.setState({ loading: true });
            fetchSections();
          }}
          className="min-h-touch rounded-xl bg-surface-elevated px-4 py-2.5 text-body-sm font-medium text-foreground ring-1 ring-border-subtle hover:bg-zinc-700"
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
        <div className="flex min-h-[60vh] items-center justify-center px-page py-section">
          <p className="text-body text-muted-fg">No habits yet. Tap + to add one.</p>
        </div>
        <AddHabitFab />
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans">
      <Navbar />

      <main className="mx-auto max-w-7xl px-page py-section">
        {isEmpty(filteredAndSortedSections) ? (
          <p className="py-section text-center text-body text-muted-fg">
            No sections match your search.
          </p>
        ) : viewMode === "list" ? (
          <div
            className={cn(
              "flex gap-stack",
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
          <div className="grid grid-cols-1 gap-stack sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredAndSortedSections.map((section) => (
              <ViewChartPanel key={section.id} title={section.title} colorKey={section.colorKey}>
                <FreqChart section={section} freqRange={freqRange} />
              </ViewChartPanel>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-stack sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredAndSortedSections.map((section) => (
              <ViewChartPanel key={section.id} title={section.title} colorKey={section.colorKey}>
                <CalendarGrid section={section} range={calendarRange} />
              </ViewChartPanel>
            ))}
          </div>
        )}
      </main>
      <DeleteToast />
      <AddHabitFab />
    </div>
  );
}
