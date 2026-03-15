import { describe, it, expect } from "vitest";
import {
  VIEW_MODES,
  CALENDAR_RANGES,
  CALENDAR_RANGE_LABELS,
  FREQ_RANGES,
  LAYOUT_MODES,
} from "./viewOptions";

describe("viewOptions", () => {
  it("VIEW_MODES has list, calendar, freq", () => {
    expect(VIEW_MODES).toHaveLength(3);
    expect(VIEW_MODES.map((m) => m.value)).toEqual(["list", "calendar", "freq"]);
  });

  it("CALENDAR_RANGES has week, month, last7, last30", () => {
    expect(CALENDAR_RANGES).toHaveLength(4);
    expect(CALENDAR_RANGE_LABELS.week).toBe("Week");
    expect(CALENDAR_RANGE_LABELS.last30).toBe("Last 30 days");
  });

  it("FREQ_RANGES has 1m, 3m, 6m, 1y", () => {
    expect(FREQ_RANGES).toHaveLength(4);
    expect(FREQ_RANGES.map((r) => r.value)).toEqual(["1m", "3m", "6m", "1y"]);
  });

  it("LAYOUT_MODES has horizontal and grid", () => {
    expect(LAYOUT_MODES).toHaveLength(2);
    expect(LAYOUT_MODES.map((m) => m.value)).toEqual(["horizontal", "grid"]);
  });
});
