"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { EGG_CATALOG, useEggs, type EggId } from "@/lib/egg-context";

export default function EggCounter() {
  const { foundEggs, totalEggs } = useEggs();
  const [open, setOpen] = useState(false);

  // Hidden until the first egg is discovered — no spoilers.
  if (foundEggs.size === 0) return null;

  const ids = Object.keys(EGG_CATALOG) as EggId[];

  return (
    <div className="fixed left-4 top-4 z-[55] no-print">
      <motion.button
        onClick={() => setOpen((o) => !o)}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className="flex items-center gap-2 rounded-full border border-amber-300/50 bg-white/90 px-3 py-1.5 text-xs font-mono text-amber-800 shadow-md backdrop-blur transition-colors hover:bg-amber-50"
        aria-label={`Easter eggs found: ${foundEggs.size} of ${totalEggs}`}
      >
        <span className="text-sm">🏆</span>
        <span className="font-semibold">
          {foundEggs.size}
          <span className="text-amber-500">/{totalEggs}</span>
        </span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className="mt-2 w-[260px] rounded-2xl border border-amber-200/60 bg-white/95 p-3 shadow-xl backdrop-blur"
          >
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[2px] text-amber-700">
              Hidden features
            </p>
            <ul className="space-y-1.5">
              {ids.map((id) => {
                const found = foundEggs.has(id);
                const egg = EGG_CATALOG[id];
                return (
                  <li
                    key={id}
                    className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors ${
                      found ? "bg-amber-50 text-amber-900" : "text-neutral-400"
                    }`}
                  >
                    <span className="text-base">{found ? egg.icon : "❓"}</span>
                    <span className="flex-1 truncate">
                      {found ? egg.title : "???"}
                    </span>
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 text-[10px] italic text-neutral-400">
              Keep exploring to unlock more.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
