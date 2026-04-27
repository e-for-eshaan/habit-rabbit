import { secondsInDay } from "date-fns/constants";
import { describe, expect, it } from "vitest";

import {
  formatNfTimeRemainingToMilestone,
  getNextNfMilestone,
  NF_MILESTONES,
} from "@/lib/nfMilestones";

const DAY = secondsInDay;

describe("getNextNfMilestone", () => {
  it("at 0s, next is 1 day", () => {
    const n = getNextNfMilestone(0);
    expect(n).not.toBeNull();
    expect(n!.label).toBe("1 day");
    expect(n!.totalSeconds).toBe(1 * DAY);
    expect(n!.remainingSeconds).toBe(1 * DAY);
  });

  it("1s before first milestone, remaining 1s", () => {
    const n = getNextNfMilestone(1 * DAY - 1);
    expect(n).not.toBeNull();
    expect(n!.label).toBe("1 day");
    expect(n!.remainingSeconds).toBe(1);
  });

  it("at exactly first milestone, next is 3 days", () => {
    const n = getNextNfMilestone(1 * DAY);
    expect(n).not.toBeNull();
    expect(n!.label).toBe("3 days");
    expect(n!.totalSeconds).toBe(3 * DAY);
  });

  it("between 1d and 3d, next is 3 days with correct remainder", () => {
    const n = getNextNfMilestone(1 * DAY + 10);
    expect(n).not.toBeNull();
    expect(n!.label).toBe("3 days");
    expect(n!.remainingSeconds).toBe(2 * DAY - 10);
  });

  it("1.5 month threshold is 45d", () => {
    const idx = NF_MILESTONES.findIndex((m) => m.label === "1.5 month");
    expect(NF_MILESTONES[idx]!.totalSeconds).toBe(45 * DAY);
  });

  it("at or past 6 months (180d), no next milestone", () => {
    expect(getNextNfMilestone(6 * 30 * DAY - 1)).not.toBeNull();
    expect(getNextNfMilestone(6 * 30 * DAY)).toBeNull();
    expect(getNextNfMilestone(6 * 30 * DAY + 1000)).toBeNull();
  });
});

describe("formatNfTimeRemainingToMilestone", () => {
  it("uses day hour when at least 1d", () => {
    expect(formatNfTimeRemainingToMilestone(2 * DAY + 3 * 3600)).toBe("2d 3h");
  });

  it("uses hour minute under 1d, at least 1h", () => {
    expect(formatNfTimeRemainingToMilestone(2 * 3600 + 5 * 60)).toBe("2h 5m");
  });

  it("uses minute second under 1h", () => {
    expect(formatNfTimeRemainingToMilestone(2 * 60 + 3)).toBe("2m 3s");
  });

  it("uses seconds only under 1m", () => {
    expect(formatNfTimeRemainingToMilestone(7)).toBe("7s");
  });
});
