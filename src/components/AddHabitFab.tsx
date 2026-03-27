"use client";

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
          "fixed bottom-6 right-6 z-20 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2 dark:focus:ring-stone-500",
          "bg-stone-800 text-white hover:bg-stone-700 dark:bg-stone-200 dark:text-stone-900 dark:hover:bg-stone-100"
        )}
        aria-label="Add new habit"
      >
        <span className="text-2xl leading-none" aria-hidden>
          +
        </span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-habit-title"
          onClick={handleCancel}
        >
          <form
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-xl border border-stone-200 bg-white p-4 shadow-xl dark:border-stone-600 dark:bg-stone-800"
          >
            <h2
              id="add-habit-title"
              className="mb-3 text-lg font-semibold text-stone-800 dark:text-stone-200"
            >
              New habit
            </h2>
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Habit name"
              className="mb-4 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 outline-none focus:ring-2 focus:ring-stone-400 dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100 dark:focus:ring-stone-500"
              aria-label="Habit name"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-lg px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim()}
                className="rounded-lg bg-stone-800 px-3 py-2 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-50 dark:bg-stone-200 dark:text-stone-900 dark:hover:bg-stone-100 dark:disabled:opacity-50"
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
