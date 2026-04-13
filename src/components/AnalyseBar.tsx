"use client";

import { motion } from "framer-motion";

interface AnalyseBarProps {
  visitedCount: number;
  threshold: number; // 8
  onRevealClick: () => void;
  revealDismissed: boolean;
}

const PHASES = [
  { max: 0.5, label: "Collecting data..." },
  { max: 0.79, label: "Analyzing patterns..." },
  { max: 0.99, label: "Almost there..." },
  { max: Infinity, label: "Enough data collected — result available" },
];

function getPhaseLabel(progress: number): string {
  for (const phase of PHASES) {
    if (progress <= phase.max) return phase.label;
  }
  return PHASES[PHASES.length - 1].label;
}

export default function AnalyseBar({
  visitedCount,
  threshold,
  onRevealClick,
  revealDismissed,
}: AnalyseBarProps) {
  const progress = Math.min(visitedCount / threshold, 1);
  const isReady = progress >= 1;
  const label = getPhaseLabel(progress);

  return (
    <div className="fixed top-0 left-0 right-0 z-30 no-print">
      {/* Bar */}
      <div className="h-1 bg-neutral-200 dark:bg-neutral-700">
        <motion.div
          className={`h-full ${isReady ? "bg-orange-500" : "bg-neutral-400 dark:bg-neutral-500"}`}
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>

      {/* Label */}
      <div className="flex items-center justify-between px-4 py-1.5 text-xs">
        <span className={`tracking-wide ${isReady ? "text-orange-600 dark:text-orange-400" : "text-neutral-400"}`}>
          {label}
        </span>
        {isReady && !revealDismissed && (
          <motion.button
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={onRevealClick}
            className="text-orange-600 dark:text-orange-400 hover:text-orange-700 underline transition-colors"
          >
            See result
          </motion.button>
        )}
      </div>
    </div>
  );
}
