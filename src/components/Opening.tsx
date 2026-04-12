"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const STARTER_HOOKS = [
  { label: "Why Anthropic?", question: "Why do you want to work at Anthropic?" },
  { label: "What I've built", question: "What have you built in your career?" },
  { label: "How I think about education", question: "How do you think about education and learning?" },
  { label: "Who are you, really?", question: "Who are you as a person, beyond work?" },
];

interface OpeningProps {
  onSubmit: (question: string) => void;
  visible: boolean;
}

export default function Opening({ onSubmit, visible }: OpeningProps) {
  if (!visible) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="pb-8 pt-20 text-center"
    >
      <div className="mx-auto mb-6 h-36 w-36 overflow-hidden rounded-full shadow-neu">
        <Image
          src="/photo-coffee.jpg"
          alt="Max Marowsky"
          width={144}
          height={144}
          className="h-full w-full object-cover"
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
        {STARTER_HOOKS.map((hook) => (
          <motion.button
            key={hook.label}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSubmit(hook.question)}
            className="rounded-xl border border-accent/20 bg-paper px-4 py-2 text-sm text-accent shadow-neu-sm transition-shadow hover:shadow-neu"
          >
            {hook.label}
          </motion.button>
        ))}
      </div>
    </motion.section>
  );
}
