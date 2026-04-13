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
      <div className="mx-auto mb-6 max-w-md overflow-hidden rounded-2xl shadow-md">
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
      <div className="mx-auto mt-8 flex max-w-sm flex-col gap-3 sm:flex-row sm:justify-center">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onStartJourney}
          className="w-full rounded-xl bg-accent px-6 py-3 text-base font-semibold text-white shadow-sm transition-shadow hover:shadow-md sm:flex-1"
        >
          Get to know me
        </motion.button>
        <Link href="/cv" className="w-full sm:flex-1">
          <motion.span
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-block w-full rounded-xl border border-accent/30 bg-paper px-6 py-3 text-center text-base font-semibold text-accent shadow-sm transition-shadow hover:shadow-md"
          >
            View Resume
          </motion.span>
        </Link>
      </div>
    </motion.section>
  );
}
