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
  const pad = (n: number) => String(n).padStart(2, "0");
  if (days > 0) {
    return `${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export function formatNfElapsedFromStart(startedAtIso: string, nowMs: number): string {
  const start = Date.parse(startedAtIso);
  if (Number.isNaN(start)) return "00:00:00";
  return formatNfElapsedDisplay(computeNfElapsedParts(nowMs - start));
}
