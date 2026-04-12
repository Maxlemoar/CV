"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CONTENT_GRAPH, ROOT_HOOKS, getPrintNodes, type Hook } from "@/lib/content-graph";
import ContentNode from "./ContentNode";
import HookButton from "./HookButton";
import MetaReflection from "./MetaReflection";

function getVisibleHooks(hooks: Hook[], visited: Set<string>): Hook[] {
  return hooks.filter((h) => {
    if (h.requiredVisited && !h.requiredVisited.every((id) => visited.has(id))) return false;
    if (h.minVisited && visited.size < h.minVisited) return false;
    return true;
  });
}

export default function ExplorationView() {
  const [visitedNodes, setVisitedNodes] = useState<Set<string>>(new Set());
  const [expandedNodes, setExpandedNodes] = useState<string[]>([]);
  const [latestNode, setLatestNode] = useState<string | null>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  // Persist to sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem("exploration-state");
    if (saved) {
      try {
        const { visited, expanded } = JSON.parse(saved);
        setVisitedNodes(new Set(visited));
        setExpandedNodes(expanded);
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (expandedNodes.length > 0) {
      sessionStorage.setItem(
        "exploration-state",
        JSON.stringify({ visited: [...visitedNodes], expanded: expandedNodes })
      );
    }
  }, [visitedNodes, expandedNodes]);

  const handleHookClick = useCallback((targetId: string) => {
    if (visitedNodes.has(targetId)) {
      // Scroll to existing node
      const el = document.getElementById(`node-${targetId}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setVisitedNodes((prev) => new Set([...prev, targetId]));
    setExpandedNodes((prev) => [...prev, targetId]);
    setLatestNode(targetId);
  }, [visitedNodes]);

  const handleReset = () => {
    setVisitedNodes(new Set());
    setExpandedNodes([]);
    setLatestNode(null);
    sessionStorage.removeItem("exploration-state");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const rootHooksVisible = getVisibleHooks(ROOT_HOOKS, visitedNodes);

  return (
    <>
      {/* Interactive exploration */}
      <div className="print:hidden">
        {/* Root hooks */}
        {expandedNodes.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex flex-col gap-3">
              {rootHooksVisible.map((hook) => (
                <HookButton
                  key={hook.targetId}
                  label={hook.label}
                  visited={visitedNodes.has(hook.targetId)}
                  onClick={() => handleHookClick(hook.targetId)}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Show root hooks inline after first exploration */}
        {expandedNodes.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {rootHooksVisible.map((hook) => (
              <HookButton
                key={hook.targetId}
                label={hook.label}
                visited={visitedNodes.has(hook.targetId)}
                onClick={() => handleHookClick(hook.targetId)}
              />
            ))}
          </div>
        )}

        {/* Expanded nodes */}
        <AnimatePresence>
          {expandedNodes.map((nodeId) => {
            const node = CONTENT_GRAPH[nodeId];
            if (!node) return null;
            const visibleHooks = getVisibleHooks(node.hooks, visitedNodes);
            return (
              <div key={nodeId} id={`node-${nodeId}`}>
                <ContentNode
                  node={node}
                  visibleHooks={visibleHooks}
                  visitedNodes={visitedNodes}
                  onHookClick={handleHookClick}
                  isNew={nodeId === latestNode}
                />
              </div>
            );
          })}
        </AnimatePresence>

        {/* Meta reflection after 8+ nodes */}
        {visitedNodes.size >= 8 && <MetaReflection />}

        {/* Contact + reset */}
        {expandedNodes.length > 0 && (
          <motion.div
            ref={contactRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 rounded-2xl bg-paper-dark p-6 shadow-neu sm:p-8"
          >
            <h2 className="mb-4 font-serif text-2xl text-ink">Get in Touch</h2>
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
              <a
                href="mailto:m.marowsky@googlemail.com"
                className="text-sm text-ink-light transition-colors hover:text-accent"
              >
                m.marowsky@googlemail.com
              </a>
              <a
                href="https://www.linkedin.com/in/maximilian-marowsky-416bb3164/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-ink-light transition-colors hover:text-accent"
              >
                LinkedIn
              </a>
            </div>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => window.print()}
                className="rounded-xl bg-paper px-5 py-2.5 text-sm font-medium text-ink shadow-neu-sm transition-all hover:shadow-neu active:shadow-neu-inset"
              >
                Export as PDF
              </button>
              <button
                onClick={handleReset}
                className="rounded-xl px-5 py-2.5 text-sm text-ink-light transition-colors hover:text-accent"
              >
                Start over
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Print-only: linear CV */}
      <div className="hidden print:block">
        {getPrintNodes().map((node) => (
          <div key={node.id} className="mb-4">
            <p className="text-sm leading-relaxed">{node.content}</p>
          </div>
        ))}
        <div className="mt-6 border-t pt-4">
          <p className="text-sm">m.marowsky@googlemail.com</p>
          <p className="text-sm">linkedin.com/in/maximilian-marowsky-416bb3164</p>
        </div>
      </div>
    </>
  );
}
