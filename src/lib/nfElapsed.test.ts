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
  it("uses Nd Nh Nm Ns and omits zero units", () => {
    expect(formatNfElapsedDisplay({ days: 0, hours: 3, minutes: 7, seconds: 9 })).toBe("3h 7m 9s");
    expect(formatNfElapsedDisplay({ days: 2, hours: 5, minutes: 3, seconds: 42 })).toBe(
      "2d 5h 3m 42s"
    );
    expect(formatNfElapsedDisplay({ days: 0, hours: 0, minutes: 2, seconds: 1 })).toBe("2m 1s");
  });

  it("drops middle zeros without collapsing order", () => {
    expect(formatNfElapsedDisplay({ days: 1, hours: 0, minutes: 2, seconds: 0 })).toBe("1d 2m");
    expect(formatNfElapsedDisplay({ days: 0, hours: 0, minutes: 0, seconds: 0 })).toBe("0s");
  });
});

describe("formatNfElapsedFromStart", () => {
  it("formats from ISO start to now", () => {
    const start = "2025-03-01T12:00:00.000Z";
    const now = Date.parse("2025-03-01T15:30:45.000Z");
    expect(formatNfElapsedFromStart(start, now)).toBe("3h 30m 45s");
  });

  it("returns safe fallback for invalid ISO", () => {
    expect(formatNfElapsedFromStart("not-a-date", Date.now())).toBe("0s");
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
  it("formats total seconds like elapsed parts", () => {
    expect(formatNfElapsedFromTotalSeconds(90061)).toBe("1d 1h 1m 1s");
  });
});
