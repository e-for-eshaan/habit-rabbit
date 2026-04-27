import { secondsInDay } from "date-fns/constants";
import { describe, expect, it } from "vitest";

import {
  buildNfMilestoneBar,
  formatNfTimeRemainingToMilestone,
  getMilestoneBarMarks,
  getMilestonesCrossedInInterval,
  getMilestoneSegmentBoundsForNext,
  getNextNfMilestone,
  listMilestonesPassedWithoutCongrat,
  NF_MILESTONES,
  nfMilestoneKey,
  pickMilestoneBarMarkCount,
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

  it("at exactly 1 day milestone, next is 3 days", () => {
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

describe("listMilestonesPassedWithoutCongrat", () => {
  it("lists passed milestones not in congratulated set", () => {
    const empty = new Set<string>();
    const past1d = listMilestonesPassedWithoutCongrat(1 * DAY + 10, empty);
    expect(past1d.map((x) => x.label)).toEqual(["1 day"]);

    const at3d = listMilestonesPassedWithoutCongrat(3 * DAY + 1, empty);
    expect(at3d.map((x) => x.label)).toEqual(["1 day", "3 days"]);
  });

  it("omits keys present in congratulated set", () => {
    const s = new Set([nfMilestoneKey(1 * DAY)]);
    const at3d = listMilestonesPassedWithoutCongrat(3 * DAY + 1, s);
    expect(at3d.map((x) => x.label)).toEqual(["3 days"]);
  });
});

describe("getMilestonesCrossedInInterval", () => {
  it("is empty when next is not after prev", () => {
    expect(getMilestonesCrossedInInterval(5, 5).length).toBe(0);
    expect(getMilestonesCrossedInInterval(10, 2).length).toBe(0);
  });

  it("returns one milestone at first 1d boundary", () => {
    const crossed = getMilestonesCrossedInInterval(1 * DAY - 1, 1 * DAY);
    expect(crossed).toHaveLength(1);
    expect(crossed[0]!.key).toBe(nfMilestoneKey(1 * DAY));
    expect(crossed[0]!.label).toBe("1 day");
  });

  it("can return several when elapsed jumps a large gap", () => {
    const crossed = getMilestonesCrossedInInterval(0, 4 * DAY + 1);
    expect(crossed.map((c) => c.label)).toEqual(["1 day", "3 days"]);
  });
});

describe("milestone progress bar", () => {
  it("segment for first milestone is from 0 to 1 day", () => {
    const b = getMilestoneSegmentBoundsForNext(1 * DAY);
    expect(b.segmentStartSeconds).toBe(0);
    expect(b.segmentEndSeconds).toBe(1 * DAY);
  });

  it("segment for 3 days milestone starts at 1 day", () => {
    const b = getMilestoneSegmentBoundsForNext(3 * DAY);
    expect(b.segmentStartSeconds).toBe(1 * DAY);
    expect(b.segmentEndSeconds).toBe(3 * DAY);
  });

  it("pickMilestoneBarMarkCount stays between 4 and 8", () => {
    expect(pickMilestoneBarMarkCount(100)).toBeGreaterThanOrEqual(4);
    expect(pickMilestoneBarMarkCount(100)).toBeLessThanOrEqual(8);
    expect(pickMilestoneBarMarkCount(200 * DAY)).toBe(8);
    expect(pickMilestoneBarMarkCount(0.5 * DAY)).toBe(4);
  });

  it("getMilestoneBarMarks spans endpoints with ordered positions", () => {
    const marks = getMilestoneBarMarks(0, 100, 5);
    expect(marks.length).toBeGreaterThanOrEqual(2);
    expect(marks[0]!.totalSeconds).toBe(0);
    expect(marks[marks.length - 1]!.totalSeconds).toBe(100);
    for (let i = 1; i < marks.length; i += 1) {
      expect(marks[i]!.position01).toBeGreaterThanOrEqual(marks[i - 1]!.position01);
    }
  });

  it("first bar mark label is 0s when segment starts at zero", () => {
    const marks = getMilestoneBarMarks(0, DAY, 4);
    expect(marks[0]!.totalSeconds).toBe(0);
    expect(marks[0]!.label).toBe("0s");
  });

  it("first bar mark label is the previous milestone name when segment starts after zero", () => {
    const marks = getMilestoneBarMarks(DAY, 3 * DAY, 4);
    expect(marks[0]!.totalSeconds).toBe(DAY);
    expect(marks[0]!.label).toBe("1 day");
  });

  it("buildNfMilestoneBar progress reflects elapsed within segment", () => {
    const next = getNextNfMilestone(0)!;
    const atStart = buildNfMilestoneBar(0, next);
    expect(atStart.progress01).toBe(0);

    const mid = DAY / 2;
    const atMid = buildNfMilestoneBar(mid, next);
    expect(atMid.progress01).toBeCloseTo(0.5, 5);
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
