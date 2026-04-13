"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import { usePreferences } from "@/lib/preferences";
import type { VisualStyle, InfoDepth, ContentFocus } from "@/lib/types";

const VISUAL_OPTIONS: { value: VisualStyle | "default"; label: string }[] = [
  { value: "default", label: "Notebook" },
  { value: "colorful", label: "Colorful" },
];

const DEPTH_OPTIONS: { value: InfoDepth; label: string }[] = [
  { value: "overview", label: "Overview" },
  { value: "deep-dive", label: "Deep Dive" },
];

const FOCUS_OPTIONS: { value: ContentFocus; label: string }[] = [
  { value: "product-builder", label: "Product Builder" },
  { value: "learning-scientist", label: "Learning Scientist" },
  { value: "ai-vision", label: "AI & Vision" },
  { value: "max-personal", label: "Max as a person" },
];

function ThemePreview({ theme }: { theme: "default" | "colorful" }) {
  if (theme === "default") {
    return (
      <div className="h-8 w-12 overflow-hidden rounded border border-[rgba(0,0,0,0.1)]" style={{ background: "#FAF6F1" }}>
        <div style={{ padding: "3px 4px" }}>
          <div style={{ height: 2, width: "80%", background: "#2C2C2C", borderRadius: 1, marginBottom: 2 }} />
          <div style={{ height: 1.5, width: "60%", background: "#6B6B6B", borderRadius: 1, marginBottom: 2 }} />
          <div style={{ height: 1.5, width: "70%", background: "#6B6B6B", borderRadius: 1 }} />
        </div>
      </div>
    );
  }
  return (
    <div className="h-8 w-12 overflow-hidden rounded" style={{ background: "#FFFBE6", border: "2px solid #1a1a1a" }}>
      <div style={{ padding: "2px 3px" }}>
        <div style={{ height: 3, width: "70%", background: "#FF3366", borderRadius: 1, marginBottom: 2 }} />
        <div style={{ display: "flex", gap: 2 }}>
          <div style={{ height: 6, flex: 1, background: "#EBFF00", border: "1px solid #1a1a1a", borderRadius: 2 }} />
          <div style={{ height: 6, flex: 1, background: "#7B61FF", border: "1px solid #1a1a1a", borderRadius: 2 }} />
        </div>
      </div>
    </div>
  );
}

export default function SettingsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { preferences, updatePreference, isOnboarded } = usePreferences();

  useEffect(() => {
    if (!isOpen) return;
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen]);

  if (!isOnboarded || !preferences) return null;

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.y > 100) setIsOpen(false);
  }

  return (
    <>
      {/* Gear trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="no-print fixed bottom-20 right-4 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink-light shadow-sm transition-all hover:shadow-md"
        aria-label="Personalization settings"
      >
        <motion.svg
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
          <circle cx="12" cy="12" r="3"/>
        </motion.svg>
      </button>

      {/* Bottom Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
              className="no-print fixed inset-0 z-40 bg-black/30"
              style={{ backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }}
            />

            {/* Drawer */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              drag="y"
              dragConstraints={{ top: 0 }}
              dragElastic={0.1}
              onDragEnd={handleDragEnd}
              className="no-print fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-md rounded-t-[20px] bg-white shadow-lg"
              style={{ paddingBottom: "env(safe-area-inset-bottom, 16px)" }}
              role="dialog"
              aria-modal="true"
              aria-label="Personalization settings"
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="h-1 w-10 rounded-full bg-ink-light/20" />
              </div>

              <div className="px-6 pb-6 pt-2">
                <div className="mb-5 text-xs font-medium uppercase tracking-wide text-ink-light">
                  Personalization
                </div>

                {/* Style */}
                <div className="mb-5">
                  <div className="mb-2 text-xs text-ink-light">Style</div>
                  <div className="flex gap-2">
                    {VISUAL_OPTIONS.map((opt) => {
                      const isActive = opt.value === "default"
                        ? preferences.visualStyle === "default" || preferences.visualStyle === "focused"
                        : preferences.visualStyle === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => updatePreference("visualStyle", opt.value as VisualStyle)}
                          className={`flex flex-1 items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${
                            isActive
                              ? "bg-accent text-white ring-2 ring-accent/30 ring-offset-1 shadow-sm"
                              : "bg-paper text-ink-light hover:text-ink hover:bg-paper-dark/30"
                          }`}
                        >
                          {!isActive && <ThemePreview theme={opt.value as "default" | "colorful"} />}
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Mode */}
                <div className="mb-5">
                  <div className="mb-2 text-xs text-ink-light">Mode</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updatePreference("darkMode", false)}
                      className={`flex-1 rounded-xl px-3 py-2.5 text-xs transition-colors ${
                        !preferences.darkMode ? "bg-accent text-white ring-2 ring-accent/30 ring-offset-1 shadow-sm font-medium" : "bg-paper text-ink-light hover:text-ink hover:bg-paper-dark/30"
                      }`}
                    >
                      Light
                    </button>
                    <button
                      onClick={() => updatePreference("darkMode", true)}
                      className={`flex-1 rounded-xl px-3 py-2.5 text-xs transition-colors ${
                        preferences.darkMode ? "bg-accent text-white ring-2 ring-accent/30 ring-offset-1 shadow-sm font-medium" : "bg-paper text-ink-light hover:text-ink hover:bg-paper-dark/30"
                      }`}
                    >
                      Dark
                    </button>
                  </div>
                </div>

                {/* Depth */}
                <div className="mb-5">
                  <div className="mb-2 text-xs text-ink-light">Depth</div>
                  <div className="flex gap-2">
                    {DEPTH_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => updatePreference("infoDepth", opt.value)}
                        className={`flex-1 rounded-xl px-3 py-2.5 text-xs transition-colors ${
                          preferences.infoDepth === opt.value
                            ? "bg-accent text-white"
                            : "bg-paper text-ink-light hover:text-ink"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Focus */}
                <div className="mb-5">
                  <div className="mb-2 text-xs text-ink-light">Focus</div>
                  <div className="grid grid-cols-2 gap-2">
                    {FOCUS_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => updatePreference("contentFocus", opt.value)}
                        className={`rounded-xl px-3 py-2.5 text-xs transition-colors ${
                          preferences.contentFocus === opt.value
                            ? "bg-accent text-white"
                            : "bg-paper text-ink-light hover:text-ink"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Gamification */}
                <div className="border-t border-paper-dark pt-5">
                  <div className="mb-2 text-xs text-ink-light">Gamification</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updatePreference("gamified", true)}
                      className={`flex-1 rounded-xl px-3 py-2.5 text-xs transition-colors ${
                        preferences.gamified ? "bg-accent text-white ring-2 ring-accent/30 ring-offset-1 shadow-sm font-medium" : "bg-paper text-ink-light hover:text-ink hover:bg-paper-dark/30"
                      }`}
                    >
                      On
                    </button>
                    <button
                      onClick={() => updatePreference("gamified", false)}
                      className={`flex-1 rounded-xl px-3 py-2.5 text-xs transition-colors ${
                        !preferences.gamified ? "bg-accent text-white ring-2 ring-accent/30 ring-offset-1 shadow-sm font-medium" : "bg-paper text-ink-light hover:text-ink hover:bg-paper-dark/30"
                      }`}
                    >
                      Off
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
