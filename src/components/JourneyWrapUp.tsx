"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { AchievementDefinition } from "@/lib/types";
import { NODE_CLUSTERS } from "@/lib/content-graph";
import { ACHIEVEMENT_DEFINITIONS } from "@/lib/achievement-definitions";
import type { ContentBlockData } from "@/lib/types";

interface JourneyWrapUpProps {
  narrative: string | null;
  isLoading: boolean;
  gamified: boolean;
  unlockedAchievements: Set<string>;
  unlockedGems: Set<string>;
  discoveredCount: number;
  totalNodes: number;
  onNewJourney: () => void;
  visitOrder: string[];
  foundCoffeeEasterEgg: boolean;
  blocks: ContentBlockData[];
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
  visitOrder,
  foundCoffeeEasterEgg,
  blocks,
}: JourneyWrapUpProps) {
  const [shareStatus, setShareStatus] = useState<"idle" | "saving" | "copied">("idle");

  // Derive cluster path from visit order
  const clusterPath: Array<{ emoji: string; name: string }> = [];
  const seenClusters = new Set<string>();
  for (const nodeId of visitOrder) {
    const cluster = NODE_CLUSTERS[nodeId];
    if (!cluster || seenClusters.has(cluster.name)) continue;
    seenClusters.add(cluster.name);
    clusterPath.push(cluster);
  }

  async function handleShare() {
    if (shareStatus === "saving") return;
    setShareStatus("saving");
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocks }),
      });
      if (!res.ok) throw new Error("Failed to save");
      const { id } = await res.json();
      const url = `${window.location.origin}/s/${id}`;
      await navigator.clipboard.writeText(url);
      setShareStatus("copied");
      setTimeout(() => setShareStatus("idle"), 2000);
    } catch {
      setShareStatus("idle");
    }
  }

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
      className="no-print rounded-2xl bg-white p-6 shadow-md sm:p-8"
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
                className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-medium text-ink shadow-sm"
              >
                <span role="img" aria-label={a.name}>{a.emoji}</span>
                {a.name}
              </span>
            ))}
            {earnedGems.map((g) => (
              <span
                key={g.id}
                className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 shadow-sm"
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

      {/* Discovery Path */}
      {visitOrder.length > 0 && (
        <div className="mt-5 rounded-xl border border-[var(--color-paper-dark,#E5DDD3)] bg-paper p-4">
          <div className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-light">
            Your Discovery Path
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-sm">
            {clusterPath.map((cluster, i) => (
              <span key={cluster.name} className="inline-flex items-center">
                {i > 0 && <span className="mx-1 text-ink-light/40">→</span>}
                <span className="text-ink">
                  {cluster.emoji} {cluster.name}
                </span>
              </span>
            ))}
            {foundCoffeeEasterEgg && (
              <span className="inline-flex items-center">
                <span className="mx-1 text-ink-light/40">·</span>
                <span className="text-ink">☕</span>
              </span>
            )}
          </div>
          <div className="mt-2 text-xs text-ink-light">
            {discoveredCount}/{totalNodes} topics
            {unlockedGems.size > 0 && ` · ${unlockedGems.size} gem${unlockedGems.size > 1 ? "s" : ""}`}
            {foundCoffeeEasterEgg && " · ☕ found"}
          </div>
          <button
            onClick={handleShare}
            disabled={shareStatus === "saving"}
            className="mt-3 w-full rounded-lg border border-accent/20 bg-white px-3 py-2 text-xs font-medium text-accent transition-shadow hover:shadow-sm disabled:opacity-50"
          >
            {shareStatus === "copied" ? "Link copied!" : shareStatus === "saving" ? "Saving..." : "Share your discovery path"}
          </button>
        </div>
      )}

      {/* CTAs */}
      <div className="mt-6 border-t border-[var(--color-paper-dark,#E5DDD3)] pt-6">
        <div className="mb-4 font-heading text-lg font-semibold text-ink">
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
            className="flex-1 rounded-xl border border-accent/20 bg-paper px-5 py-3 text-center text-sm font-medium text-accent transition-shadow hover:shadow-sm"
          >
            Start a new journey
          </button>
        </div>
      </div>
    </motion.div>
  );
}
