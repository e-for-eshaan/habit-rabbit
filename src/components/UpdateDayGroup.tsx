"use client";

import { useState } from "react";
import type { Update } from "@/types";
import { UpdateItem } from "./UpdateItem";
import { cn } from "@/lib/utils";

type UpdateDayGroupProps = {
  dateLabel: string;
  updates: Update[];
  onEdit: (updateId: string, payload: { text?: string; createdAt?: string }) => void;
  onDelete: (updateId: string) => void;
};

export function UpdateDayGroup({ dateLabel, updates, onEdit, onDelete }: UpdateDayGroupProps) {
  const [open, setOpen] = useState(false);
  const isMultiple = updates.length > 1;

  if (!isMultiple) {
    const u = updates[0];
    return (
      <div className="rounded-lg border border-stone-200 bg-white/60 p-2 dark:border-stone-600 dark:bg-stone-800/60">
        <p className="mb-1 text-xs text-stone-500 dark:text-stone-400">{dateLabel}</p>
        <UpdateItem update={u} onEdit={onEdit} onDelete={onDelete} />
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-stone-200 bg-white/60 dark:border-stone-600 dark:bg-stone-800/60">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left"
      >
        <span className="text-xs text-stone-500 dark:text-stone-400">{dateLabel}</span>
        <span className="text-xs text-stone-500 dark:text-stone-400">{updates.length} updates</span>
        <span
          className={cn(
            "text-stone-500 transition-transform dark:text-stone-400",
            open && "rotate-180"
          )}
        >
          ▼
        </span>
      </button>
      {open && (
        <div className="flex flex-col gap-2 border-t border-stone-200 px-2 pb-2 pt-2 dark:border-stone-600">
          {updates.map((u) => (
            <UpdateItem key={u.id} update={u} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
