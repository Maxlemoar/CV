"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import type { ContentBlockData, AIResponse } from "@/lib/types";
import { CONTENT_GRAPH, nodeToBlock, ROOT_HOOKS } from "@/lib/content-graph";
import { useExperiment } from "@/lib/experiment-context";
import { useSettings } from "@/lib/preferences";
import { pickStarterHooks } from "@/lib/hook-router";
import type { FrameResponse } from "@/lib/experiment-types";
import Opening from "./Opening";
import ContentBlock from "./ContentBlock";
import SkeletonBlock from "./SkeletonBlock";
import InputBar from "./InputBar";
import ShareButton from "./ShareButton";
import PrintCV from "./PrintCV";
import Landing from "./Landing";
import Interview from "./Interview";
import AnalyseBar from "./AnalyseBar";
import Reveal from "./Reveal";
import SettingsPanel from "./SettingsPanel";
import PourOverGame from "./PourOverGame";
import { matchesCoffeeKeyword } from "@/lib/content-graph";
import { useKonamiCode } from "@/hooks/useKonamiCode";
import ArchitectView from "./rabbit-holes/ArchitectView";

export default function ConversationView() {
  const [blocks, setBlocks] = useState<ContentBlockData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [visitedNodes, setVisitedNodes] = useState<Set<string>>(new Set());
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const blockCounter = useRef(0);
  const [freeQuestionCount, setFreeQuestionCount] = useState(0);
  const [visitOrder, setVisitOrder] = useState<string[]>([]);

  // Experiment flow state
  const [showInterview, setShowInterview] = useState(false);
  const [showReveal, setShowReveal] = useState(false);
  const [revealDismissed, setRevealDismissed] = useState(false);
  const experimentNumberRef = useRef<number | null>(null);
  const REVEAL_THRESHOLD = 8;
  const [shareStatus, setShareStatus] = useState<"idle" | "saving" | "copied" | "error">("idle");

  // Coffee easter egg (kept for fun)
  const [coffeeGameActive, setCoffeeGameActive] = useState(false);

  // Architect View (Konami code easter egg)
  const konamiActivated = useKonamiCode();
  const [showArchitect, setShowArchitect] = useState(false);

  const { profile, signals, setProfile, recordClick, isInterviewed, resetExperiment } =
    useExperiment();
  const { settings } = useSettings();

  const hasStarted = blocks.length > 0 || isLoading;

  const starterHooks = useMemo(
    () => (profile ? pickStarterHooks(profile, signals, visitedNodes, 4) : ROOT_HOOKS),
    [profile, signals, visitedNodes],
  );

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [blocks.length, isLoading]);

  useEffect(() => {
    if (konamiActivated) setShowArchitect(true);
  }, [konamiActivated]);

  useEffect(() => {
    if (!showArchitect) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowArchitect(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [showArchitect]);

  const addNodeBlock = useCallback(async (nodeId: string) => {
    if (isLoading) return;
    const node = CONTENT_GRAPH[nodeId];
    if (!node) return;

    const updatedVisited = new Set(visitedNodes);
    updatedVisited.add(nodeId);
    setVisitedNodes(updatedVisited);
    const updatedVisitOrder = visitOrder.includes(nodeId)
      ? visitOrder
      : [...visitOrder, nodeId];
    setVisitOrder(updatedVisitOrder);
    // Nudge the signal vector toward the clicked node's tags so the next
    // frame request reflects the visitor's evolving interest.
    recordClick(nodeId);

    const depth = profile?.learning === "structured" ? "overview" : "deep-dive";

    // Fetch framing + personalized next-hooks from API if profile exists.
    // Show the skeleton while we wait so the visitor sees something is loading.
    let framing: FrameResponse | null = null;
    if (profile) {
      setIsLoading(true);
      try {
        const res = await fetch("/api/frame", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "frame",
            nodeId,
            profile,
            signals,
            visitedNodes: Array.from(updatedVisited),
            visitOrder: updatedVisitOrder,
            previousNodeId: blocks.length > 0 ? blocks[blocks.length - 1].id : undefined,
          }),
        });
        if (res.ok) framing = await res.json();
      } catch {
        // Continue without framing
      } finally {
        setIsLoading(false);
      }
    }

    const block = nodeToBlock(node, updatedVisited, depth);

    // Prepend framing text
    if (framing?.transition && blocks.length > 0) {
      block.text = framing.transition + " " + block.text;
    }
    if (framing?.introduction) {
      block.text = framing.introduction + "\n\n" + block.text;
    }
    // Replace hooks with Claude's personalized picks if available, otherwise
    // keep authored hooks with optional label overrides.
    if (framing?.nextHooks && framing.nextHooks.length > 0) {
      const safeHooks = framing.nextHooks
        .filter((h) => CONTENT_GRAPH[h.targetId] && !updatedVisited.has(h.targetId))
        .slice(0, 3);
      if (safeHooks.length >= 2) {
        block.hooks = safeHooks.map((h) => ({
          label: h.label,
          question: h.label,
          targetId: h.targetId,
        }));
      }
    } else if (framing?.hookLabels) {
      block.hooks = block.hooks.map((h) => ({
        ...h,
        label: (h.targetId && framing!.hookLabels![h.targetId]) || h.label,
      }));
    }

    setBlocks((prev) => [...prev, block]);
    setMessages((prev) => [
      ...prev,
      { role: "user" as const, content: block.questionTitle },
      { role: "assistant" as const, content: block.text },
    ]);
  }, [isLoading, visitedNodes, visitOrder, profile, signals, blocks, recordClick]);

  const submitFreeQuestion = useCallback(async (question: string) => {
    if (isLoading) return;

    // Coffee Easter Egg
    if (matchesCoffeeKeyword(question)) {
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
          profile,
          signals,
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
  }, [isLoading, messages, profile, signals]);

  const handleShare = async () => {
    if (!profile) return;
    setShareStatus("saving");
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          experimentNumber: profile.experimentNumber,
          profile,
          visitedNodes: Array.from(visitedNodes),
        }),
      });
      if (!res.ok) throw new Error(`Session save failed: ${res.status}`);
      const { id } = await res.json();
      const url = `${window.location.origin}/s/${id}`;
      await navigator.clipboard.writeText(url);
      setShareStatus("copied");
      setTimeout(() => setShareStatus("idle"), 3000);
    } catch (err) {
      console.error("Share failed:", err);
      setShareStatus("error");
      setTimeout(() => setShareStatus("idle"), 3000);
    }
  };

  function handleNewJourney() {
    resetExperiment();
    setBlocks([]);
    setVisitedNodes(new Set());
    setMessages([]);
    setFreeQuestionCount(0);
    blockCounter.current = 0;
    setVisitOrder([]);
    setCoffeeGameActive(false);
    setShowReveal(false);
    setRevealDismissed(false);
    setShowInterview(false);
    experimentNumberRef.current = null;
  }

  const handleHookClick = useCallback((value: string, isNodeId: boolean) => {
    if (isNodeId) {
      addNodeBlock(value);
    } else {
      submitFreeQuestion(value);
    }
  }, [addNodeBlock, submitFreeQuestion]);

  // Landing -> Interview -> Main conversation flow
  if (!isInterviewed && !showInterview) {
    return <Landing onStartJourney={(num: number) => {
      experimentNumberRef.current = num;
      setShowInterview(true);
    }} />;
  }

  if (!isInterviewed && showInterview) {
    return (
      <Interview
        experimentNumber={experimentNumberRef.current!}
        onComplete={(p) => {
          setProfile(p);
          setShowInterview(false);
        }}
      />
    );
  }

  // Reveal screen
  if (showReveal && profile) {
    return (
      <Reveal
        profile={profile}
        visitedNodes={Array.from(visitedNodes)}
        visitOrder={visitOrder}
        onShare={handleShare}
        shareStatus={shareStatus}
        onNewJourney={handleNewJourney}
      />
    );
  }

  return (
    <>
      {showArchitect && (
        <ArchitectView
          visitedNodes={visitedNodes}
          onClose={() => setShowArchitect(false)}
        />
      )}
      <Opening visible={!hasStarted} onHookClick={addNodeBlock} starterHooks={starterHooks} />

      {hasStarted && (
        <div className="space-y-6 pb-24 pt-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 overflow-hidden rounded-full shadow-sm">
                <img src="/photo-coffee.jpg" alt="Max Marowsky" className="h-full w-full object-cover" />
              </div>
              <div>
                <div className="font-heading text-sm font-semibold text-ink">Max Marowsky</div>
                <div className="text-xs text-ink-light">Product Manager · Founder · EdTech</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ShareButton blocks={blocks} />
            </div>
          </div>
          {blocks.map((block, i) => (
            block.id.startsWith("coffee-") ? (
              <PourOverGame
                key={block.id}
                onClose={() => {
                  setCoffeeGameActive(false);
                  setBlocks((prev) => prev.filter((b) => !b.id.startsWith("coffee-")));
                }}
              />
            ) : (
              <ContentBlock
                key={block.id}
                block={block}
                onHookClick={handleHookClick}
                isReadOnly={i < blocks.length - 1}
              />
            )
          ))}
          {isLoading && <SkeletonBlock />}
          <div ref={bottomRef} />
        </div>
      )}

      {hasStarted && !isLoading && (
        <InputBar onSubmit={(q) => submitFreeQuestion(q)} disabled={isLoading} />
      )}

      <AnalyseBar
        visitedCount={visitedNodes.size}
        threshold={REVEAL_THRESHOLD}
        onRevealClick={() => setShowReveal(true)}
        revealDismissed={revealDismissed}
      />

      <SettingsPanel />
      <PrintCV />
    </>
  );
}
