import { describe, expect, it } from "vitest";

import {
  computeNfElapsedParts,
  formatNfElapsedDisplay,
  formatNfElapsedFromStart,
  formatNfElapsedFromTotalSeconds,
  nfElapsedSecondsFromStart,
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
  it("uses min sec under one day", () => {
    expect(formatNfElapsedDisplay({ days: 0, hours: 3, minutes: 7, seconds: 9 })).toBe("187m 9s");
    expect(formatNfElapsedDisplay({ days: 0, hours: 0, minutes: 2, seconds: 1 })).toBe("2m 1s");
    expect(formatNfElapsedDisplay({ days: 0, hours: 0, minutes: 0, seconds: 0 })).toBe("0m 0s");
  });

  it("uses day hour from 1d through 6d", () => {
    expect(formatNfElapsedDisplay({ days: 1, hours: 0, minutes: 0, seconds: 0 })).toBe("1d 0h");
    expect(formatNfElapsedDisplay({ days: 2, hours: 5, minutes: 3, seconds: 42 })).toBe("2d 5h");
    expect(formatNfElapsedDisplay({ days: 6, hours: 23, minutes: 0, seconds: 0 })).toBe("6d 23h");
  });

  it("uses week day from 7d through 29d", () => {
    expect(formatNfElapsedDisplay({ days: 7, hours: 0, minutes: 0, seconds: 0 })).toBe("1w 0d");
    expect(formatNfElapsedDisplay({ days: 13, hours: 4, minutes: 0, seconds: 0 })).toBe("1w 6d");
    expect(formatNfElapsedDisplay({ days: 29, hours: 0, minutes: 0, seconds: 0 })).toBe("4w 1d");
  });

  it("uses month day from 30d onward (30-day months)", () => {
    expect(formatNfElapsedDisplay({ days: 30, hours: 0, minutes: 0, seconds: 0 })).toBe("1mo 0d");
    expect(formatNfElapsedDisplay({ days: 45, hours: 0, minutes: 0, seconds: 0 })).toBe("1mo 15d");
    expect(formatNfElapsedDisplay({ days: 60, hours: 0, minutes: 0, seconds: 0 })).toBe("2mo 0d");
  });
});

describe("formatNfElapsedFromStart", () => {
  it("formats from ISO start to now", () => {
    const start = "2025-03-01T12:00:00.000Z";
    const now = Date.parse("2025-03-01T15:30:45.000Z");
    expect(formatNfElapsedFromStart(start, now)).toBe("210m 45s");
  });

  it("returns safe fallback for invalid ISO", () => {
    expect(formatNfElapsedFromStart("not-a-date", Date.now())).toBe("0m 0s");
  });
});

describe("nfElapsedSecondsFromStart", () => {
  it("returns whole seconds between start and now", () => {
    const start = "2025-03-01T12:00:00.000Z";
    const now = Date.parse("2025-03-01T12:00:45.999Z");
    expect(nfElapsedSecondsFromStart(start, now)).toBe(45);
  });

  it("returns 0 for invalid ISO", () => {
    expect(nfElapsedSecondsFromStart("bad", Date.now())).toBe(0);
  });
});

describe("formatNfElapsedFromTotalSeconds", () => {
  it("formats total seconds with two-unit rules", () => {
    expect(formatNfElapsedFromTotalSeconds(90061)).toBe("1d 1h");
  });
});
