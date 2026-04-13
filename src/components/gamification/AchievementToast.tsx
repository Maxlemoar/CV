"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { AchievementDefinition } from "@/lib/types";

interface AchievementToastProps {
  achievement: AchievementDefinition | null;
  onDismiss: () => void;
}

export default function AchievementToast({ achievement, onDismiss }: AchievementToastProps) {
  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          key={achievement.id}
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="no-print fixed top-4 left-1/2 z-50 -translate-x-1/2"
          role="status"
          aria-live="polite"
        >
          <button
            onClick={onDismiss}
            className="flex max-w-[360px] items-center gap-3 rounded-2xl border border-[var(--color-paper-dark,#E5DDD3)] bg-white px-5 py-3 shadow-neu cursor-pointer hover:shadow-neu-sm transition-shadow"
          >
            <span className="text-2xl" role="img" aria-label={achievement.name}>
              {achievement.emoji}
            </span>
            <div className="text-left">
              <div className="text-sm font-semibold text-ink">{achievement.name}</div>
              <div className="text-xs text-ink-light">{achievement.description}</div>
            </div>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
