"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const principles = [
  {
    name: "Learner Agency",
    description:
      "You chose every path. No one told you what to read next \u2014 your curiosity drove the experience.",
  },
  {
    name: "Progressive Disclosure",
    description:
      "This page started almost empty. Everything you see, you actively uncovered. Nothing was dumped on you.",
  },
  {
    name: "Adaptive Content",
    description:
      "Your journey was unique. Someone else clicking different hooks would have a completely different experience.",
  },
  {
    name: "Formative Assessment",
    description:
      "Quizzes weren\u2019t tests \u2014 they were invitations to think deeper about what you just learned.",
  },
  {
    name: "Conversational AI",
    description:
      "The chatbot let you ask anything, anytime \u2014 meeting you where you are, not where I planned for you to be.",
  },
];

export default function MetaReflection() {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="no-print mb-6 rounded-2xl bg-paper-dark p-6 shadow-neu sm:p-8">
      <h2 className="mb-4 font-serif text-2xl text-ink">One More Thing</h2>
      {!revealed ? (
        <div className="text-center py-4">
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
            This website used{" "}
            <span className="font-medium text-ink">
              5 principles of AI-native learning design
            </span>{" "}
            to tell my story. Here&apos;s what you just experienced:
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
    </div>
  );
}
