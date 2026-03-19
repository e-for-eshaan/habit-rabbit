"use client";

import { useState } from "react";
import type { FitnessState, Exercise } from "@/types/fitness";
import { EXERCISE_GROUPS, labelToId } from "@/lib/fitnessConstants";
import { getPastelStyle } from "@/constants/colors";
import { cn } from "@/lib/utils";
type ExerciseEditModeProps = {
  state: FitnessState;
  onSave: (state: FitnessState) => void;
  onClose: () => void;
  className?: string;
};

export function ExerciseEditMode({ state, onSave, onClose, className }: ExerciseEditModeProps) {
  const [exercises, setExercises] = useState<Exercise[]>(state.exercises);
  const [newLabel, setNewLabel] = useState("");
  const [newGroup, setNewGroup] = useState<string>(EXERCISE_GROUPS[0] ?? "Shoulder");

  const addExercise = () => {
    const label = newLabel.trim();
    if (!label) return;
    const id = labelToId(label);
    if (exercises.some((e) => e.id === id)) return;
    setExercises([...exercises, { id, label, group: newGroup }]);
    setNewLabel("");
  };

  const removeExercise = (id: string) => {
    setExercises(exercises.filter((e) => e.id !== id));
  };

  const handleSave = () => {
    const weekLogs = state.weekLogs.map((log) => ({
      ...log,
      exerciseIds: log.exerciseIds.filter((id) => exercises.some((e) => e.id === id)),
    }));
    onSave({ exercises, weekLogs });
    onClose();
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-xl border-2 border-amber-200 bg-amber-50/30 p-4 dark:border-amber-800 dark:bg-amber-900/20",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-200">Edit exercises</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-stone-600 hover:bg-stone-200 dark:text-stone-400 dark:hover:bg-stone-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-lg bg-stone-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-stone-700 dark:bg-stone-200 dark:text-stone-800 dark:hover:bg-stone-300"
          >
            Save
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="new-ex-label" className="text-xs text-stone-600 dark:text-stone-400">
            New exercise
          </label>
          <input
            id="new-ex-label"
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addExercise()}
            placeholder="Exercise name"
            className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-800 dark:text-stone-200"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="new-ex-group" className="text-xs text-stone-600 dark:text-stone-400">
            Group
          </label>
          <select
            id="new-ex-group"
            value={newGroup}
            onChange={(e) => setNewGroup(e.target.value)}
            className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-800 dark:text-stone-200"
          >
            {EXERCISE_GROUPS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={addExercise}
          className="rounded-lg bg-stone-700 px-3 py-2 text-sm font-medium text-white hover:bg-stone-600 dark:bg-stone-300 dark:text-stone-800 dark:hover:bg-stone-200"
        >
          Add
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {EXERCISE_GROUPS.map((group, idx) => {
          const items = exercises.filter((e) => e.group === group);
          if (items.length === 0) return null;
          const style = getPastelStyle(idx % 6);
          return (
            <div key={group} className={cn("rounded-lg border p-2", style.border, style.light)}>
              <h3 className="mb-2 text-sm font-medium text-stone-700 dark:text-stone-300">
                {group}
              </h3>
              <ul className="flex flex-col gap-1">
                {items.map((ex) => (
                  <li
                    key={ex.id}
                    className="flex items-center justify-between gap-2 text-sm text-stone-700 dark:text-stone-300"
                  >
                    <span className="truncate">{ex.label}</span>
                    <button
                      type="button"
                      onClick={() => removeExercise(ex.id)}
                      className="shrink-0 rounded px-1.5 py-0.5 text-xs font-medium text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/30"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
