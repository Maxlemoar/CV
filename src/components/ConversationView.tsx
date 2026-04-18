"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import type { ContentBlockData, AIResponse } from "@/lib/types";
import { CONTENT_GRAPH, nodeToBlock, ROOT_HOOKS } from "@/lib/content-graph";
import { useExperiment } from "@/lib/experiment-context";
import { useSettings } from "@/lib/preferences";
import { pickStarterHooks, isNodeUnlocked } from "@/lib/hook-router";
import type { GeneratedContent } from "@/lib/visitor-profile";
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

  const { profile, signals, setProfile, recordClick, isInterviewed, resetExperiment,
    visitorProfile, narrative, contentCache, updateProfileAsync } =
    useExperiment();
  const { settings } = useSettings();
  const { discoverEgg, resetEggs } = useEggs();

  const hasStarted = blocks.length > 0 || isLoading;

  const starterHooks = useMemo(
    () => (profile ? pickStarterHooks(profile, signals, visitedNodes, 4) : ROOT_HOOKS),
    [profile, signals, visitedNodes],
  );

  const [personalizedStarters, setPersonalizedStarters] = useState<
    Array<{ targetId: string; label: string; teaser: string }> | null
  >(null);
  const [transitionText, setTransitionText] = useState<string | null>(null);
  const [isOpeningLoading, setIsOpeningLoading] = useState(false);

  // Which gems are currently reachable? Used so hook chips pointing to a
  // gem render with the amber shimmer affordance.
  const unlockedGems = useMemo(() => {
    const s = new Set<string>();
    for (const node of Object.values(CONTENT_GRAPH)) {
      if (node.gem && isNodeUnlocked(node, visitedNodes)) s.add(node.id);
    }
    return s;
  }, [visitedNodes]);

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

  // Trigger initial profile update from interview answers
  useEffect(() => {
    if (visitorProfile && narrative && narrative.interactionCount === 0 && profile) {
      updateProfileAsync(
        {
          type: "interview_complete",
          interviewAnswers: {
            persuasion: profile.persuasion,
            motivation: profile.motivation,
            contentInterest: profile.contentInterest,
          },
        },
        [],
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visitorProfile !== null]);

  // Generate personalized opening (transition text + hooks) after interview
  useEffect(() => {
    if (!visitorProfile || !narrative || personalizedStarters) return;
    setIsOpeningLoading(true);

    fetch("/api/opening", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profile,
        visitorProfile,
        narrative,
        signals,
      }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.transitionText) {
          setTransitionText(data.transitionText);
        }
        if (data?.hooks?.length > 0) {
          setPersonalizedStarters(
            data.hooks.map((h: { nodeId: string; label: string }) => ({
              targetId: h.nodeId,
              label: h.label,
              teaser: "",
            })),
          );
          // Pre-generate content for the selected hooks
          for (const hook of data.hooks) {
            if (contentCache.has(hook.nodeId)) continue;
            fetch("/api/generate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                nodeId: hook.nodeId,
                profile: visitorProfile,
                narrative,
                signals,
                visitedNodes: [],
                visitOrder: [],
              }),
            })
              .then((res) => (res.ok ? res.json() : null))
              .then((genData: GeneratedContent | null) => {
                if (genData) contentCache.set(hook.nodeId, genData);
              })
              .catch(() => {});
          }
        } else {
          // Fallback: use scored starter hooks with static labels
          setPersonalizedStarters(
            starterHooks.map((h) => ({
              targetId: h.targetId,
              label: h.label,
              teaser: "",
            })),
          );
        }
      })
      .catch(() => {
        // Full fallback
        setPersonalizedStarters(
          starterHooks.map((h) => ({
            targetId: h.targetId,
            label: h.label,
            teaser: "",
          })),
        );
      })
      .finally(() => setIsOpeningLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visitorProfile, narrative]);

  const preGenerateHooks = useCallback(
    (hooks: Array<{ nodeId: string }>, currentVisitedNodes: string[], currentVisitOrder: string[], currentNodeId: string) => {
      if (!visitorProfile || !narrative) return;
      for (const hook of hooks) {
        if (contentCache.has(hook.nodeId)) continue;
        fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nodeId: hook.nodeId,
            profile: visitorProfile,
            narrative,
            signals,
            visitedNodes: currentVisitedNodes,
            visitOrder: currentVisitOrder,
            previousNodeId: currentNodeId,
          }),
        })
          .then((res) => (res.ok ? res.json() : null))
          .then((data: GeneratedContent | null) => {
            if (data) contentCache.set(hook.nodeId, data);
          })
          .catch(() => {});
      }
    },
    [visitorProfile, narrative, signals, contentCache],
  );

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
    recordClick(nodeId);

    // Check pre-generation cache first
    const cached = contentCache.get(nodeId);

    let generatedContent: GeneratedContent | null = null;

    if (cached) {
      generatedContent = cached;
    } else if (visitorProfile && narrative) {
      setIsLoading(true);
      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nodeId,
            profile: visitorProfile,
            narrative,
            signals,
            visitedNodes: Array.from(updatedVisited),
            visitOrder: updatedVisitOrder,
            previousNodeId: blocks.length > 0 ? blocks[blocks.length - 1].id : undefined,
          }),
        });
        if (res.ok) {
          generatedContent = await res.json();
        }
      } catch {
        // Fall through to static fallback
      } finally {
        setIsLoading(false);
      }
    }

    let block: ContentBlockData;

    if (generatedContent) {
      blockCounter.current += 1;
      block = {
        id: nodeId,
        questionTitle: generatedContent.title,
        text: generatedContent.content,
        richType: null,
        richData: null,
        hooks: generatedContent.hooks.map((h) => ({
          label: h.label,
          question: h.teaser || h.label,
          targetId: h.nodeId,
        })),
      };
      if (node.image) {
        block.richType = "photo";
        block.richData = node.image;
      }
    } else {
      const depth = profile?.contentInterest === "vision" ? "overview" : "deep-dive";
      block = nodeToBlock(node, updatedVisited, depth);
    }

    // Deterministic hidden-gem surfacing (unchanged)
    const surfaceableGems = Object.values(CONTENT_GRAPH).filter(
      (n) => n.gem && !updatedVisited.has(n.id) && isNodeUnlocked(n, updatedVisited),
    );
    if (surfaceableGems.length > 0) {
      const gemHooks = surfaceableGems.map((g) => ({
        label: g.gemTitle ?? g.id,
        question: g.gemTitle ?? g.id,
        targetId: g.id,
      }));
      const existingIds = new Set(block.hooks.map((h) => h.targetId));
      const deduped = gemHooks.filter((g) => !existingIds.has(g.targetId));
      block.hooks = [...deduped, ...block.hooks].slice(0, 4);
    }

    setBlocks((prev) => [...prev, block]);
    setMessages((prev) => [
      ...prev,
      { role: "user" as const, content: block.questionTitle },
      { role: "assistant" as const, content: block.text },
    ]);

    // Async profile update (non-blocking)
    updateProfileAsync(
      { type: "hook_click", nodeId },
      Array.from(updatedVisited),
    );

    // Pre-generate next hooks (non-blocking)
    if (generatedContent?.hooks) {
      preGenerateHooks(
        generatedContent.hooks,
        Array.from(updatedVisited),
        updatedVisitOrder,
        nodeId,
      );
    }

    // Easter egg discovery (unchanged)
    if (nodeId === "gem-convergence" || nodeId === "gem-lab-to-product" || nodeId === "gem-full-picture") {
      discoverEgg(nodeId);
    }
  }, [isLoading, visitedNodes, visitOrder, profile, signals, blocks, recordClick, discoverEgg,
      visitorProfile, narrative, contentCache, updateProfileAsync, preGenerateHooks]);

  const submitFreeQuestion = useCallback(async (question: string) => {
    if (isLoading) return;

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
          signals,
          visitorProfile,
          narrative,
          visitedNodes: Array.from(visitedNodes),
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
      const newMessages = [
        ...updatedMessages,
        { role: "assistant" as const, content: data.text },
      ];
      setMessages(newMessages);

      // Invalidate pre-generation cache — profile may have shifted significantly
      contentCache.clear();

      // Async profile update with both question and answer
      updateProfileAsync(
        { type: "chat_question", question, answer: data.text },
        Array.from(visitedNodes),
      );
    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, messages, profile, signals, discoverEgg, visitorProfile, narrative,
      visitedNodes, contentCache, updateProfileAsync]);

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
          visitorProfile,
          narrative,
          generatedContents: Object.fromEntries(contentCache.entries()),
          blocks: blocks.map((b) => ({ id: b.id, questionTitle: b.questionTitle })),
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
    setPersonalizedStarters(null);
    setTransitionText(null);
    setIsOpeningLoading(false);
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
          narrative={narrative}
          visitorProfile={visitorProfile}
          messages={messages}
          blocks={blocks.map((b) => ({ id: b.id, questionTitle: b.questionTitle }))}
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
      <Opening visible={!hasStarted} onHookClick={addNodeBlock} starterHooks={starterHooks} personalizedStarters={personalizedStarters} transitionText={transitionText} isLoading={isOpeningLoading} />

      {hasStarted && (
        <div className="space-y-6 pb-24 pt-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 overflow-hidden rounded-full shadow-sm">
                <img src="/photo-coffee-square.jpg" alt="Max Marowsky" className="h-full w-full object-cover" />
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
                isReadOnly={i < blocks.length - 1 || isLoading}
                unlockedGems={unlockedGems}
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
