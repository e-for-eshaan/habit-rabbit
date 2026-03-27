"use client";

import { useState } from "react";

import { getGroupIcon, GROUP_ICON_SIZE } from "@/components/fitness/groupIcons";
import { getPastelStyle } from "@/constants/colors";
import { EXERCISE_GROUPS, labelToId } from "@/lib/fitnessConstants";
import { cn } from "@/lib/utils";
import type { Exercise, FitnessState } from "@/types/fitness";

type ExerciseEditModeProps = {
  state: FitnessState;
  onSave: (state: FitnessState) => void;
  onClose: () => void;
  className?: string;
};

function ensureUniqueId(exercises: Exercise[], label: string, group: string): string {
  const base: string = labelToId(label);
  if (!exercises.some((e) => e.id === base)) return base;
  const withGroup = labelToId(`${label} ${group}`);
  if (!exercises.some((e) => e.id === withGroup)) return withGroup;
  let n = 1;
  while (exercises.some((e) => e.id === `${withGroup}-${n}`)) n += 1;
  return `${withGroup}-${n}`;
}

export function ExerciseEditMode({ state, onSave, onClose, className }: ExerciseEditModeProps) {
  const [exercises, setExercises] = useState<Exercise[]>(state.exercises);
  const [addingToGroup, setAddingToGroup] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState("");

  const addExerciseToGroup = (group: string) => {
    const label = newLabel.trim();
    if (!label) return;
    const id = ensureUniqueId(exercises, label, group);
    const next = [...exercises, { id, label, group, muted: false }];
    setExercises(next);
    setNewLabel("");
    setAddingToGroup(null);
    onSave(buildNextState(next));
  };

  function buildNextState(nextExercises: Exercise[]): FitnessState {
    const dayLogs = state.dayLogs.map((log) => ({
      ...log,
      exerciseIds: log.exerciseIds.filter((id) => nextExercises.some((e) => e.id === id)),
    }));
    return { exercises: nextExercises, dayLogs };
  }

  const persist = (nextExercises: Exercise[]) => {
    setExercises(nextExercises);
    onSave(buildNextState(nextExercises));
  };

  const removeExercise = (id: string) => {
    const next = exercises.filter((e) => e.id !== id);
    persist(next);
  };

  const toggleMuted = (id: string) => {
    const next = exercises.map((e) => (e.id === id ? { ...e, muted: !e.muted } : e));
    persist(next);
  };

  const handleSave = () => {
    onClose();
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg border-2 border-amber-200 bg-amber-50/30 p-3 dark:border-amber-800 dark:bg-amber-900/20 sm:gap-4 sm:rounded-xl sm:p-4",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-200 sm:text-xl">
          Edit exercises
        </h2>
        <div className="flex gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-stone-600 hover:bg-stone-200 dark:text-stone-400 dark:hover:bg-stone-700 sm:rounded-lg sm:px-3 sm:py-1.5 sm:text-base"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-md bg-stone-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-stone-700 dark:bg-stone-200 dark:text-stone-800 dark:hover:bg-stone-300 sm:rounded-lg sm:px-3 sm:py-1.5 sm:text-base"
          >
            Done
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
        {EXERCISE_GROUPS.map((group, idx) => {
          const items = exercises.filter((e) => e.group === group);
          const style = getPastelStyle(idx % 6);
          const isAdding = addingToGroup === group;
          return (
            <div
              key={group}
              className={cn(
                "rounded-md border p-2 sm:rounded-lg sm:p-3",
                style.border,
                style.light
              )}
            >
              <h3 className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-stone-700 dark:text-stone-300 sm:mb-2 sm:gap-2 sm:text-base">
                {(() => {
                  const Icon = getGroupIcon(group);
                  return <Icon size={GROUP_ICON_SIZE} className="shrink-0" aria-hidden />;
                })()}
                <span className="truncate">{group}</span>
              </h3>
              <ul className="flex flex-col gap-1 sm:gap-1.5">
                {items.map((ex) => (
                  <li
                    key={ex.id}
                    className={cn(
                      "flex items-center justify-between gap-1.5 text-sm sm:gap-2 sm:text-base",
                      ex.muted && "opacity-60"
                    )}
                  >
                    <span className="truncate text-stone-700 dark:text-stone-300">
                      {ex.label}
                      {ex.muted && (
                        <span className="ml-0.5 text-xs text-stone-500 dark:text-stone-400 sm:ml-1 sm:text-sm">
                          (muted)
                        </span>
                      )}
                    </span>
                    <span className="flex shrink-0 items-center gap-0.5 sm:gap-1">
                      <button
                        type="button"
                        onClick={() => toggleMuted(ex.id)}
                        title={ex.muted ? "Show in least hit" : "Hide from least hit"}
                        className={cn(
                          "rounded px-1.5 py-1 text-xs font-medium sm:px-2 sm:text-sm",
                          ex.muted
                            ? "bg-stone-300 text-stone-600 dark:bg-stone-600 dark:text-stone-300"
                            : "bg-stone-200 text-stone-500 hover:bg-stone-300 dark:bg-stone-700 dark:text-stone-400 dark:hover:bg-stone-600"
                        )}
                      >
                        {ex.muted ? "Unmute" : "Mute"}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeExercise(ex.id)}
                        className="rounded px-1.5 py-1 text-xs font-medium text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/30 sm:px-2 sm:text-sm"
                      >
                        Remove
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
              {isAdding ? (
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5 sm:mt-2 sm:gap-2">
                  <input
                    type="text"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") addExerciseToGroup(group);
                      if (e.key === "Escape") {
                        setAddingToGroup(null);
                        setNewLabel("");
                      }
                    }}
                    placeholder="Exercise name"
                    autoFocus
                    className="min-w-0 flex-1 rounded border border-stone-300 bg-white px-2 py-1.5 text-sm dark:border-stone-600 dark:bg-stone-800 dark:text-stone-200 sm:px-2 sm:py-2 sm:text-base"
                  />
                  <button
                    type="button"
                    onClick={() => addExerciseToGroup(group)}
                    className="rounded bg-stone-700 px-2 py-1.5 text-xs font-medium text-white dark:bg-stone-300 dark:text-stone-800 sm:px-2 sm:py-2 sm:text-sm"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAddingToGroup(null);
                      setNewLabel("");
                    }}
                    className="rounded px-2 py-1.5 text-xs text-stone-500 hover:bg-stone-200 dark:hover:bg-stone-700 sm:px-2 sm:py-2 sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setAddingToGroup(group)}
                  className="mt-1.5 w-full rounded border border-dashed border-stone-300 py-2 text-xs font-medium text-stone-500 hover:border-stone-400 hover:text-stone-700 dark:border-stone-600 dark:text-stone-400 dark:hover:border-stone-500 dark:hover:text-stone-300 sm:mt-2 sm:py-2 sm:text-sm"
                >
                  + Add exercise
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
