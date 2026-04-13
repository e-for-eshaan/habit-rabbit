"use client";

import { AlertTriangle } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { DeleteToast } from "@/components/DeleteToast";
import { isDataStale, STALE_DATA_AFTER_MS, useAppDataStore } from "@/store/useAppDataStore";

const STALE_TICK_MS = 30_000;

export function AppBottomToasts() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-fab left-1/2 z-50 flex max-w-[min(100vw-2rem,420px)] -translate-x-1/2 flex-col-reverse gap-inline px-page">
      <StaleDataToast />
      {pathname === "/" ? <DeleteToast /> : null}
    </div>
  );
}

function StaleDataToast() {
  const lastSyncedAt = useAppDataStore((s) => s.lastSyncedAt);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), STALE_TICK_MS);
    return () => window.clearInterval(id);
  }, []);

  const stale = isDataStale(lastSyncedAt, now);

  if (!stale) return null;

  const staleHours = Math.round(STALE_DATA_AFTER_MS / 3_600_000);

  return (
    <div
      className="flex w-full flex-col gap-inline rounded-2xl border border-border-subtle bg-surface-elevated px-4 py-3 shadow-xl shadow-black/40 sm:flex-row sm:items-center"
      role="status"
    >
      <div className="flex min-w-0 flex-1 items-center gap-inline">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-400 ring-1 ring-amber-400/30">
          <AlertTriangle className="size-5" aria-hidden />
        </div>
        <span className="min-w-0 flex-1 text-body-sm text-muted">
          Your data may be outdated (not refreshed in {staleHours}+ hours). Pull fresh data?
        </span>
      </div>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="flex min-h-touch w-full shrink-0 items-center justify-center gap-tight rounded-xl bg-zinc-700 px-3 py-2 text-body-sm font-medium text-foreground hover:bg-zinc-600 sm:w-auto"
      >
        Refresh
      </button>
    </div>
  );
}
