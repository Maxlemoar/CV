"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { type CuriosityMode, MODES, DEFAULT_ORDER } from "@/lib/curiosity-config";

interface CuriosityContextValue {
  mode: CuriosityMode | null;
  setMode: (mode: CuriosityMode) => void;
  order: string[];
  isHighlighted: (sectionId: string) => boolean;
  isExpandedByDefault: (sectionId: string) => boolean;
}

const CuriosityContext = createContext<CuriosityContextValue | null>(null);

export function useCuriosity() {
  const ctx = useContext(CuriosityContext);
  if (!ctx) throw new Error("useCuriosity must be used within CuriosityProvider");
  return ctx;
}

export default function CuriosityProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialMode = searchParams.get("mode") as CuriosityMode | null;
  const [mode, setModeState] = useState<CuriosityMode | null>(
    initialMode && initialMode in MODES ? initialMode : null
  );

  const setMode = useCallback((m: CuriosityMode) => {
    setModeState(m);
    const params = new URLSearchParams(searchParams.toString());
    params.set("mode", m);
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [searchParams, router]);

  const config = mode ? MODES[mode] : null;
  const order = config ? config.order : DEFAULT_ORDER;
  const isHighlighted = useCallback((id: string) => config?.highlight.includes(id) ?? false, [config]);
  const isExpandedByDefault = useCallback((id: string) => config?.expandDefault.includes(id) ?? false, [config]);

  return (
    <CuriosityContext value={{ mode, setMode, order, isHighlighted, isExpandedByDefault }}>
      {children}
    </CuriosityContext>
  );
}
