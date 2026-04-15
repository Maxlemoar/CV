"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import type { ContentBlockData, HookSuggestion } from "@/lib/types";
import RichElement from "./RichElements";
import { CONTENT_GRAPH } from "@/lib/content-graph";
import BehindTheScience from "./rabbit-holes/BehindTheScience";
import { useEggs } from "@/lib/egg-context";

interface ContentBlockProps {
  block: ContentBlockData;
  onHookClick: (targetIdOrQuestion: string, isNodeId: boolean) => void;
  isReadOnly?: boolean;
  unlockedGems?: Set<string>;
  sciencePrinciple?: string; // key from LEARNING_PRINCIPLES
}

export default function ContentBlock({ block, onHookClick, isReadOnly = false, unlockedGems, sciencePrinciple }: ContentBlockProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const isGemBlock = block.id.startsWith("gem-");
  const gemNode = isGemBlock ? CONTENT_GRAPH[block.id] : null;
  const [scienceOpen, setScienceOpen] = useState(false);
  const { discoverEgg } = useEggs();

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`relative rounded-2xl p-6 shadow-md sm:p-8 transition-shadow hover:shadow-lg hover:-translate-y-0.5 ${
        isGemBlock ? "bg-amber-50/50 border border-amber-200/30" : "bg-white"
      }`}
    >
      <div className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-light">
        {gemNode?.gemTitle ?? block.questionTitle}
      </div>
      {gemNode?.gemIntro && (
        <p className="mb-3 text-sm italic text-amber-700/70">{gemNode.gemIntro}</p>
      )}
      <p className="leading-relaxed text-ink">{block.text}</p>
      {block.richType && block.richData && (
        <RichElement richType={block.richType} richData={block.richData} />
      )}
      {!isReadOnly && block.hooks.length > 0 && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.05, delayChildren: 0.2 } },
          }}
          className="mt-5 flex flex-wrap gap-2"
        >
          {block.hooks.map((hook) => (
            <HookChip
              key={hook.label}
              hook={hook}
              onClick={() => onHookClick(hook.targetId ?? hook.question, !!hook.targetId)}
              isGem={!!unlockedGems?.has(hook.targetId ?? "")}
            />
          ))}
        </motion.div>
      )}
      {sciencePrinciple && (
        <>
          <button
            onClick={() => {
              setScienceOpen(!scienceOpen);
              discoverEgg("science");
            }}
            className="absolute bottom-2 right-2 opacity-[0.15] hover:opacity-60 transition-opacity text-xs"
            title="?"
          >
            🔬
          </button>
          <BehindTheScience
            isOpen={scienceOpen}
            onClose={() => setScienceOpen(false)}
            principleKey={sciencePrinciple}
          />
        </>
      )}
    </motion.div>
  );
}

function HookChip({ hook, onClick, isGem = false }: { hook: HookSuggestion; onClick: () => void; isGem?: boolean }) {
  return (
    <motion.button
      variants={{
        hidden: { opacity: 0, y: 8 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`rounded-xl border px-4 py-2 text-sm transition-shadow hover:shadow-sm ${
        isGem
          ? "border-amber-400/40 bg-amber-50 text-amber-700 font-medium animate-shimmer"
          : "border-accent/20 bg-paper text-accent"
      }`}
    >
      {hook.label} →
    </motion.button>
  );
}
