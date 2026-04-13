import { millisecondsInMinute } from "date-fns/constants";
import { create } from "zustand";

export const STALE_DATA_AFTER_MS = 10 * millisecondsInMinute;

type AppDataSyncState = {
  lastSyncedAt: number | null;
  markSynced: () => void;
};

export const useAppDataStore = create<AppDataSyncState>((set) => ({
  lastSyncedAt: null,
  markSynced: () => set({ lastSyncedAt: Date.now() }),
}));

export function isDataStale(lastSyncedAt: number | null, nowMs: number): boolean {
  if (lastSyncedAt === null) return false;
  return nowMs - lastSyncedAt > STALE_DATA_AFTER_MS;
}
