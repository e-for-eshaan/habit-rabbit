"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

type AddUpdateFormProps = {
  onSubmit: (text: string) => void;
};

export function AddUpdateForm({ onSubmit }: AddUpdateFormProps) {
  const [text, setText] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setText("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Log what you did…"
        className="min-w-0 flex-1 rounded-xl border border-border-subtle bg-surface-elevated px-3 py-2.5 text-sm text-foreground placeholder:text-muted-fg outline-none ring-lime-400/20 focus:ring-2"
        aria-label="Update"
      />
      <button
        type="submit"
        disabled={!text.trim()}
        className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-lime-400 text-zinc-950 shadow-sm hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Add update"
        title="Add update"
      >
        <Plus className="size-5" strokeWidth={2.5} aria-hidden />
      </button>
    </form>
  );
}
