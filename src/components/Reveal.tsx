"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { ExperimentProfile } from "@/lib/experiment-types";
import { DIMENSION_LABELS } from "@/lib/experiment-types";
import Comparison from "./rabbit-holes/Comparison";

interface RevealProps {
  profile: ExperimentProfile;
  visitedNodes: string[];
  visitOrder: string[];
  onShare: () => void;
  shareStatus: "idle" | "saving" | "copied" | "error";
  onNewJourney: () => void;
}

// Every bullet below maps to a concrete code path that read your profile.
// If a claim isn't backed by a branch, it isn't here.
const REVEAL_EXPLANATIONS: Record<string, Record<string, string>> = {
  persuasion: {
    results:
      "Each chapter opened with a line leaning on impact numbers — because results are what convince you.",
    process:
      "Each chapter opened with a line framing it as a problem I was solving, not a result I'd reached — because process is what convinces you.",
    character:
      "Each chapter opened with a personal line about what drives me, before any numbers or frameworks — because character is what convinces you.",
  },
  learning: {
    exploratory:
      "I kept every topic in its long-form version so you could wander, and in chat I nudged myself to offer more side paths — because you learn by exploring.",
    structured:
      "Instead of the long-form, I served each topic as a compact overview — because you prefer structure when learning something new.",
    social:
      "When you asked questions in chat, I leaned into conversational back-and-forth instead of neat summaries — because you learn best through dialogue.",
  },
  education: {
    practice:
      "The first four doors I opened for you were about building — the startup, Claude, side projects — because you value learning by doing.",
    individualization:
      "The first four doors I opened for you were about the psychology of learning and what school gets wrong — because you care about meeting learners where they are.",
    inspiration:
      "The first four doors I opened for you led with vision and what I'd build from scratch — because you care about the why before the what.",
  },
  motivation: {
    mastery:
      "Those same opening lines leaned on architecture and technical depth — because mastery is what drives you.",
    purpose:
      "Those same opening lines leaned on impact and why this work matters — because purpose is what drives you.",
    relatedness:
      "Those same opening lines leaned on the teams and people I've built with — because connection is what drives you.",
  },
};

const DIMENSION_TITLES: Record<string, string> = {
  persuasion: "What convinces you",
  learning: "How you learn",
  motivation: "What drives you",
  education: "Your education wish",
  sharing: "What you share",
};

export default function Reveal({ profile, visitedNodes, visitOrder, onShare, shareStatus, onNewJourney }: RevealProps) {
  const dimensions = ["persuasion", "learning", "education", "motivation", "sharing"] as const;
  const [showComparison, setShowComparison] = useState(false);

  // Scroll to top when Reveal mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

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
        <p className="text-xs tracking-[2px] text-neutral-400 mb-5 uppercase">
          Your Profile <span className="normal-case tracking-normal text-neutral-400">— from your 5 answers</span>
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {dimensions.map((dim) => (
            <div key={dim}>
              <p className="text-xs text-neutral-400 mb-1">{DIMENSION_TITLES[dim]}</p>
              <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                {DIMENSION_LABELS[dim][profile[dim]]}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Session data — real, per-visitor */}
      <motion.div
        className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75 }}
      >
        <p className="text-xs tracking-[2px] text-neutral-400 mb-5 uppercase">
          Session data <span className="normal-case tracking-normal text-neutral-400">— what actually happened</span>
        </p>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-xs text-neutral-400 mb-1">Topics explored</p>
            <p className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums">
              {visitedNodes.length}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-400 mb-1">Experiment</p>
            <p className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums">
              #{profile.experimentNumber}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-400 mb-1">Unique path</p>
            <p className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums">
              {visitOrder.length}
            </p>
          </div>
        </div>
        {visitOrder.length > 0 && (
          <div>
            <p className="text-xs text-neutral-400 mb-2">Your first steps</p>
            <p className="text-sm text-neutral-600 dark:text-neutral-300 font-mono leading-relaxed break-words">
              {visitOrder.slice(0, 3).join(" → ")}
              {visitOrder.length > 3 && " → …"}
            </p>
          </div>
        )}
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
          {(["persuasion", "learning", "education", "motivation"] as const).map((dim) => (
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
          disabled={shareStatus === "saving"}
          className={`px-7 py-3 rounded-lg transition-colors ${
            shareStatus === "copied"
              ? "bg-green-600 text-white"
              : shareStatus === "error"
                ? "bg-red-600 text-white"
                : "bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50"
          }`}
        >
          {shareStatus === "saving" && "Saving..."}
          {shareStatus === "copied" && "Link copied!"}
          {shareStatus === "error" && "Failed — try again"}
          {shareStatus === "idle" && "Share my result"}
        </button>
        <a
          href="mailto:m.marowsky@gmail.com?subject=Let's%20talk%20—%20from%20your%20Experiment"
          className="px-7 py-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 rounded-lg hover:border-orange-400 transition-colors text-center"
        >
          Invite Max to a conversation
        </a>
      </motion.div>
    </motion.div>
  );
}
