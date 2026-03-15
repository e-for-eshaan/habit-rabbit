"use client";

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
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Worked on something..."
        className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-stone-400 dark:border-stone-600 dark:bg-stone-800 dark:focus:ring-stone-500"
        aria-label="Update"
      />
      <button
        type="submit"
        className="rounded-lg bg-stone-200 py-2 text-sm font-medium text-stone-800 hover:bg-stone-300 dark:bg-stone-700 dark:text-stone-100 dark:hover:bg-stone-600"
      >
        Add update
      </button>
    </form>
  );
}
