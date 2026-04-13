"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePreferences } from "@/lib/preferences";
import type { VisualStyle, InfoDepth, ContentFocus } from "@/lib/types";

const VISUAL_OPTIONS: { value: VisualStyle; label: string }[] = [
  { value: "focused", label: "Focused" },
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

export default function SettingsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { preferences, updatePreference, isOnboarded } = usePreferences();

  if (!isOnboarded || !preferences) return null;

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="no-print fixed bottom-20 right-4 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink-light shadow-neu-sm transition-shadow hover:shadow-neu"
        aria-label="Personalization settings"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      </button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="no-print fixed bottom-32 right-4 z-30 w-64 rounded-2xl bg-white p-5 shadow-neu"
          >
            <div className="mb-4 text-xs font-medium uppercase tracking-wide text-ink-light">
              Personalization
            </div>

            {/* Visual Style */}
            <div className="mb-4">
              <div className="mb-1.5 text-xs text-ink-light">Style</div>
              <div className="flex gap-1.5">
                {VISUAL_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => updatePreference("visualStyle", opt.value)}
                    className={`flex-1 rounded-lg px-3 py-1.5 text-xs transition-colors ${
                      preferences.visualStyle === opt.value
                        ? "bg-accent text-white"
                        : "bg-paper text-ink-light hover:text-ink"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dark Mode */}
            <div className="mb-4">
              <div className="mb-1.5 text-xs text-ink-light">Mode</div>
              <div className="flex gap-1.5">
                <button
                  onClick={() => updatePreference("darkMode", false)}
                  className={`flex-1 rounded-lg px-3 py-1.5 text-xs transition-colors ${
                    !preferences.darkMode
                      ? "bg-accent text-white"
                      : "bg-paper text-ink-light hover:text-ink"
                  }`}
                >
                  Light
                </button>
                <button
                  onClick={() => updatePreference("darkMode", true)}
                  className={`flex-1 rounded-lg px-3 py-1.5 text-xs transition-colors ${
                    preferences.darkMode
                      ? "bg-accent text-white"
                      : "bg-paper text-ink-light hover:text-ink"
                  }`}
                >
                  Dark
                </button>
              </div>
            </div>

            {/* Info Depth */}
            <div className="mb-4">
              <div className="mb-1.5 text-xs text-ink-light">Depth</div>
              <div className="flex gap-1.5">
                {DEPTH_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => updatePreference("infoDepth", opt.value)}
                    className={`flex-1 rounded-lg px-3 py-1.5 text-xs transition-colors ${
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

            {/* Content Focus */}
            <div>
              <div className="mb-1.5 text-xs text-ink-light">Focus</div>
              <div className="flex flex-wrap gap-1.5">
                {FOCUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => updatePreference("contentFocus", opt.value)}
                    className={`rounded-lg px-3 py-1.5 text-xs transition-colors ${
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
            <div className="mt-4 pt-4 border-t border-[var(--color-paper-dark,#E5DDD3)]">
              <div className="mb-1.5 text-xs text-ink-light">Gamification</div>
              <div className="flex gap-1.5">
                <button
                  onClick={() => updatePreference("gamified", true)}
                  className={`flex-1 rounded-lg px-3 py-1.5 text-xs transition-colors ${
                    preferences.gamified
                      ? "bg-accent text-white"
                      : "bg-paper text-ink-light hover:text-ink"
                  }`}
                >
                  On
                </button>
                <button
                  onClick={() => updatePreference("gamified", false)}
                  className={`flex-1 rounded-lg px-3 py-1.5 text-xs transition-colors ${
                    !preferences.gamified
                      ? "bg-accent text-white"
                      : "bg-paper text-ink-light hover:text-ink"
                  }`}
                >
                  Off
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
