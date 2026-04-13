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
import Landing from "./Landing";
import SettingsPanel from "./SettingsPanel";
import { useGamification } from "@/hooks/useGamification";
import ProgressRing from "./gamification/ProgressRing";
import AchievementToast from "./gamification/AchievementToast";
import JourneyWrapUp from "./JourneyWrapUp";
import PourOverGame from "./PourOverGame";
import { matchesCoffeeKeyword } from "@/lib/content-graph";

export default function ConversationView() {
  const [blocks, setBlocks] = useState<ContentBlockData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [visitedNodes, setVisitedNodes] = useState<Set<string>>(new Set());
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const blockCounter = useRef(0);
  const [freeQuestionCount, setFreeQuestionCount] = useState(0);
  const [isWrappedUp, setIsWrappedUp] = useState(false);
  const [wrapUpNarrative, setWrapUpNarrative] = useState<string | null>(null);
  const [isWrapUpLoading, setIsWrapUpLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [visitOrder, setVisitOrder] = useState<string[]>([]);
  const [foundCoffeeEasterEgg, setFoundCoffeeEasterEgg] = useState(false);
  const [coffeeGameActive, setCoffeeGameActive] = useState(false);

  const { preferences, setPreferences, resetPreferences, isOnboarded } = usePreferences();

  function isDeadEnd(block: ContentBlockData): boolean {
    if (block.hooks.length === 0) return true;
    return block.hooks.every((h) => h.targetId && visitedNodes.has(h.targetId));
  }

  const hasStarted = blocks.length > 0 || isLoading;

  const gamification = useGamification(
    visitedNodes,
    freeQuestionCount,
    preferences?.gamified ?? false,
    foundCoffeeEasterEgg,
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

        const gemLabel = gemId === "gem-convergence" ? "The Convergence"
          : gemId === "gem-lab-to-product" ? "From Lab to Product"
          : "The Full Picture";

        gemHooks.push({ label: gemLabel, question: gemLabel, targetId: gemId });
      }

      if (gemHooks.length === 0) return prev;

      const updatedLast = { ...lastBlock, hooks: [...lastBlock.hooks, ...gemHooks] };
      return [...prev.slice(0, -1), updatedLast];
    });
  }, [gamification.unlockedGems, preferences?.gamified, visitedNodes]);

  // Inject wrap-up hook when last block is a dead end
  useEffect(() => {
    if (isWrappedUp || blocks.length === 0) return;

    const lastBlock = blocks[blocks.length - 1];
    if (!isDeadEnd(lastBlock)) return;
    if (lastBlock.hooks.some((h) => h.question === "__wrapup__")) return;

    setBlocks((prev) => {
      const last = prev[prev.length - 1];
      const wrapUpHook = { label: "See what you've discovered →", question: "__wrapup__", targetId: undefined };
      return [...prev.slice(0, -1), { ...last, hooks: [...last.hooks, wrapUpHook] }];
    });
  }, [blocks, visitedNodes, isWrappedUp]);

  const addNodeBlock = useCallback((nodeId: string) => {
    const node = CONTENT_GRAPH[nodeId];
    if (!node) return;

    const updatedVisited = new Set(visitedNodes);
    updatedVisited.add(nodeId);
    setVisitedNodes(updatedVisited);
    setVisitOrder((prev) => prev.includes(nodeId) ? prev : [...prev, nodeId]);

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

    // Coffee Easter Egg
    if (matchesCoffeeKeyword(question)) {
      setFoundCoffeeEasterEgg(true);
      setCoffeeGameActive(true);
      blockCounter.current += 1;
      const coffeeBlock: ContentBlockData = {
        id: `coffee-${blockCounter.current}`,
        questionTitle: "Max's Pour-Over Lab",
        text: "",
        richType: null,
        richData: null,
        hooks: [],
      };
      setBlocks((prev) => [...prev, coffeeBlock]);
      return;
    }

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

  const triggerWrapUp = useCallback(async () => {
    if (isWrapUpLoading || isWrappedUp) return;
    setIsWrappedUp(true);
    setIsWrapUpLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages,
          preferences: preferences ?? undefined,
          wrapUp: true,
        }),
      });

      if (!res.ok) throw new Error("Failed to get wrap-up");

      const data = await res.json();
      setWrapUpNarrative(data.text);
    } catch (err) {
      console.error("Wrap-up error:", err);
      setWrapUpNarrative("You explored several facets of Max's background. Thank you for your curiosity.");
    } finally {
      setIsWrapUpLoading(false);
    }
  }, [isWrapUpLoading, isWrappedUp, messages, preferences]);

  function handleNewJourney() {
    setBlocks([]);
    setVisitedNodes(new Set());
    setMessages([]);
    setFreeQuestionCount(0);
    setIsWrappedUp(false);
    setWrapUpNarrative(null);
    setIsWrapUpLoading(false);
    blockCounter.current = 0;
    setShowOnboarding(false);
    setVisitOrder([]);
    setFoundCoffeeEasterEgg(false);
    setCoffeeGameActive(false);
    resetPreferences();
  }

  const handleHookClick = useCallback((value: string, isNodeId: boolean) => {
    if (value === "__wrapup__") {
      triggerWrapUp();
      return;
    }
    if (isNodeId) {
      addNodeBlock(value);
    } else {
      submitFreeQuestion(value);
    }
  }, [addNodeBlock, submitFreeQuestion, triggerWrapUp]);

  function handleOnboardingComplete(prefs: UserPreferences) {
    setPreferences(prefs);
  }

  function handleSkip() {
    setPreferences({
      visualStyle: "focused",
      darkMode: false,
      infoDepth: "deep-dive",
      contentFocus: "product-builder",
      gamified: false,
    });
  }

  if (!isOnboarded && !showOnboarding) {
    return <Landing onStartJourney={() => setShowOnboarding(true)} />;
  }

  if (!isOnboarded && showOnboarding) {
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
                <div className="text-xs text-ink-light">Product Manager · Founder · EdTech</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {blocks.length >= 3 && !isWrappedUp && !isLoading && (
                <button
                  onClick={triggerWrapUp}
                  className="text-xs text-ink-light/60 transition-colors hover:text-accent"
                >
                  Wrap up
                </button>
              )}
              <ShareButton blocks={blocks} />
            </div>
          </div>
          {blocks.map((block, i) => (
            block.id.startsWith("coffee-") ? (
              <PourOverGame
                key={block.id}
                onClose={() => setCoffeeGameActive(false)}
              />
            ) : (
              <ContentBlock
                key={block.id}
                block={block}
                onHookClick={handleHookClick}
                isReadOnly={i < blocks.length - 1}
                unlockedGems={preferences?.gamified ? gamification.unlockedGems : undefined}
              />
            )
          ))}
          {isLoading && <SkeletonBlock />}
          {isWrappedUp && (
            <JourneyWrapUp
              narrative={wrapUpNarrative}
              isLoading={isWrapUpLoading}
              gamified={preferences?.gamified ?? false}
              unlockedAchievements={gamification.unlockedAchievements}
              unlockedGems={gamification.unlockedGems}
              discoveredCount={gamification.discoveredCount}
              totalNodes={gamification.totalNodes}
              onNewJourney={handleNewJourney}
              visitOrder={visitOrder}
              foundCoffeeEasterEgg={foundCoffeeEasterEgg}
              blocks={blocks}
            />
          )}
          <div ref={bottomRef} />
        </div>
      )}

      {hasStarted && !isWrappedUp && (
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
