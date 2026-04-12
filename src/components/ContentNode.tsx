"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import type { ContentNode as ContentNodeType, Hook } from "@/lib/content-graph";
import HookButton from "./HookButton";
import Quiz from "./Quiz";

interface ContentNodeProps {
  node: ContentNodeType;
  visibleHooks: Hook[];
  visitedNodes: Set<string>;
  onHookClick: (targetId: string) => void;
  isNew: boolean;
}

export default function ContentNode({ node, visibleHooks, visitedNodes, onHookClick, isNew }: ContentNodeProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isNew && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [isNew]);

  return (
    <motion.div
      ref={ref}
      initial={isNew ? { opacity: 0, y: 30 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="mb-6 rounded-2xl bg-paper-dark p-6 shadow-neu sm:p-8"
    >
      {node.image && (
        <div className="relative mb-4 h-48 w-full overflow-hidden rounded-xl">
          <Image
            src={node.image.src}
            alt={node.image.alt}
            fill
            className="object-cover"
          />
        </div>
      )}

      <p className="text-ink-light leading-relaxed">{node.content}</p>

      {node.quiz && (
        <Quiz
          question={node.quiz.question}
          options={node.quiz.options}
        />
      )}

      {visibleHooks.length > 0 && (
        <div className="mt-5 flex flex-col gap-2">
          {visibleHooks.map((hook) => (
            <HookButton
              key={hook.targetId}
              label={hook.label}
              visited={visitedNodes.has(hook.targetId)}
              onClick={() => onHookClick(hook.targetId)}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
