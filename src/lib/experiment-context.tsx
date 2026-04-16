"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { ExperimentProfile, SignalVector } from "./experiment-types";
import { CONTENT_GRAPH } from "./content-graph";
import {
  applyClickToSignals,
  createEmptySignals,
  seedSignalsFromProfile,
} from "./hook-router";
import type { VisitorProfile, ProfileNarrative } from "./visitor-profile";
import { createEmptyVisitorProfile, createEmptyNarrative } from "./visitor-profile";
import { createContentCache, type ContentCache } from "./content-cache";

interface ExperimentState {
  profile: ExperimentProfile | null;
  signals: SignalVector;
  setProfile: (profile: ExperimentProfile) => void;
  recordClick: (nodeId: string) => void;
  resetExperiment: () => void;
  isInterviewed: boolean;
  // Adaptive personalization state
  visitorProfile: VisitorProfile | null;
  narrative: ProfileNarrative | null;
  contentCache: ContentCache;
  isProfileUpdating: boolean;
  setVisitorProfile: (vp: VisitorProfile) => void;
  setNarrative: (n: ProfileNarrative) => void;
  setIsProfileUpdating: (v: boolean) => void;
  updateProfileAsync: (interaction: {
    type: "interview_complete" | "hook_click" | "chat_question" | "chat_answer_read";
    nodeId?: string;
    question?: string;
    answer?: string;
    interviewAnswers?: Omit<ExperimentProfile, "experimentNumber">;
  }, visitedNodes: string[]) => void;
}

const ExperimentContext = createContext<ExperimentState | null>(null);

export function ExperimentProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<ExperimentProfile | null>(null);
  const [signals, setSignals] = useState<SignalVector>(() => createEmptySignals());
  const [visitorProfile, setVisitorProfile] = useState<VisitorProfile | null>(null);
  const [narrative, setNarrative] = useState<ProfileNarrative | null>(null);
  const [contentCacheRef] = useState(() => createContentCache());
  const [isProfileUpdating, setIsProfileUpdating] = useState(false);

  const setProfile = useCallback((p: ExperimentProfile) => {
    setProfileState(p);
    setSignals(seedSignalsFromProfile(p));
    // Initialize visitor profile from interview answers
    const vp = createEmptyVisitorProfile(p);
    setVisitorProfile(vp);
    setNarrative(createEmptyNarrative());
  }, []);

  const recordClick = useCallback((nodeId: string) => {
    const node = CONTENT_GRAPH[nodeId];
    if (!node) return;
    setSignals((prev) => applyClickToSignals(prev, node));
  }, []);

  const resetExperiment = useCallback(() => {
    setProfileState(null);
    setSignals(createEmptySignals());
    setVisitorProfile(null);
    setNarrative(null);
    contentCacheRef.clear();
    setIsProfileUpdating(false);
  }, [contentCacheRef]);

  const updateProfileAsync = useCallback(
    (
      interaction: {
        type: "interview_complete" | "hook_click" | "chat_question" | "chat_answer_read";
        nodeId?: string;
        question?: string;
        answer?: string;
        interviewAnswers?: Omit<ExperimentProfile, "experimentNumber">;
      },
      visitedNodes: string[],
    ) => {
      if (!visitorProfile || !narrative) return;
      setIsProfileUpdating(true);

      fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentProfile: visitorProfile,
          currentNarrative: narrative,
          newInteraction: interaction,
          visitedNodes,
        }),
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.profile) setVisitorProfile(data.profile);
          if (data?.narrative) setNarrative(data.narrative);
        })
        .catch(() => {
          // Silent failure — next interaction will try again with current profile
        })
        .finally(() => setIsProfileUpdating(false));
    },
    [visitorProfile, narrative],
  );

  return (
    <ExperimentContext.Provider
      value={{
        profile,
        signals,
        setProfile,
        recordClick,
        resetExperiment,
        isInterviewed: profile !== null,
        visitorProfile,
        narrative,
        contentCache: contentCacheRef,
        isProfileUpdating,
        setVisitorProfile,
        setNarrative,
        setIsProfileUpdating,
        updateProfileAsync,
      }}
    >
      {children}
    </ExperimentContext.Provider>
  );
}

export function useExperiment() {
  const ctx = useContext(ExperimentContext);
  if (!ctx) throw new Error("useExperiment must be used within ExperimentProvider");
  return ctx;
}
