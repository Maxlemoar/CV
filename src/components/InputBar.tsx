"use client";

import { useState } from "react";

interface InputBarProps {
  onSubmit: (question: string) => void;
  disabled: boolean;
}

export default function InputBar({ onSubmit, disabled }: InputBarProps) {
  const [input, setInput] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
    setInput("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="fixed bottom-0 left-0 right-0 z-20 border-t border-paper-dark bg-paper/95 px-4 pb-[env(safe-area-inset-bottom,8px)] pt-3 backdrop-blur-sm no-print"
    >
      <div className="mx-auto flex max-w-3xl gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What do you want to know?"
          disabled={disabled}
          className="flex-1 rounded-xl bg-white px-4 py-3 text-sm text-ink shadow-neu-sm placeholder:text-ink-light/50 focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className="rounded-xl bg-accent px-4 py-3 text-sm font-medium text-white shadow-neu-sm transition-colors hover:bg-accent-hover disabled:opacity-40"
        >
          ↑
        </button>
      </div>
    </form>
  );
}
