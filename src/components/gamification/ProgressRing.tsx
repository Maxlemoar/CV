"use client";

import { motion } from "framer-motion";

interface ProgressRingProps {
  discovered: number;
  total: number;
}

export default function ProgressRing({ discovered, total }: ProgressRingProps) {
  const progress = total > 0 ? discovered / total : 0;

  // Desktop ring: 72px, radius 30, circumference = 2 * π * 30
  const desktopRadius = 30;
  const desktopCircumference = 2 * Math.PI * desktopRadius;
  const desktopOffset = desktopCircumference * (1 - progress);

  // Mobile ring: 48px, radius 19, circumference = 2 * π * 19
  const mobileRadius = 19;
  const mobileCircumference = 2 * Math.PI * mobileRadius;
  const mobileOffset = mobileCircumference * (1 - progress);

  return (
    <div className="no-print fixed z-20 bottom-32 right-4 sm:bottom-auto sm:top-4 sm:right-4">
      {/* Desktop version */}
      <div className="hidden sm:flex flex-col items-center">
        <div className="relative h-[72px] w-[72px] rounded-full bg-white shadow-neu-sm">
          <svg width="72" height="72" viewBox="0 0 72 72" className="rotate-[-90deg]">
            <circle
              cx="36" cy="36" r={desktopRadius}
              fill="none" stroke="var(--color-paper-dark, #E5DDD3)" strokeWidth="4"
            />
            <motion.circle
              cx="36" cy="36" r={desktopRadius}
              fill="none" stroke="var(--color-accent)" strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={desktopCircumference}
              initial={{ strokeDashoffset: desktopCircumference }}
              animate={{ strokeDashoffset: desktopOffset }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-semibold text-ink">
              {discovered}/{total}
            </span>
          </div>
        </div>
        <span className="mt-1 text-[10px] text-ink-light">Themen entdeckt</span>
      </div>

      {/* Mobile version */}
      <div className="flex sm:hidden flex-col items-center">
        <div className="relative h-12 w-12 rounded-full bg-white shadow-neu-sm">
          <svg width="48" height="48" viewBox="0 0 48 48" className="rotate-[-90deg]">
            <circle
              cx="24" cy="24" r={mobileRadius}
              fill="none" stroke="var(--color-paper-dark, #E5DDD3)" strokeWidth="3"
            />
            <motion.circle
              cx="24" cy="24" r={mobileRadius}
              fill="none" stroke="var(--color-accent)" strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={mobileCircumference}
              initial={{ strokeDashoffset: mobileCircumference }}
              animate={{ strokeDashoffset: mobileOffset }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-semibold text-ink">{discovered}</span>
          </div>
        </div>
        <span className="mt-0.5 text-[9px] text-ink-light">von {total}</span>
      </div>
    </div>
  );
}
