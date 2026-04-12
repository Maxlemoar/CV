"use client";

import { useState, useCallback, useEffect } from "react";
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
  const [history, setHistory] = useState<string[]>([]); // stack of node IDs
  const [direction, setDirection] = useState<1 | -1>(1);
  const [showMeta, setShowMeta] = useState(false);
  const [showContact, setShowContact] = useState(false);

  const currentNodeId = history.length > 0 ? history[history.length - 1] : null;
  const currentNode = currentNodeId ? CONTENT_GRAPH[currentNodeId] : null;

  // Persist to sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem("exploration-state-v2");
    if (saved) {
      try {
        const { visited, hist } = JSON.parse(saved);
        setVisitedNodes(new Set(visited));
        setHistory(hist);
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (history.length > 0) {
      sessionStorage.setItem(
        "exploration-state-v2",
        JSON.stringify({ visited: [...visitedNodes], hist: history })
      );
    }
  }, [visitedNodes, history]);

  const handleHookClick = useCallback(
    (targetId: string) => {
      if (targetId === "__meta__") {
        setShowMeta(true);
        setDirection(1);
        setHistory((prev) => [...prev, "__meta__"]);
        return;
      }
      if (targetId === "__contact__") {
        setShowContact(true);
        setDirection(1);
        setHistory((prev) => [...prev, "__contact__"]);
        return;
      }
      setShowMeta(false);
      setShowContact(false);
      setDirection(1);
      setVisitedNodes((prev) => new Set([...prev, targetId]));
      setHistory((prev) => [...prev, targetId]);
    },
    []
  );

  const handleBack = useCallback(() => {
    if (history.length <= 1) {
      // Go back to root
      setHistory([]);
      setShowMeta(false);
      setShowContact(false);
      return;
    }
    setDirection(-1);
    setShowMeta(false);
    setShowContact(false);
    setHistory((prev) => prev.slice(0, -1));
  }, [history]);

  const handleReset = () => {
    setVisitedNodes(new Set());
    setHistory([]);
    setShowMeta(false);
    setShowContact(false);
    sessionStorage.removeItem("exploration-state-v2");
  };

  const visibleHooks = currentNode ? getVisibleHooks(currentNode.hooks, visitedNodes) : [];

  // Add meta + contact hooks when enough explored
  const extraHooks: Hook[] = [];
  if (visitedNodes.size >= 8 && currentNodeId !== "__meta__" && currentNodeId !== "__contact__") {
    extraHooks.push({ label: "What did I just experience?", targetId: "__meta__" });
  }
  if (history.length > 0 && currentNodeId !== "__contact__") {
    extraHooks.push({ label: "Get in touch", targetId: "__contact__" });
  }

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
  };

  return (
    <>
      {/* Interactive exploration */}
      <div className="print:hidden">
        {/* Progress indicator */}
        {visitedNodes.size > 0 && (
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs text-ink-light">
              {visitedNodes.size} explored
            </p>
            <button
              onClick={handleReset}
              className="text-xs text-ink-light/50 transition-colors hover:text-accent"
            >
              Start over
            </button>
          </div>
        )}

        {/* Root hooks — shown when no node is selected */}
        {!currentNodeId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="flex flex-col gap-3">
              {ROOT_HOOKS.map((hook) => (
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

        {/* Current card — one at a time */}
        <AnimatePresence mode="wait" custom={direction}>
          {currentNodeId && !showMeta && !showContact && currentNode && (
            <motion.div
              key={currentNodeId}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <ContentNode
                node={currentNode}
                visibleHooks={[...visibleHooks, ...extraHooks]}
                visitedNodes={visitedNodes}
                onHookClick={handleHookClick}
                isNew={false}
              />
            </motion.div>
          )}

          {showMeta && (
            <motion.div
              key="__meta__"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <MetaReflection />
              <div className="mt-4 flex flex-col gap-2">
                <HookButton
                  label="Get in touch"
                  visited={false}
                  onClick={() => handleHookClick("__contact__")}
                />
              </div>
            </motion.div>
          )}

          {showContact && (
            <motion.div
              key="__contact__"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <div className="rounded-2xl bg-paper-dark p-6 shadow-neu sm:p-8">
                <h2 className="mb-4 font-serif text-2xl text-ink">Get in Touch</h2>
                <p className="text-ink-light leading-relaxed mb-4">
                  I&apos;d love to hear from you. Whether it&apos;s about the role, my work, or just coffee.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
                  <a
                    href="mailto:m.marowsky@googlemail.com"
                    className="text-sm text-accent hover:text-accent-hover transition-colors"
                  >
                    m.marowsky@googlemail.com
                  </a>
                  <a
                    href="https://www.linkedin.com/in/maximilian-marowsky-416bb3164/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-accent hover:text-accent-hover transition-colors"
                  >
                    LinkedIn
                  </a>
                </div>
                <button
                  onClick={() => window.print()}
                  className="mt-5 no-print rounded-xl bg-paper px-5 py-2.5 text-sm font-medium text-ink shadow-neu-sm transition-all hover:shadow-neu active:shadow-neu-inset"
                >
                  Export as PDF
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Back button */}
        {history.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 flex justify-center"
          >
            <button
              onClick={handleBack}
              className="rounded-xl px-5 py-2.5 text-sm text-ink-light transition-colors hover:text-accent"
            >
              &larr; Back
            </button>
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
