"use client";

import { motion } from "framer-motion";
import { CONTENT_GRAPH } from "@/lib/content-graph";

interface ArchitectViewProps {
  visitedNodes: Set<string>;
  onClose: () => void;
}

export default function ArchitectView({ visitedNodes, onClose }: ArchitectViewProps) {
  const nodes = Object.values(CONTENT_GRAPH);

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-[#0a0a1a] text-green-400 overflow-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-green-900/30">
        <div className="font-mono text-sm">
          <span className="text-green-600">$</span> architect-view --mode=interactive
        </div>
        <button onClick={onClose} className="text-green-600 hover:text-green-400 font-mono text-sm">
          [ESC] exit
        </button>
      </div>

      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-12">
          <h2 className="font-mono text-lg text-green-300 mb-4">
            // Content Graph &mdash; {nodes.length} nodes, {nodes.reduce((a, n) => a + n.hooks.length, 0)} edges
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {nodes.map((node) => (
              <div
                key={node.id}
                className={`p-3 rounded border font-mono text-xs ${
                  visitedNodes.has(node.id)
                    ? "border-green-500 bg-green-950/30 text-green-300"
                    : "border-green-900/30 bg-green-950/10 text-green-700"
                }`}
              >
                <p className="font-bold truncate">{node.id}</p>
                <p className="text-green-600 mt-1">{node.hooks.length} hooks</p>
                {node.gem && <p className="text-amber-500 mt-1">gem</p>}
              </div>
            ))}
          </div>
        </div>

        <div className="mb-12">
          <h2 className="font-mono text-lg text-green-300 mb-4">// Architecture Decisions</h2>
          <div className="space-y-4 font-mono text-sm text-green-400/80 leading-relaxed">
            <div>
              <p className="text-green-300">/* Why a content graph instead of a CMS? */</p>
              <p>The graph structure allows non-linear exploration &mdash; every visitor creates their own path. A CMS would impose a linear narrative. The graph IS the product philosophy: learner agency over prescribed curricula.</p>
            </div>
            <div>
              <p className="text-green-300">/* Why hybrid personalization? */</p>
              <p>Static content for reliability, AI framing for adaptivity. The core facts never hallucinate. The wrapping adapts. Same pattern you&apos;d use at scale &mdash; source of truth + adaptive layer.</p>
            </div>
            <div>
              <p className="text-green-300">/* Why the interview instead of tracking? */</p>
              <p>Explicit consent + genuine interaction &gt; surveillance. The visitor knows they&apos;re being asked. They just don&apos;t know why &mdash; yet. That&apos;s the ethical version of personalization.</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="font-mono text-lg text-green-300 mb-4">// Stack</h2>
          <pre className="text-green-400/60 text-xs">
{`Next.js 14 (App Router) · TypeScript · Tailwind CSS
Anthropic Claude (AI framing + free-form chat)
Supabase (sessions + experiment counter)
Framer Motion (animations)
Vercel (hosting + OG image generation)`}</pre>
        </div>
      </div>
    </motion.div>
  );
}
