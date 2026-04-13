"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface ExperimentHookProps {
  onStart: (experimentNumber: number) => void;
}

export default function ExperimentHook({ onStart }: ExperimentHookProps) {
  const [experimentNumber, setExperimentNumber] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch("/api/experiment-number", { method: "POST" })
      .then((res) => res.json())
      .then((data) => setExperimentNumber(data.number))
      .catch(() => setExperimentNumber(Date.now() % 100000));
  }, []);

  const handleStart = () => {
    if (experimentNumber === null) return;
    setIsLoading(true);
    onStart(experimentNumber);
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {experimentNumber !== null && (
        <motion.p
          className="text-xs tracking-[3px] text-neutral-400 mb-10 uppercase"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          Experiment #{experimentNumber}
        </motion.p>
      )}

      <motion.h1
        className="font-serif text-3xl md:text-4xl text-neutral-900 dark:text-neutral-100 mb-10 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        Let&apos;s get to know each other.
      </motion.h1>

      <motion.button
        onClick={handleStart}
        disabled={isLoading || experimentNumber === null}
        className="px-9 py-3.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-base transition-colors disabled:opacity-50"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.6 }}
      >
        Start Experiment
      </motion.button>

      <motion.p
        className="text-xs text-neutral-400 mt-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      >
        ~5 minutes · No data stored ·{" "}
        <Link href="/cv" className="underline hover:text-orange-600 transition-colors">
          Prefer the classic CV?
        </Link>
      </motion.p>
    </motion.div>
  );
}
