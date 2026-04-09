"use client";

import { isEqual, isNil } from "lodash";
import { ArrowLeft, Check, Pencil, PenLine } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { DaySelector } from "@/components/fitness/DaySelector";
import { ExerciseEditMode } from "@/components/fitness/ExerciseEditMode";
import { FitnessDashboard } from "@/components/fitness/FitnessDashboard";
import { SwimRunInput } from "@/components/fitness/SwimRunInput";
import { DayTemplate } from "@/components/fitness/WeeklyTemplate";
import { WelcomeScreen } from "@/components/fitness/WelcomeScreen";
import { WellBeingInput } from "@/components/fitness/WellBeingInput";
import { FitnessPageSkeleton } from "@/components/skeletons";
import { getFitness, updateFitness } from "@/lib/api";
import { toDateKey } from "@/lib/dateRange";
import { computeNfStreak } from "@/lib/fitnessNfStreak";
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
    nfCompleted: false,
  };
}

function FitnessPage() {
  const [state, setState] = useState<FitnessState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastPersistedFitnessRef = useRef<FitnessState | null>(null);
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
  const hasNoSelectedGroups = !dayLog?.selectedGroups?.length;
  const showExerciseWelcome = isCurrentDay && hasNoSelectedGroups;

  const fetchState = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getFitness();
      setState(data);
      lastPersistedFitnessRef.current = data;
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
    if (
      lastPersistedFitnessRef.current !== null &&
      isEqual(lastPersistedFitnessRef.current, next)
    ) {
      return;
    }
    try {
      await updateFitness(next);
      lastPersistedFitnessRef.current = next;
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
      nfCompleted: false,
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

  const handleNfChange = useCallback(
    (checked: boolean) => {
      const next = ensureDayLogInState();
      if (!next) return;
      const log = next.dayLogs.find((l) => l.dateKey === selectedDateKey);
      const selectedWithPending = [...new Set([...(log?.selectedGroups ?? []), ...pendingGroups])];
      const logs = next.dayLogs.map((l) =>
        l.dateKey === selectedDateKey
          ? { ...l, selectedGroups: selectedWithPending, nfCompleted: checked }
          : l
      );
      setPendingGroups([]);
      persistState({ ...next, dayLogs: logs });
    },
    [ensureDayLogInState, selectedDateKey, pendingGroups, persistState]
  );

  const nfStreak = useMemo(
    () => (state ? computeNfStreak(state.dayLogs, selectedDateKey) : 0),
    [state, selectedDateKey]
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
    return <FitnessPageSkeleton />;
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-inline px-page py-section sm:gap-stack">
        <p className="text-center text-title text-red-400">{error}</p>
        <button
          type="button"
          onClick={fetchState}
          className="min-h-touch rounded-xl bg-surface-elevated px-4 py-2.5 text-body-sm font-medium text-foreground ring-1 ring-border-subtle hover:bg-zinc-700"
        >
          Retry
        </button>
        <Link
          href="/"
          className="flex min-h-touch items-center gap-tight text-body-sm text-muted-fg hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Habits
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans">
      <header className="sticky top-0 z-10 border-b border-border-subtle bg-surface/90 px-page py-2 backdrop-blur-md sm:py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-tight sm:gap-stack">
          <Link
            href="/"
            className="flex min-h-touch min-w-touch items-center justify-center rounded-xl text-muted-fg hover:bg-surface-elevated hover:text-foreground sm:min-w-0 sm:justify-start sm:gap-inline sm:px-2"
            aria-label="Back to habits"
          >
            <ArrowLeft className="size-5 shrink-0" aria-hidden />
            <span className="hidden text-body-sm font-medium sm:inline">Habits</span>
          </Link>
          <h1 className="text-title font-semibold tracking-tight text-foreground sm:text-display">
            Fitness
          </h1>
          <button
            type="button"
            onClick={() => setEditExercisesMode(!editExercisesMode)}
            className={cn(
              "flex min-h-touch min-w-touch items-center justify-center rounded-xl sm:min-w-0 sm:gap-inline sm:px-3",
              editExercisesMode
                ? "bg-lime-400/20 text-lime-300 ring-1 ring-lime-400/40"
                : "bg-surface-elevated text-muted hover:bg-zinc-700 hover:text-foreground ring-1 ring-border-subtle"
            )}
            aria-label={editExercisesMode ? "Done editing exercises" : "Edit exercise list"}
            title={editExercisesMode ? "Done" : "Edit exercises"}
          >
            {editExercisesMode ? (
              <Check className="size-5" aria-hidden />
            ) : (
              <Pencil className="size-5" aria-hidden />
            )}
            <span className="hidden text-body-sm font-medium sm:inline">
              {editExercisesMode ? "Done" : "Edit"}
            </span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-stack px-page py-section sm:space-y-section">
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
              <div className="flex items-center gap-inline">
                {isEditingThisDay ? (
                  <button
                    type="button"
                    onClick={() => setEditingDayKey(null)}
                    className="flex min-h-touch items-center gap-inline rounded-xl bg-lime-400/15 px-3 py-2 text-body-sm font-medium text-lime-200 ring-1 ring-lime-400/35"
                    aria-label="Done editing this day"
                  >
                    <Check className="size-4" aria-hidden />
                    <span className="hidden sm:inline">Done</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditingDayKey(selectedDateKey)}
                    className="flex min-h-touch items-center gap-inline rounded-xl bg-surface-elevated px-3 py-2 text-body-sm font-medium text-muted ring-1 ring-border-subtle hover:bg-zinc-700 hover:text-foreground"
                    aria-label="Edit this day"
                  >
                    <PenLine className="size-4" aria-hidden />
                    <span className="hidden sm:inline">Edit day</span>
                  </button>
                )}
              </div>
            )}
            {showExerciseWelcome && (
              <WelcomeScreen
                selectedGroups={dayLog?.selectedGroups ?? []}
                onStart={handleSelectGroups}
              />
            )}
            {!showExerciseWelcome && (
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
            )}
            <SwimRunInput
              dayLog={dayLog!}
              onSwimmingChange={handleSwimmingChange}
              onRunningChange={handleRunningChange}
              locked={locked}
            />
            <WellBeingInput
              dayLog={dayLog!}
              nfStreak={nfStreak}
              onNfChange={handleNfChange}
              locked={locked}
            />
            <FitnessDashboard state={state} />
          </>
        )}
      </main>
    </div>
  );
}

export { FitnessPage as default };
