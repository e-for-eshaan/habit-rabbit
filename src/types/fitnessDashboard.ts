export type DashboardKPIs = {
  thisWeekDays: number;
  thisWeekSessions: number;
  streak: number;
  swim30d: number;
  run30d: number;
};

export type WeeklyVolumeItem = {
  weekStart: string;
  label: string;
  exercises: number;
  swimming: number;
  running: number;
  total: number;
};

export type WorkoutDaysPerWeekItem = {
  weekStart: string;
  label: string;
  days: number;
};

export type GroupFreqItem = {
  group: string;
  count: number;
};

export type LeastHitItem = {
  id: string;
  days: number;
  label: string;
};

export type MissedExerciseItem = {
  id: string;
  label: string;
  group: string;
  daysSinceLastDone: number;
  lastDoneDateKey: string | null;
};

export type FitnessDashboardData = {
  kpis: DashboardKPIs;
  weeklyVolume: WeeklyVolumeItem[];
  activityByDay: Record<string, number>;
  workoutDaysPerWeek: WorkoutDaysPerWeekItem[];
  groupFrequency: GroupFreqItem[];
  leastHit: LeastHitItem[];
  missedExercises: MissedExerciseItem[];
};
