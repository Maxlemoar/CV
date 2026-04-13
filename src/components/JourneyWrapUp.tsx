"use client";

import { motion } from "framer-motion";
import type { AchievementDefinition } from "@/lib/types";
import { ACHIEVEMENT_DEFINITIONS } from "@/lib/content-graph";

interface JourneyWrapUpProps {
  narrative: string | null;
  isLoading: boolean;
  gamified: boolean;
  unlockedAchievements: Set<string>;
  unlockedGems: Set<string>;
  discoveredCount: number;
  totalNodes: number;
  onNewJourney: () => void;
}

export default function JourneyWrapUp({
  narrative,
  isLoading,
  gamified,
  unlockedAchievements,
  unlockedGems,
  discoveredCount,
  totalNodes,
  onNewJourney,
}: JourneyWrapUpProps) {
  const earnedAchievements = ACHIEVEMENT_DEFINITIONS.filter((a) =>
    unlockedAchievements.has(a.id)
  );

  const gemNames: Record<string, string> = {
    "gem-convergence": "The Convergence",
    "gem-lab-to-product": "From Lab to Product",
    "gem-full-picture": "The Full Picture",
  };

  const earnedGems = Array.from(unlockedGems).map((id) => ({
    id,
    emoji: "💎",
    name: gemNames[id] ?? id,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="no-print rounded-2xl bg-white p-6 shadow-neu sm:p-8"
    >
      {/* Headline */}
      <div className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-light">
        What you've learned about Max
      </div>

      {/* AI Narrative */}
      {isLoading ? (
        <div className="space-y-3 py-2">
          <div className="h-4 w-full animate-pulse rounded bg-paper-dark/30" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-paper-dark/30" />
          <div className="h-4 w-4/6 animate-pulse rounded bg-paper-dark/30" />
        </div>
      ) : (
        <p className="leading-relaxed text-ink">{narrative}</p>
      )}

      {/* Gamification badges */}
      {gamified && (earnedAchievements.length > 0 || earnedGems.length > 0) && (
        <div className="mt-5 rounded-xl border border-[var(--color-paper-dark,#E5DDD3)] bg-paper p-4">
          <div className="flex flex-wrap gap-2">
            {earnedAchievements.map((a) => (
              <span
                key={a.id}
                className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-medium text-ink shadow-neu-sm"
              >
                <span role="img" aria-label={a.name}>{a.emoji}</span>
                {a.name}
              </span>
            ))}
            {earnedGems.map((g) => (
              <span
                key={g.id}
                className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 shadow-neu-sm"
              >
                <span role="img" aria-label={g.name}>{g.emoji}</span>
                {g.name}
              </span>
            ))}
          </div>
          <div className="mt-2 text-xs text-ink-light">
            {discoveredCount}/{totalNodes} topics discovered
          </div>
        </div>
      )}

      {/* CTAs */}
      <div className="mt-6 border-t border-[var(--color-paper-dark,#E5DDD3)] pt-6">
        <div className="mb-4 font-serif text-lg font-semibold text-ink">
          Curious?
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href="mailto:m.marowsky@googlemail.com?subject=Let's chat — re: your portfolio"
            className="flex-1 rounded-xl bg-accent px-5 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-accent-hover"
          >
            Invite Max to a conversation
          </a>
          <button
            onClick={onNewJourney}
            className="flex-1 rounded-xl border border-accent/20 bg-paper px-5 py-3 text-center text-sm font-medium text-accent transition-shadow hover:shadow-neu-sm"
          >
            Start a new journey
          </button>
        </div>
      </div>
    </motion.div>
  );
}
