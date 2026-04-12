"use client";

import { motion } from "framer-motion";
import { type CuriosityMode, MODES } from "@/lib/curiosity-config";

interface CuriosityScreenProps {
  onSelect: (mode: CuriosityMode) => void;
}

const modeKeys: CuriosityMode[] = ["education", "product", "ai", "person"];

export default function CuriosityScreen({ onSelect }: CuriosityScreenProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-paper">
      <div className="mx-auto max-w-2xl px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-serif text-4xl font-bold text-ink md:text-5xl"
        >
          What are you curious about?
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-4 text-ink-light"
        >
          Choose a lens — I&apos;ll tailor my story to what matters most to you.
        </motion.p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {modeKeys.map((key, i) => {
            const config = MODES[key];
            return (
              <motion.button
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1, duration: 0.4 }}
                onClick={() => onSelect(key)}
                className="group rounded-2xl bg-paper-dark p-6 text-left shadow-neu transition-all hover:shadow-neu-sm active:shadow-neu-inset"
              >
                <h2 className="font-serif text-lg text-ink group-hover:text-accent transition-colors">
                  {config.label}
                </h2>
                <p className="mt-2 text-sm text-ink-light">
                  {config.description}
                </p>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
