"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { UserPreferences } from "./types";

interface SettingsState {
  settings: UserPreferences;
  updateSetting: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
}

const SettingsContext = createContext<SettingsState | null>(null);

const DEFAULT_SETTINGS: UserPreferences = {
  visualStyle: "focused",
  darkMode: false,
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<UserPreferences>(DEFAULT_SETTINGS);

  const updateSetting = useCallback(<K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSetting }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
