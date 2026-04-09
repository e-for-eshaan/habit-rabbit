"use client";

import { isNil } from "lodash";
import { Clock, Loader2, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import type { Update } from "@/types";

type UpdateItemProps = {
  update: Update;
  onEdit: (id: string, payload: { text?: string; createdAt?: string }) => void;
  onDelete: (id: string) => void;
  onEditSessionChange?: (updateId: string | null) => void;
  activeEditUpdateId?: string | null;
  savingUpdateId?: string | null;
};

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 16);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function UpdateItem({
  update,
  onEdit,
  onDelete,
  onEditSessionChange,
  activeEditUpdateId,
  savingUpdateId,
}: UpdateItemProps) {
  const [editingTimestamp, setEditingTimestamp] = useState(false);
  const [editingText, setEditingText] = useState(false);
  const [timestampValue, setTimestampValue] = useState(() =>
    toDatetimeLocalValue(update.createdAt)
  );
  const [textValue, setTextValue] = useState(update.text);
  const isEditing = editingText || editingTimestamp;

  useEffect(() => {
    return () => {
      onEditSessionChange?.(null);
    };
  }, [onEditSessionChange]);

  function beginEditSession() {
    onEditSessionChange?.(update.id);
  }

  function endEditSession() {
    onEditSessionChange?.(null);
  }

  function commitTimestamp() {
    const d = new Date(timestampValue);
    if (Number.isNaN(d.getTime())) {
      setEditingTimestamp(false);
      endEditSession();
      return;
    }
    const nextIso = d.toISOString();
    const unchanged = new Date(update.createdAt).getTime() === new Date(nextIso).getTime();
    if (unchanged) {
      setEditingTimestamp(false);
      endEditSession();
      return;
    }
    onEdit(update.id, { createdAt: nextIso });
    setEditingTimestamp(false);
    endEditSession();
  }

  function commitText() {
    const trimmed = textValue.trim();
    if (trimmed === (update.text ?? "")) {
      setEditingText(false);
      endEditSession();
      return;
    }
    onEdit(update.id, { text: trimmed });
    setEditingText(false);
    endEditSession();
  }

  const hasText = !isNil(update.text) && update.text.trim() !== "";
  const dimAsPeer = !isNil(activeEditUpdateId) && activeEditUpdateId !== update.id;
  const isSavingThisRow = savingUpdateId === update.id;

  return (
    <div
      className={cn(
        "relative flex items-start gap-inline pt-0 pb-3 transition-opacity",
        !isEditing && "min-h-touch",
        dimAsPeer && "pointer-events-none opacity-45",
        isEditing && "z-20 opacity-100 pointer-events-auto",
        isSavingThisRow && "z-30"
      )}
      aria-busy={isSavingThisRow}
    >
      <div className="min-w-0 flex-1 pt-0">
        {editingText ? (
          <textarea
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            onBlur={commitText}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && commitText()}
            placeholder="What did you do?"
            rows={2}
            className="w-full resize-none rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-body-sm text-foreground outline-none ring-lime-400/30 focus:ring-2"
            autoFocus
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              beginEditSession();
              setTextValue(update.text);
              setEditingText(true);
            }}
            className="m-0 w-full p-0 text-left text-body-sm font-medium leading-snug text-foreground"
          >
            {hasText ? update.text : formatDate(update.createdAt)}
          </button>
        )}
        {editingTimestamp ? (
          <input
            type="datetime-local"
            value={timestampValue}
            onChange={(e) => setTimestampValue(e.target.value)}
            onBlur={commitTimestamp}
            onKeyDown={(e) => e.key === "Enter" && commitTimestamp()}
            className="mt-2 w-full rounded-lg border border-border-subtle bg-surface-elevated px-2 py-1.5 text-caption text-foreground outline-none ring-lime-400/30 focus:ring-2"
            autoFocus
          />
        ) : (
          !editingText && (
            <p className="mt-0 text-caption text-muted-fg">{formatTime(update.createdAt)}</p>
          )
        )}
      </div>
      {!isEditing && (
        <div className="flex shrink-0 items-center gap-0.5 pt-0">
          <button
            type="button"
            onClick={() => {
              beginEditSession();
              setTextValue(update.text);
              setEditingText(true);
            }}
            className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted hover:bg-surface-elevated hover:text-foreground"
            aria-label="Edit text"
            title="Edit text"
          >
            <Pencil className="size-3.5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => {
              beginEditSession();
              setTimestampValue(toDatetimeLocalValue(update.createdAt));
              setEditingTimestamp(true);
            }}
            className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted hover:bg-surface-elevated hover:text-foreground"
            aria-label="Edit time"
            title="Edit time"
          >
            <Clock className="size-3.5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => onDelete(update.id)}
            className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted hover:bg-red-950/40 hover:text-red-400"
            aria-label="Delete update"
            title="Delete"
          >
            <Trash2 className="size-3.5" aria-hidden />
          </button>
        </div>
      )}
      {isSavingThisRow && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-background/60 backdrop-blur-[1px]"
          role="status"
        >
          <Loader2 className="size-7 shrink-0 animate-spin text-lime-400" aria-hidden />
          <span className="sr-only">Saving</span>
        </div>
      )}
    </div>
  );
}
