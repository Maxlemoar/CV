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
      className="fixed bottom-0 left-0 right-0 z-20 px-4 pb-[env(safe-area-inset-bottom,8px)] sm:pb-4 pt-3 no-print"
      style={{
        background: `rgba(var(--paper-rgb), 0.7)`,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderTop: "1px solid rgba(0,0,0,0.04)",
      }}
    >
      <div className="mx-auto flex max-w-3xl gap-2">
        <div className={`input-border-sweep flex-1 ${disabled ? "active" : ""}`}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={disabled ? "Thinking..." : "Ask me anything..."}
            disabled={disabled}
            className="w-full rounded-[14px] bg-white/80 px-4 py-3 text-sm text-ink shadow-sm placeholder:text-ink-light/50 focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-60"
            style={{ border: "1px solid rgba(0,0,0,0.06)" }}
          />
        </div>
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className="flex items-center justify-center rounded-[14px] bg-accent px-4 py-3 text-white shadow-sm transition-colors hover:bg-accent-hover disabled:opacity-40"
        >
          {disabled ? (
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2v4m0 12v4m-7.07-3.93l2.83-2.83m8.48-8.48l2.83-2.83M2 12h4m12 0h4m-3.93 7.07l-2.83-2.83M7.76 7.76L4.93 4.93" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 19V5M5 12l7-7 7 7"/>
            </svg>
          )}
        </button>
      </div>
    </form>
  );
}
