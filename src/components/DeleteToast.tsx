"use client";

import { Undo2 } from "lucide-react";
import { useEffect, useState } from "react";

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
          className="text-zinc-700"
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
          className="text-lime-400/90"
          style={{ transition: `stroke-dashoffset ${TICK_MS}ms linear` }}
        />
      </svg>
      <span className="absolute text-body-sm font-medium tabular-nums text-foreground">
        {Math.ceil(remaining)}
      </span>
    </div>
  );
}

function SingleDeleteToast({ pending, onUndo }: { pending: PendingDelete; onUndo: () => void }) {
  return (
    <div
      className="flex items-center gap-inline rounded-2xl border border-border-subtle bg-surface-elevated px-4 py-3 shadow-xl shadow-black/40"
      role="status"
    >
      <CountdownCircle deletedAt={pending.deletedAt} />
      <span className="min-w-0 flex-1 text-body-sm text-muted">Deleted. Undo soon.</span>
      <button
        type="button"
        onClick={onUndo}
        className="flex min-h-touch shrink-0 items-center gap-tight rounded-xl bg-zinc-700 px-3 py-2 text-body-sm font-medium text-foreground hover:bg-zinc-600"
      >
        <Undo2 className="size-4" aria-hidden />
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
    <div className="flex w-full flex-col items-stretch gap-inline">
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
