export type NfElapsedParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export function computeNfElapsedParts(elapsedMs: number): NfElapsedParts {
  const totalSeconds = Math.floor(Math.max(0, elapsedMs) / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
}

export function formatNfElapsedDisplay(parts: NfElapsedParts): string {
  const { days, hours, minutes, seconds } = parts;
  const segments: string[] = [];
  if (days > 0) segments.push(`${days}d`);
  if (hours > 0) segments.push(`${hours}h`);
  if (minutes > 0) segments.push(`${minutes}m`);
  if (seconds > 0) segments.push(`${seconds}s`);
  if (segments.length === 0) return "0s";
  return segments.join(" ");
}

export function formatNfElapsedFromStart(startedAtIso: string, nowMs: number): string {
  const start = Date.parse(startedAtIso);
  if (Number.isNaN(start)) return "0s";
  return formatNfElapsedDisplay(computeNfElapsedParts(nowMs - start));
}

export function nfElapsedSecondsFromStart(startedAtIso: string, nowMs: number): number {
  const start = Date.parse(startedAtIso);
  if (Number.isNaN(start)) return 0;
  return Math.floor(Math.max(0, nowMs - start) / 1000);
}

export function formatNfElapsedFromTotalSeconds(totalSeconds: number): string {
  return formatNfElapsedDisplay(computeNfElapsedParts(totalSeconds * 1000));
}
