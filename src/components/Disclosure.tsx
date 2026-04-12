"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DisclosureProps {
  summary: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export default function Disclosure({ summary, children, defaultOpen = false }: DisclosureProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="mt-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 text-left text-sm font-medium text-accent hover:text-accent-hover transition-colors"
        aria-expanded={open}
      >
        <motion.span
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ duration: 0.2 }}
          className="inline-block"
        >
          ▶
        </motion.span>
        {summary}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pt-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Always visible in print */}
      <div className="hidden print:block pt-3">{children}</div>
    </div>
  );
}
