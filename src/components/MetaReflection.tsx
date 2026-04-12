"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionCard from "./SectionCard";

const principles = [
  {
    name: "Learner Agency",
    description: "You chose what to explore first — the experience adapted to your curiosity, not the other way around.",
  },
  {
    name: "Adaptive Content",
    description: "The page reorganized itself based on your selection, surfacing the most relevant information first.",
  },
  {
    name: "Progressive Disclosure",
    description: "Information unfolded at your pace — you decided when to go deeper, rather than being overwhelmed upfront.",
  },
  {
    name: "Formative Assessment",
    description: "Interactive quizzes helped you engage actively with the content, not just passively read it.",
  },
  {
    name: "Conversational AI",
    description: "You could ask anything, anytime — a Claude-powered conversation that meets you where you are.",
  },
];

export default function MetaReflection() {
  const [revealed, setRevealed] = useState(false);

  return (
    <SectionCard id="reflection" title="One More Thing" className="no-print">
      {!revealed ? (
        <div className="text-center">
          <p className="text-ink-light leading-relaxed">
            You&apos;ve just experienced something. Want to know what it was?
          </p>
          <button
            onClick={() => setRevealed(true)}
            className="mt-4 rounded-xl bg-paper px-6 py-3 text-sm font-medium text-accent shadow-neu transition-all hover:shadow-neu-sm active:shadow-neu-inset"
          >
            Reveal
          </button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-ink-light leading-relaxed mb-6">
            This website used <span className="font-medium text-ink">5 principles of AI-native learning design</span> to
            tell my story. Here&apos;s what you just experienced:
          </p>
          <div className="space-y-4">
            {principles.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15, duration: 0.4 }}
                className="flex gap-4"
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-serif text-base text-ink">{p.name}</h3>
                  <p className="mt-1 text-sm text-ink-light">{p.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="mt-8 text-center font-serif text-lg text-ink"
          >
            This is what I want to build at Anthropic&apos;s Education Labs.
          </motion.p>
        </motion.div>
      )}
    </SectionCard>
  );
}
