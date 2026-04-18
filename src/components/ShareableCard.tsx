"use client";

import type { ExperimentProfile } from "@/lib/experiment-types";
import { DIMENSION_LABELS } from "@/lib/experiment-types";
import { TOTAL_EGGS } from "@/lib/egg-context";

interface ShareableCardProps {
  profile: ExperimentProfile;
  visitedNodes?: string[];
  foundEggs?: string[];
}

export default function ShareableCard({ profile, visitedNodes, foundEggs }: ShareableCardProps) {
  return (
    <div className="w-full max-w-md mx-auto bg-gradient-to-br from-neutral-50 to-orange-50 dark:from-neutral-900 dark:to-orange-950/20 p-8 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-lg">
      <p className="text-[10px] tracking-[3px] text-neutral-400 mb-5 uppercase">
        Experiment #{profile.experimentNumber}
      </p>
      <p className="font-serif text-xl text-neutral-900 dark:text-neutral-100 mb-1 leading-snug">
        You are convinced by
      </p>
      <p className="font-serif text-xl font-bold text-orange-600 dark:text-orange-400 mb-5">
        {DIMENSION_LABELS.persuasion[profile.persuasion]}
      </p>
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div>
          <p className="text-[11px] text-neutral-400">Interest</p>
          <p className="text-sm text-neutral-700 dark:text-neutral-300">
            {DIMENSION_LABELS.contentInterest[profile.contentInterest]}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-neutral-400">Drive</p>
          <p className="text-sm text-neutral-700 dark:text-neutral-300">
            {DIMENSION_LABELS.motivation[profile.motivation]}
          </p>
        </div>
      </div>
      {(visitedNodes || foundEggs) && (
        <div className="grid grid-cols-2 gap-4 mb-5">
          {visitedNodes && (
            <div>
              <p className="text-[11px] text-neutral-400">Topics explored</p>
              <p className="text-sm text-neutral-700 dark:text-neutral-300">
                {visitedNodes.length}
              </p>
            </div>
          )}
          {foundEggs && (
            <div>
              <p className="text-[11px] text-neutral-400">Easter eggs found</p>
              <p className="text-sm text-neutral-700 dark:text-neutral-300">
                {foundEggs.length}/{TOTAL_EGGS}
              </p>
            </div>
          )}
        </div>
      )}
      <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
        <p className="text-xs text-neutral-400">
          Every journey is unique · Start yours
        </p>
      </div>
    </div>
  );
}
