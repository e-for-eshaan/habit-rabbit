import { describe, expect, it } from "vitest";

import {
  computeNfElapsedParts,
  formatNfElapsedDisplay,
  formatNfElapsedFromStart,
} from "@/lib/nfElapsed";

describe("computeNfElapsedParts", () => {
  it("returns zeros for non-positive elapsed", () => {
    expect(computeNfElapsedParts(0)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    expect(computeNfElapsedParts(-1000)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  });

  it("splits 90061 seconds worth of ms", () => {
    const ms = 90061 * 1000;
    expect(computeNfElapsedParts(ms)).toEqual({
      days: 1,
      hours: 1,
      minutes: 1,
      seconds: 1,
    });
  });

  it("handles exactly one day", () => {
    expect(computeNfElapsedParts(86400 * 1000)).toEqual({
      days: 1,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
  });
});

describe("formatNfElapsedDisplay", () => {
  it("uses H:MM:SS when days is 0", () => {
    expect(formatNfElapsedDisplay({ days: 0, hours: 3, minutes: 7, seconds: 9 })).toBe("03:07:09");
  });

  it("includes day prefix when days > 0", () => {
    expect(formatNfElapsedDisplay({ days: 2, hours: 5, minutes: 3, seconds: 42 })).toBe(
      "2d 05:03:42"
    );
  });
});

describe("formatNfElapsedFromStart", () => {
  it("formats from ISO start to now", () => {
    const start = "2025-03-01T12:00:00.000Z";
    const now = Date.parse("2025-03-01T15:30:45.000Z");
    expect(formatNfElapsedFromStart(start, now)).toBe("03:30:45");
  });

  it("returns safe fallback for invalid ISO", () => {
    expect(formatNfElapsedFromStart("not-a-date", Date.now())).toBe("00:00:00");
  });
});
