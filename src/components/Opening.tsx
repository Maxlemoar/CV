"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { Hook } from "@/lib/content-graph";
import { ROOT_HOOKS } from "@/lib/content-graph";

interface OpeningProps {
  onHookClick: (targetId: string) => void;
  visible: boolean;
  starterHooks?: Hook[];
  personalizedStarters?: Array<{ targetId: string; label: string; teaser: string }> | null;
  transitionText?: string | null;
  isLoading?: boolean;
}

export default function Opening({ onHookClick, visible, starterHooks, personalizedStarters, transitionText, isLoading }: OpeningProps) {
  if (!visible) return null;

  const hooks = personalizedStarters
    ? personalizedStarters.map((ps) => ({ targetId: ps.targetId, label: ps.label }))
    : (starterHooks ?? ROOT_HOOKS);

  const showSkeleton = isLoading && !transitionText;

  return (
    <section className="pb-8 pt-20 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="mx-auto mb-6 max-w-md overflow-hidden rounded-2xl shadow-md"
      >
        <Image
          src="/Max_tafel.jpg"
          alt="Max Marowsky in front of a chalkboard with <Max> in chalk"
          width={600}
          height={400}
          className="h-auto w-full object-cover"
          priority
        />
      </motion.div>

      <motion.h1
        initial={{ clipPath: "inset(0 100% 0 0)" }}
        animate={{ clipPath: "inset(0 0% 0 0)" }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
        className="font-heading text-4xl font-bold text-ink"
      >
        Max Marowsky
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.6 }}
        className="mt-2 text-ink-light"
      >
        Product Manager · Founder · EdTech
      </motion.p>

      {showSkeleton ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mx-auto mt-6 max-w-md space-y-2"
        >
          <div className="animate-pulse space-y-2">
            <div className="mx-auto h-4 w-5/6 rounded bg-ink/10" />
            <div className="mx-auto h-4 w-4/6 rounded bg-ink/10" />
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-9 w-28 animate-pulse rounded-xl bg-ink/10" />
            ))}
          </div>
        </motion.div>
      ) : (
        <>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.7 }}
            className="mt-6 max-w-md mx-auto text-lg text-ink leading-relaxed"
          >
            {transitionText || "Get to know me. Just ask."}
          </motion.p>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.06, delayChildren: 0.85 } },
            }}
            className="mx-auto mt-6 flex max-w-md flex-wrap justify-center gap-2"
          >
            {hooks.map((hook) => (
              <motion.button
                key={hook.label}
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onHookClick(hook.targetId)}
                className="rounded-xl border border-accent/20 bg-paper px-4 py-2 text-sm text-accent shadow-sm transition-shadow hover:shadow-md"
              >
                {hook.label}
              </motion.button>
            ))}
          </motion.div>
        </>
      )}
    </section>
  );
}
