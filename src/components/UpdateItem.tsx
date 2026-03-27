"use client";

import { isNil } from "lodash";
import { Clock, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import type { Update } from "@/types";

type UpdateItemProps = {
  update: Update;
  onEdit: (id: string, payload: { text?: string; createdAt?: string }) => void;
  onDelete: (id: string) => void;
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

export function UpdateItem({ update, onEdit, onDelete }: UpdateItemProps) {
  const [editingTimestamp, setEditingTimestamp] = useState(false);
  const [editingText, setEditingText] = useState(false);
  const [timestampValue, setTimestampValue] = useState(update.createdAt.slice(0, 16));
  const [textValue, setTextValue] = useState(update.text);

  function commitTimestamp() {
    const d = new Date(timestampValue);
    if (!Number.isNaN(d.getTime())) {
      onEdit(update.id, { createdAt: d.toISOString() });
    }
    setEditingTimestamp(false);
  }

  function commitText() {
    onEdit(update.id, { text: textValue.trim() });
    setEditingText(false);
  }

  const hasText = !isNil(update.text) && update.text.trim() !== "";
  const isEditing = editingText || editingTimestamp;

  return (
    <div className={cn("flex items-start gap-inline py-3 first:pt-2", !isEditing && "min-h-touch")}>
      <div className="min-w-0 flex-1">
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
              setTextValue(update.text);
              setEditingText(true);
            }}
            className="w-full text-left text-body-sm font-medium leading-snug text-foreground"
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
            <p className="mt-0.5 text-caption text-muted-fg">{formatTime(update.createdAt)}</p>
          )
        )}
      </div>
      {!isEditing && (
        <div className="flex shrink-0 items-center gap-px pt-0.5">
          <button
            type="button"
            onClick={() => {
              setTextValue(update.text);
              setEditingText(true);
            }}
            className="flex min-h-touch min-w-touch items-center justify-center rounded-lg text-muted hover:bg-surface-elevated hover:text-foreground"
            aria-label="Edit text"
            title="Edit text"
          >
            <Pencil className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => {
              setTimestampValue(update.createdAt.slice(0, 16));
              setEditingTimestamp(true);
            }}
            className="flex min-h-touch min-w-touch items-center justify-center rounded-lg text-muted hover:bg-surface-elevated hover:text-foreground"
            aria-label="Edit time"
            title="Edit time"
          >
            <Clock className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => onDelete(update.id)}
            className="flex min-h-touch min-w-touch items-center justify-center rounded-lg text-muted hover:bg-red-950/40 hover:text-red-400"
            aria-label="Delete update"
            title="Delete"
          >
            <Trash2 className="size-4" aria-hidden />
          </button>
        </div>
      )}
    </div>
  );
}
