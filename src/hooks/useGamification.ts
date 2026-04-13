"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { CONTENT_GRAPH, ACHIEVEMENT_DEFINITIONS, getNodeCounts } from "@/lib/content-graph";
import type { AchievementDefinition } from "@/lib/types";

export interface GamificationState {
  unlockedAchievements: Set<string>;
  unlockedGems: Set<string>;
  currentToast: AchievementDefinition | null;
  dismissToast: () => void;
  totalNodes: number;
  discoveredCount: number;
}

export function useGamification(
  visitedNodes: Set<string>,
  freeQuestionCount: number,
  gamified: boolean,
): GamificationState {
  const [unlockedAchievements, setUnlockedAchievements] = useState<Set<string>>(new Set());
  const [unlockedGems, setUnlockedGems] = useState<Set<string>>(new Set());
  const [toastQueue, setToastQueue] = useState<AchievementDefinition[]>([]);
  const [currentToast, setCurrentToast] = useState<AchievementDefinition | null>(null);
  const isShowingToast = useRef(false);

  const { total } = getNodeCounts();

  const discoveredCount = visitedNodes.size;

  // Process toast queue
  useEffect(() => {
    if (isShowingToast.current || toastQueue.length === 0) return;

    isShowingToast.current = true;
    const next = toastQueue[0];
    setCurrentToast(next);
    setToastQueue((q) => q.slice(1));

    const timer = setTimeout(() => {
      setCurrentToast(null);
      isShowingToast.current = false;
    }, 4000);

    return () => clearTimeout(timer);
  }, [toastQueue]);

  const dismissToast = useCallback(() => {
    setCurrentToast(null);
    isShowingToast.current = false;
  }, []);

  // Check achievements
  useEffect(() => {
    if (!gamified) return;

    const newAchievements: AchievementDefinition[] = [];

    for (const achievement of ACHIEVEMENT_DEFINITIONS) {
      if (unlockedAchievements.has(achievement.id)) continue;

      let earned = true;

      if (achievement.requiredNodes) {
        earned = achievement.requiredNodes.every((id) => visitedNodes.has(id));
      }

      if (earned && achievement.minVisited) {
        earned = visitedNodes.size >= achievement.minVisited;
      }

      if (earned && achievement.minFreeQuestions) {
        earned = freeQuestionCount >= achievement.minFreeQuestions;
      }

      // Completionist: all nodes visited
      if (earned && achievement.id === "completionist") {
        earned = visitedNodes.size >= total;
      }

      if (earned) {
        newAchievements.push(achievement);
      }
    }

    if (newAchievements.length > 0) {
      setUnlockedAchievements((prev) => {
        const next = new Set(prev);
        newAchievements.forEach((a) => next.add(a.id));
        return next;
      });
      setToastQueue((prev) => [...prev, ...newAchievements]);
    }
  }, [visitedNodes, freeQuestionCount, gamified, unlockedAchievements, total]);

  // Check gem unlocks
  useEffect(() => {
    if (!gamified) return;

    const gemNodes = Object.values(CONTENT_GRAPH).filter((n) => n.gem);

    for (const gemNode of gemNodes) {
      if (unlockedGems.has(gemNode.id)) continue;
      if (visitedNodes.has(gemNode.id)) continue;

      const gem = gemNode.gem!;
      let unlocked = true;

      if (gem.requiredNodes) {
        unlocked = gem.requiredNodes.every((id) => visitedNodes.has(id));
      }

      if (unlocked && gem.minVisited) {
        unlocked = visitedNodes.size >= gem.minVisited;
      }

      if (unlocked) {
        setUnlockedGems((prev) => {
          const next = new Set(prev);
          next.add(gemNode.id);
          return next;
        });

        const gemToast: AchievementDefinition = {
          id: gemNode.id,
          emoji: "💎",
          name: gemNode.id === "gem-convergence" ? "The Convergence" :
                gemNode.id === "gem-lab-to-product" ? "From Lab to Product" :
                "The Full Picture",
          description: "Hidden content unlocked",
        };
        setToastQueue((prev) => [...prev, gemToast]);
      }
    }
  }, [visitedNodes, gamified, unlockedGems]);

  return {
    unlockedAchievements,
    unlockedGems,
    currentToast,
    dismissToast,
    totalNodes: total,
    discoveredCount,
  };
}
