export type Exercise = {
  id: string;
  label: string;
  group: string;
};

export type WeekLog = {
  weekStart: string;
  exerciseIds: string[];
  swimmingSessions: number;
  runningSessions: number;
};

export type FitnessState = {
  exercises: Exercise[];
  weekLogs: WeekLog[];
};
