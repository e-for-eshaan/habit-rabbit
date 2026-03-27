"use client";

import { isNil } from "lodash";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { DaySelector } from "@/components/fitness/DaySelector";
import { ExerciseEditMode } from "@/components/fitness/ExerciseEditMode";
import { FitnessDashboard } from "@/components/fitness/FitnessDashboard";
import { SwimRunInput } from "@/components/fitness/SwimRunInput";
import { DayTemplate } from "@/components/fitness/WeeklyTemplate";
import { WelcomeScreen } from "@/components/fitness/WelcomeScreen";
import { getFitness, updateFitness } from "@/lib/api";
import { toDateKey } from "@/lib/dateRange";
import { cn } from "@/lib/utils";
import type { DayLog, FitnessState } from "@/types/fitness";

function getOrCreateDayLog(dayLogs: DayLog[], dateKey: string): DayLog {
  const existing = dayLogs.find((l) => l.dateKey === dateKey);
  if (existing) return existing;
  return {
    dateKey,
    exerciseIds: [],
    swimmingSessions: 0,
    runningSessions: 0,
  };
}

function FitnessPage() {
  const [state, setState] = useState<FitnessState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDateKey, setSelectedDateKey] = useState(() => toDateKey(new Date()));
  const [editingDayKey, setEditingDayKey] = useState<string | null>(null);
  const [editExercisesMode, setEditExercisesMode] = useState(false);
  const [pendingGroups, setPendingGroups] = useState<string[]>([]);

  useEffect(() => {
    setPendingGroups([]);
  }, [selectedDateKey]);

  const todayKey = toDateKey(new Date());
  const dayLog = state ? getOrCreateDayLog(state.dayLogs, selectedDateKey) : null;
  const isCurrentDay = selectedDateKey === todayKey;
  const isEditingThisDay = editingDayKey === selectedDateKey;
  const locked = !isCurrentDay && !isEditingThisDay;
  const hasNoInput =
    dayLog &&
    dayLog.exerciseIds.length === 0 &&
    (dayLog.swimmingSessions ?? 0) === 0 &&
    (dayLog.runningSessions ?? 0) === 0;
  const hasNoSelectedGroups = !dayLog?.selectedGroups?.length;
  const showWelcome = isCurrentDay && hasNoInput && hasNoSelectedGroups;

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

  const ensureDayLogInState = useCallback(() => {
    if (!state || dayLog === null) return state;
    const exists = state.dayLogs.some((l) => l.dateKey === selectedDateKey);
    if (exists) return state;
    const newLog: DayLog = {
      dateKey: selectedDateKey,
      exerciseIds: [],
      swimmingSessions: 0,
      runningSessions: 0,
    };
    return {
      ...state,
      dayLogs: [...state.dayLogs, newLog].sort((a, b) => a.dateKey.localeCompare(b.dateKey)),
    };
  }, [state, selectedDateKey, dayLog]);

  const handleToggleExercise = useCallback(
    (exerciseId: string, checked: boolean) => {
      const next = ensureDayLogInState();
      if (!next) return;
      const log = next.dayLogs.find((l) => l.dateKey === selectedDateKey);
      const selectedWithPending = [...new Set([...(log?.selectedGroups ?? []), ...pendingGroups])];
      const logs = next.dayLogs.map((l) =>
        l.dateKey === selectedDateKey
          ? {
              ...l,
              selectedGroups: selectedWithPending,
              exerciseIds: checked
                ? [...l.exerciseIds, exerciseId]
                : l.exerciseIds.filter((id) => id !== exerciseId),
            }
          : l
      );
      setPendingGroups([]);
      persistState({ ...next, dayLogs: logs });
    },
    [ensureDayLogInState, selectedDateKey, pendingGroups, persistState]
  );

  const handleSwimmingChange = useCallback(
    (value: number) => {
      const next = ensureDayLogInState();
      if (!next) return;
      const log = next.dayLogs.find((l) => l.dateKey === selectedDateKey);
      const selectedWithPending = [...new Set([...(log?.selectedGroups ?? []), ...pendingGroups])];
      const logs = next.dayLogs.map((l) =>
        l.dateKey === selectedDateKey
          ? { ...l, selectedGroups: selectedWithPending, swimmingSessions: value }
          : l
      );
      setPendingGroups([]);
      persistState({ ...next, dayLogs: logs });
    },
    [ensureDayLogInState, selectedDateKey, pendingGroups, persistState]
  );

  const handleRunningChange = useCallback(
    (value: number) => {
      const next = ensureDayLogInState();
      if (!next) return;
      const log = next.dayLogs.find((l) => l.dateKey === selectedDateKey);
      const selectedWithPending = [...new Set([...(log?.selectedGroups ?? []), ...pendingGroups])];
      const logs = next.dayLogs.map((l) =>
        l.dateKey === selectedDateKey
          ? { ...l, selectedGroups: selectedWithPending, runningSessions: value }
          : l
      );
      setPendingGroups([]);
      persistState({ ...next, dayLogs: logs });
    },
    [ensureDayLogInState, selectedDateKey, pendingGroups, persistState]
  );

  const handleSelectGroups = useCallback(
    (groups: string[]) => {
      const next = ensureDayLogInState();
      if (!next) return;
      const logs = next.dayLogs.map((log) =>
        log.dateKey === selectedDateKey ? { ...log, selectedGroups: groups } : log
      );
      persistState({ ...next, dayLogs: logs });
    },
    [ensureDayLogInState, selectedDateKey, persistState]
  );

  const handleAddGroup = useCallback((group: string) => {
    setPendingGroups((prev) => (prev.includes(group) ? prev : [...prev, group]));
  }, []);

  const handleAddGroups = useCallback((groups: string[]) => {
    setPendingGroups((prev) => [...new Set([...prev, ...groups])]);
  }, []);

  const handleRemoveGroup = useCallback(
    (group: string) => {
      if (pendingGroups.includes(group)) {
        setPendingGroups((prev) => prev.filter((g) => g !== group));
        return;
      }
      const current = state?.dayLogs.find((l) => l.dateKey === selectedDateKey);
      const selected = current?.selectedGroups ?? [];
      if (!selected.includes(group)) return;
      const nextSelected = selected.filter((g) => g !== group);
      if (!state) return;
      const logs = state.dayLogs.map((log) =>
        log.dateKey === selectedDateKey ? { ...log, selectedGroups: nextSelected } : log
      );
      persistState({ ...state, dayLogs: logs });
    },
    [state, selectedDateKey, pendingGroups, persistState]
  );

  if (loading || isNil(state)) {
    return (
      <div className="flex min-h-screen items-center justify-center p-3 sm:p-4">
        <p className="text-base text-stone-500 dark:text-stone-400 sm:text-lg">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-3 sm:gap-4 sm:p-4">
        <p className="text-center text-base text-red-600 dark:text-red-400 sm:text-lg">{error}</p>
        <button
          type="button"
          onClick={fetchState}
          className="rounded-md bg-stone-200 px-4 py-2 text-sm font-medium dark:bg-stone-700 sm:rounded-lg sm:px-4 sm:py-2 sm:text-base"
        >
          Retry
        </button>
        <Link
          href="/"
          className="text-sm text-stone-600 dark:text-stone-400 underline sm:text-base"
        >
          Back to habits
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans">
      <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/90 px-3 py-2 backdrop-blur dark:border-stone-700 dark:bg-stone-900/90 sm:px-4 sm:py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 sm:gap-4">
          <Link
            href="/"
            className="text-sm font-medium text-stone-600 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 sm:text-base"
          >
            ← Back to habits
          </Link>
          <h1 className="text-lg font-semibold text-stone-800 dark:text-stone-200 sm:text-xl">
            Fitness
          </h1>
          <button
            type="button"
            onClick={() => setEditExercisesMode(!editExercisesMode)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium sm:rounded-lg sm:px-3 sm:py-1.5 sm:text-base",
              editExercisesMode
                ? "bg-amber-200 text-amber-900 dark:bg-amber-800 dark:text-amber-100"
                : "bg-stone-200 text-stone-700 hover:bg-stone-300 dark:bg-stone-700 dark:text-stone-200 dark:hover:bg-stone-600"
            )}
          >
            {editExercisesMode ? "Done editing" : "Edit exercises"}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-4 p-3 sm:space-y-6 sm:p-4 md:p-6">
        {editExercisesMode ? (
          <ExerciseEditMode
            state={state}
            onSave={persistState}
            onClose={() => setEditExercisesMode(false)}
          />
        ) : (
          <>
            <DaySelector dateKey={selectedDateKey} onDateChange={setSelectedDateKey} />
            {!isCurrentDay && (
              <div className="flex items-center gap-1.5 sm:gap-2">
                {isEditingThisDay ? (
                  <button
                    type="button"
                    onClick={() => setEditingDayKey(null)}
                    className="rounded-md bg-stone-700 px-3 py-1.5 text-sm font-medium text-white dark:bg-stone-300 dark:text-stone-800 sm:rounded-lg sm:px-3 sm:py-1.5 sm:text-base"
                  >
                    Done editing this day
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditingDayKey(selectedDateKey)}
                    className="rounded-md bg-stone-200 px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-300 dark:bg-stone-700 dark:text-stone-200 dark:hover:bg-stone-600 sm:rounded-lg sm:px-3 sm:py-1.5 sm:text-base"
                  >
                    Edit this day
                  </button>
                )}
              </div>
            )}
            {showWelcome ? (
              <WelcomeScreen
                selectedGroups={dayLog?.selectedGroups ?? []}
                onStart={handleSelectGroups}
              />
            ) : (
              <>
                <DayTemplate
                  exercises={state.exercises}
                  dayLog={dayLog!}
                  pendingGroups={pendingGroups}
                  onToggleExercise={handleToggleExercise}
                  onAddGroup={handleAddGroup}
                  onAddSection={handleAddGroups}
                  onRemoveGroup={handleRemoveGroup}
                  locked={locked}
                />
                <SwimRunInput
                  dayLog={dayLog!}
                  onSwimmingChange={handleSwimmingChange}
                  onRunningChange={handleRunningChange}
                  locked={locked}
                />
                <FitnessDashboard state={state} />
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export { FitnessPage as default };
