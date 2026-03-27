"use client";

import { isNil } from "lodash";
import { useState } from "react";

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

  return (
    <div className="relative flex flex-col gap-1 rounded border border-stone-200 bg-white/80 p-2 pr-8 dark:border-stone-600 dark:bg-stone-800/80">
      <button
        type="button"
        onClick={() => onDelete(update.id)}
        className="absolute right-2 top-2 flex h-6 w-6 shrink-0 items-center justify-center rounded text-stone-400 hover:bg-stone-200 hover:text-stone-600 dark:hover:bg-stone-600 dark:hover:text-stone-300"
        aria-label="Delete update"
      >
        <span className="text-sm leading-none">×</span>
      </button>
      {editingText ? (
        <textarea
          value={textValue}
          onChange={(e) => setTextValue(e.target.value)}
          onBlur={commitText}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && commitText()}
          placeholder="What did you do?"
          rows={2}
          className="min-w-0 resize-none rounded border border-stone-300 px-2 py-1 text-sm dark:border-stone-500 dark:bg-stone-700"
          autoFocus
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditingText(true)}
          className="text-left text-sm font-medium text-stone-800 dark:text-stone-200"
        >
          {hasText ? update.text : formatDate(update.createdAt)}
        </button>
      )}
      <div className="flex items-center justify-between gap-2">
        {editingTimestamp ? (
          <input
            type="datetime-local"
            value={timestampValue}
            onChange={(e) => setTimestampValue(e.target.value)}
            onBlur={commitTimestamp}
            onKeyDown={(e) => e.key === "Enter" && commitTimestamp()}
            className="min-w-0 flex-1 rounded border border-stone-300 px-2 py-1 text-xs dark:border-stone-500 dark:bg-stone-700"
            autoFocus
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditingTimestamp(true)}
            className="text-left text-xs text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-300"
          >
            {formatTime(update.createdAt)}
          </button>
        )}
      </div>
    </div>
  );
}
