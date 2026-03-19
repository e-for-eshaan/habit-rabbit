"use client";

import { useMemo } from "react";
import type { Exercise, WeekLog } from "@/types/fitness";
import { getPastelStyle } from "@/constants/colors";
import { cn } from "@/lib/utils";
import { groupBy } from "lodash";

type WeeklyTemplateProps = {
  exercises: Exercise[];
  weekLog: WeekLog;
  onToggleExercise: (exerciseId: string, checked: boolean) => void;
  className?: string;
};

const GROUP_ORDER = ["Chest", "Arms Biceps", "Arms Triceps", "Back", "Shoulder", "Legs", "Abs"];

export function WeeklyTemplate({
  exercises,
  weekLog,
  onToggleExercise,
  className,
}: WeeklyTemplateProps) {
  const byGroup = useMemo(() => {
    const grouped = groupBy(exercises, "group");
    return GROUP_ORDER.filter((g) => grouped[g]?.length).map((group) => ({
      group,
      items: grouped[group] ?? [],
    }));
  }, [exercises]);

  const doneSet = useMemo(() => new Set(weekLog.exerciseIds), [weekLog.exerciseIds]);

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-200">
        This week&apos;s exercises
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {byGroup.map(({ group, items }, idx) => {
          const style = getPastelStyle(idx % 6);
          return (
            <div
              key={group}
              className={cn("rounded-xl border-2 p-3 shadow-sm", style.border, style.light)}
            >
              <h3 className="mb-2 font-medium text-stone-800 dark:text-stone-200">{group}</h3>
              <ul className="flex flex-col gap-1.5">
                {items.map((ex) => {
                  const checked = doneSet.has(ex.id);
                  return (
                    <li key={ex.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`ex-${ex.id}`}
                        checked={checked}
                        onChange={(e) => onToggleExercise(ex.id, e.target.checked)}
                        className="h-4 w-4 rounded border-stone-300 text-stone-700 focus:ring-stone-500 dark:border-stone-600 dark:bg-stone-700"
                      />
                      <label
                        htmlFor={`ex-${ex.id}`}
                        className={cn(
                          "cursor-pointer text-sm",
                          checked && "text-stone-500 line-through dark:text-stone-400"
                        )}
                      >
                        {ex.label}
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
