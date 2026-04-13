"use client";

import { motion, AnimatePresence } from "framer-motion";

export const LEARNING_PRINCIPLES: Record<string, { name: string; description: string; paper: string }> = {
  "testing-effect": {
    name: "Testing Effect",
    description: "Actively retrieving information from memory strengthens long-term retention more than passive re-reading. When you estimated an answer before seeing it, your brain encoded the information more deeply.",
    paper: "Roediger & Karpicke (2006). Test-Enhanced Learning. Psychological Science, 17(3), 249-255.",
  },
  "spaced-retrieval": {
    name: "Spaced Retrieval",
    description: "Information encountered at spaced intervals is retained better than information studied in a single session. When an earlier topic resurfaced in a new context, it strengthened your memory of both.",
    paper: "Karpicke & Bauernschmidt (2011). Spaced retrieval: Absolute spacing enhances learning. Journal of Experimental Psychology, 137(5), 1250.",
  },
  interleaving: {
    name: "Interleaving",
    description: "Mixing different topics during study leads to better discrimination and long-term retention than studying one topic at a time.",
    paper: "Rohrer & Taylor (2007). The shuffling of mathematics problems improves learning. Instructional Science, 35(6), 481-498.",
  },
  personalization: {
    name: "Adaptive Presentation",
    description: "Content presented in alignment with a learner's cognitive preferences is processed more fluently and remembered better.",
    paper: "Kalyuga (2007). Expertise Reversal Effect and Its Implications for Learner-Tailored Instruction. Educational Psychology Review, 19(4), 509-539.",
  },
};

interface BehindTheScienceProps {
  isOpen: boolean;
  onClose: () => void;
  principleKey: string | null;
}

export default function BehindTheScience({ isOpen, onClose, principleKey }: BehindTheScienceProps) {
  const principle = principleKey ? LEARNING_PRINCIPLES[principleKey] : null;
  if (!principle) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          className="mt-3 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm"
        >
          <div className="flex justify-between items-start mb-2">
            <p className="font-semibold text-blue-800 dark:text-blue-300">{principle.name}</p>
            <button onClick={onClose} className="text-blue-400 hover:text-blue-600 text-xs">close</button>
          </div>
          <p className="text-blue-700 dark:text-blue-300/80 leading-relaxed mb-2">{principle.description}</p>
          <p className="text-blue-500 dark:text-blue-400 text-xs italic">{principle.paper}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
