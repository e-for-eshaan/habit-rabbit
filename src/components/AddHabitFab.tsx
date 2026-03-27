"use client";

import { Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { useSectionsStore } from "@/store/useSectionsStore";

export function AddHabitFab() {
  const addSection = useSectionsStore((s) => s.addSection);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    await addSection(trimmed);
    setOpen(false);
    setTitle("");
  };

  const handleCancel = () => {
    setOpen(false);
    setTitle("");
  };

  const handleOpen = () => {
    setTitle("");
    setOpen(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className={cn(
          "fixed bottom-6 right-6 z-20 flex size-14 items-center justify-center rounded-full shadow-lg shadow-black/30 transition hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
          "bg-lime-400 text-zinc-950 hover:bg-lime-300"
        )}
        aria-label="Add new habit"
      >
        <Plus className="size-7" strokeWidth={2.5} aria-hidden />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-habit-title"
          onClick={handleCancel}
        >
          <form
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl border border-border-subtle bg-surface p-5 shadow-2xl shadow-black/40"
          >
            <h2
              id="add-habit-title"
              className="mb-4 text-lg font-semibold tracking-tight text-foreground"
            >
              New habit
            </h2>
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Habit name"
              className="mb-5 w-full rounded-xl border border-border-subtle bg-surface-elevated px-3 py-2.5 text-foreground placeholder:text-muted-fg outline-none ring-lime-400/20 focus:ring-2"
              aria-label="Habit name"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-xl px-4 py-2 text-sm font-medium text-muted hover:bg-surface-elevated hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim()}
                className="rounded-xl bg-lime-400 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-lime-300 disabled:opacity-40"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
