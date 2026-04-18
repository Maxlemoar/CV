"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { ExperimentProfile } from "@/lib/experiment-types";
import { DIMENSION_LABELS } from "@/lib/experiment-types";
import type { ContentBlockData } from "@/lib/types";
import Comparison from "./rabbit-holes/Comparison";
import { useEggs } from "@/lib/egg-context";
import type { ProfileNarrative, VisitorProfile } from "@/lib/visitor-profile";

interface RevealProps {
  profile: ExperimentProfile;
  visitedNodes: string[];
  visitOrder: string[];
  onShare: () => void;
  shareStatus: "idle" | "saving" | "copied" | "error";
  shareUrl?: string | null;
  onNewJourney: () => void;
  narrative?: ProfileNarrative | null;
  visitorProfile?: VisitorProfile | null;
  messages?: Array<{ role: string; content: string }>;
  blocks?: Array<{ id: string; questionTitle: string }>;
}

const REVEAL_EXPLANATIONS: Record<string, Record<string, string>> = {
  persuasion: {
    results: "Because you value results, I told you my story through impact numbers and concrete outcomes.",
    process: "Because you value thinking processes, I told you my startup story as a problem-solving journey, not a success story.",
    character: "Because you connect with personality, I led with personal stories and what drives me as a person.",
  },
  motivation: {
    mastery: "I emphasized the architecture decisions and technical depth behind my projects — because mastery drives you.",
    purpose: "I emphasized how my work impacts education and why it matters — because purpose drives you.",
    relatedness: "I emphasized the teams I've built and the people I've worked with — because connection drives you.",
  },
  contentInterest: {
    technical: "I prioritized my projects, technical decisions, and measurable outcomes — because that's what you wanted to see.",
    vision: "I led with my philosophy and vision for AI in education — because you're interested in how I think.",
    journey: "I walked you through my career arc and the decisions that shaped it — because you wanted to know my story.",
  },
};

const DIMENSION_TITLES: Record<string, string> = {
  persuasion: "What convinces you",
  motivation: "What drives you",
  contentInterest: "What you wanted to see",
};

export default function Reveal({ profile, visitedNodes, visitOrder, onShare, shareStatus, shareUrl, onNewJourney, narrative, visitorProfile, messages, blocks }: RevealProps) {
  const dimensions = ["persuasion", "motivation", "contentInterest"] as const;
  const [showComparison, setShowComparison] = useState(false);
  const { foundEggs, totalEggs, discoverEgg } = useEggs();
  const [revealData, setRevealData] = useState<{
    sections: Array<{ heading: string; content: string }>;
    profileInsight: string;
  } | null>(null);
  const [revealLoading, setRevealLoading] = useState(false);

  // Scroll to top when Reveal mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (!narrative || !visitorProfile) return;
    setRevealLoading(true);

    fetch("/api/reveal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profile,
        visitorProfile,
        narrative,
        visitedNodes,
        visitOrder,
        messages: messages ?? [],
        blocks: blocks ?? [],
      }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.sections) setRevealData(data);
      })
      .catch(() => {})
      .finally(() => setRevealLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          onClick={() => {
            setShowComparison(true);
            discoverEgg("comparison");
          }}
          className="text-xs tracking-[3px] text-neutral-400 mb-3 uppercase hover:text-orange-500 transition-colors cursor-pointer"
        >
          Experiment #{profile.experimentNumber} — Result
        </button>
        <h2 className="font-serif text-2xl md:text-3xl text-neutral-900 dark:text-neutral-100">
          {revealData?.profileInsight || "Thank you. Here\u0027s what I learned about you."}
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
          Your Profile <span className="normal-case tracking-normal text-neutral-400">— from your 3 answers</span>
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
            <p className="text-xs text-neutral-400 mb-1">Eggs found</p>
            <p className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums">
              {foundEggs.size}<span className="text-neutral-400">/{totalEggs}</span>
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

      {/* Personalized analysis sections */}
      {revealLoading && (
        <motion.div
          className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3" />
            <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-full" />
            <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-5/6" />
            <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-4/6" />
          </div>
        </motion.div>
      )}
      {revealData?.sections.map((section, i) => (
        <motion.div
          key={section.heading}
          className={`${
            i === revealData.sections.length - 1
              ? "bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-200 dark:border-orange-800"
              : "bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700"
          } p-6 mb-6`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 + i * 0.3 }}
        >
          <p className="text-xs tracking-[2px] text-neutral-400 mb-4 uppercase">
            {section.heading}
          </p>
          <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed whitespace-pre-line">
            {section.content}
          </p>
        </motion.div>
      ))}
      {revealData && (
        <p className="text-xs text-neutral-400 text-center mb-6 -mt-3 italic">
          This analysis is based on 3 interview answers and your browsing behavior — a small sample. Take it as a hypothesis, not a diagnosis.
        </p>
      )}
      {!revealData && !revealLoading && (
        <>
          {/* Static fallback: original REVEAL_EXPLANATIONS */}
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
              {(["persuasion", "motivation", "contentInterest"] as const).map((dim) => (
                <div key={dim} className="flex gap-3">
                  <span className="text-orange-500 flex-shrink-0 mt-0.5">&rarr;</span>
                  <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                    {REVEAL_EXPLANATIONS[dim][profile[dim]]}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div
            className="bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-200 dark:border-orange-800 p-6 mb-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
          >
            <p className="text-base text-neutral-600 dark:text-neutral-300 leading-relaxed">
              Every person who visits this site experiences a slightly different version of me.
              <br />
              Yours was unique — though based on limited data.
            </p>
            <p className="text-base text-neutral-900 dark:text-neutral-100 mt-4 italic">
              This is what I want to build at Anthropic — learning experiences that try to adapt to the
              person, not the other way around.
            </p>
          </motion.div>
        </>
      )}

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
          {shareStatus === "copied" && (shareUrl ? "Saved! Copy the link below" : "Link copied!")}
          {shareStatus === "error" && "Failed — try again"}
          {shareStatus === "idle" && "Share my result"}
        </button>
        {shareUrl && shareStatus === "copied" && (
          <input
            type="text"
            readOnly
            value={shareUrl}
            onFocus={(e) => e.target.select()}
            className="w-full px-4 py-2 text-sm bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-600 dark:text-neutral-300 text-center"
          />
        )}
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
