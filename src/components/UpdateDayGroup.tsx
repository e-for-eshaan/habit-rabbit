"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import type { Update } from "@/types";

import { UpdateItem } from "./UpdateItem";

type UpdateDayGroupProps = {
  dateLabel: string;
  updates: Update[];
  onEdit: (updateId: string, payload: { text?: string; createdAt?: string }) => void;
  onDelete: (updateId: string) => void;
};

export function UpdateDayGroup({ dateLabel, updates, onEdit, onDelete }: UpdateDayGroupProps) {
  const [open, setOpen] = useState(false);
  const isMultiple = updates.length > 1;

  const dateHeading = (
    <span className="text-caption font-semibold uppercase tracking-wider text-muted-fg">
      {dateLabel}
    </span>
  );

  if (!isMultiple) {
    const u = updates[0];
    return (
      <div>
        <div className="mb-0 leading-none">{dateHeading}</div>
        <UpdateItem update={u} onEdit={onEdit} onDelete={onDelete} />
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex min-h-touch w-full items-center gap-inline py-1 text-left"
      >
        <span className="min-w-0 flex-1 text-left">{dateHeading}</span>
        <span className="ml-auto text-caption tabular-nums text-muted-fg">{updates.length}</span>
        <ChevronDown
          className={cn("size-4 shrink-0 text-muted transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>
      {open && (
        <div className="mt-inline divide-y divide-border-subtle rounded-xl bg-surface-elevated/40">
          {updates.map((u) => (
            <UpdateItem key={u.id} update={u} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
