"use client";

import { motion } from "framer-motion";
import type { ContentBlockData, HookSuggestion } from "@/lib/types";
import RichElement from "./RichElements";

interface ContentBlockProps {
  block: ContentBlockData;
  onHookClick: (question: string) => void;
  isReadOnly?: boolean;
}

export default function ContentBlock({ block, onHookClick, isReadOnly = false }: ContentBlockProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl bg-white p-6 shadow-neu sm:p-8"
    >
      <div className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-light">
        {block.questionTitle}
      </div>
      <p className="leading-relaxed text-ink">{block.text}</p>
      {block.richType && block.richData && (
        <RichElement richType={block.richType} richData={block.richData} />
      )}
      {!isReadOnly && block.hooks.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {block.hooks.map((hook) => (
            <HookChip key={hook.label} hook={hook} onClick={() => onHookClick(hook.question)} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

function HookChip({ hook, onClick }: { hook: HookSuggestion; onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="rounded-xl border border-accent/20 bg-paper px-4 py-2 text-sm text-accent transition-shadow hover:shadow-neu-sm"
    >
      {hook.label} →
    </motion.button>
  );
}
