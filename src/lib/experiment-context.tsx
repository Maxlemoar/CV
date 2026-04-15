"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { ExperimentProfile, SignalVector } from "./experiment-types";
import { CONTENT_GRAPH } from "./content-graph";
import {
  applyClickToSignals,
  createEmptySignals,
  seedSignalsFromProfile,
} from "./hook-router";

interface ExperimentState {
  profile: ExperimentProfile | null;
  signals: SignalVector;
  setProfile: (profile: ExperimentProfile) => void;
  recordClick: (nodeId: string) => void;
  resetExperiment: () => void;
  isInterviewed: boolean;
}

const ExperimentContext = createContext<ExperimentState | null>(null);

export function ExperimentProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<ExperimentProfile | null>(null);
  const [signals, setSignals] = useState<SignalVector>(() => createEmptySignals());

  const setProfile = useCallback((p: ExperimentProfile) => {
    setProfileState(p);
    setSignals(seedSignalsFromProfile(p));
  }, []);

  const recordClick = useCallback((nodeId: string) => {
    const node = CONTENT_GRAPH[nodeId];
    if (!node) return;
    setSignals((prev) => applyClickToSignals(prev, node));
  }, []);

  const resetExperiment = useCallback(() => {
    setProfileState(null);
    setSignals(createEmptySignals());
  }, []);

  return (
    <ExperimentContext.Provider
      value={{
        profile,
        signals,
        setProfile,
        recordClick,
        resetExperiment,
        isInterviewed: profile !== null,
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
