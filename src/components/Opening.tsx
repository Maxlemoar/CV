"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { usePreferences } from "@/lib/preferences";
import { FOCUS_STARTER_HOOKS, ROOT_HOOKS } from "@/lib/content-graph";

interface OpeningProps {
  onHookClick: (targetId: string) => void;
  visible: boolean;
}

export default function Opening({ onHookClick, visible }: OpeningProps) {
  const { preferences } = usePreferences();

  if (!visible) return null;

  const hooks = preferences?.contentFocus
    ? FOCUS_STARTER_HOOKS[preferences.contentFocus]
    : ROOT_HOOKS;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="pb-8 pt-20 text-center"
    >
      {/* Hero banner — chalkboard wide shot */}
      <div className="mx-auto mb-6 max-w-md overflow-hidden rounded-2xl shadow-neu">
        <Image
          src="/Max_tafel.png"
          alt="Max Marowsky vor einer Tafel mit <Max> in Kreide"
          width={600}
          height={400}
          className="h-auto w-full object-cover"
          priority
        />
      </div>
      <h1 className="font-serif text-4xl font-bold text-ink">
        Max Marowsky
      </h1>
      <p className="mt-2 text-ink-light">
        Product Manager · Ex-Founder · Psychologist
      </p>
      <p className="mt-6 text-lg text-ink">
        Get to know me. Just ask.
      </p>
      <div className="mx-auto mt-6 flex max-w-md flex-wrap justify-center gap-2">
        {hooks.map((hook) => (
          <motion.button
            key={hook.label}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onHookClick(hook.targetId)}
            className="rounded-xl border border-accent/20 bg-paper px-4 py-2 text-sm text-accent shadow-neu-sm transition-shadow hover:shadow-neu"
          >
            {hook.label}
          </motion.button>
        ))}
      </div>
    </motion.section>
  );
}
