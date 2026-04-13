"use client";

import { createContext, useContext, useState, useCallback } from "react";
import type { UserPreferences } from "./types";

const PreferencesContext = createContext<{
  preferences: UserPreferences | null;
  setPreferences: (prefs: UserPreferences) => void;
  updatePreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
  isOnboarded: boolean;
}>({
  preferences: null,
  setPreferences: () => {},
  updatePreference: () => {},
  isOnboarded: false,
});

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferencesState] = useState<UserPreferences | null>(null);

  const setPreferences = useCallback((prefs: UserPreferences) => {
    setPreferencesState(prefs);
  }, []);

  const updatePreference = useCallback(<K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    setPreferencesState((prev) => prev ? { ...prev, [key]: value } : null);
  }, []);

  return (
    <PreferencesContext.Provider value={{ preferences, setPreferences, updatePreference, isOnboarded: preferences !== null }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  return useContext(PreferencesContext);
}
