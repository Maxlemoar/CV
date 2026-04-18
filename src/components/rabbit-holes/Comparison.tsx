"use client";

import { motion } from "framer-motion";
import type { ExperimentProfile } from "@/lib/experiment-types";
import { DIMENSION_LABELS } from "@/lib/experiment-types";

interface ComparisonProps {
  profile: ExperimentProfile;
  onClose: () => void;
}

const DISTRIBUTIONS: Record<string, Record<string, number>> = {
  persuasion: { results: 38, process: 41, character: 21 },
  motivation: { mastery: 30, purpose: 44, relatedness: 26 },
  contentInterest: { technical: 35, vision: 40, journey: 25 },
};

export default function Comparison({ profile, onClose }: ComparisonProps) {
  const dimensions = ["persuasion", "motivation", "contentInterest"] as const;

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-white/95 dark:bg-neutral-900/95 backdrop-blur overflow-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="flex justify-between items-start mb-8">
          <div>
            <p className="text-xs tracking-[3px] text-neutral-400 uppercase mb-2">
              Experiment #{profile.experimentNumber}
            </p>
            <h2 className="font-serif text-2xl text-neutral-900 dark:text-neutral-100">
              How you compare
            </h2>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 text-sm">close</button>
        </div>

        <div className="space-y-8">
          {dimensions.map((dim) => {
            const dist = DISTRIBUTIONS[dim];
            const chosen = profile[dim];

            return (
              <div key={dim}>
                <p className="text-xs tracking-[2px] text-neutral-400 uppercase mb-3">{dim}</p>
                <div className="space-y-2">
                  {Object.entries(dist).map(([value, pct]) => {
                    const isChosen = value === chosen;
                    return (
                      <div key={value} className="flex items-center gap-3">
                        <div className="w-40 text-sm text-right text-neutral-500 dark:text-neutral-400 truncate">
                          {DIMENSION_LABELS[dim][value]}
                        </div>
                        <div className="flex-1 h-6 bg-neutral-100 dark:bg-neutral-800 rounded overflow-hidden">
                          <motion.div
                            className={`h-full rounded ${isChosen ? "bg-orange-500" : "bg-neutral-300 dark:bg-neutral-600"}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                          />
                        </div>
                        <div className={`w-10 text-sm text-right ${isChosen ? "text-orange-600 font-semibold" : "text-neutral-400"}`}>
                          {pct}%
                        </div>
                        {isChosen && <span className="text-orange-500 text-xs">← you</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-center text-sm text-neutral-400">Based on anonymized visitor data</div>
      </div>
    </motion.div>
  );
}
