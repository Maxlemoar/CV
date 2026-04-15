"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

// ── Egg catalog ──────────────────────────────────────────────
// Single source of truth for all hidden features. The total count
// shown in toasts / counter / Reveal is derived from this list.

export type EggId =
  | "curious-mind"
  | "coffee"
  | "gem-convergence"
  | "gem-lab-to-product"
  | "gem-full-picture"
  | "science"
  | "comparison"
  | "konami";

export interface EggDefinition {
  id: EggId;
  title: string;
  hint: string; // Shown once discovered
  icon: string; // Emoji
}

export const EGG_CATALOG: Record<EggId, EggDefinition> = {
  "curious-mind": {
    id: "curious-mind",
    title: "Curious Mind",
    hint: "You asked your own question.",
    icon: "💬",
  },
  coffee: {
    id: "coffee",
    title: "Barista Mode",
    hint: "You found Max's pour-over lab.",
    icon: "☕",
  },
  "gem-convergence": {
    id: "gem-convergence",
    title: "The Convergence",
    hint: "Psychology × AI × building — you connected the threads.",
    icon: "💎",
  },
  "gem-lab-to-product": {
    id: "gem-lab-to-product",
    title: "From Lab to Product",
    hint: "You linked research methodology to product work.",
    icon: "💎",
  },
  "gem-full-picture": {
    id: "gem-full-picture",
    title: "The Full Picture",
    hint: "You explored 15+ nodes — the whole story.",
    icon: "💎",
  },
  science: {
    id: "science",
    title: "Behind the Science",
    hint: "You uncovered the learning-science citations.",
    icon: "🔬",
  },
  comparison: {
    id: "comparison",
    title: "The Benchmark",
    hint: "You compared yourself to other visitors.",
    icon: "📊",
  },
  konami: {
    id: "konami",
    title: "Architect View",
    hint: "↑↑↓↓←→←→BA — you speak the ancient tongue.",
    icon: "🕹️",
  },
};

export const TOTAL_EGGS = Object.keys(EGG_CATALOG).length;

const STORAGE_KEY = "cv-found-eggs-v1";

interface EggToastData {
  id: EggId;
  egg: EggDefinition;
  foundIndex: number; // 1-based position in discovery order
  total: number;
}

interface EggContextValue {
  foundEggs: Set<EggId>;
  totalEggs: number;
  discoverEgg: (id: EggId) => void;
  resetEggs: () => void;
  activeToast: EggToastData | null;
  dismissToast: () => void;
}

const EggContext = createContext<EggContextValue | null>(null);

function readStoredEggs(): Set<EggId> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as EggId[];
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id) => id in EGG_CATALOG));
  } catch {
    return new Set();
  }
}

export function EggProvider({ children }: { children: ReactNode }) {
  // Lazy initializer reads from localStorage once. Safe for hydration because
  // consumers (counter / Reveal summary) only mount after user interaction,
  // well past the initial SSR hydration pass.
  const [foundEggs, setFoundEggs] = useState<Set<EggId>>(readStoredEggs);
  const [activeToast, setActiveToast] = useState<EggToastData | null>(null);

  // Persist on change
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(foundEggs)));
      }
    } catch {
      // ignore quota errors
    }
  }, [foundEggs]);

  const discoverEgg = useCallback((id: EggId) => {
    setFoundEggs((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      const egg = EGG_CATALOG[id];
      if (egg) {
        setActiveToast({
          id,
          egg,
          foundIndex: next.size,
          total: TOTAL_EGGS,
        });
      }
      return next;
    });
  }, []);

  const resetEggs = useCallback(() => {
    setFoundEggs(new Set());
    setActiveToast(null);
    try {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  }, []);

  const dismissToast = useCallback(() => setActiveToast(null), []);

  const value = useMemo<EggContextValue>(
    () => ({
      foundEggs,
      totalEggs: TOTAL_EGGS,
      discoverEgg,
      resetEggs,
      activeToast,
      dismissToast,
    }),
    [foundEggs, discoverEgg, resetEggs, activeToast, dismissToast],
  );

  return <EggContext.Provider value={value}>{children}</EggContext.Provider>;
}

export function useEggs() {
  const ctx = useContext(EggContext);
  if (!ctx) throw new Error("useEggs must be used within EggProvider");
  return ctx;
}
