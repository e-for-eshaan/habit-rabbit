"use client";

import { useMemo } from "react";
import type { Section } from "@/types";
import { getPastelStyle } from "@/constants/colors";
import { AddUpdateForm } from "./AddUpdateForm";
import { UpdateDayGroup } from "./UpdateDayGroup";
import { cn } from "@/lib/utils";
import { groupUpdatesByDay } from "@/lib/groupUpdatesByDay";
import { isEmpty } from "lodash";

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
};

export function SectionCard({
  section,
  collapsed,
  onToggleCollapse,
  onAddUpdate,
  onEditUpdate,
  onDeleteUpdate,
}: SectionCardProps) {
  const style = getPastelStyle(section.colorKey);
  const dayGroups = useMemo(() => groupUpdatesByDay(section.updates), [section.updates]);

  return (
    <section
      className={cn(
        "flex min-w-[280px] max-w-[380px] flex-1 flex-col rounded-xl border-2 shadow-sm",
        style.border,
        style.light
      )}
    >
      <button
        type="button"
        onClick={() => onToggleCollapse(section.id)}
        data-testid="section-toggle"
        className={cn(
          "flex items-center justify-between gap-2 px-4 py-3 text-left font-semibold",
          style.bg,
          "rounded-t-xl border-b border-stone-200/50 dark:border-stone-600/50"
        )}
      >
        <span className="truncate text-stone-800 dark:text-stone-200">{section.title}</span>
        <span className="text-xs font-normal text-stone-600 dark:text-stone-400">
          {section.updates.length} update{section.updates.length !== 1 ? "s" : ""}
        </span>
        <span
          className={cn(
            "shrink-0 text-stone-600 transition-transform dark:text-stone-400",
            collapsed && "rotate-180"
          )}
        >
          ▼
        </span>
      </button>
      {!collapsed && (
        <div className="flex flex-1 flex-col gap-3 p-3">
          <div className="flex flex-col gap-2">
            {isEmpty(dayGroups) ? (
              <p className="py-4 text-center text-sm text-stone-500 dark:text-stone-400">
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
                />
              ))
            )}
          </div>
          <AddUpdateForm onSubmit={(text) => onAddUpdate(section.id, text)} />
        </div>
      )}
    </section>
  );
}
