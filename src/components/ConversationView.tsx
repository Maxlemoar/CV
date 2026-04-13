"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { ContentBlockData, AIResponse } from "@/lib/types";
import { CONTENT_GRAPH, nodeToBlock } from "@/lib/content-graph";
import Opening from "./Opening";
import ContentBlock from "./ContentBlock";
import SkeletonBlock from "./SkeletonBlock";
import InputBar from "./InputBar";
import ShareButton from "./ShareButton";
import PrintCV from "./PrintCV";

export default function ConversationView() {
  const [blocks, setBlocks] = useState<ContentBlockData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [visitedNodes, setVisitedNodes] = useState<Set<string>>(new Set());
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const blockCounter = useRef(0);

  const hasStarted = blocks.length > 0 || isLoading;

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [blocks.length, isLoading]);

  const addNodeBlock = useCallback((nodeId: string) => {
    const node = CONTENT_GRAPH[nodeId];
    if (!node) return;

    setVisitedNodes((prev) => {
      const next = new Set(prev);
      next.add(nodeId);
      return next;
    });

    const block = nodeToBlock(node, visitedNodes);
    setBlocks((prev) => [...prev, block]);
    setMessages((prev) => [
      ...prev,
      { role: "user" as const, content: block.questionTitle },
      { role: "assistant" as const, content: block.text },
    ]);
  }, [visitedNodes]);

  const submitFreeQuestion = useCallback(async (question: string) => {
    if (isLoading) return;
    setIsLoading(true);

    const updatedMessages = [
      ...messages,
      { role: "user" as const, content: question },
    ];

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
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
  }, [isLoading, messages]);

  const handleHookClick = useCallback((value: string, isNodeId: boolean) => {
    if (isNodeId) {
      addNodeBlock(value);
    } else {
      submitFreeQuestion(value);
    }
  }, [addNodeBlock, submitFreeQuestion]);

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
          {blocks.map((block) => (
            <ContentBlock
              key={block.id}
              block={block}
              onHookClick={handleHookClick}
            />
          ))}
          {isLoading && <SkeletonBlock />}
          <div ref={bottomRef} />
        </div>
      )}

      {hasStarted && (
        <InputBar onSubmit={(q) => submitFreeQuestion(q)} disabled={isLoading} />
      )}
      <PrintCV />
    </>
  );
}
