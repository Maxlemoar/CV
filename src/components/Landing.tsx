"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

interface LandingProps {
  onStartJourney: () => void;
}

export default function Landing({ onStartJourney }: LandingProps) {
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

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.1, delayChildren: 0.8 } },
        }}
        className="mx-auto mt-8 flex max-w-sm flex-col gap-3 sm:flex-row sm:justify-center"
      >
        <motion.button
          variants={{
            hidden: { opacity: 0, y: 12 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onStartJourney}
          className="w-full rounded-xl bg-accent px-6 py-3 text-base font-semibold text-white shadow-sm transition-shadow hover:shadow-md sm:flex-1"
        >
          Get to know me
        </motion.button>
        <Link href="/cv" className="w-full sm:flex-1">
          <motion.span
            variants={{
              hidden: { opacity: 0, y: 12 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-block w-full rounded-xl border border-accent/30 bg-paper px-6 py-3 text-center text-base font-semibold text-accent shadow-sm transition-shadow hover:shadow-md"
          >
            View Resume
          </motion.span>
        </Link>
      </motion.div>
    </section>
  );
}
