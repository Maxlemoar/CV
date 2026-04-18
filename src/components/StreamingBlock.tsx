"use client";

import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

interface StreamingBlockProps {
  title: string;
  text: string;
}

export default function StreamingBlock({ title, text }: StreamingBlockProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="rounded-2xl bg-white p-6 shadow-md sm:p-8"
    >
      {title ? (
        <div className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-light">
          {title}
        </div>
      ) : (
        <div className="mb-3 h-3 w-24 rounded bg-paper-dark/40 animate-pulse" />
      )}
      {text ? (
        <div className="prose prose-sm max-w-none leading-relaxed text-ink prose-headings:font-heading prose-headings:text-ink prose-headings:mt-4 prose-headings:mb-2 prose-p:my-2 prose-strong:text-ink prose-em:text-ink-light">
          <ReactMarkdown>{text}</ReactMarkdown>
          <span className="inline-block w-1.5 h-4 bg-accent/60 animate-pulse ml-0.5 align-text-bottom rounded-sm" />
        </div>
      ) : (
        <div className="space-y-2.5 animate-pulse">
          <div className="h-4 w-full rounded bg-paper-dark/30" />
          <div className="h-4 w-5/6 rounded bg-paper-dark/30" />
          <div className="h-4 w-4/6 rounded bg-paper-dark/30" />
        </div>
      )}
    </motion.div>
  );
}
