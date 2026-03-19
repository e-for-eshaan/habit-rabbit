"use client";

import { useMemo, useState } from "react";
import type { Exercise, DayLog } from "@/types/fitness";
import { SECTIONS } from "@/lib/fitnessConstants";
import { getPastelStyle } from "@/constants/colors";
import { cn } from "@/lib/utils";
import { groupBy } from "lodash";
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
        <h2 className="text-base font-semibold text-stone-800 dark:text-stone-200 sm:text-lg">
          Exercises for this day
        </h2>
        {canAddGroup && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setAddGroupOpen(!addGroupOpen)}
              className="rounded-md border border-stone-300 bg-white px-2.5 py-1 text-xs font-medium text-stone-700 hover:bg-stone-50 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700 sm:rounded-lg sm:px-3 sm:py-1.5 sm:text-sm"
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
                  className="absolute right-0 top-full z-20 mt-1 max-h-56 w-44 overflow-auto rounded-md border border-stone-200 bg-white py-0.5 shadow-lg dark:border-stone-600 dark:bg-stone-800 sm:max-h-64 sm:w-52 sm:rounded-lg sm:py-1"
                  role="listbox"
                >
                  <li className="px-2 py-0.5 text-[10px] font-medium text-stone-500 dark:text-stone-400 sm:py-1 sm:text-xs">
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
                          className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-xs text-stone-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-700 sm:px-3 sm:py-2 sm:text-sm"
                        >
                          <Icon size={GROUP_ICON_SIZE} className="shrink-0" aria-hidden />
                          <span className="truncate">{group}</span>
                        </button>
                      </li>
                    );
                  })}
                  {sectionsToShow.length > 0 && (
                    <>
                      <li className="my-0.5 border-t border-stone-200 dark:border-stone-600 sm:my-1" />
                      <li className="px-2 py-0.5 text-[10px] font-medium text-stone-500 dark:text-stone-400 sm:py-1 sm:text-xs">
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
                              className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-xs font-medium text-stone-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-700 sm:px-3 sm:py-2 sm:text-sm"
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
        <p className="rounded-lg border border-dashed border-stone-300 bg-stone-50/50 px-2 py-3 text-center text-xs text-stone-500 dark:border-stone-600 dark:bg-stone-800/50 dark:text-stone-400 sm:rounded-xl sm:px-8 sm:py-10 sm:text-sm">
          No groups selected. Use &quot;Add group&quot; to choose muscle groups, or for today start
          from the welcome screen.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {byGroup.map(({ group, items }, idx) => {
            const style = getPastelStyle(idx % 6);
            const canRemove = !locked && onRemoveGroup && groupIsRemovable(group);
            return (
              <div
                key={group}
                className={cn(
                  "rounded-lg border-2 p-2.5 shadow-sm sm:rounded-xl sm:p-3",
                  style.border,
                  style.light
                )}
              >
                <div className="mb-1.5 flex items-center justify-between gap-1.5 sm:mb-2 sm:gap-2">
                  <h3 className="flex min-w-0 items-center gap-1.5 text-sm font-medium text-stone-800 dark:text-stone-200 sm:gap-2 sm:text-base">
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
                      className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium text-stone-500 hover:bg-stone-200 hover:text-stone-700 dark:hover:bg-stone-600 dark:hover:text-stone-200 sm:px-2 sm:text-xs"
                      title="Remove group from view"
                    >
                      Remove group
                    </button>
                  )}
                </div>
                <ul className="flex flex-col gap-1.5 sm:gap-2">
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
                          labelClassName={cn(
                            checked && "text-stone-500 line-through dark:text-stone-400"
                          )}
                          accentClassName={cn(style.bg, style.border)}
                          checkIconClassName="text-stone-800 dark:text-stone-200"
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
