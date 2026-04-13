"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

interface LandingProps {
  onStartJourney: () => void;
}

export default function Landing({ onStartJourney }: LandingProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="pb-8 pt-20 text-center"
    >
      <div className="mx-auto mb-6 max-w-md overflow-hidden rounded-2xl shadow-neu">
        <Image
          src="/Max_tafel.jpg"
          alt="Max Marowsky in front of a chalkboard with <Max> in chalk"
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
        Product Manager · Founder · EdTech
      </p>
      <p className="mt-6 text-lg text-ink">
        Get to know me. Just ask.
      </p>
      <div className="mx-auto mt-8 flex max-w-sm flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onStartJourney}
          className="w-full rounded-xl bg-accent px-6 py-3 text-base font-semibold text-white shadow-neu-sm transition-shadow hover:shadow-neu sm:w-auto"
        >
          Let&apos;s go
        </motion.button>
        <Link href="/cv">
          <motion.span
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-block w-full rounded-xl border border-accent/30 bg-paper px-6 py-3 text-base font-semibold text-accent shadow-neu-sm transition-shadow hover:shadow-neu sm:w-auto"
          >
            View Resume
          </motion.span>
        </Link>
      </div>
    </motion.section>
  );
}
