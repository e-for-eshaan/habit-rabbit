import { describe, it, expect } from "vitest";
import { differenceInCalendarDays } from "date-fns";
import { getDateRange, getDaysInRange, getCalendarGrid, toDateKey } from "./dateRange";

describe("getDateRange", () => {
  const ref = new Date("2025-01-15T12:00:00Z");

  it("last7 returns 7 days", () => {
    const { start, end } = getDateRange("last7", ref);
    const days = differenceInCalendarDays(end, start) + 1;
    expect(days).toBe(7);
  });

  it("last30 returns 30 days", () => {
    const { start, end } = getDateRange("last30", ref);
    const days = differenceInCalendarDays(end, start) + 1;
    expect(days).toBe(30);
  });
});

describe("getDaysInRange", () => {
  it("returns array of dates for last7", () => {
    const ref = new Date("2025-01-15");
    const days = getDaysInRange("last7", ref);
    expect(days).toHaveLength(7);
  });
});

describe("getCalendarGrid", () => {
  it("returns grid with 7 columns", () => {
    const ref = new Date("2025-01-15");
    const days = getDaysInRange("last7", ref);
    const grid = getCalendarGrid(days);
    expect(grid.length).toBeGreaterThan(0);
    grid.forEach((row) => expect(row).toHaveLength(7));
  });
});

describe("toDateKey", () => {
  it("formats date as YYYY-MM-DD", () => {
    expect(toDateKey(new Date("2025-01-05"))).toBe("2025-01-05");
  });
});
