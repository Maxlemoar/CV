"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { ExperimentProfile } from "./experiment-types";

interface ExperimentState {
  profile: ExperimentProfile | null;
  setProfile: (profile: ExperimentProfile) => void;
  resetExperiment: () => void;
  isInterviewed: boolean;
}

const ExperimentContext = createContext<ExperimentState | null>(null);

export function ExperimentProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<ExperimentProfile | null>(null);

  const setProfile = useCallback((p: ExperimentProfile) => {
    setProfileState(p);
  }, []);

  const resetExperiment = useCallback(() => {
    setProfileState(null);
  }, []);

  return (
    <ExperimentContext.Provider
      value={{
        profile,
        setProfile,
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
