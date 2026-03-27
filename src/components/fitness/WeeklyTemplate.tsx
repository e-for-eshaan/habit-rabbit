"use client";

import { groupBy } from "lodash";
import { X } from "lucide-react";
import { useMemo, useState } from "react";

import { getPastelAccentVar, getPastelStyle } from "@/constants/colors";
import { SECTIONS } from "@/lib/fitnessConstants";
import { cn } from "@/lib/utils";
import type { DayLog, Exercise } from "@/types/fitness";

import { FitnessCheckbox } from "./FitnessCheckbox";
import { getGroupIcon, GROUP_ICON_SIZE } from "./groupIcons";

type DayTemplateProps = {
  exercises: Exercise[];
  dayLog: DayLog;
  pendingGroups?: string[];
  onToggleExercise: (exerciseId: string, checked: boolean) => void;
  onAddGroup?: (group: string) => void;
  onAddSection?: (groups: string[]) => void;
  onRemoveGroup?: (group: string) => void;
  locked?: boolean;
  className?: string;
};

const GROUP_ORDER = ["Shoulder", "Back", "Chest", "Arms Biceps", "Arms Triceps", "Legs", "Abs"];

function getVisibleGroups(dayLog: DayLog, exercises: Exercise[], pending: string[]): string[] {
  const fromExercises = new Set<string>();
  for (const id of dayLog.exerciseIds) {
    const ex = exercises.find((e) => e.id === id);
    if (ex) fromExercises.add(ex.group);
  }
  const fromSelected = new Set(dayLog.selectedGroups ?? []);
  const fromPending = new Set(pending ?? []);
  const merged = new Set([...fromExercises, ...fromSelected, ...fromPending]);
  return GROUP_ORDER.filter((g) => merged.has(g));
}

export function DayTemplate({
  exercises,
  dayLog,
  pendingGroups = [],
  onToggleExercise,
  onAddGroup,
  onAddSection,
  onRemoveGroup,
  locked = false,
  className,
}: DayTemplateProps) {
  const [addGroupOpen, setAddGroupOpen] = useState(false);
  const visibleGroups = useMemo(
    () => getVisibleGroups(dayLog, exercises, pendingGroups),
    [dayLog, exercises, pendingGroups]
  );
  const grouped = useMemo(() => groupBy(exercises, "group"), [exercises]);
  const byGroup = useMemo(
    () =>
      visibleGroups
        .filter((g) => (grouped[g]?.length ?? 0) > 0)
        .map((group) => ({ group, items: grouped[group] ?? [] })),
    [visibleGroups, grouped]
  );
  const doneSet = useMemo(() => new Set(dayLog.exerciseIds), [dayLog.exerciseIds]);
  const groupsToAdd = GROUP_ORDER.filter((g) => !visibleGroups.includes(g));
  const canAddGroup = groupsToAdd.length > 0 && (onAddGroup ?? onAddSection) && !locked;
  const sectionsToShow = SECTIONS.filter((sec) => sec.groups.some((g) => groupsToAdd.includes(g)));
  const groupIsRemovable = (group: string) =>
    pendingGroups.includes(group) || (dayLog.selectedGroups ?? []).includes(group);

  return (
    <div className={cn("flex flex-col gap-3 sm:gap-4", className)}>
      <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2">
        <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
          Exercises for this day
        </h2>
        {canAddGroup && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setAddGroupOpen(!addGroupOpen)}
              className="rounded-xl border border-border-subtle bg-surface-elevated px-3 py-2 text-sm font-medium text-foreground ring-1 ring-border-subtle hover:bg-zinc-700 sm:text-base"
            >
              + Add group
            </button>
            {addGroupOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  aria-hidden
                  onClick={() => setAddGroupOpen(false)}
                />
                <ul
                  className="absolute right-0 top-full z-20 mt-1 max-h-56 w-44 overflow-auto rounded-xl border border-border-subtle bg-surface py-1 shadow-xl shadow-black/40 sm:max-h-64 sm:w-52"
                  role="listbox"
                >
                  <li className="px-2 py-1 text-xs font-medium text-muted-fg sm:py-1 sm:text-sm">
                    Groups
                  </li>
                  {groupsToAdd.map((group) => {
                    const Icon = getGroupIcon(group);
                    return (
                      <li key={group}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={false}
                          onClick={() => {
                            onAddGroup?.(group);
                            setAddGroupOpen(false);
                          }}
                          className="flex w-full items-center gap-2 px-2.5 py-2 text-left text-sm text-foreground hover:bg-surface-elevated sm:px-3 sm:py-2 sm:text-base"
                        >
                          <Icon size={GROUP_ICON_SIZE} className="shrink-0" aria-hidden />
                          <span className="truncate">{group}</span>
                        </button>
                      </li>
                    );
                  })}
                  {sectionsToShow.length > 0 && (
                    <>
                      <li className="my-0.5 border-t border-border-subtle sm:my-1" />
                      <li className="px-2 py-1 text-xs font-medium text-muted-fg sm:py-1 sm:text-sm">
                        Sections
                      </li>
                      {sectionsToShow.map((section) => {
                        const toAdd = section.groups.filter((g) => groupsToAdd.includes(g));
                        if (toAdd.length === 0) return null;
                        return (
                          <li key={section.name}>
                            <button
                              type="button"
                              role="option"
                              aria-selected={false}
                              onClick={() => {
                                onAddSection?.(toAdd);
                                setAddGroupOpen(false);
                              }}
                              className="flex w-full items-center gap-2 px-2.5 py-2 text-left text-sm font-medium text-foreground hover:bg-surface-elevated sm:px-3 sm:py-2 sm:text-base"
                            >
                              {(() => {
                                const Icon = getGroupIcon(section.groups[0]);
                                return (
                                  <Icon size={GROUP_ICON_SIZE} className="shrink-0" aria-hidden />
                                );
                              })()}
                              <span className="truncate">{section.name}</span>
                            </button>
                          </li>
                        );
                      })}
                    </>
                  )}
                </ul>
              </>
            )}
          </div>
        )}
      </div>
      {byGroup.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border-subtle bg-surface-elevated/30 px-3 py-4 text-center text-sm text-muted-fg sm:px-8 sm:py-10 sm:text-base">
          No groups selected. Use &quot;Add group&quot; to choose muscle groups, or for today start
          from the welcome screen.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {byGroup.map(({ group, items }, idx) => {
            const style = getPastelStyle(idx % 6);
            const accent = getPastelAccentVar(idx);
            const canRemove = !locked && onRemoveGroup && groupIsRemovable(group);
            return (
              <div
                key={group}
                className="rounded-xl border border-border-subtle bg-surface-elevated/25 p-2.5 sm:p-3"
                style={{ borderLeftWidth: 3, borderLeftColor: accent }}
              >
                <div className="mb-1.5 flex items-center justify-between gap-1.5 sm:mb-2 sm:gap-2">
                  <h3 className="flex min-w-0 items-center gap-1.5 text-base font-medium text-foreground sm:gap-2 sm:text-lg">
                    {(() => {
                      const Icon = getGroupIcon(group);
                      return <Icon size={GROUP_ICON_SIZE} className="shrink-0" aria-hidden />;
                    })()}
                    <span className="truncate">{group}</span>
                  </h3>
                  {canRemove && (
                    <button
                      type="button"
                      onClick={() => onRemoveGroup?.(group)}
                      className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-red-950/50 hover:text-red-400"
                      title="Remove group"
                      aria-label="Remove group from view"
                    >
                      <X className="size-5" aria-hidden />
                    </button>
                  )}
                </div>
                <ul className="flex flex-col gap-2 sm:gap-2.5">
                  {items.map((ex) => {
                    const checked = doneSet.has(ex.id);
                    return (
                      <li key={ex.id}>
                        <FitnessCheckbox
                          id={`ex-${dayLog.dateKey}-${ex.id}`}
                          checked={checked}
                          onChange={(next) => onToggleExercise(ex.id, next)}
                          disabled={locked}
                          label={ex.label}
                          labelClassName={cn(checked && "text-muted line-through")}
                          accentClassName={cn(style.bg, style.border)}
                          checkIconClassName="text-foreground"
                        />
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
