import { secondsInDay, secondsInHour, secondsInMinute } from "date-fns/constants";

const DISPLAY_DAYS_PER_MONTH = 30;
const daySeconds = secondsInDay;

const NF_MILESTONE_THRESHOLDS_SECONDS = [
  1 * daySeconds,
  3 * daySeconds,
  7 * daySeconds,
  14 * daySeconds,
  21 * daySeconds,
  30 * daySeconds,
  1.5 * DISPLAY_DAYS_PER_MONTH * daySeconds,
  2 * DISPLAY_DAYS_PER_MONTH * daySeconds,
  2.5 * DISPLAY_DAYS_PER_MONTH * daySeconds,
  3 * DISPLAY_DAYS_PER_MONTH * daySeconds,
  4 * DISPLAY_DAYS_PER_MONTH * daySeconds,
  5 * DISPLAY_DAYS_PER_MONTH * daySeconds,
  6 * DISPLAY_DAYS_PER_MONTH * daySeconds,
] as const;

const NF_MILESTONE_LABELS = [
  "1 day",
  "3 days",
  "7 days",
  "14 days",
  "21 days",
  "30 days",
  "1.5 month",
  "2 month",
  "2.5 month",
  "3 months",
  "4 months",
  "5 months",
  "6 months",
] as const;

export const NF_MILESTONES: ReadonlyArray<{
  label: (typeof NF_MILESTONE_LABELS)[number];
  totalSeconds: number;
}> = NF_MILESTONE_LABELS.map((label, i) => ({
  label,
  totalSeconds: NF_MILESTONE_THRESHOLDS_SECONDS[i]!,
}));

export type NextNfMilestone = {
  label: string;
  totalSeconds: number;
  remainingSeconds: number;
};

export function getNextNfMilestone(elapsedSeconds: number): NextNfMilestone | null {
  const e = Math.max(0, Math.floor(elapsedSeconds));
  for (const m of NF_MILESTONES) {
    if (e < m.totalSeconds) {
      return {
        label: m.label,
        totalSeconds: m.totalSeconds,
        remainingSeconds: m.totalSeconds - e,
      };
    }
  }
  return null;
}

export const NF_MILESTONE_CONGRATULATORY_MESSAGES: readonly string[] = [
  "What you are building is quiet strength. The kind that compounds. Keep it moving.",
  "A milestone is proof you showed up, even when it was not glamorous. That counts for more than motivation.",
  "The gap between you and a stronger version of yourself is mostly consistency. You just proved you have it today.",
  "Respect. Most people do not do hard things in small rooms of their own mind. You did.",
  "This is the kind of win nobody posts, but the kind that reshapes a life. Protect it with calm discipline.",
  "One clean habit at a time, you are teaching your nervous system a new default. This milestone is a receipt.",
  "The longer you go, the more your identity changes from trying to being. Stay gentle with the pressure.",
  "You did the boring part that matters. Consistency is not a vibe; it is a stack of days like this one.",
  "Progress here is not loud. It is a quiet bet on yourself, repaid a little at a time. This was a real payment.",
  "This streak is a promise you kept with yourself. Keep the promise simple, and the results get surprising.",
] as const;

export function pickRandomNfMilestoneMessage(): string {
  const a = NF_MILESTONE_CONGRATULATORY_MESSAGES;
  return a[Math.floor(Math.random() * a.length)]!;
}

export function nfMilestoneKey(totalSeconds: number): string {
  return `nfMilestone:${totalSeconds}`;
}

export function getMilestonesCrossedInInterval(
  prevElapsedSeconds: number,
  nextElapsedSeconds: number
): Array<{ key: string; label: string; totalSeconds: number }> {
  const p = Math.max(0, Math.floor(prevElapsedSeconds));
  const n = Math.max(0, Math.floor(nextElapsedSeconds));
  if (n <= p) return [];
  const out: Array<{ key: string; label: string; totalSeconds: number }> = [];
  for (const m of NF_MILESTONES) {
    if (p < m.totalSeconds && n >= m.totalSeconds) {
      out.push({
        key: nfMilestoneKey(m.totalSeconds),
        label: m.label,
        totalSeconds: m.totalSeconds,
      });
    }
  }
  return out;
}

export function formatNfTimeRemainingToMilestone(remainingSeconds: number): string {
  const r = Math.max(0, Math.floor(remainingSeconds));

  if (r >= secondsInDay) {
    const totalDays = Math.floor(r / secondsInDay);
    const remAfterDays = r % secondsInDay;
    const h = Math.floor(remAfterDays / secondsInHour);
    return `${totalDays}d ${h}h`;
  }

  const totalHours = Math.floor(r / secondsInHour);
  if (totalHours >= 1) {
    const m = Math.floor((r % secondsInHour) / secondsInMinute);
    return `${totalHours}h ${m}m`;
  }

  const totalMinutes = Math.floor(r / secondsInMinute);
  if (totalMinutes >= 1) {
    const sec = r % secondsInMinute;
    return `${totalMinutes}m ${sec}s`;
  }

  return `${r}s`;
}
