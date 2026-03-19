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
  selectedGroups?: string[];
};

export type FitnessState = {
  exercises: Exercise[];
  dayLogs: DayLog[];
};
