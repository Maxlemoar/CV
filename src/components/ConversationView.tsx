"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { ContentBlockData, AIResponse } from "@/lib/types";
import type { UserPreferences } from "@/lib/types";
import { CONTENT_GRAPH, nodeToBlock } from "@/lib/content-graph";
import { usePreferences } from "@/lib/preferences";
import Opening from "./Opening";
import ContentBlock from "./ContentBlock";
import SkeletonBlock from "./SkeletonBlock";
import InputBar from "./InputBar";
import ShareButton from "./ShareButton";
import PrintCV from "./PrintCV";
import OnboardingChat from "./OnboardingChat";
import SettingsPanel from "./SettingsPanel";
import { useGamification } from "@/hooks/useGamification";
import ProgressRing from "./gamification/ProgressRing";
import AchievementToast from "./gamification/AchievementToast";

export default function ConversationView() {
  const [blocks, setBlocks] = useState<ContentBlockData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [visitedNodes, setVisitedNodes] = useState<Set<string>>(new Set());
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const blockCounter = useRef(0);
  const [freeQuestionCount, setFreeQuestionCount] = useState(0);

  const { preferences, setPreferences, isOnboarded } = usePreferences();

  const hasStarted = blocks.length > 0 || isLoading;

  const gamification = useGamification(
    visitedNodes,
    freeQuestionCount,
    preferences?.gamified ?? false,
  );

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [blocks.length, isLoading]);

  // Inject gem hooks into the last block when a gem unlocks
  useEffect(() => {
    if (!preferences?.gamified || gamification.unlockedGems.size === 0) return;

    setBlocks((prev) => {
      if (prev.length === 0) return prev;
      const lastBlock = prev[prev.length - 1];

      const gemHooks: Array<{ label: string; question: string; targetId: string }> = [];
      for (const gemId of gamification.unlockedGems) {
        if (visitedNodes.has(gemId)) continue;
        if (lastBlock.hooks.some((h) => h.targetId === gemId)) continue;

        const gemNode = CONTENT_GRAPH[gemId];
        if (!gemNode) continue;

        const gemLabel = gemId === "gem-convergence" ? "💎 Die Konvergenz entdecken"
          : gemId === "gem-lab-to-product" ? "💎 Vom Labor ins Produkt"
          : "💎 Das ganze Bild";

        gemHooks.push({ label: gemLabel, question: gemLabel, targetId: gemId });
      }

      if (gemHooks.length === 0) return prev;

      const updatedLast = { ...lastBlock, hooks: [...lastBlock.hooks, ...gemHooks] };
      return [...prev.slice(0, -1), updatedLast];
    });
  }, [gamification.unlockedGems, preferences?.gamified, visitedNodes]);

  const addNodeBlock = useCallback((nodeId: string) => {
    const node = CONTENT_GRAPH[nodeId];
    if (!node) return;

    const updatedVisited = new Set(visitedNodes);
    updatedVisited.add(nodeId);
    setVisitedNodes(updatedVisited);

    const depth = preferences?.infoDepth ?? "deep-dive";
    const block = nodeToBlock(node, updatedVisited, depth);
    setBlocks((prev) => [...prev, block]);
    setMessages((prev) => [
      ...prev,
      { role: "user" as const, content: block.questionTitle },
      { role: "assistant" as const, content: block.text },
    ]);
  }, [visitedNodes, preferences]);

  const submitFreeQuestion = useCallback(async (question: string) => {
    if (isLoading) return;
    setIsLoading(true);
    setFreeQuestionCount((prev) => prev + 1);

    const updatedMessages = [
      ...messages,
      { role: "user" as const, content: question },
    ];

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          preferences: preferences ?? undefined,
        }),
      });

      if (!res.ok) throw new Error("Failed to get response");

      const data: AIResponse = await res.json();
      blockCounter.current += 1;

      const newBlock: ContentBlockData = {
        id: `ai-${blockCounter.current}`,
        questionTitle: data.questionTitle,
        text: data.text,
        richType: data.richType,
        richData: data.richData,
        hooks: data.hooks,
      };

      setBlocks((prev) => [...prev, newBlock]);
      setMessages([
        ...updatedMessages,
        { role: "assistant" as const, content: data.text },
      ]);
    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, messages, preferences]);

  const handleHookClick = useCallback((value: string, isNodeId: boolean) => {
    if (isNodeId) {
      addNodeBlock(value);
    } else {
      submitFreeQuestion(value);
    }
  }, [addNodeBlock, submitFreeQuestion]);

  function handleOnboardingComplete(prefs: UserPreferences) {
    setPreferences(prefs);
  }

  function handleSkip() {
    setPreferences({
      visualStyle: "focused",
      infoDepth: "deep-dive",
      contentFocus: "product-builder",
      gamified: false,
    });
  }

  if (!isOnboarded) {
    return <OnboardingChat onComplete={handleOnboardingComplete} onSkip={handleSkip} />;
  }

  return (
    <>
      <Opening visible={!hasStarted} onHookClick={addNodeBlock} />

      {hasStarted && (
        <div className="space-y-6 pb-24 pt-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 overflow-hidden rounded-full shadow-neu-sm">
                <img src="/photo-coffee.jpg" alt="Max Marowsky" className="h-full w-full object-cover" />
              </div>
              <div>
                <div className="font-serif text-sm font-semibold text-ink">Max Marowsky</div>
                <div className="text-xs text-ink-light">Product Manager · Ex-Founder · Psychologist</div>
              </div>
            </div>
            <ShareButton blocks={blocks} />
          </div>
          {blocks.map((block, i) => (
            <ContentBlock
              key={block.id}
              block={block}
              onHookClick={handleHookClick}
              isReadOnly={i < blocks.length - 1}
              unlockedGems={preferences?.gamified ? gamification.unlockedGems : undefined}
            />
          ))}
          {isLoading && <SkeletonBlock />}
          <div ref={bottomRef} />
        </div>
      )}

      {hasStarted && (
        <InputBar onSubmit={(q) => submitFreeQuestion(q)} disabled={isLoading} />
      )}
      <SettingsPanel />
      <PrintCV />
      {preferences?.gamified && (
        <>
          <ProgressRing
            discovered={gamification.discoveredCount}
            total={gamification.totalNodes}
          />
          <AchievementToast
            achievement={gamification.currentToast}
            onDismiss={gamification.dismissToast}
          />
        </>
      )}
    </>
  );
}
