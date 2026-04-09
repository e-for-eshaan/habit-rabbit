import { describe, expect, it } from "vitest";

import { computeNfStreak } from "@/lib/fitnessNfStreak";
import type { DayLog } from "@/types/fitness";

function log(dateKey: string, overrides: Partial<Pick<DayLog, "nfCompleted">> = {}): DayLog {
  return {
    dateKey,
    exerciseIds: [],
    swimmingSessions: 0,
    runningSessions: 0,
    ...overrides,
  };
}

describe("computeNfStreak", () => {
  it("returns 0 when end day is not checked", () => {
    const dayLogs = [log("2025-03-05", { nfCompleted: false })];
    expect(computeNfStreak(dayLogs, "2025-03-05")).toBe(0);
  });

  it("returns 0 when end day has no log", () => {
    expect(computeNfStreak([], "2025-03-05")).toBe(0);
  });

  it("returns 0 for invalid end date key", () => {
    expect(computeNfStreak([log("2025-03-05", { nfCompleted: true })], "not-a-date")).toBe(0);
  });

  it("counts consecutive checked days ending at endDateKey", () => {
    const dayLogs = [
      log("2025-03-03", { nfCompleted: true }),
      log("2025-03-04", { nfCompleted: true }),
      log("2025-03-05", { nfCompleted: true }),
    ];
    expect(computeNfStreak(dayLogs, "2025-03-05")).toBe(3);
  });

  it("stops at first gap", () => {
    const dayLogs = [
      log("2025-03-03", { nfCompleted: true }),
      log("2025-03-04", { nfCompleted: false }),
      log("2025-03-05", { nfCompleted: true }),
    ];
    expect(computeNfStreak(dayLogs, "2025-03-05")).toBe(1);
  });

  it("stops when previous day has no log", () => {
    const dayLogs = [log("2025-03-05", { nfCompleted: true })];
    expect(computeNfStreak(dayLogs, "2025-03-05")).toBe(1);
  });

  it("treats missing nfCompleted as unchecked", () => {
    const dayLogs = [log("2025-03-05")];
    expect(computeNfStreak(dayLogs, "2025-03-05")).toBe(0);
  });
});
