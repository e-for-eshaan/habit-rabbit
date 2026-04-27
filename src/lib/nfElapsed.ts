import { differenceInSeconds } from "date-fns";
import { daysInWeek, secondsInDay, secondsInHour, secondsInMinute } from "date-fns/constants";

export type NfElapsedParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

/** Approximate month length for NF display tiers (not calendar months). */
const DISPLAY_DAYS_PER_MONTH = 30;

function partsFromTotalSeconds(totalSeconds: number): NfElapsedParts {
  const s = Math.max(0, Math.floor(totalSeconds));
  const days = Math.floor(s / secondsInDay);
  const hours = Math.floor((s % secondsInDay) / secondsInHour);
  const minutes = Math.floor((s % secondsInHour) / secondsInMinute);
  const seconds = s % secondsInMinute;
  return { days, hours, minutes, seconds };
}

export function computeNfElapsedParts(elapsedMs: number): NfElapsedParts {
  const safeMs = Math.max(0, Math.floor(elapsedMs));
  const totalSeconds = differenceInSeconds(new Date(safeMs), new Date(0));
  return partsFromTotalSeconds(totalSeconds);
}

function totalSecondsFromParts(parts: NfElapsedParts): number {
  return (
    parts.days * secondsInDay +
    parts.hours * secondsInHour +
    parts.minutes * secondsInMinute +
    parts.seconds
  );
}

/**
 * Two units only, from total elapsed seconds:
 * `43s` · `1m 43s` · `1h 2m` · `1d 2h` · `1w 2d` · `1mo 0d`
 */
function formatElapsedTotalSeconds(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const totalDays = Math.floor(s / secondsInDay);
  const remAfterDays = s % secondsInDay;

  if (totalDays >= DISPLAY_DAYS_PER_MONTH) {
    const months = Math.floor(totalDays / DISPLAY_DAYS_PER_MONTH);
    const d = totalDays % DISPLAY_DAYS_PER_MONTH;
    return `${months}mo ${d}d`;
  }
  if (totalDays >= daysInWeek) {
    const weeks = Math.floor(totalDays / daysInWeek);
    const d = totalDays % daysInWeek;
    return `${weeks}w ${d}d`;
  }
  if (totalDays >= 1) {
    const h = Math.floor(remAfterDays / secondsInHour);
    return `${totalDays}d ${h}h`;
  }

  const totalHours = Math.floor(s / secondsInHour);
  if (totalHours >= 1) {
    const m = Math.floor((s % secondsInHour) / secondsInMinute);
    return `${totalHours}h ${m}m`;
  }

  const totalMinutes = Math.floor(s / secondsInMinute);
  if (totalMinutes >= 1) {
    const sec = s % secondsInMinute;
    return `${totalMinutes}m ${sec}s`;
  }

  return `${s}s`;
}

export function formatNfElapsedDisplay(parts: NfElapsedParts): string {
  return formatElapsedTotalSeconds(totalSecondsFromParts(parts));
}

export function formatNfElapsedFromStart(startedAtIso: string, nowMs: number): string {
  const start = new Date(startedAtIso);
  if (Number.isNaN(start.getTime())) return "0s";
  const totalSeconds = Math.max(0, differenceInSeconds(new Date(nowMs), start));
  return formatElapsedTotalSeconds(totalSeconds);
}

export function nfElapsedSecondsFromStart(startedAtIso: string, nowMs: number): number {
  const start = new Date(startedAtIso);
  if (Number.isNaN(start.getTime())) return 0;
  return Math.max(0, differenceInSeconds(new Date(nowMs), start));
}

export function formatNfElapsedFromTotalSeconds(totalSeconds: number): string {
  return formatElapsedTotalSeconds(totalSeconds);
}

export function formatNfElapsedSingleUnitForBarLabel(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const totalDays = Math.floor(s / secondsInDay);
  if (totalDays >= DISPLAY_DAYS_PER_MONTH) {
    const months = Math.floor(totalDays / DISPLAY_DAYS_PER_MONTH);
    return `${months}mo`;
  }
  if (totalDays >= daysInWeek) {
    const weeks = Math.floor(totalDays / daysInWeek);
    return `${weeks}w`;
  }
  if (totalDays >= 1) {
    return `${totalDays}d`;
  }
  const totalHours = Math.floor(s / secondsInHour);
  if (totalHours >= 1) {
    return `${totalHours}h`;
  }
  const totalMinutes = Math.floor(s / secondsInMinute);
  if (totalMinutes >= 1) {
    return `${totalMinutes}m`;
  }
  return `${s}s`;
}
