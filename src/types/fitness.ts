export type Exercise = {
  id: string;
  label: string;
  group: string;
  muted?: boolean;
};

export type DayLog = {
  dateKey: string;
  exerciseIds: string[];
  swimmingSessions: number;
  runningSessions: number;
  nfCompleted?: boolean;
  selectedGroups?: string[];
};

export type FitnessState = {
  exercises: Exercise[];
  dayLogs: DayLog[];
  nfStreakStartedAt?: string;
};

export type FitnessCalendarDaySummary = {
  running: boolean;
  swimming: boolean;
  groupCount: number;
};

export type FitnessCalendarMonthResponse = {
  year: number;
  month: number;
  days: Record<string, FitnessCalendarDaySummary>;
};
