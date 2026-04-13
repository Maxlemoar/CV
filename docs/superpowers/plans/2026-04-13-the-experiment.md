# The Experiment — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the portfolio from a conversation-style CV into "The Experiment" — an interactive psychological profiling experience with personalized content, a reveal moment, and viral sharing.

**Architecture:** Replace onboarding with a 5-question interview that measures psychological dimensions. Use those dimensions to personalize the exploration via a hybrid approach (static content graph + AI-generated framing). Replace gamification with an experiment-themed analyse bar and reveal. Replace session sharing with Shareable Cards.

**Tech Stack:** Next.js App Router, React Context, Tailwind CSS, Framer Motion, Anthropic Claude API (via `ai` SDK), Supabase, Vercel OG Image API

**Spec:** `docs/superpowers/specs/2026-04-13-the-experiment-design.md`

---

## File Structure

### New files
| Path | Responsibility |
|---|---|
| `src/lib/experiment-types.ts` | ExperimentProfile type, dimension types, interview question config, profile label mappings |
| `src/lib/experiment-context.tsx` | ExperimentProvider + useExperiment hook (replaces PreferencesContext for profiling) |
| `src/lib/experiment-starter-hooks.ts` | Starter hook mappings per education-resonance dimension |
| `src/lib/framing-hints.ts` | Per-node framing hints for persuasion/motivation dimensions |
| `src/components/ExperimentHook.tsx` | Act 1: Landing screen ("Experiment #N") |
| `src/components/Interview.tsx` | Act 2: 5-question chat-style interview |
| `src/components/AnalyseBar.tsx` | Act 3: Progress bar with experiment-themed phases |
| `src/components/Reveal.tsx` | Act 4: Profile + personalization breakdown + punchline |
| `src/components/ShareableCard.tsx` | Shareable card preview component (for in-page rendering) |
| `src/components/rabbit-holes/BehindTheScience.tsx` | Rabbit Hole 1: Learning principle overlay per block |
| `src/components/rabbit-holes/ArchitectView.tsx` | Rabbit Hole 2: Content graph visualization + architecture |
| `src/components/rabbit-holes/Comparison.tsx` | Rabbit Hole 3: Anonymized aggregate comparison |
| `src/hooks/useKonamiCode.ts` | Keyboard sequence detector for Architect View |
| `src/app/api/experiment-number/route.ts` | Unique experiment number generation |
| `src/app/api/frame/route.ts` | AI framing generation endpoint |
| `src/app/api/og/[id]/route.tsx` | OG image generation for shareable cards |

### Modified files
| Path | Change |
|---|---|
| `src/lib/types.ts` | Add ExperimentProfile, FrameResponse, SharedSession types; slim down UserPreferences to visual-only |
| `src/lib/content-graph.ts` | Add `framingHints` to ContentNode, add starter hook mappings, add learning mechanic markers |
| `src/lib/preferences.tsx` | Slim down to visual settings only (SettingsContext) |
| `src/lib/session-store.ts` | Update to store ExperimentProfile + visitedNodes instead of blocks |
| `src/components/ConversationView.tsx` | Replace onboarding flow, integrate AnalyseBar, add reveal trigger, add framing API calls, remove gamification |
| `src/components/ContentBlock.tsx` | Add behind-the-science icon, support framing introduction/transition |
| `src/components/Landing.tsx` | Rewrite → ExperimentHook |
| `src/app/api/chat/route.ts` | Update system prompt with profile-aware personalization |
| `src/app/api/sessions/route.ts` | Update to store/retrieve SharedSession format |
| `src/app/s/[id]/page.tsx` | Rewrite to show Card + CTA only |

### Removed files
| Path | Reason |
|---|---|
| `src/components/OnboardingChat.tsx` | Replaced by Interview.tsx |
| `src/components/gamification/ProgressRing.tsx` | Replaced by AnalyseBar.tsx |
| `src/components/gamification/AchievementToast.tsx` | Removed — experiment IS the gamification |
| `src/components/JourneyWrapUp.tsx` | Replaced by Reveal.tsx |
| `src/hooks/useGamification.ts` | Removed entirely |

---

## Task 1: Types & Data Model

**Files:**
- Modify: `src/lib/types.ts`
- Create: `src/lib/experiment-types.ts`

- [ ] **Step 1: Create experiment-types.ts with all new types**

```typescript
// src/lib/experiment-types.ts

export type Persuasion = 'results' | 'process' | 'character';
export type Learning = 'exploratory' | 'structured' | 'social';
export type Education = 'practice' | 'individualization' | 'inspiration';
export type Motivation = 'mastery' | 'purpose' | 'relatedness';
export type Sharing = 'surprise' | 'utility' | 'emotion';

export interface ExperimentProfile {
  experimentNumber: number;
  persuasion: Persuasion;
  learning: Learning;
  education: Education;
  motivation: Motivation;
  sharing: Sharing;
}

export interface InterviewQuestion {
  id: string;
  text: string;
  options: {
    label: string;
    value: string;
  }[];
  dimension: keyof Omit<ExperimentProfile, 'experimentNumber'>;
}

export interface FrameRequest {
  type: 'frame';
  nodeId: string;
  profile: ExperimentProfile;
  visitedNodes: string[];
  previousNodeId?: string;
}

export interface FrameResponse {
  introduction: string;
  transition?: string;
  hookLabels?: Record<string, string>;
  learningMechanic?: {
    type: 'testing-effect' | 'spaced-retrieval';
    content: string;
    answer?: string;
  };
}

export interface SharedSession {
  id: string;
  experimentNumber: number;
  profile: ExperimentProfile;
  visitedNodes: string[];
  createdAt: string;
}

// Labels for the Reveal screen
export const DIMENSION_LABELS: Record<string, Record<string, string>> = {
  persuasion: {
    results: 'Results & Impact',
    process: 'Thinking Processes & Frameworks',
    character: 'Personality & Values',
  },
  learning: {
    exploratory: 'Exploratory & self-directed',
    structured: 'Systematic & methodical',
    social: 'Collaborative & dialogue-driven',
  },
  education: {
    practice: 'More practical application',
    individualization: 'More individualization',
    inspiration: 'More inspiration & passion',
  },
  motivation: {
    mastery: 'Mastery & deep expertise',
    purpose: 'Purpose & real-world impact',
    relatedness: 'Connection & collaboration',
  },
  sharing: {
    surprise: 'Unexpected insights',
    utility: 'Useful discoveries',
    emotion: 'Emotionally moving moments',
  },
};

export const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  {
    id: 'persuasion',
    text: "Before you get to know me — may I ask you something? If you had to evaluate a candidate in 30 seconds — what do you look at first?",
    options: [
      { label: "What they've achieved", value: 'results' },
      { label: 'How they think and solve problems', value: 'process' },
      { label: 'Who they are — energy, values, personality', value: 'character' },
    ],
    dimension: 'persuasion',
  },
  {
    id: 'learning',
    text: "Imagine you need to understand a topic you know nothing about. What do you do first?",
    options: [
      { label: 'Just start and learn along the way', value: 'exploratory' },
      { label: 'Research first, then proceed systematically', value: 'structured' },
      { label: 'Ask someone who knows', value: 'social' },
    ],
    dimension: 'learning',
  },
  {
    id: 'education',
    text: "When you think back to school or university — what could have been better?",
    options: [
      { label: 'More practical application — too much theory, too little doing', value: 'practice' },
      { label: 'More individualization — everyone was treated the same', value: 'individualization' },
      { label: 'More inspiration — it lacked passion and curiosity', value: 'inspiration' },
    ],
    dimension: 'education',
  },
  {
    id: 'motivation',
    text: "What makes a really good work day — what needs to have happened?",
    options: [
      { label: 'I solved a hard problem', value: 'mastery' },
      { label: 'I moved something that has real impact', value: 'purpose' },
      { label: 'I had great conversations with smart people', value: 'relatedness' },
    ],
    dimension: 'motivation',
  },
  {
    id: 'sharing',
    text: "Last question. When was the last time you showed someone something and said: 'You have to see this'?",
    options: [
      { label: 'Something surprising — it broke my expectations', value: 'surprise' },
      { label: 'Something useful — it could help you too', value: 'utility' },
      { label: 'Something moving — it touched me emotionally', value: 'emotion' },
    ],
    dimension: 'sharing',
  },
];
```

- [ ] **Step 2: Update types.ts — slim down UserPreferences to visual-only**

In `src/lib/types.ts`, replace the `UserPreferences` interface and remove the now-unused types:

```typescript
// Remove these lines:
// export type InfoDepth = "overview" | "deep-dive";
// export type ContentFocus = "product-builder" | "learning-scientist" | "ai-vision" | "max-personal";

// Replace UserPreferences with:
export interface UserPreferences {
  visualStyle: VisualStyle;
  darkMode: boolean;
}

// Remove AchievementDefinition interface entirely
```

Keep `VisualStyle` as-is. Keep all other types (`ContentBlockData`, `SessionData`, `AIResponse`, etc.) unchanged for now — they'll be modified in later tasks as needed.

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit 2>&1 | head -30`

Expected: Compilation errors related to removed types being used in other files. This is expected — we'll fix consumers in subsequent tasks. Just verify the new types file itself is valid.

- [ ] **Step 4: Commit**

```bash
git add src/lib/experiment-types.ts src/lib/types.ts
git commit -m "feat: add experiment profile types and slim down UserPreferences"
```

---

## Task 2: Experiment Context (replaces PreferencesContext)

**Files:**
- Create: `src/lib/experiment-context.tsx`
- Modify: `src/lib/preferences.tsx`

- [ ] **Step 1: Create ExperimentContext**

```typescript
// src/lib/experiment-context.tsx
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
```

- [ ] **Step 2: Slim down preferences.tsx to visual settings only**

Rewrite `src/lib/preferences.tsx` to only manage visual settings (dark mode + visual style). The context shape becomes:

```typescript
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
  darkMode: typeof window !== "undefined"
    ? window.matchMedia("(prefers-color-scheme: dark)").matches
    : false,
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
```

- [ ] **Step 3: Update app layout to wrap with both providers**

In whichever layout file wraps the app with `PreferencesProvider`, replace it with both `SettingsProvider` and `ExperimentProvider`. Check `src/app/layout.tsx` or `src/app/page.tsx` for where the provider is mounted.

- [ ] **Step 4: Commit**

```bash
git add src/lib/experiment-context.tsx src/lib/preferences.tsx
git commit -m "feat: add ExperimentContext, slim preferences to visual settings"
```

---

## Task 3: Experiment Number API

**Files:**
- Create: `src/app/api/experiment-number/route.ts`

- [ ] **Step 1: Create the API route**

```typescript
// src/app/api/experiment-number/route.ts
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
  try {
    // Atomic increment in Supabase
    const { data, error } = await supabase
      .rpc("next_experiment_number");

    if (error || !data) {
      // Fallback: timestamp-based unique number
      const fallback = Date.now() % 100000;
      return NextResponse.json({ number: fallback });
    }

    return NextResponse.json({ number: data });
  } catch {
    const fallback = Date.now() % 100000;
    return NextResponse.json({ number: fallback });
  }
}
```

- [ ] **Step 2: Create the Supabase function**

Run this SQL in Supabase dashboard or via migration:

```sql
-- Create counter table
CREATE TABLE IF NOT EXISTS experiment_counter (
  id INTEGER PRIMARY KEY DEFAULT 1,
  current_value INTEGER NOT NULL DEFAULT 0
);

-- Seed with initial value
INSERT INTO experiment_counter (id, current_value) VALUES (1, 0)
ON CONFLICT (id) DO NOTHING;

-- Atomic increment function
CREATE OR REPLACE FUNCTION next_experiment_number()
RETURNS INTEGER AS $$
DECLARE
  next_val INTEGER;
BEGIN
  UPDATE experiment_counter
  SET current_value = current_value + 1
  WHERE id = 1
  RETURNING current_value INTO next_val;
  RETURN next_val;
END;
$$ LANGUAGE plpgsql;
```

- [ ] **Step 3: Test the endpoint locally**

Run: `curl -X POST http://localhost:3000/api/experiment-number`

Expected: `{"number":1}` (first call), incrementing on each subsequent call.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/experiment-number/route.ts
git commit -m "feat: add experiment number API with Supabase atomic counter"
```

---

## Task 4: Act 1 — The Hook (Landing Screen)

**Files:**
- Create: `src/components/ExperimentHook.tsx`
- Modify: `src/components/Landing.tsx` (rewrite)

- [ ] **Step 1: Create ExperimentHook component**

```typescript
// src/components/ExperimentHook.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface ExperimentHookProps {
  onStart: (experimentNumber: number) => void;
}

export default function ExperimentHook({ onStart }: ExperimentHookProps) {
  const [experimentNumber, setExperimentNumber] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Fetch experiment number on mount
    fetch("/api/experiment-number", { method: "POST" })
      .then((res) => res.json())
      .then((data) => setExperimentNumber(data.number))
      .catch(() => setExperimentNumber(Date.now() % 100000));
  }, []);

  const handleStart = () => {
    if (experimentNumber === null) return;
    setIsLoading(true);
    onStart(experimentNumber);
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {experimentNumber !== null && (
        <motion.p
          className="text-xs tracking-[3px] text-neutral-400 mb-10 uppercase"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          Experiment #{experimentNumber}
        </motion.p>
      )}

      <motion.h1
        className="font-serif text-3xl md:text-4xl text-neutral-900 dark:text-neutral-100 mb-10 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        Let&apos;s get to know each other.
      </motion.h1>

      <motion.button
        onClick={handleStart}
        disabled={isLoading || experimentNumber === null}
        className="px-9 py-3.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-base transition-colors disabled:opacity-50"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.6 }}
      >
        Start Experiment
      </motion.button>

      <motion.p
        className="text-xs text-neutral-400 mt-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      >
        ~5 minutes · No data stored ·{" "}
        <Link href="/cv" className="underline hover:text-orange-600 transition-colors">
          Prefer the classic CV?
        </Link>
      </motion.p>
    </motion.div>
  );
}
```

- [ ] **Step 2: Rewrite Landing.tsx to use ExperimentHook**

Replace the entire content of `src/components/Landing.tsx`:

```typescript
// src/components/Landing.tsx
"use client";

import ExperimentHook from "./ExperimentHook";

interface LandingProps {
  onStartJourney: (experimentNumber: number) => void;
}

export default function Landing({ onStartJourney }: LandingProps) {
  return <ExperimentHook onStart={onStartJourney} />;
}
```

Note: The `onStartJourney` signature changes from `() => void` to `(experimentNumber: number) => void`. This will require updating ConversationView — handled in Task 7.

- [ ] **Step 3: Verify component renders**

Start dev server, navigate to `/`. Should see the minimal experiment hook screen instead of the old hero landing.

- [ ] **Step 4: Commit**

```bash
git add src/components/ExperimentHook.tsx src/components/Landing.tsx
git commit -m "feat: replace landing with Experiment Hook screen"
```

---

## Task 5: Act 2 — The Interview

**Files:**
- Create: `src/components/Interview.tsx`

- [ ] **Step 1: Create Interview component**

```typescript
// src/components/Interview.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { INTERVIEW_QUESTIONS, type ExperimentProfile } from "@/lib/experiment-types";

interface InterviewProps {
  experimentNumber: number;
  onComplete: (profile: ExperimentProfile) => void;
}

interface ChatMessage {
  type: "question" | "answer" | "typing";
  text: string;
}

export default function Interview({ experimentNumber, onComplete }: InterviewProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showOptions, setShowOptions] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Show first question on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setMessages([{ type: "question", text: INTERVIEW_QUESTIONS[0].text }]);
      setTimeout(() => setShowOptions(true), 400);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSelect = (value: string, label: string) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setShowOptions(false);

    const question = INTERVIEW_QUESTIONS[currentStep];
    const newAnswers = { ...answers, [question.dimension]: value };
    setAnswers(newAnswers);

    // Add user's answer to chat
    setMessages((prev) => [...prev, { type: "answer", text: label }]);

    const nextStep = currentStep + 1;

    if (nextStep >= INTERVIEW_QUESTIONS.length) {
      // All questions answered — build profile
      setTimeout(() => {
        const profile: ExperimentProfile = {
          experimentNumber,
          persuasion: newAnswers.persuasion as ExperimentProfile["persuasion"],
          learning: newAnswers.learning as ExperimentProfile["learning"],
          education: newAnswers.education as ExperimentProfile["education"],
          motivation: newAnswers.motivation as ExperimentProfile["motivation"],
          sharing: newAnswers.sharing as ExperimentProfile["sharing"],
        };
        onComplete(profile);
      }, 800);
    } else {
      // Show next question
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { type: "question", text: INTERVIEW_QUESTIONS[nextStep].text },
        ]);
        setCurrentStep(nextStep);
        setTimeout(() => {
          setShowOptions(true);
          setIsTransitioning(false);
        }, 400);
      }, 600);
    }
  };

  const currentQuestion = INTERVIEW_QUESTIONS[currentStep];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="text-center pt-8 pb-4">
        <p className="text-xs tracking-[3px] text-neutral-400 uppercase">
          Experiment #{experimentNumber}
        </p>
      </div>

      {/* Chat area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-8 max-w-2xl mx-auto w-full">
        <AnimatePresence mode="popLayout">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`mb-4 ${msg.type === "answer" ? "text-right" : ""}`}
            >
              {msg.type === "question" && (
                <div className="bg-neutral-100 dark:bg-neutral-800 rounded-2xl rounded-tl-sm px-5 py-4 inline-block max-w-[85%] text-left">
                  <p className="text-sm text-neutral-500 mb-1">Max</p>
                  <p className="text-base text-neutral-800 dark:text-neutral-200 leading-relaxed">
                    {msg.text}
                  </p>
                </div>
              )}
              {msg.type === "answer" && (
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-2xl rounded-tr-sm px-5 py-3 inline-block max-w-[85%]">
                  <p className="text-base text-neutral-800 dark:text-neutral-200">
                    {msg.text}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Options */}
        <AnimatePresence>
          {showOptions && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-2.5 mt-2 mb-8"
            >
              {currentQuestion.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value, option.label)}
                  className="text-left px-5 py-3.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl hover:border-orange-400 hover:bg-orange-50/50 dark:hover:bg-orange-900/10 transition-all text-base text-neutral-700 dark:text-neutral-300"
                >
                  {option.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify component renders in isolation**

Temporarily render `<Interview experimentNumber={42} onComplete={(p) => console.log(p)} />` in a test page or directly in ConversationView. Click through all 5 questions and verify the console output shows a complete ExperimentProfile.

- [ ] **Step 3: Commit**

```bash
git add src/components/Interview.tsx
git commit -m "feat: add Interview component (5-question psychological profiling)"
```

---

## Task 6: Analyse Bar

**Files:**
- Create: `src/components/AnalyseBar.tsx`

- [ ] **Step 1: Create AnalyseBar component**

```typescript
// src/components/AnalyseBar.tsx
"use client";

import { motion } from "framer-motion";

interface AnalyseBarProps {
  visitedCount: number;
  threshold: number; // 8
  onRevealClick: () => void;
  revealDismissed: boolean;
}

const PHASES = [
  { max: 0.5, label: "Collecting data..." },
  { max: 0.79, label: "Analyzing patterns..." },
  { max: 0.99, label: "Almost there..." },
  { max: Infinity, label: "Enough data collected — result available" },
];

function getPhaseLabel(progress: number): string {
  for (const phase of PHASES) {
    if (progress <= phase.max) return phase.label;
  }
  return PHASES[PHASES.length - 1].label;
}

export default function AnalyseBar({
  visitedCount,
  threshold,
  onRevealClick,
  revealDismissed,
}: AnalyseBarProps) {
  const progress = Math.min(visitedCount / threshold, 1);
  const isReady = progress >= 1;
  const label = getPhaseLabel(progress);

  return (
    <div className="fixed top-0 left-0 right-0 z-30 no-print">
      {/* Bar */}
      <div className="h-1 bg-neutral-200 dark:bg-neutral-700">
        <motion.div
          className={`h-full ${isReady ? "bg-orange-500" : "bg-neutral-400 dark:bg-neutral-500"}`}
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>

      {/* Label */}
      <div className="flex items-center justify-between px-4 py-1.5 text-xs">
        <span className={`tracking-wide ${isReady ? "text-orange-600 dark:text-orange-400" : "text-neutral-400"}`}>
          {label}
        </span>
        {isReady && !revealDismissed && (
          <motion.button
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={onRevealClick}
            className="text-orange-600 dark:text-orange-400 hover:text-orange-700 underline transition-colors"
          >
            See result
          </motion.button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/AnalyseBar.tsx
git commit -m "feat: add AnalyseBar with experiment-themed progress phases"
```

---

## Task 7: Content Graph Enhancements

**Files:**
- Create: `src/lib/experiment-starter-hooks.ts`
- Create: `src/lib/framing-hints.ts`
- Modify: `src/lib/content-graph.ts`

- [ ] **Step 1: Create starter hook mappings**

```typescript
// src/lib/experiment-starter-hooks.ts
import type { Education } from "./experiment-types";
import type { Hook } from "./content-graph";

// Which entry hooks appear after interview, based on education resonance
export const EDUCATION_STARTER_HOOKS: Record<Education, Hook[]> = {
  practice: [
    { label: "The startup I built and sold", targetId: "startup-story" },
    { label: "What I'm building with Claude right now", targetId: "building-with-claude" },
    { label: "Side projects that taught me the most", targetId: "side-projects" },
    { label: "Why I want to work at Anthropic", targetId: "why-anthropic" },
  ],
  individualization: [
    { label: "What I believe school gets wrong", targetId: "school-gets-wrong" },
    { label: "The psychology of how we learn", targetId: "psychology-of-learning" },
    { label: "My vision for AI in education", targetId: "anthropic-education-vision" },
    { label: "Why I want to work at Anthropic", targetId: "why-anthropic" },
  ],
  inspiration: [
    { label: "What I believe school gets wrong", targetId: "school-gets-wrong" },
    { label: "Why I want to work at Anthropic", targetId: "why-anthropic" },
    { label: "The startup I built and sold", targetId: "startup-story" },
    { label: "What I'd build if I could start from scratch", targetId: "what-id-build" },
  ],
};
```

- [ ] **Step 2: Create framing hints**

```typescript
// src/lib/framing-hints.ts
import type { Persuasion, Motivation } from "./experiment-types";

export interface FramingHint {
  results: string;
  process: string;
  character: string;
  mastery: string;
  purpose: string;
  relatedness: string;
}

// Framing hints per content node — tells the AI what to emphasize
export const FRAMING_HINTS: Record<string, Partial<FramingHint>> = {
  "startup-story": {
    results: "150k teachers, 1.5M ARR, team from 2 to 12 in 3 years",
    process: "Hypothesis-driven iteration, pivots based on data, product-market fit process",
    character: "Two psychologists in a 20sqm apartment asking: can we actually do this?",
    mastery: "Technical architecture decisions, building without engineering background",
    purpose: "Teachers spending 40% of time on material search — we changed that",
    relatedness: "Co-founding dynamic, early team building, user community",
  },
  "school-gets-wrong": {
    results: "PISA scores, international benchmarks, measurable gaps",
    process: "Analysis framework: what's the actual bottleneck in education?",
    character: "Personal frustration with a system that didn't see individuals",
    mastery: "Deep understanding of pedagogy, Hattie's meta-analyses",
    purpose: "Every child deserves an education that adapts to them",
    relatedness: "Conversations with teachers that changed my perspective",
  },
  "why-anthropic": {
    results: "Anthropic's scale, Claude's capabilities, market position in EdTech",
    process: "Strategic fit analysis: why this role, why now, why me",
    character: "Personal alignment with Anthropic's mission and values",
    mastery: "AI safety understanding, technical depth in LLM applications",
    purpose: "AI as the lever for personalized education at scale",
    relatedness: "Team culture, collaborative research, building together",
  },
  "building-with-claude": {
    results: "Specific tools built, usage metrics, time saved",
    process: "Prompt engineering approach, iteration methodology",
    character: "Genuine enthusiasm for AI as a daily creative partner",
    mastery: "Technical fluency with Claude API, advanced prompting techniques",
    purpose: "Making AI accessible for education practitioners",
    relatedness: "Sharing discoveries with colleagues, teaching others to use AI",
  },
  // Add more nodes as needed — the AI can handle nodes without hints
};
```

- [ ] **Step 3: Add `framingHints` field to ContentNode interface**

In `src/lib/content-graph.ts`, add to the `ContentNode` interface:

```typescript
export interface ContentNode {
  id: string;
  content: string;
  contentCompact: string;
  image?: { src: string; alt: string };
  quiz?: QuizData;
  hooks: Hook[];
  printSection?: "about" | "experience" | "education" | "projects" | "philosophy" | "publications" | "skills" | "personal";
  printOrder?: number;
  gem?: {
    requiredNodes?: string[];
    minVisited?: number;
  };
  gemIntro?: string;
  gemTitle?: string;
  // NEW: learning mechanic markers
  testingEffectQuestion?: {
    question: string;
    answer: string;
  };
  spacedRetrievalRef?: string; // Node ID this references back to
}
```

Then add `testingEffectQuestion` and `spacedRetrievalRef` to a few key nodes in `CONTENT_GRAPH`. For example:

```typescript
"startup-story": {
  // ... existing fields ...
  testingEffectQuestion: {
    question: "How many teachers do you think use the platform Max co-founded?",
    answer: "Over 150,000 teachers across German-speaking countries — making it one of the largest teacher communities in Europe.",
  },
},
"psychology-of-learning": {
  // ... existing fields ...
  spacedRetrievalRef: "school-gets-wrong", // callback to earlier node
},
```

Add these markers to 4-6 key nodes. The AI framing endpoint will use these as triggers.

- [ ] **Step 4: Commit**

```bash
git add src/lib/experiment-starter-hooks.ts src/lib/framing-hints.ts src/lib/content-graph.ts
git commit -m "feat: add framing hints, starter hooks, and learning mechanic markers"
```

---

## Task 8: AI Framing API

**Files:**
- Create: `src/app/api/frame/route.ts`

- [ ] **Step 1: Create the framing endpoint**

```typescript
// src/app/api/frame/route.ts
import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import { NextResponse } from "next/server";
import { CONTENT_GRAPH } from "@/lib/content-graph";
import { FRAMING_HINTS } from "@/lib/framing-hints";
import type { ExperimentProfile } from "@/lib/experiment-types";
import { DIMENSION_LABELS } from "@/lib/experiment-types";
import { PROFILE_CONTENT } from "@/lib/profile-content";

const requestSchema = z.object({
  type: z.literal("frame"),
  nodeId: z.string(),
  profile: z.object({
    experimentNumber: z.number(),
    persuasion: z.enum(["results", "process", "character"]),
    learning: z.enum(["exploratory", "structured", "social"]),
    education: z.enum(["practice", "individualization", "inspiration"]),
    motivation: z.enum(["mastery", "purpose", "relatedness"]),
    sharing: z.enum(["surprise", "utility", "emotion"]),
  }),
  visitedNodes: z.array(z.string()),
  previousNodeId: z.string().optional(),
});

const responseSchema = z.object({
  introduction: z.string(),
  transition: z.string().optional(),
  hookLabels: z.record(z.string()).optional(),
  learningMechanic: z
    .object({
      type: z.enum(["testing-effect", "spaced-retrieval"]),
      content: z.string(),
      answer: z.string().optional(),
    })
    .optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = requestSchema.parse(body);

    const node = CONTENT_GRAPH[parsed.nodeId];
    if (!node) {
      return NextResponse.json({ error: "Node not found" }, { status: 404 });
    }

    const hints = FRAMING_HINTS[parsed.nodeId];
    const previousNode = parsed.previousNodeId
      ? CONTENT_GRAPH[parsed.previousNodeId]
      : null;

    const persuasionHint = hints?.[parsed.profile.persuasion] ?? "";
    const motivationHint = hints?.[parsed.profile.motivation] ?? "";

    const systemPrompt = `You are Max Marowsky's portfolio framing engine. You generate short, personalized introductions and transitions for content blocks.

VISITOR PROFILE:
- Persuasion: ${parsed.profile.persuasion} (${DIMENSION_LABELS.persuasion[parsed.profile.persuasion]})
- Learning: ${parsed.profile.learning} (${DIMENSION_LABELS.learning[parsed.profile.learning]})
- Motivation: ${parsed.profile.motivation} (${DIMENSION_LABELS.motivation[parsed.profile.motivation]})

CURRENT NODE: "${parsed.nodeId}"
${persuasionHint ? `PERSUASION EMPHASIS: ${persuasionHint}` : ""}
${motivationHint ? `MOTIVATION EMPHASIS: ${motivationHint}` : ""}
${previousNode ? `PREVIOUS NODE: "${parsed.previousNodeId}" (transition from there)` : ""}
VISITED SO FAR: ${parsed.visitedNodes.join(", ") || "none"}

RULES:
- Introduction: 1-2 sentences that frame the upcoming content. Subtly match the visitor's persuasion mode.
- Transition: Only if previousNodeId provided. 1 sentence connecting previous topic to this one.
- Hook labels: Only override if you can make them more relevant to this visitor. Use the existing labels as defaults.
- Learning mechanic: ${node.testingEffectQuestion ? `This node has a testing-effect question available: "${node.testingEffectQuestion.question}" (answer: "${node.testingEffectQuestion.answer}"). Include it if the visitor hasn't seen too many already.` : node.spacedRetrievalRef && parsed.visitedNodes.includes(node.spacedRetrievalRef) ? `This node references back to "${node.spacedRetrievalRef}" which the visitor has already seen. Create a spaced-retrieval callback.` : "No learning mechanic for this node."}

Be warm, concise, natural. Never mention that you're personalizing. Write in English.`;

    const { object } = await generateObject({
      model: anthropic("claude-sonnet-4-5-20241022"),
      schema: responseSchema,
      prompt: systemPrompt,
    });

    return NextResponse.json(object);
  } catch (error) {
    // Return empty framing on error — the static content still works
    return NextResponse.json({
      introduction: "",
    });
  }
}
```

Note: Check if `PROFILE_CONTENT` exists at `src/lib/profile-content.ts` — it's referenced in the existing chat route. If it exists, import it for additional context. If not, remove that import.

- [ ] **Step 2: Test the endpoint**

Run dev server, then:

```bash
curl -X POST http://localhost:3000/api/frame \
  -H "Content-Type: application/json" \
  -d '{
    "type": "frame",
    "nodeId": "startup-story",
    "profile": {
      "experimentNumber": 1,
      "persuasion": "process",
      "learning": "exploratory",
      "education": "practice",
      "motivation": "mastery",
      "sharing": "surprise"
    },
    "visitedNodes": ["school-gets-wrong"],
    "previousNodeId": "school-gets-wrong"
  }'
```

Expected: JSON with `introduction` string, possibly `transition` and `learningMechanic`.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/frame/route.ts
git commit -m "feat: add AI framing endpoint for personalized content wrapping"
```

---

## Task 9: Act 4 — The Reveal

**Files:**
- Create: `src/components/Reveal.tsx`

- [ ] **Step 1: Create Reveal component**

```typescript
// src/components/Reveal.tsx
"use client";

import { motion } from "framer-motion";
import type { ExperimentProfile } from "@/lib/experiment-types";
import { DIMENSION_LABELS } from "@/lib/experiment-types";

interface RevealProps {
  profile: ExperimentProfile;
  visitedNodes: string[];
  onShare: () => void;
  onNewJourney: () => void;
}

const REVEAL_EXPLANATIONS: Record<string, Record<string, string>> = {
  persuasion: {
    results:
      "Because you value results, I told you my story through impact numbers and concrete outcomes.",
    process:
      "Because you value thinking processes, I told you my startup story as a problem-solving journey, not a success story.",
    character:
      "Because you connect with personality, I led with personal stories and what drives me as a person.",
  },
  learning: {
    exploratory:
      "You got more freedom to explore — more paths to choose from at every step — because you learn by doing.",
    structured:
      "I gave you a clearer, more guided path through my story — because you prefer structure when learning something new.",
    social:
      "I kept things conversational and invited you to ask questions — because you learn best through dialogue.",
  },
  motivation: {
    mastery:
      "I emphasized the architecture decisions and technical depth behind my projects — because mastery drives you.",
    purpose:
      "I emphasized how my work impacts education and why it matters — because purpose drives you.",
    relatedness:
      "I emphasized the teams I've built and the people I've worked with — because connection drives you.",
  },
  sharing: {
    surprise:
      "You're seeing this reveal right now — because you share things that break expectations. Hint hint.",
    utility:
      "I designed this reveal to be genuinely useful — because you share things others can learn from.",
    emotion:
      "I designed this reveal to resonate — because you share things that move you.",
  },
};

const DIMENSION_COLORS: Record<string, string> = {
  persuasion: "bg-blue-500",
  learning: "bg-green-500",
  motivation: "bg-purple-500",
  education: "bg-amber-500",
  sharing: "bg-orange-500",
};

const DIMENSION_TITLES: Record<string, string> = {
  persuasion: "What convinces you",
  learning: "How you learn",
  motivation: "What drives you",
  education: "Your education wish",
  sharing: "What you share",
};

export default function Reveal({ profile, visitedNodes, onShare, onNewJourney }: RevealProps) {
  const dimensions = ["persuasion", "learning", "education", "motivation", "sharing"] as const;
  // Pseudo progress values for visual variety
  const progressValues: Record<string, number> = {
    persuasion: 0.75,
    learning: 0.85,
    education: 0.7,
    motivation: 0.65,
    sharing: 0.8,
  };

  return (
    <motion.div
      className="max-w-2xl mx-auto px-4 py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Header */}
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-xs tracking-[3px] text-neutral-400 mb-3 uppercase">
          Experiment #{profile.experimentNumber} — Result
        </p>
        <h2 className="font-serif text-2xl md:text-3xl text-neutral-900 dark:text-neutral-100">
          Thank you. Here&apos;s what I learned about you.
        </h2>
      </motion.div>

      {/* Part 1: Profile */}
      <motion.div
        className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-xs tracking-[2px] text-neutral-400 mb-5 uppercase">Your Profile</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {dimensions.map((dim) => (
            <div key={dim}>
              <p className="text-xs text-neutral-400 mb-1">{DIMENSION_TITLES[dim]}</p>
              <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                {DIMENSION_LABELS[dim][profile[dim]]}
              </p>
              <div className="h-1.5 bg-neutral-100 dark:bg-neutral-700 rounded-full mt-2">
                <motion.div
                  className={`h-1.5 rounded-full ${DIMENSION_COLORS[dim]}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressValues[dim] * 100}%` }}
                  transition={{ delay: 0.8 + dimensions.indexOf(dim) * 0.1, duration: 0.6 }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Part 2: What I did with it */}
      <motion.div
        className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
      >
        <p className="text-xs tracking-[2px] text-neutral-400 mb-5 uppercase">
          What I did with it
        </p>
        <div className="space-y-4">
          {(["persuasion", "learning", "motivation", "sharing"] as const).map((dim) => (
            <div key={dim} className="flex gap-3">
              <span className="text-orange-500 flex-shrink-0 mt-0.5">&rarr;</span>
              <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                {REVEAL_EXPLANATIONS[dim][profile[dim]]}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Part 3: Punchline */}
      <motion.div
        className="bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-200 dark:border-orange-800 p-6 mb-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4 }}
      >
        <p className="text-base text-neutral-600 dark:text-neutral-300 leading-relaxed">
          Every person who visits this site experiences a different version of me.
          <br />
          Yours was unique.
        </p>
        <p className="text-base text-neutral-900 dark:text-neutral-100 mt-4 italic">
          This is what I want to build at Anthropic — learning experiences that adapt to the
          person, not the other way around.
        </p>
      </motion.div>

      {/* CTAs */}
      <motion.div
        className="flex flex-col sm:flex-row gap-3 justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
      >
        <button
          onClick={onShare}
          className="px-7 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
        >
          Share my result
        </button>
        <a
          href="mailto:max@marowsky.com?subject=Let's%20talk%20—%20from%20your%20Experiment"
          className="px-7 py-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 rounded-lg hover:border-orange-400 transition-colors text-center"
        >
          Invite Max to a conversation
        </a>
      </motion.div>
    </motion.div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Reveal.tsx
git commit -m "feat: add Reveal component with profile, explanations, and punchline"
```

---

## Task 10: Sharing — Shareable Card & Updated Sessions

**Files:**
- Create: `src/app/api/og/[id]/route.tsx`
- Modify: `src/lib/session-store.ts`
- Modify: `src/app/api/sessions/route.ts`
- Modify: `src/app/s/[id]/page.tsx`
- Create: `src/components/ShareableCard.tsx`

- [ ] **Step 1: Update session-store.ts for new SharedSession shape**

Replace the content of `src/lib/session-store.ts`:

```typescript
import { createClient } from "@supabase/supabase-js";
import type { ExperimentProfile, SharedSession } from "./experiment-types";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function saveSession(
  id: string,
  experimentNumber: number,
  profile: ExperimentProfile,
  visitedNodes: string[]
): Promise<void> {
  await supabase.from("sessions").insert({
    id,
    experiment_number: experimentNumber,
    profile: JSON.stringify(profile),
    visited_nodes: JSON.stringify(visitedNodes),
    created_at: new Date().toISOString(),
  });
}

export async function loadSession(id: string): Promise<SharedSession | null> {
  const { data, error } = await supabase
    .from("sessions")
    .select("id, experiment_number, profile, visited_nodes, created_at")
    .eq("id", id)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    experimentNumber: data.experiment_number,
    profile: typeof data.profile === "string" ? JSON.parse(data.profile) : data.profile,
    visitedNodes:
      typeof data.visited_nodes === "string"
        ? JSON.parse(data.visited_nodes)
        : data.visited_nodes,
    createdAt: data.created_at,
  };
}
```

Note: You'll need to update the Supabase `sessions` table schema. Run this migration:

```sql
-- Add new columns (keep old ones for backward compatibility during transition)
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS experiment_number INTEGER;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS profile TEXT;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS visited_nodes TEXT;
```

- [ ] **Step 2: Update sessions API route**

Replace `src/app/api/sessions/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { saveSession, loadSession } from "@/lib/session-store";

export async function POST(req: Request) {
  try {
    const { experimentNumber, profile, visitedNodes } = await req.json();
    const id = nanoid(8);
    await saveSession(id, experimentNumber, profile, visitedNodes);
    return NextResponse.json({ id });
  } catch {
    return NextResponse.json({ error: "Failed to save session" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const session = await loadSession(id);
  if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(session);
}
```

- [ ] **Step 3: Create ShareableCard component**

```typescript
// src/components/ShareableCard.tsx
"use client";

import type { ExperimentProfile } from "@/lib/experiment-types";
import { DIMENSION_LABELS } from "@/lib/experiment-types";

interface ShareableCardProps {
  profile: ExperimentProfile;
}

export default function ShareableCard({ profile }: ShareableCardProps) {
  return (
    <div className="w-full max-w-md mx-auto bg-gradient-to-br from-neutral-50 to-orange-50 dark:from-neutral-900 dark:to-orange-950/20 p-8 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-lg">
      <p className="text-[10px] tracking-[3px] text-neutral-400 mb-5 uppercase">
        Max Marowsky&apos;s Experiment
      </p>
      <p className="font-serif text-xl text-neutral-900 dark:text-neutral-100 mb-1 leading-snug">
        You are convinced by
      </p>
      <p className="font-serif text-xl font-bold text-orange-600 dark:text-orange-400 mb-5">
        {DIMENSION_LABELS.persuasion[profile.persuasion]}
      </p>
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div>
          <p className="text-[11px] text-neutral-400">Learning style</p>
          <p className="text-sm text-neutral-700 dark:text-neutral-300">
            {DIMENSION_LABELS.learning[profile.learning]}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-neutral-400">Drive</p>
          <p className="text-sm text-neutral-700 dark:text-neutral-300">
            {DIMENSION_LABELS.motivation[profile.motivation]}
          </p>
        </div>
      </div>
      <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
        <p className="text-xs text-neutral-400">
          Every journey is unique · Start yours
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Rewrite shared session page**

Replace `src/app/s/[id]/page.tsx`:

```typescript
import { loadSession } from "@/lib/session-store";
import { notFound } from "next/navigation";
import ShareableCard from "@/components/ShareableCard";
import Link from "next/link";

export default async function SharedSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await loadSession(id);
  if (!session) notFound();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <ShareableCard profile={session.profile} />
      <div className="mt-8 text-center">
        <Link
          href="/"
          className="px-7 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors inline-block"
        >
          Start your own experiment
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create OG image route for Slack previews**

```typescript
// src/app/api/og/[id]/route.tsx
import { ImageResponse } from "next/og";
import { loadSession } from "@/lib/session-store";
import { DIMENSION_LABELS } from "@/lib/experiment-types";

export const runtime = "edge";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await loadSession(id);

  if (!session) {
    return new Response("Not found", { status: 404 });
  }

  const { profile } = session;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px 80px",
          background: "linear-gradient(135deg, #faf8f5, #fff8f0)",
          fontFamily: "Georgia, serif",
        }}
      >
        <p style={{ fontSize: "14px", letterSpacing: "3px", color: "#999", marginBottom: "30px" }}>
          MAX MAROWSKY&apos;S EXPERIMENT
        </p>
        <p style={{ fontSize: "32px", color: "#1a1a1a", marginBottom: "8px" }}>
          You are convinced by
        </p>
        <p style={{ fontSize: "40px", color: "#e8734a", fontWeight: "bold", marginBottom: "40px" }}>
          {DIMENSION_LABELS.persuasion[profile.persuasion]}
        </p>
        <div style={{ display: "flex", gap: "60px", marginBottom: "40px" }}>
          <div>
            <p style={{ fontSize: "14px", color: "#999" }}>Learning style</p>
            <p style={{ fontSize: "20px", color: "#333" }}>
              {DIMENSION_LABELS.learning[profile.learning]}
            </p>
          </div>
          <div>
            <p style={{ fontSize: "14px", color: "#999" }}>Drive</p>
            <p style={{ fontSize: "20px", color: "#333" }}>
              {DIMENSION_LABELS.motivation[profile.motivation]}
            </p>
          </div>
        </div>
        <p style={{ fontSize: "16px", color: "#999", borderTop: "1px solid #e0d8d0", paddingTop: "20px" }}>
          Every journey is unique · Start yours
        </p>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
```

- [ ] **Step 6: Add OG meta tags to shared page**

Add metadata to `src/app/s/[id]/page.tsx`:

```typescript
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: "Max Marowsky's Experiment — My Result",
    description: "Every journey is unique. Start your own experiment.",
    openGraph: {
      images: [`/api/og/${id}`],
    },
  };
}
```

- [ ] **Step 7: Commit**

```bash
git add src/lib/session-store.ts src/app/api/sessions/route.ts src/components/ShareableCard.tsx src/app/s/[id]/page.tsx src/app/api/og/[id]/route.tsx
git commit -m "feat: add shareable card, OG image, and updated session sharing"
```

---

## Task 11: Update Chat API with Profile-Aware Personalization

**Files:**
- Modify: `src/app/api/chat/route.ts`

- [ ] **Step 1: Update the system prompt to accept experiment profile**

In the request validation, add optional `profile` field:

```typescript
// Add to request body parsing:
const { messages, profile, wrapUp } = await req.json();
// profile is ExperimentProfile | undefined
```

Update the system prompt construction to include profile-aware instructions when profile is provided:

```typescript
// After the existing system prompt, append if profile exists:
if (profile) {
  systemPrompt += `\n\nVISITOR PROFILE (personalize your responses subtly):
- Persuasion mode: ${profile.persuasion} — ${profile.persuasion === 'results' ? 'emphasize numbers, impact, outcomes' : profile.persuasion === 'process' ? 'emphasize thinking, frameworks, decision-making' : 'emphasize stories, personality, human side'}
- Learning style: ${profile.learning} — ${profile.learning === 'exploratory' ? 'encourage exploration, offer more paths' : profile.learning === 'structured' ? 'be organized and sequential' : 'be conversational and dialogue-driven'}
- Motivation: ${profile.motivation} — ${profile.motivation === 'mastery' ? 'emphasize technical depth and craft' : profile.motivation === 'purpose' ? 'emphasize mission and impact' : 'emphasize teamwork and collaboration'}

IMPORTANT: Never mention that you are personalizing. The adaptation should feel natural.`;
}
```

Remove the old preferences-based prompt that referenced `infoDepth`, `contentFocus`, etc.

- [ ] **Step 2: Commit**

```bash
git add src/app/api/chat/route.ts
git commit -m "feat: update chat API with experiment profile-aware personalization"
```

---

## Task 12: Wire Everything Together in ConversationView

**Files:**
- Modify: `src/components/ConversationView.tsx`

This is the largest change. ConversationView needs to:
1. Replace onboarding with interview flow
2. Use ExperimentContext instead of PreferencesContext
3. Call framing API for each node
4. Show AnalyseBar instead of ProgressRing
5. Trigger Reveal instead of JourneyWrapUp
6. Remove all gamification code
7. Use education-based starter hooks

- [ ] **Step 1: Update imports**

Replace old imports with new ones:

```typescript
// Remove:
import OnboardingChat from "./OnboardingChat";
import ProgressRing from "./gamification/ProgressRing";
import AchievementToast from "./gamification/AchievementToast";
import JourneyWrapUp from "./JourneyWrapUp";
import { useGamification } from "@/hooks/useGamification";
import { FOCUS_STARTER_HOOKS, ACHIEVEMENT_DEFINITIONS } from "@/lib/content-graph";
import { usePreferences } from "@/lib/preferences";

// Add:
import Interview from "./Interview";
import AnalyseBar from "./AnalyseBar";
import Reveal from "./Reveal";
import { useExperiment } from "@/lib/experiment-context";
import { useSettings } from "@/lib/preferences";
import { EDUCATION_STARTER_HOOKS } from "@/lib/experiment-starter-hooks";
import type { ExperimentProfile, FrameResponse } from "@/lib/experiment-types";
```

- [ ] **Step 2: Replace state and context usage**

Replace the preferences-based state with experiment-based state:

```typescript
// Replace:
// const { preferences, setPreferences, isOnboarded, resetPreferences } = usePreferences();
// With:
const { profile, setProfile, isInterviewed, resetExperiment } = useExperiment();
const { settings } = useSettings();

// Remove gamification state:
// const gamification = useGamification(visitedNodes, freeQuestionCount, preferences?.gamified ?? false, foundCoffeeEasterEgg);

// Add reveal state:
const [showReveal, setShowReveal] = useState(false);
const [revealDismissed, setRevealDismissed] = useState(false);
const REVEAL_THRESHOLD = 8;
```

- [ ] **Step 3: Replace onboarding flow with interview**

Replace the onboarding conditional rendering:

```typescript
// Old:
// if (!isOnboarded) return <Landing onStartJourney={() => setShowOnboarding(true)} />;
// if (showOnboarding) return <OnboardingChat onComplete={...} onSkip={...} />;

// New:
const [showInterview, setShowInterview] = useState(false);

if (!isInterviewed && !showInterview) {
  return <Landing onStartJourney={(num) => {
    // Store experiment number temporarily, show interview
    experimentNumberRef.current = num;
    setShowInterview(true);
  }} />;
}

if (!isInterviewed && showInterview) {
  return (
    <Interview
      experimentNumber={experimentNumberRef.current!}
      onComplete={(p) => {
        setProfile(p);
        setShowInterview(false);
      }}
    />
  );
}
```

Use a ref to hold the experiment number between landing and interview:

```typescript
const experimentNumberRef = useRef<number | null>(null);
```

- [ ] **Step 4: Replace starter hooks with education-based hooks**

In the Opening component or wherever starter hooks are displayed:

```typescript
// Old:
// const starterHooks = preferences?.contentFocus
//   ? FOCUS_STARTER_HOOKS[preferences.contentFocus]
//   : ROOT_HOOKS;

// New:
const starterHooks = profile
  ? EDUCATION_STARTER_HOOKS[profile.education]
  : ROOT_HOOKS;
```

- [ ] **Step 5: Add framing API call to addNodeBlock**

Modify `addNodeBlock` to call the framing API and prepend the introduction:

```typescript
const addNodeBlock = async (nodeId: string) => {
  const node = CONTENT_GRAPH[nodeId];
  if (!node) return;

  const updatedVisited = new Set(visitedNodes);
  updatedVisited.add(nodeId);
  setVisitedNodes(updatedVisited);
  setVisitOrder((prev) => [...prev, nodeId]);

  // Get personalized framing
  let framing: FrameResponse | null = null;
  if (profile) {
    try {
      const res = await fetch("/api/frame", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "frame",
          nodeId,
          profile,
          visitedNodes: Array.from(updatedVisited),
          previousNodeId: blocks.length > 0 ? blocks[blocks.length - 1].id : undefined,
        }),
      });
      framing = await res.json();
    } catch {
      // Continue without framing
    }
  }

  const depth = profile?.learning === "structured" ? "overview" : "deep-dive";
  const block = nodeToBlock(node, updatedVisited, depth as "overview" | "deep-dive");

  // Prepend framing introduction to text
  if (framing?.introduction) {
    block.text = framing.introduction + "\n\n" + block.text;
  }
  if (framing?.transition) {
    block.text = framing.transition + " " + block.text;
  }

  // Override hook labels if provided
  if (framing?.hookLabels) {
    block.hooks = block.hooks.map((h) => ({
      ...h,
      label: framing!.hookLabels![h.targetId ?? ""] ?? h.label,
    }));
  }

  setBlocks((prev) => [...prev, block]);
  // ... rest of existing logic (messages, etc.)
};
```

- [ ] **Step 6: Replace ProgressRing with AnalyseBar and add reveal trigger**

In the render section:

```typescript
// Remove:
// {preferences?.gamified && <ProgressRing ... />}
// {preferences?.gamified && gamification.currentToast && <AchievementToast ... />}

// Add (always visible during exploration):
<AnalyseBar
  visitedCount={visitedNodes.size}
  threshold={REVEAL_THRESHOLD}
  onRevealClick={() => setShowReveal(true)}
  revealDismissed={revealDismissed}
/>

// Add reveal trigger message in conversation (after threshold):
// This goes as a special block or overlay when visitedNodes.size >= REVEAL_THRESHOLD
```

- [ ] **Step 7: Replace JourneyWrapUp with Reveal**

```typescript
// When showReveal is true, render Reveal:
if (showReveal && profile) {
  return (
    <Reveal
      profile={profile}
      visitedNodes={Array.from(visitedNodes)}
      onShare={handleShare}
      onNewJourney={() => {
        resetExperiment();
        // Reset all local state
        setBlocks([]);
        setVisitedNodes(new Set());
        setMessages([]);
        setShowReveal(false);
        setRevealDismissed(false);
        setShowInterview(false);
      }}
    />
  );
}
```

- [ ] **Step 8: Update handleShare to use new session format**

```typescript
const handleShare = async () => {
  if (!profile) return;
  try {
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        experimentNumber: profile.experimentNumber,
        profile,
        visitedNodes: Array.from(visitedNodes),
      }),
    });
    const { id } = await res.json();
    const url = `${window.location.origin}/s/${id}`;
    await navigator.clipboard.writeText(url);
    // Show toast or notification
  } catch {
    // Handle error
  }
};
```

- [ ] **Step 9: Remove all gamification references**

Remove:
- All `useGamification` usage
- Gem injection effects
- Achievement toast rendering
- `foundCoffeeEasterEgg` state (keep coffee easter egg logic if desired, or remove)
- All references to `preferences.gamified`

- [ ] **Step 10: Pass profile to chat API calls**

In `submitFreeQuestion`, update the API call:

```typescript
const res = await fetch("/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    messages: [...messages, { role: "user", content: question }],
    profile, // Pass profile instead of preferences
  }),
});
```

- [ ] **Step 11: Verify the full flow works**

Start dev server. Walk through:
1. Landing → "Start Experiment" → Interview (5 questions) → Exploration with framing → AnalyseBar fills → Reveal triggers → Share works

- [ ] **Step 12: Commit**

```bash
git add src/components/ConversationView.tsx
git commit -m "feat: wire experiment flow into ConversationView"
```

---

## Task 13: Update SettingsPanel to use new SettingsContext

**Files:**
- Modify: `src/components/SettingsPanel.tsx`

- [ ] **Step 1: Update SettingsPanel imports and hook usage**

The current SettingsPanel uses `usePreferences()` and exposes InfoDepth, ContentFocus, and gamification toggles. Update it to:

1. Replace `usePreferences()` with `useSettings()` from the new preferences module
2. Remove InfoDepth, ContentFocus, and gamification options (these are now derived from the interview)
3. Keep only Visual Style and Dark Mode toggles

```typescript
// Replace:
import { usePreferences } from "@/lib/preferences";
// With:
import { useSettings } from "@/lib/preferences";

// Replace:
// const { preferences, updatePreference } = usePreferences();
// With:
const { settings, updateSetting } = useSettings();
```

Remove all references to `InfoDepth`, `ContentFocus`, `gamified`, and their corresponding UI sections. Keep only:
- Visual Style toggle (Notebook / Colorful)
- Dark Mode toggle

- [ ] **Step 2: Verify the panel works**

Open the settings panel in the browser. Should show only Visual Style and Dark Mode.

- [ ] **Step 3: Commit**

```bash
git add src/components/SettingsPanel.tsx
git commit -m "feat: slim SettingsPanel to visual-only settings"
```

---

## Task 14: Remove Old Files

**Files:**
- Remove: `src/components/gamification/ProgressRing.tsx`
- Remove: `src/components/gamification/AchievementToast.tsx`
- Remove: `src/hooks/useGamification.ts`
- Remove: `src/components/OnboardingChat.tsx`
- Remove: `src/components/JourneyWrapUp.tsx`
- Remove: `src/app/s/[id]/SharedSessionView.tsx`

- [ ] **Step 1: Delete old files**

```bash
rm src/components/gamification/ProgressRing.tsx
rm src/components/gamification/AchievementToast.tsx
rm src/hooks/useGamification.ts
rm src/components/OnboardingChat.tsx
rm src/components/JourneyWrapUp.tsx
rm src/app/s/[id]/SharedSessionView.tsx
```

- [ ] **Step 2: Remove ACHIEVEMENT_DEFINITIONS from content-graph.ts**

Remove the `ACHIEVEMENT_DEFINITIONS` export and its array. Keep `FOCUS_STARTER_HOOKS` for now (it may be referenced elsewhere) but it's no longer used by the main flow.

- [ ] **Step 3: Remove AchievementDefinition from types.ts**

Remove the `AchievementDefinition` interface if not already done.

- [ ] **Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit`

Expected: No errors. If there are remaining references to deleted files, fix them.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove old gamification, onboarding, and wrapup components"
```

---

## Task 15: Rabbit Hole 1 — Behind the Science

**Files:**
- Create: `src/components/rabbit-holes/BehindTheScience.tsx`
- Modify: `src/components/ContentBlock.tsx`

- [ ] **Step 1: Create the BehindTheScience overlay component**

```typescript
// src/components/rabbit-holes/BehindTheScience.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";

interface BehindTheScienceProps {
  isOpen: boolean;
  onClose: () => void;
  principle: {
    name: string;
    description: string;
    paper: string;
  } | null;
}

const LEARNING_PRINCIPLES: Record<string, { name: string; description: string; paper: string }> = {
  "testing-effect": {
    name: "Testing Effect",
    description:
      "Actively retrieving information from memory strengthens long-term retention more than passive re-reading. When you estimated an answer before seeing it, your brain encoded the information more deeply.",
    paper: "Roediger & Karpicke (2006). Test-Enhanced Learning. Psychological Science, 17(3), 249-255.",
  },
  "spaced-retrieval": {
    name: "Spaced Retrieval",
    description:
      "Information encountered at spaced intervals is retained better than information studied in a single session. When an earlier topic resurfaced in a new context, it strengthened your memory of both.",
    paper: "Karpicke & Bauernschmidt (2011). Spaced retrieval: Absolute spacing enhances learning. Journal of Experimental Psychology, 137(5), 1250.",
  },
  interleaving: {
    name: "Interleaving",
    description:
      "Mixing different topics during study leads to better discrimination and long-term retention than studying one topic at a time. The deliberate mixing of themes was designed to deepen your understanding.",
    paper: "Rohrer & Taylor (2007). The shuffling of mathematics problems improves learning. Instructional Science, 35(6), 481-498.",
  },
  personalization: {
    name: "Adaptive Presentation",
    description:
      "Content presented in alignment with a learner's cognitive preferences is processed more fluently and remembered better. The entire experience was adapted to how you process information.",
    paper: "Kalyuga (2007). Expertise Reversal Effect and Its Implications for Learner-Tailored Instruction. Educational Psychology Review, 19(4), 509-539.",
  },
};

export { LEARNING_PRINCIPLES };

export default function BehindTheScience({ isOpen, onClose, principle }: BehindTheScienceProps) {
  if (!principle) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          className="mt-3 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm"
        >
          <div className="flex justify-between items-start mb-2">
            <p className="font-semibold text-blue-800 dark:text-blue-300">{principle.name}</p>
            <button
              onClick={onClose}
              className="text-blue-400 hover:text-blue-600 text-xs"
            >
              close
            </button>
          </div>
          <p className="text-blue-700 dark:text-blue-300/80 leading-relaxed mb-2">
            {principle.description}
          </p>
          <p className="text-blue-500 dark:text-blue-400 text-xs italic">{principle.paper}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Add subtle science icon to ContentBlock**

In `src/components/ContentBlock.tsx`, add a tiny microscope/beaker icon in the bottom-right corner of each block. It should be very subtle (low opacity, tiny size). Clicking it opens the BehindTheScience overlay for that block.

The icon only appears on blocks where a learning mechanic was applied. Pass a `sciencePrinciple` prop to ContentBlock:

```typescript
// Add to ContentBlock props:
sciencePrinciple?: string; // key from LEARNING_PRINCIPLES

// In the render, add at the bottom of the block:
{sciencePrinciple && (
  <>
    <button
      onClick={() => setScienceOpen(!scienceOpen)}
      className="absolute bottom-2 right-2 opacity-[0.15] hover:opacity-60 transition-opacity text-xs"
      title="?"
    >
      🔬
    </button>
    <BehindTheScience
      isOpen={scienceOpen}
      onClose={() => setScienceOpen(false)}
      principle={LEARNING_PRINCIPLES[sciencePrinciple]}
    />
  </>
)}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/rabbit-holes/BehindTheScience.tsx src/components/ContentBlock.tsx
git commit -m "feat: add Behind the Science rabbit hole (hidden learning principle overlays)"
```

---

## Task 16: Rabbit Hole 2 — The Architect View

**Files:**
- Create: `src/hooks/useKonamiCode.ts`
- Create: `src/components/rabbit-holes/ArchitectView.tsx`

- [ ] **Step 1: Create Konami code hook**

```typescript
// src/hooks/useKonamiCode.ts
"use client";

import { useEffect, useState, useCallback } from "react";

const KONAMI_SEQUENCE = [
  "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
  "b", "a",
];

export function useKonamiCode(): boolean {
  const [activated, setActivated] = useState(false);
  const [position, setPosition] = useState(0);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (activated) return;
      const expected = KONAMI_SEQUENCE[position];
      if (e.key === expected || e.key.toLowerCase() === expected) {
        const next = position + 1;
        if (next === KONAMI_SEQUENCE.length) {
          setActivated(true);
        } else {
          setPosition(next);
        }
      } else {
        setPosition(0);
      }
    },
    [position, activated]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return activated;
}
```

- [ ] **Step 2: Create ArchitectView component**

```typescript
// src/components/rabbit-holes/ArchitectView.tsx
"use client";

import { motion } from "framer-motion";
import { CONTENT_GRAPH } from "@/lib/content-graph";

interface ArchitectViewProps {
  visitedNodes: Set<string>;
  onClose: () => void;
}

export default function ArchitectView({ visitedNodes, onClose }: ArchitectViewProps) {
  const nodes = Object.values(CONTENT_GRAPH);

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-[#0a0a1a] text-green-400 overflow-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Terminal header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-green-900/30">
        <div className="font-mono text-sm">
          <span className="text-green-600">$</span> architect-view --mode=interactive
        </div>
        <button
          onClick={onClose}
          className="text-green-600 hover:text-green-400 font-mono text-sm"
        >
          [ESC] exit
        </button>
      </div>

      <div className="p-6 max-w-5xl mx-auto">
        {/* Content Graph Visualization */}
        <div className="mb-12">
          <h2 className="font-mono text-lg text-green-300 mb-4">
            // Content Graph — {nodes.length} nodes, {nodes.reduce((a, n) => a + n.hooks.length, 0)} edges
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {nodes.map((node) => (
              <div
                key={node.id}
                className={`p-3 rounded border font-mono text-xs ${
                  visitedNodes.has(node.id)
                    ? "border-green-500 bg-green-950/30 text-green-300"
                    : "border-green-900/30 bg-green-950/10 text-green-700"
                }`}
              >
                <p className="font-bold truncate">{node.id}</p>
                <p className="text-green-600 mt-1">{node.hooks.length} hooks</p>
                {node.gem && <p className="text-amber-500 mt-1">gem</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Architecture Commentary */}
        <div className="mb-12">
          <h2 className="font-mono text-lg text-green-300 mb-4">
            // Architecture Decisions
          </h2>
          <div className="space-y-4 font-mono text-sm text-green-400/80 leading-relaxed">
            <div>
              <p className="text-green-300">/* Why a content graph instead of a CMS? */</p>
              <p>The graph structure allows non-linear exploration — every visitor creates their own path. A CMS would impose a linear narrative. The graph IS the product philosophy: learner agency over prescribed curricula.</p>
            </div>
            <div>
              <p className="text-green-300">/* Why hybrid personalization? */</p>
              <p>Static content for reliability, AI framing for adaptivity. The core facts never hallucinate. The wrapping adapts. Same pattern I&apos;d use at scale — source of truth + adaptive layer.</p>
            </div>
            <div>
              <p className="text-green-300">/* Why the interview instead of tracking? */</p>
              <p>Explicit consent + genuine interaction &gt; surveillance. The visitor knows they&apos;re being asked. They just don&apos;t know why — yet. That&apos;s the ethical version of personalization.</p>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div>
          <h2 className="font-mono text-lg text-green-300 mb-4">
            // Stack
          </h2>
          <pre className="text-green-400/60 text-xs">
{`Next.js 14 (App Router) · TypeScript · Tailwind CSS
Anthropic Claude (AI framing + free-form chat)
Supabase (sessions + experiment counter)
Framer Motion (animations)
Vercel (hosting + OG image generation)`}
          </pre>
        </div>
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 3: Wire into ConversationView**

In ConversationView, add:

```typescript
import { useKonamiCode } from "@/hooks/useKonamiCode";
import ArchitectView from "./rabbit-holes/ArchitectView";

// In component body:
const konamiActivated = useKonamiCode();
const [showArchitect, setShowArchitect] = useState(false);

useEffect(() => {
  if (konamiActivated) setShowArchitect(true);
}, [konamiActivated]);

// In render:
{showArchitect && (
  <ArchitectView
    visitedNodes={visitedNodes}
    onClose={() => setShowArchitect(false)}
  />
)}
```

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useKonamiCode.ts src/components/rabbit-holes/ArchitectView.tsx src/components/ConversationView.tsx
git commit -m "feat: add Architect View rabbit hole (Konami code activated)"
```

---

## Task 17: Rabbit Hole 3 — The Comparison

**Files:**
- Create: `src/components/rabbit-holes/Comparison.tsx`

- [ ] **Step 1: Create Comparison component**

This shows anonymized aggregate data. Since we don't have real aggregate data yet, we'll use realistic hardcoded distributions that can later be replaced with real Supabase queries.

```typescript
// src/components/rabbit-holes/Comparison.tsx
"use client";

import { motion } from "framer-motion";
import type { ExperimentProfile } from "@/lib/experiment-types";
import { DIMENSION_LABELS } from "@/lib/experiment-types";

interface ComparisonProps {
  profile: ExperimentProfile;
  onClose: () => void;
}

// Hardcoded distributions (replace with real data later)
const DISTRIBUTIONS: Record<string, Record<string, number>> = {
  persuasion: { results: 38, process: 41, character: 21 },
  learning: { exploratory: 45, structured: 35, social: 20 },
  education: { practice: 33, individualization: 42, inspiration: 25 },
  motivation: { mastery: 30, purpose: 44, relatedness: 26 },
  sharing: { surprise: 47, utility: 31, emotion: 22 },
};

export default function Comparison({ profile, onClose }: ComparisonProps) {
  const dimensions = ["persuasion", "learning", "education", "motivation", "sharing"] as const;

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-white/95 dark:bg-neutral-900/95 backdrop-blur overflow-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="flex justify-between items-start mb-8">
          <div>
            <p className="text-xs tracking-[3px] text-neutral-400 uppercase mb-2">
              Experiment #{profile.experimentNumber}
            </p>
            <h2 className="font-serif text-2xl text-neutral-900 dark:text-neutral-100">
              How you compare
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 text-sm"
          >
            close
          </button>
        </div>

        <div className="space-y-8">
          {dimensions.map((dim) => {
            const dist = DISTRIBUTIONS[dim];
            const chosen = profile[dim];
            const chosenPct = dist[chosen];

            return (
              <div key={dim}>
                <p className="text-xs tracking-[2px] text-neutral-400 uppercase mb-3">
                  {dim}
                </p>
                <div className="space-y-2">
                  {Object.entries(dist).map(([value, pct]) => {
                    const isChosen = value === chosen;
                    return (
                      <div key={value} className="flex items-center gap-3">
                        <div className="w-40 text-sm text-right text-neutral-500 dark:text-neutral-400 truncate">
                          {DIMENSION_LABELS[dim][value]}
                        </div>
                        <div className="flex-1 h-6 bg-neutral-100 dark:bg-neutral-800 rounded overflow-hidden">
                          <motion.div
                            className={`h-full rounded ${
                              isChosen
                                ? "bg-orange-500"
                                : "bg-neutral-300 dark:bg-neutral-600"
                            }`}
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                          />
                        </div>
                        <div className={`w-10 text-sm text-right ${
                          isChosen ? "text-orange-600 font-semibold" : "text-neutral-400"
                        }`}>
                          {pct}%
                        </div>
                        {isChosen && (
                          <span className="text-orange-500 text-xs">← you</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-center text-sm text-neutral-400">
          Based on anonymized visitor data
        </div>
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 2: Wire discovery mechanism**

The Comparison is discovered by clicking the experiment number on the hook screen. In `ExperimentHook.tsx`, make the experiment number clickable after the experiment is complete (i.e., when viewing from the Reveal or AnalyseBar).

Alternatively, wire it into the Reveal screen — clicking the "Experiment #N" text at the top of the Reveal opens the Comparison. Add to `Reveal.tsx`:

```typescript
const [showComparison, setShowComparison] = useState(false);

// Make the experiment number clickable:
<button
  onClick={() => setShowComparison(true)}
  className="text-xs tracking-[3px] text-neutral-400 mb-3 uppercase hover:text-orange-500 transition-colors cursor-pointer"
>
  Experiment #{profile.experimentNumber} — Result
</button>

// Render comparison:
{showComparison && (
  <Comparison profile={profile} onClose={() => setShowComparison(false)} />
)}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/rabbit-holes/Comparison.tsx src/components/Reveal.tsx
git commit -m "feat: add Comparison rabbit hole (click experiment number to discover)"
```

---

## Task 18: Final Integration Test & Cleanup

**Files:**
- Various — fix any remaining TypeScript errors and broken imports

- [ ] **Step 1: Run TypeScript compiler**

Run: `npx tsc --noEmit 2>&1`

Fix any remaining type errors. Common issues:
- Old `UserPreferences` shape referenced somewhere
- Missing imports for new types
- `onStartJourney` signature change in Landing

- [ ] **Step 2: Run the dev server and walk through the full flow**

```bash
npm run dev
```

Test the complete journey:
1. Open `/` → see "Experiment #N"
2. Click "Start Experiment" → Interview (5 questions)
3. Answer all → Exploration begins with personalized starter hooks
4. Click through 8+ nodes → AnalyseBar fills, reveal prompt appears
5. Click "Show me" → Reveal screen with profile + explanations
6. Click "Share my result" → Session saved, link copied
7. Open shared link `/s/[id]` → Card + CTA
8. Test Konami code → Architect View
9. Click microscope icon on a block → Behind the Science
10. Click experiment number on Reveal → Comparison

- [ ] **Step 3: Run linter**

Run: `npx next lint`

Fix any lint errors.

- [ ] **Step 4: Build for production**

Run: `npm run build`

Fix any build errors.

- [ ] **Step 5: Commit final fixes**

```bash
git add -A
git commit -m "fix: resolve TypeScript errors and integration issues"
```

---

## Task 19: Add .superpowers to .gitignore

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Add .superpowers to gitignore**

Add this line to `.gitignore` if not already present:

```
.superpowers/
```

- [ ] **Step 2: Commit**

```bash
git add .gitignore
git commit -m "chore: add .superpowers to gitignore"
```
