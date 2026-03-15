"use client";

import { useState, useEffect } from "react";
import type { PendingDelete } from "@/store/useSectionsStore";
import { useSectionsStore } from "@/store/useSectionsStore";

const UNDO_SECONDS = 10;
const TICK_MS = 100;

function CountdownCircle({ deletedAt }: { deletedAt: number }) {
  const [now, setNow] = useState(() => Date.now());
  const elapsed = (now - deletedAt) / 1000;
  const remaining = Math.max(0, UNDO_SECONDS - elapsed);
  const progress = Math.min(1, elapsed / UNDO_SECONDS);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(id);
  }, []);

  const size = 44;
  const stroke = 4;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const strokeDashoffset = progress * circumference;

  return (
    <div className="relative flex h-11 w-11 shrink-0 items-center justify-center">
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-stone-200 dark:text-stone-600"
        />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="text-stone-600 dark:text-stone-400"
          style={{ transition: `stroke-dashoffset ${TICK_MS}ms linear` }}
        />
      </svg>
      <span className="absolute text-sm font-medium tabular-nums text-stone-700 dark:text-stone-300">
        {Math.ceil(remaining)}
      </span>
    </div>
  );
}

function SingleDeleteToast({ pending, onUndo }: { pending: PendingDelete; onUndo: () => void }) {
  return (
    <div
      className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white px-4 py-3 shadow-lg dark:border-stone-600 dark:bg-stone-800"
      role="status"
    >
      <CountdownCircle deletedAt={pending.deletedAt} />
      <span className="text-sm text-stone-700 dark:text-stone-300">
        Deleted. Undo within {UNDO_SECONDS}s
      </span>
      <button
        type="button"
        onClick={onUndo}
        className="rounded bg-stone-200 px-3 py-1.5 text-sm font-medium text-stone-800 hover:bg-stone-300 dark:bg-stone-700 dark:text-stone-100 dark:hover:bg-stone-600"
      >
        Undo
      </button>
    </div>
  );
}

export function DeleteToast() {
  const pendingDeletes = useSectionsStore((s) => s.pendingDeletes);
  const cancelDelete = useSectionsStore((s) => s.cancelDelete);

  if (pendingDeletes.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-2">
      {pendingDeletes.map((pending) => (
        <SingleDeleteToast
          key={`${pending.sectionId}-${pending.updateId}`}
          pending={pending}
          onUndo={() => cancelDelete(pending.sectionId, pending.updateId)}
        />
      ))}
    </div>
  );
}
