"use client";

import { motion } from "framer-motion";
import type { ContentBlockData, HookSuggestion } from "@/lib/types";
import RichElement from "./RichElements";
import { CONTENT_GRAPH } from "@/lib/content-graph";

interface ContentBlockProps {
  block: ContentBlockData;
  onHookClick: (targetIdOrQuestion: string, isNodeId: boolean) => void;
  isReadOnly?: boolean;
  unlockedGems?: Set<string>;
}

export default function ContentBlock({ block, onHookClick, isReadOnly = false, unlockedGems }: ContentBlockProps) {
  const isGemBlock = block.id.startsWith("gem-");
  const gemNode = isGemBlock ? CONTENT_GRAPH[block.id] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-2xl p-6 shadow-md sm:p-8 ${
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
        <div className="mt-5 flex flex-wrap gap-2">
          {block.hooks.map((hook) => (
            <HookChip
              key={hook.label}
              hook={hook}
              onClick={() => onHookClick(hook.targetId ?? hook.question, !!hook.targetId)}
              isGem={!!unlockedGems?.has(hook.targetId ?? "")}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

function HookChip({ hook, onClick, isGem = false }: { hook: HookSuggestion; onClick: () => void; isGem?: boolean }) {
  return (
    <motion.button
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
