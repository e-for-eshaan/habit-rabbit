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

export type WeeklyActivityDaysItem = {
  weekStart: string;
  label: string;
  workoutDays: number;
  cardioDays: number;
  runDays: number;
  swimDays: number;
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

export type ActivityDayBreakdown = {
  exercises: number;
  swimming: number;
  running: number;
};

export type FitnessDashboardData = {
  kpis: DashboardKPIs;
  weeklyVolume: WeeklyVolumeItem[];
  weeklyActivityDays: WeeklyActivityDaysItem[];
  activityByDay: Record<string, number>;
  activityBreakdownByDay: Record<string, ActivityDayBreakdown>;
  workoutDaysPerWeek: WorkoutDaysPerWeekItem[];
  groupFrequency: GroupFreqItem[];
  leastHit: LeastHitItem[];
  missedExercises: MissedExerciseItem[];
};
