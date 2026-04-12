"use client";

import { motion } from "framer-motion";

interface HookButtonProps {
  label: string;
  visited: boolean;
  onClick: () => void;
}

export default function HookButton({ label, visited, onClick }: HookButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full rounded-xl px-5 py-3 text-left text-sm transition-all ${
        visited
          ? "bg-paper-dark text-ink-light/50 shadow-neu-inset"
          : "bg-paper text-accent font-medium shadow-neu-sm hover:shadow-neu active:shadow-neu-inset"
      }`}
    >
      <span className="flex items-center gap-2">
        {visited ? (
          <span className="text-xs">✓</span>
        ) : (
          <span className="text-xs">→</span>
        )}
        {label}
      </span>
    </motion.button>
  );
}
