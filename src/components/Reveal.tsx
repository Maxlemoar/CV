"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { ExperimentProfile } from "@/lib/experiment-types";
import { DIMENSION_LABELS } from "@/lib/experiment-types";
import Comparison from "./rabbit-holes/Comparison";

interface RevealProps {
  profile: ExperimentProfile;
  visitedNodes: string[];
  onShare: () => void;
  onNewJourney: () => void;
}

const REVEAL_EXPLANATIONS: Record<string, Record<string, string>> = {
  persuasion: {
    results:
      "Because you value results, I told you my story through impact numbers and concrete outcomes.",
    process:
      "Because you value thinking processes, I told you my startup story as a problem-solving journey, not a success story.",
    character:
      "Because you connect with personality, I led with personal stories and what drives me as a person.",
  },
  learning: {
    exploratory:
      "You got more freedom to explore — more paths to choose from at every step — because you learn by doing.",
    structured:
      "I gave you a clearer, more guided path through my story — because you prefer structure when learning something new.",
    social:
      "I kept things conversational and invited you to ask questions — because you learn best through dialogue.",
  },
  motivation: {
    mastery:
      "I emphasized the architecture decisions and technical depth behind my projects — because mastery drives you.",
    purpose:
      "I emphasized how my work impacts education and why it matters — because purpose drives you.",
    relatedness:
      "I emphasized the teams I've built and the people I've worked with — because connection drives you.",
  },
  sharing: {
    surprise:
      "You're seeing this reveal right now — because you share things that break expectations. Hint hint.",
    utility:
      "I designed this reveal to be genuinely useful — because you share things others can learn from.",
    emotion:
      "I designed this reveal to resonate — because you share things that move you.",
  },
};

const DIMENSION_COLORS: Record<string, string> = {
  persuasion: "bg-blue-500",
  learning: "bg-green-500",
  motivation: "bg-purple-500",
  education: "bg-amber-500",
  sharing: "bg-orange-500",
};

const DIMENSION_TITLES: Record<string, string> = {
  persuasion: "What convinces you",
  learning: "How you learn",
  motivation: "What drives you",
  education: "Your education wish",
  sharing: "What you share",
};

export default function Reveal({ profile, visitedNodes, onShare, onNewJourney }: RevealProps) {
  const dimensions = ["persuasion", "learning", "education", "motivation", "sharing"] as const;
  const [showComparison, setShowComparison] = useState(false);
  const progressValues: Record<string, number> = {
    persuasion: 0.75,
    learning: 0.85,
    education: 0.7,
    motivation: 0.65,
    sharing: 0.8,
  };

  return (
    <motion.div
      className="max-w-2xl mx-auto px-4 py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {showComparison && (
        <Comparison profile={profile} onClose={() => setShowComparison(false)} />
      )}
      {/* Header */}
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <button
          onClick={() => setShowComparison(true)}
          className="text-xs tracking-[3px] text-neutral-400 mb-3 uppercase hover:text-orange-500 transition-colors cursor-pointer"
        >
          Experiment #{profile.experimentNumber} — Result
        </button>
        <h2 className="font-serif text-2xl md:text-3xl text-neutral-900 dark:text-neutral-100">
          Thank you. Here&apos;s what I learned about you.
        </h2>
      </motion.div>

      {/* Part 1: Profile */}
      <motion.div
        className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-xs tracking-[2px] text-neutral-400 mb-5 uppercase">Your Profile</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {dimensions.map((dim) => (
            <div key={dim}>
              <p className="text-xs text-neutral-400 mb-1">{DIMENSION_TITLES[dim]}</p>
              <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                {DIMENSION_LABELS[dim][profile[dim]]}
              </p>
              <div className="h-1.5 bg-neutral-100 dark:bg-neutral-700 rounded-full mt-2">
                <motion.div
                  className={`h-1.5 rounded-full ${DIMENSION_COLORS[dim]}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressValues[dim] * 100}%` }}
                  transition={{ delay: 0.8 + dimensions.indexOf(dim) * 0.1, duration: 0.6 }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Part 2: What I did with it */}
      <motion.div
        className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
      >
        <p className="text-xs tracking-[2px] text-neutral-400 mb-5 uppercase">
          What I did with it
        </p>
        <div className="space-y-4">
          {(["persuasion", "learning", "motivation", "sharing"] as const).map((dim) => (
            <div key={dim} className="flex gap-3">
              <span className="text-orange-500 flex-shrink-0 mt-0.5">&rarr;</span>
              <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                {REVEAL_EXPLANATIONS[dim][profile[dim]]}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Part 3: Punchline */}
      <motion.div
        className="bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-200 dark:border-orange-800 p-6 mb-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4 }}
      >
        <p className="text-base text-neutral-600 dark:text-neutral-300 leading-relaxed">
          Every person who visits this site experiences a different version of me.
          <br />
          Yours was unique.
        </p>
        <p className="text-base text-neutral-900 dark:text-neutral-100 mt-4 italic">
          This is what I want to build at Anthropic — learning experiences that adapt to the
          person, not the other way around.
        </p>
      </motion.div>

      {/* CTAs */}
      <motion.div
        className="flex flex-col sm:flex-row gap-3 justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
      >
        <button
          onClick={onShare}
          className="px-7 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
        >
          Share my result
        </button>
        <a
          href="mailto:max@marowsky.com?subject=Let's%20talk%20—%20from%20your%20Experiment"
          className="px-7 py-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 rounded-lg hover:border-orange-400 transition-colors text-center"
        >
          Invite Max to a conversation
        </a>
      </motion.div>
    </motion.div>
  );
}
