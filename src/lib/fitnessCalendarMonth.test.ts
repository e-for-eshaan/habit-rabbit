import { describe, expect, it } from "vitest";

import { buildFitnessCalendarMonthResponse, summarizeDayLog } from "@/lib/fitnessCalendarMonth";
import type { DayLog, Exercise } from "@/types/fitness";

const exercises: Exercise[] = [
  { id: "a", label: "A", group: "Chest" },
  { id: "b", label: "B", group: "Back" },
];

describe("summarizeDayLog", () => {
  it("returns zeros when log missing", () => {
    expect(summarizeDayLog(undefined, exercises)).toEqual({
      running: false,
      swimming: false,
      groupCount: 0,
    });
  });

  it("counts running swimming and distinct groups", () => {
    const log: DayLog = {
      dateKey: "2025-03-10",
      exerciseIds: ["a", "b"],
      swimmingSessions: 1,
      runningSessions: 1,
    };
    expect(summarizeDayLog(log, exercises)).toEqual({
      running: true,
      swimming: true,
      groupCount: 2,
    });
  });
});

describe("buildFitnessCalendarMonthResponse", () => {
  it("includes grid padding days for March 2025", () => {
    const res = buildFitnessCalendarMonthResponse(2025, 3, [], exercises);
    expect(res.year).toBe(2025);
    expect(res.month).toBe(3);
    expect(res.days["2025-02-23"]).toBeDefined();
    expect(res.days["2025-03-01"]).toBeDefined();
    expect(res.days["2025-04-05"]).toBeDefined();
  });

  it("merges day log into days map", () => {
    const logs: DayLog[] = [
      {
        dateKey: "2025-03-15",
        exerciseIds: ["a"],
        swimmingSessions: 0,
        runningSessions: 2,
      },
    ];
    const res = buildFitnessCalendarMonthResponse(2025, 3, logs, exercises);
    expect(res.days["2025-03-15"]).toEqual({
      running: true,
      swimming: false,
      groupCount: 1,
    });
  });
});
