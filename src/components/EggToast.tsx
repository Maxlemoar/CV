"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { useEggs } from "@/lib/egg-context";

export default function EggToast() {
  const { activeToast, dismissToast } = useEggs();

  useEffect(() => {
    if (!activeToast) return;
    const timer = window.setTimeout(() => dismissToast(), 4000);
    return () => window.clearTimeout(timer);
  }, [activeToast, dismissToast]);

  return (
    <AnimatePresence>
      {activeToast && (
        <motion.div
          key={activeToast.id}
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 320, damping: 26 }}
          className="fixed right-4 top-4 z-[60] max-w-[320px] no-print"
          role="status"
          aria-live="polite"
        >
          <button
            onClick={dismissToast}
            className="w-full text-left rounded-2xl border border-amber-300/50 bg-gradient-to-br from-amber-50 to-orange-50 p-4 shadow-lg shadow-amber-900/10 backdrop-blur transition-transform hover:scale-[1.02]"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-xl">
                {activeToast.egg.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-0.5 flex items-baseline justify-between gap-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[2px] text-amber-700">
                    Easter Egg Found
                  </p>
                  <p className="text-xs font-mono text-amber-600">
                    {activeToast.foundIndex}/{activeToast.total}
                  </p>
                </div>
                <p className="font-serif text-base font-semibold text-amber-900">
                  {activeToast.egg.title}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-amber-800/80">
                  {activeToast.egg.hint}
                </p>
              </div>
            </div>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
