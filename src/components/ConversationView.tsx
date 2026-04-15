"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { ContentBlockData, AIResponse } from "@/lib/types";
import { CONTENT_GRAPH, nodeToBlock, ROOT_HOOKS } from "@/lib/content-graph";
import { useExperiment } from "@/lib/experiment-context";
import { useSettings } from "@/lib/preferences";
import { EDUCATION_STARTER_HOOKS } from "@/lib/experiment-starter-hooks";
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
import EggToast from "./EggToast";
import EggCounter from "./EggCounter";
import { useEggs } from "@/lib/egg-context";

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

  const { profile, setProfile, isInterviewed, resetExperiment } = useExperiment();
  const { settings } = useSettings();
  const { discoverEgg, resetEggs } = useEggs();

  const hasStarted = blocks.length > 0 || isLoading;

  const starterHooks = profile ? EDUCATION_STARTER_HOOKS[profile.education] : ROOT_HOOKS;

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [blocks.length, isLoading]);

  useEffect(() => {
    if (konamiActivated) {
      setShowArchitect(true);
      discoverEgg("konami");
    }
  }, [konamiActivated, discoverEgg]);

  useEffect(() => {
    if (!showArchitect) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowArchitect(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [showArchitect]);

  const addNodeBlock = useCallback(async (nodeId: string) => {
    const node = CONTENT_GRAPH[nodeId];
    if (!node) return;

    const updatedVisited = new Set(visitedNodes);
    updatedVisited.add(nodeId);
    setVisitedNodes(updatedVisited);
    setVisitOrder((prev) => prev.includes(nodeId) ? prev : [...prev, nodeId]);

    const depth = profile?.learning === "structured" ? "overview" : "deep-dive";

    // Fetch framing from API if profile exists
    let framing: FrameResponse | null = null;
    if (profile) {
      try {
        const res = await fetch("/api/frame", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "frame",
            nodeId,
            profile,
            visitedNodes: Array.from(updatedVisited),
            previousNodeId: blocks.length > 0 ? blocks[blocks.length - 1].id : undefined,
          }),
        });
        if (res.ok) framing = await res.json();
      } catch {
        // Continue without framing
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
    // Override hook labels if framing provides them
    if (framing?.hookLabels) {
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

    // Hidden gem discovery
    if (nodeId === "gem-convergence" || nodeId === "gem-lab-to-product" || nodeId === "gem-full-picture") {
      discoverEgg(nodeId);
    }
  }, [visitedNodes, profile, blocks, discoverEgg]);

  const submitFreeQuestion = useCallback(async (question: string) => {
    if (isLoading) return;

    // Coffee Easter Egg
    if (matchesCoffeeKeyword(question)) {
      setCoffeeGameActive(true);
      discoverEgg("coffee");
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
    // First free-form question → the gateway easter egg everyone can find.
    setFreeQuestionCount((prev) => {
      if (prev === 0) discoverEgg("curious-mind");
      return prev + 1;
    });

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
  }, [isLoading, messages, profile, discoverEgg]);

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
    resetEggs();
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
      <>
        <EggCounter />
        <EggToast />
        <Reveal
          profile={profile}
          visitedNodes={Array.from(visitedNodes)}
          visitOrder={visitOrder}
          onShare={handleShare}
          shareStatus={shareStatus}
          onNewJourney={handleNewJourney}
        />
      </>
    );
  }

  return (
    <>
      <EggCounter />
      <EggToast />
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
