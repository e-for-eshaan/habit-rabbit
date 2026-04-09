"use client";

import { isEmpty } from "lodash";
import { ChevronDown, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { getPastelAccentVar, getPastelStyle } from "@/constants/colors";
import { groupUpdatesByDay } from "@/lib/groupUpdatesByDay";
import { SECTION_UPDATES_PAGE_SIZE } from "@/lib/sectionUpdates";
import { cn } from "@/lib/utils";
import { useSectionsStore } from "@/store/useSectionsStore";
import type { Section } from "@/types";

import { AddUpdateForm } from "./AddUpdateForm";
import { UpdateDayGroup } from "./UpdateDayGroup";

const INITIAL_VISIBLE_UPDATES = 3;

type SectionCardProps = {
  section: Section;
  collapsed: boolean;
  onToggleCollapse: (sectionId: string) => void;
  onAddUpdate: (sectionId: string, text: string) => void;
  onEditUpdate: (
    sectionId: string,
    updateId: string,
    payload: { text?: string; createdAt?: string }
  ) => void;
  onDeleteUpdate: (sectionId: string, updateId: string) => void;
  openDashboardHref?: string;
};

export function SectionCard({
  section,
  collapsed,
  onToggleCollapse,
  onAddUpdate,
  onEditUpdate,
  onDeleteUpdate,
  openDashboardHref,
}: SectionCardProps) {
  const style = getPastelStyle(section.colorKey);
  const accentVar = getPastelAccentVar(section.colorKey);
  const fetchMoreSectionUpdates = useSectionsStore((s) => s.fetchMoreSectionUpdates);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_UPDATES);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeEditUpdateId, setActiveEditUpdateId] = useState<string | null>(null);

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_UPDATES);
  }, [section.id]);

  const totalInDb = section.updateCount ?? section.updates.length;
  const loadedCount = section.updates.length;

  const displayedUpdates = useMemo(
    () => section.updates.slice(0, Math.min(visibleCount, loadedCount)),
    [section.updates, visibleCount, loadedCount]
  );

  const dayGroups = useMemo(() => groupUpdatesByDay(displayedUpdates), [displayedUpdates]);

  const canShowMore = visibleCount < loadedCount || loadedCount < totalInDb;

  const handleShowMore = useCallback(async () => {
    if (visibleCount < loadedCount) {
      if (visibleCount <= INITIAL_VISIBLE_UPDATES) {
        setVisibleCount(Math.min(INITIAL_VISIBLE_UPDATES + 7, loadedCount));
      } else {
        setVisibleCount((v) => Math.min(v + SECTION_UPDATES_PAGE_SIZE, loadedCount));
      }
      return;
    }
    if (loadedCount < totalInDb) {
      const beforeLen = section.updates.length;
      setLoadingMore(true);
      try {
        await fetchMoreSectionUpdates(section.id);
        const afterLen =
          useSectionsStore.getState().sections.find((x) => x.id === section.id)?.updates.length ??
          beforeLen;
        setVisibleCount((v) => v + (afterLen - beforeLen));
      } finally {
        setLoadingMore(false);
      }
    }
  }, [
    visibleCount,
    loadedCount,
    totalInDb,
    section.id,
    section.updates.length,
    fetchMoreSectionUpdates,
  ]);

  const onEditSessionChange = useCallback((updateId: string | null) => {
    setActiveEditUpdateId(updateId);
  }, []);

  const pendingSave = useSectionsStore((s) => s.pendingUpdateSave);
  const pendingDeleteInFlight = useSectionsStore((s) => s.pendingDeleteInFlight);
  const savingUpdateId =
    pendingSave !== null && pendingSave.sectionId === section.id ? pendingSave.updateId : null;
  const deletingUpdateId =
    pendingDeleteInFlight !== null && pendingDeleteInFlight.sectionId === section.id
      ? pendingDeleteInFlight.updateId
      : null;

  const isCardLocked =
    activeEditUpdateId !== null || savingUpdateId !== null || deletingUpdateId !== null;

  return (
    <section
      className="relative flex min-w-[280px] max-w-[380px] flex-1 flex-col overflow-hidden rounded-2xl border border-border-subtle bg-surface shadow-sm transition-opacity"
      style={{ borderLeftWidth: 4, borderLeftColor: accentVar }}
      aria-busy={isCardLocked}
    >
      <div
        className={cn(
          "flex items-stretch gap-0 border-b border-border-subtle transition-opacity",
          isCardLocked && "pointer-events-none opacity-45"
        )}
      >
        <button
          type="button"
          onClick={() => onToggleCollapse(section.id)}
          data-testid="section-toggle"
          aria-expanded={!collapsed}
          aria-label={`${section.title}, ${totalInDb} update${totalInDb !== 1 ? "s" : ""}`}
          className={cn(
            "flex min-h-touch flex-1 items-center gap-inline px-4 py-3 text-left",
            style.light
          )}
        >
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-muted transition-transform",
              collapsed && "-rotate-90"
            )}
            aria-hidden
          />
          <span className="min-w-0 flex-1 truncate text-title font-semibold text-foreground">
            {section.title}
          </span>
          <span className="shrink-0 text-caption tabular-nums text-muted-fg">{totalInDb}</span>
        </button>
        {openDashboardHref && (
          <Link
            href={openDashboardHref}
            className={cn(
              "flex min-h-touch min-w-touch items-center justify-center border-l border-border-subtle text-muted hover:bg-surface-elevated hover:text-foreground"
            )}
            aria-label="Open fitness dashboard"
            title="Dashboard"
          >
            <LayoutDashboard className="size-5" aria-hidden />
          </Link>
        )}
      </div>
      {!collapsed && (
        <div className="flex flex-1 flex-col gap-inline p-card">
          <div className="flex flex-col gap-stack">
            {isEmpty(dayGroups) ? (
              <p className="py-6 text-center text-body-sm text-muted-fg">
                No updates yet. Add one below.
              </p>
            ) : (
              dayGroups.map((g) => (
                <UpdateDayGroup
                  key={g.dateKey}
                  dateLabel={g.dateLabel}
                  updates={g.updates}
                  onEdit={(updateId, payload) => onEditUpdate(section.id, updateId, payload)}
                  onDelete={(updateId) => onDeleteUpdate(section.id, updateId)}
                  onEditSessionChange={onEditSessionChange}
                  activeEditUpdateId={activeEditUpdateId}
                  savingUpdateId={savingUpdateId}
                  deletingUpdateId={deletingUpdateId}
                />
              ))
            )}
            {canShowMore && (
              <button
                type="button"
                onClick={() => void handleShowMore()}
                disabled={loadingMore}
                className="w-full rounded-md border border-border-subtle/70 bg-surface-elevated/60 px-2 py-1.5 text-caption font-medium text-muted-fg transition-colors hover:border-border-subtle hover:bg-surface-elevated hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loadingMore ? "Loading…" : "Show more"}
              </button>
            )}
          </div>
          <div
            className={cn("transition-opacity", isCardLocked && "pointer-events-none opacity-45")}
          >
            <AddUpdateForm onSubmit={(text) => onAddUpdate(section.id, text)} />
          </div>
        </div>
      )}
    </section>
  );
}
