"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getFitness, updateFitness } from "@/lib/api";
import type { FitnessState, WeekLog } from "@/types/fitness";
import { getWeekStartKey } from "@/lib/dateRange";
import { WeekSelector } from "@/components/fitness/WeekSelector";
import { WeeklyTemplate } from "@/components/fitness/WeeklyTemplate";
import { SwimRunInput } from "@/components/fitness/SwimRunInput";
import { FitnessDashboard } from "@/components/fitness/FitnessDashboard";
import { ExerciseEditMode } from "@/components/fitness/ExerciseEditMode";
import { cn } from "@/lib/utils";
import { isNil } from "lodash";

function getOrCreateWeekLog(weekLogs: WeekLog[], weekStartKey: string): WeekLog {
  const existing = weekLogs.find((l) => l.weekStart === weekStartKey);
  if (existing) return existing;
  return {
    weekStart: weekStartKey,
    exerciseIds: [],
    swimmingSessions: 0,
    runningSessions: 0,
  };
}

function FitnessPage() {
  const [state, setState] = useState<FitnessState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weekStartKey, setWeekStartKey] = useState(getWeekStartKey());
  const [editMode, setEditMode] = useState(false);

  const fetchState = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getFitness();
      setState(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load fitness data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  const persistState = useCallback(async (next: FitnessState) => {
    setState(next);
    try {
      await updateFitness(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    }
  }, []);

  const weekLog = state ? getOrCreateWeekLog(state.weekLogs, weekStartKey) : null;

  const ensureWeekLogInState = useCallback(() => {
    if (!state || weekLog === null) return state;
    const exists = state.weekLogs.some((l) => l.weekStart === weekStartKey);
    if (exists) return state;
    const newLog: WeekLog = {
      weekStart: weekStartKey,
      exerciseIds: [],
      swimmingSessions: 0,
      runningSessions: 0,
    };
    return {
      ...state,
      weekLogs: [...state.weekLogs, newLog].sort((a, b) => a.weekStart.localeCompare(b.weekStart)),
    };
  }, [state, weekStartKey, weekLog]);

  const handleToggleExercise = useCallback(
    (exerciseId: string, checked: boolean) => {
      const next = ensureWeekLogInState();
      if (!next) return;
      const logs = next.weekLogs.map((log) =>
        log.weekStart === weekStartKey
          ? {
              ...log,
              exerciseIds: checked
                ? [...log.exerciseIds, exerciseId]
                : log.exerciseIds.filter((id) => id !== exerciseId),
            }
          : log
      );
      persistState({ ...next, weekLogs: logs });
    },
    [ensureWeekLogInState, weekStartKey, persistState]
  );

  const handleSwimmingChange = useCallback(
    (value: number) => {
      const next = ensureWeekLogInState();
      if (!next) return;
      const logs = next.weekLogs.map((log) =>
        log.weekStart === weekStartKey ? { ...log, swimmingSessions: value } : log
      );
      persistState({ ...next, weekLogs: logs });
    },
    [ensureWeekLogInState, weekStartKey, persistState]
  );

  const handleRunningChange = useCallback(
    (value: number) => {
      const next = ensureWeekLogInState();
      if (!next) return;
      const logs = next.weekLogs.map((log) =>
        log.weekStart === weekStartKey ? { ...log, runningSessions: value } : log
      );
      persistState({ ...next, weekLogs: logs });
    },
    [ensureWeekLogInState, weekStartKey, persistState]
  );

  if (loading || isNil(state)) {
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
          onClick={fetchState}
          className="rounded-lg bg-stone-200 px-4 py-2 text-sm font-medium dark:bg-stone-700"
        >
          Retry
        </button>
        <Link href="/" className="text-sm text-stone-600 dark:text-stone-400 underline">
          Back to habits
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans">
      <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-stone-700 dark:bg-stone-900/90">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <Link
            href="/"
            className="text-sm font-medium text-stone-600 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200"
          >
            ← Back to habits
          </Link>
          <h1 className="text-lg font-semibold text-stone-800 dark:text-stone-200">Fitness</h1>
          <button
            type="button"
            onClick={() => setEditMode(!editMode)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium",
              editMode
                ? "bg-amber-200 text-amber-900 dark:bg-amber-800 dark:text-amber-100"
                : "bg-stone-200 text-stone-700 hover:bg-stone-300 dark:bg-stone-700 dark:text-stone-200 dark:hover:bg-stone-600"
            )}
          >
            {editMode ? "Done editing" : "Edit exercises"}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 p-4">
        {editMode ? (
          <ExerciseEditMode
            state={state}
            onSave={persistState}
            onClose={() => setEditMode(false)}
          />
        ) : (
          <>
            <WeekSelector weekStartKey={weekStartKey} onWeekChange={setWeekStartKey} />
            <WeeklyTemplate
              exercises={state.exercises}
              weekLog={weekLog!}
              onToggleExercise={handleToggleExercise}
            />
            <SwimRunInput
              weekLog={weekLog!}
              onSwimmingChange={handleSwimmingChange}
              onRunningChange={handleRunningChange}
            />
            <FitnessDashboard state={state} />
          </>
        )}
      </main>
    </div>
  );
}

export { FitnessPage as default };
