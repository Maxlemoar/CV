"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface QuizOption {
  label: string;
  correct?: boolean;
  explanation: string;
}

interface QuizProps {
  question: string;
  options: QuizOption[];
}

export default function Quiz({ question, options }: QuizProps) {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="no-print mt-6 rounded-xl bg-paper p-5 shadow-neu-sm">
      <p className="text-xs font-medium uppercase tracking-wider text-accent mb-3">Quick Check</p>
      <p className="text-sm font-medium text-ink mb-4">{question}</p>
      <div className="space-y-2">
        {options.map((opt, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            disabled={selected !== null}
            className={`w-full rounded-lg px-4 py-2.5 text-left text-sm transition-all ${
              selected === null
                ? "bg-paper-dark text-ink-light hover:text-ink hover:shadow-neu-sm"
                : selected === i
                  ? opt.correct
                    ? "bg-green-50 text-green-800 shadow-neu-inset"
                    : "bg-red-50 text-red-800 shadow-neu-inset"
                  : opt.correct
                    ? "bg-green-50 text-green-800"
                    : "bg-paper-dark text-ink-light opacity-60"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <AnimatePresence>
        {selected !== null && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4"
          >
            <p className="text-sm text-ink-light leading-relaxed">
              {options[selected].explanation}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
