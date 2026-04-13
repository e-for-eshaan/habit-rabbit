"use client";

import { Check, Plus, Trash2, Volume2, VolumeX, X } from "lucide-react";
import { useState } from "react";

import { getGroupIcon, GROUP_ICON_SIZE } from "@/components/fitness/groupIcons";
import { getPastelAccentVar } from "@/constants/colors";
import { EXERCISE_GROUPS, getGroupPastelKey, labelToId } from "@/lib/fitnessConstants";
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
    return { ...state, exercises: nextExercises, dayLogs };
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
        "flex flex-col gap-inline rounded-2xl border border-amber-500/25 bg-amber-950/20 p-inline ring-1 ring-amber-500/15 sm:gap-stack sm:p-card",
        className
      )}
    >
      <div className="flex items-center justify-between gap-inline">
        <h2 className="text-title font-semibold tracking-tight text-foreground sm:text-display">
          Edit exercises
        </h2>
        <div className="flex items-center gap-tight">
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-touch min-w-touch items-center justify-center rounded-xl text-muted hover:bg-surface-elevated hover:text-foreground"
            aria-label="Cancel"
            title="Cancel"
          >
            <X className="size-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex min-h-touch min-w-touch items-center justify-center rounded-xl bg-lime-400 text-zinc-950 hover:bg-lime-300"
            aria-label="Done"
            title="Done"
          >
            <Check className="size-5" aria-hidden />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-tight sm:grid-cols-2 sm:gap-inline lg:grid-cols-3">
        {EXERCISE_GROUPS.map((group) => {
          const items = exercises.filter((e) => e.group === group);
          const accent = getPastelAccentVar(getGroupPastelKey(group));
          const isAdding = addingToGroup === group;
          return (
            <div
              key={group}
              className="rounded-xl border border-border-subtle bg-surface-elevated/30 p-card"
              style={{ borderLeftWidth: 3, borderLeftColor: accent }}
            >
              <h3 className="mb-inline flex items-center gap-inline text-body-sm font-medium text-foreground sm:text-body">
                {(() => {
                  const Icon = getGroupIcon(group);
                  return (
                    <Icon size={GROUP_ICON_SIZE} className="shrink-0 text-muted" aria-hidden />
                  );
                })()}
                <span className="truncate">{group}</span>
              </h3>
              <ul className="flex flex-col gap-tight sm:gap-tight">
                {items.map((ex) => (
                  <li
                    key={ex.id}
                    className={cn(
                      "flex items-center justify-between gap-inline text-body-sm sm:text-body",
                      ex.muted && "opacity-55"
                    )}
                  >
                    <span className="min-w-0 truncate text-foreground">
                      {ex.label}
                      {ex.muted && (
                        <span className="ml-1 text-caption text-muted-fg sm:text-body-sm">
                          (muted)
                        </span>
                      )}
                    </span>
                    <span className="flex shrink-0 items-center gap-px">
                      <button
                        type="button"
                        onClick={() => toggleMuted(ex.id)}
                        title={ex.muted ? "Show in least hit" : "Hide from least hit"}
                        aria-label={ex.muted ? "Unmute exercise" : "Mute exercise"}
                        className={cn(
                          "flex min-h-touch min-w-touch items-center justify-center rounded-lg",
                          ex.muted
                            ? "bg-zinc-700 text-muted hover:text-foreground"
                            : "text-muted hover:bg-surface hover:text-foreground"
                        )}
                      >
                        {ex.muted ? (
                          <VolumeX className="size-4" aria-hidden />
                        ) : (
                          <Volume2 className="size-4" aria-hidden />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeExercise(ex.id)}
                        className="flex min-h-touch min-w-touch items-center justify-center rounded-lg text-muted hover:bg-red-950/50 hover:text-red-400"
                        aria-label="Remove exercise"
                        title="Remove"
                      >
                        <Trash2 className="size-4" aria-hidden />
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
              {isAdding ? (
                <div className="mt-inline flex flex-wrap items-center gap-inline">
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
                    className="min-h-touch min-w-0 flex-1 rounded-lg border border-border-subtle bg-surface px-2 py-2 text-body-sm text-foreground outline-none ring-lime-400/20 focus:ring-2 sm:text-body"
                  />
                  <button
                    type="button"
                    onClick={() => addExerciseToGroup(group)}
                    className="flex min-h-touch min-w-touch items-center justify-center rounded-lg bg-lime-400 text-zinc-950 hover:bg-lime-300"
                    aria-label="Add exercise"
                    title="Add"
                  >
                    <Plus className="size-5" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAddingToGroup(null);
                      setNewLabel("");
                    }}
                    className="flex min-h-touch min-w-touch items-center justify-center rounded-lg text-muted hover:bg-surface-elevated"
                    aria-label="Cancel add"
                  >
                    <X className="size-5" aria-hidden />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setAddingToGroup(group)}
                  className="mt-inline flex min-h-touch w-full items-center justify-center gap-inline rounded-lg border border-dashed border-border-subtle py-2.5 text-caption font-medium text-muted-fg hover:border-muted hover:text-foreground sm:text-body-sm"
                >
                  <Plus className="size-4" aria-hidden />
                  Add exercise
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
