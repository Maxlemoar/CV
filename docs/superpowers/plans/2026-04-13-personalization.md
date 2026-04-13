# Recruiter Experience Personalization — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add recruiter personalization (visual style, info depth, content focus) via a conversational onboarding flow that transforms the UI.

**Architecture:** Preferences stored in React context, consumed by all components. Theme switching via CSS custom properties on `data-theme` attribute. Content graph extended with compact text variants. Chat API receives preferences for system prompt injection.

**Tech Stack:** React Context, Tailwind CSS 4 custom properties, Framer Motion (existing), Next.js App Router

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `src/lib/types.ts` | Modify | Add preference types |
| `src/lib/preferences.tsx` | Create | React context provider + hook for preferences |
| `src/lib/content-graph.ts` | Modify | Add `contentCompact` field to all 18 nodes, add `FOCUS_STARTER_HOOKS` |
| `src/app/globals.css` | Modify | Add `[data-theme="focused"]` and `[data-theme="colorful"]` CSS blocks |
| `src/app/layout.tsx` | Modify | Wrap app in `PreferencesProvider`, apply `data-theme` to `<html>` |
| `src/components/OnboardingChat.tsx` | Create | 3-question conversational onboarding flow |
| `src/components/ConversationView.tsx` | Modify | Integrate onboarding phase, pass preferences to components |
| `src/components/Opening.tsx` | Modify | Use focus-based starter hooks from preferences |
| `src/components/ContentBlock.tsx` | No change | Receives pre-selected text from ConversationView via nodeToBlock |
| `src/components/SettingsPanel.tsx` | Create | Floating button + panel to change preferences mid-session |
| `src/app/api/chat/route.ts` | Modify | Accept preferences in request body, inject into system prompt |

---

### Task 1: Preference Types and Context

**Files:**
- Modify: `src/lib/types.ts`
- Create: `src/lib/preferences.tsx`

- [ ] **Step 1: Add preference types to types.ts**

Add at the end of `src/lib/types.ts`:

```typescript
export type VisualStyle = "focused" | "colorful";
export type InfoDepth = "overview" | "deep-dive";
export type ContentFocus = "product-builder" | "learning-scientist" | "ai-vision" | "max-personal";

export interface UserPreferences {
  visualStyle: VisualStyle;
  infoDepth: InfoDepth;
  contentFocus: ContentFocus;
}
```

- [ ] **Step 2: Create preferences context**

Create `src/lib/preferences.tsx`:

```tsx
"use client";

import { createContext, useContext, useState, useCallback } from "react";
import type { UserPreferences, VisualStyle, InfoDepth, ContentFocus } from "./types";

const DEFAULT_PREFERENCES: UserPreferences = {
  visualStyle: "focused",
  infoDepth: "deep-dive",
  contentFocus: "product-builder",
};

interface PreferencesContextValue {
  preferences: UserPreferences | null;
  setPreferences: (prefs: UserPreferences) => void;
  updatePreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
  isOnboarded: boolean;
}

const PreferencesContext = createContext<PreferencesContextValue>({
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
```

- [ ] **Step 3: Verify build passes**

Run: `cd /Users/maximilianmarowsky/Code/CV && npx next build`
Expected: Build succeeds (new files not yet imported anywhere)

- [ ] **Step 4: Commit**

```bash
git add src/lib/types.ts src/lib/preferences.tsx
git commit -m "feat: add preference types and React context"
```

---

### Task 2: Theme CSS Custom Properties

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add focused theme CSS block**

Add after the `body::before` block (after line 38) in `src/app/globals.css`:

```css
/* ── Theme: Focused (Paperlike) ─────────────────────────── */
[data-theme="focused"] {
  --color-paper: #F7F3EE;
  --color-paper-dark: #E8E0D4;
  --color-ink: #2C2416;
  --color-ink-light: #A89F91;
  --color-accent: #5C4F3D;
  --color-accent-hover: #3D3529;
  --shadow-neu: 0 1px 2px rgba(0,0,0,0.04);
  --shadow-neu-sm: 0 1px 1px rgba(0,0,0,0.03);
  --shadow-neu-inset: inset 0 1px 2px rgba(0,0,0,0.04);
  --font-serif: Georgia, "Times New Roman", serif;
  --font-sans: Georgia, "Times New Roman", serif;
}

[data-theme="focused"] body {
  font-family: Georgia, "Times New Roman", serif;
}

[data-theme="focused"] body::before {
  /* Replace noise texture with subtle line pattern */
  opacity: 0.04;
  background-image: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 28px,
    rgba(0,0,0,0.15) 28px,
    rgba(0,0,0,0.15) 29px
  );
}
```

- [ ] **Step 2: Add colorful theme CSS block**

Add after the focused theme block:

```css
/* ── Theme: Colorful (Neo-Brutalist) ────────────────────── */
[data-theme="colorful"] {
  --color-paper: #FFF5E1;
  --color-paper-dark: #FFE8C2;
  --color-ink: #222222;
  --color-ink-light: #555555;
  --color-accent: #FF6B35;
  --color-accent-hover: #E55A2B;
  --shadow-neu: 4px 4px 0 #222;
  --shadow-neu-sm: 3px 3px 0 #222;
  --shadow-neu-inset: inset 2px 2px 0 rgba(0,0,0,0.1);
  --font-serif: system-ui, sans-serif;
  --font-sans: system-ui, sans-serif;
}

[data-theme="colorful"] body {
  font-family: system-ui, sans-serif;
}

[data-theme="colorful"] body::before {
  display: none;
}

/* Brutalist card overrides */
[data-theme="colorful"] .rounded-2xl {
  border: 2.5px solid #222;
}

[data-theme="colorful"] .rounded-xl {
  border: 2px solid #222;
}
```

- [ ] **Step 3: Add theme transition for smooth switching**

Add after the theme blocks:

```css
/* Smooth theme transitions */
body,
body::before {
  transition: background-color 0.4s ease, color 0.4s ease, font-family 0.3s ease;
}
```

- [ ] **Step 4: Verify build passes**

Run: `cd /Users/maximilianmarowsky/Code/CV && npx next build`
Expected: Build succeeds

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: add focused and colorful theme CSS custom properties"
```

---

### Task 3: Content Graph — Compact Variants and Focus Hooks

**Files:**
- Modify: `src/lib/content-graph.ts`

- [ ] **Step 1: Add `contentCompact` to the `ContentNode` interface**

In `src/lib/content-graph.ts`, change the interface:

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
}
```

- [ ] **Step 2: Add `contentCompact` to every node**

For each of the 18 nodes, add a `contentCompact` field. Here are all 18 compact versions:

**school-gets-wrong:**
```typescript
contentCompact: "Schools optimize for recall, but when every answer is searchable, that's not the scarce skill. What matters: knowing which question to ask, evaluating answers, and deciding what to do next.",
```

**startup-story:**
```typescript
contentCompact: "Co-founded pearprogramming — a game teaching coding through running a virtual startup. Won a federal grant, grew to 10 people, acquired by eduki in 2022. Started at 28. Hardest and best thing I've done.",
```

**why-anthropic:**
```typescript
contentCompact: "Daily Claude user since September 2024. Building apps with Claude Code every evening. When the Education Labs PM role appeared, it felt written for me: maximum autonomy, interest-driven exploration, and the belief that AI systems need ethical foundations.",
```

**building-with-claude:**
```typescript
contentCompact: "Using Claude Code daily — not to skip understanding, but because the bottleneck was never the idea, it was implementation speed. Hypothesis to working prototype in a day. Currently building three learning apps.",
```

**what-schools-should-teach:**
```typescript
contentCompact: "Agency. The confidence to say 'I don't know this yet, but I can figure it out.' Not AI literacy as buzzword — the real skill: directing a tool, evaluating its output, adapting when things change.",
```

**anthropic-education-vision:**
```typescript
contentCompact: "The real question isn't 'how to put AI in classrooms' but 'how to use AI to make learners more independent.' A good AI tutor helps you realize what you don't understand. That's the product problem I want to solve.",
```

**my-fit:**
```typescript
contentCompact: "Psychology taught me how people learn. Founding taught me how to ship. Game-based learning taught me medium shapes message. Building with AI daily showed me what's possible in production. Published researcher, built an AI assessor hitting 89% human agreement.",
```

**product-magic:**
```typescript
contentCompact: "Students founded a virtual startup, made business decisions, solved real programming challenges. Started with Google Blockly, progressed to text-based languages. Completion rates far above typical e-learning — intrinsic motivation beats curriculum design.",
```

**after-acquisition:**
```typescript
contentCompact: "eduki — Germany's largest teaching materials marketplace, ~150 people — acquired us in 2022. Led product integration with a team of seven. Spent three years finding product-market fit as intrapreneur, then owned core commerce: product page, cart, checkout.",
```

**founder-lessons:**
```typescript
contentCompact: "Three founding lessons: your first idea is almost always wrong, so kill it early. Hiring is harder than building the product. Speed matters more than perfection — especially with ten people, a federal grant, and no revenue.",
```

**pm-approach:**
```typescript
contentCompact: "Hypothesis-driven. Not 'what should we build?' but 'what do we believe, and how do we test it?' Deep discovery before building. A/B tests to validate. Discipline to kill ideas that don't work — including my own.",
```

**ai-in-education:**
```typescript
contentCompact: "Led 'Make Quality Visible' at eduki Q1 2026: AI assessor evaluating teaching materials across 12 criteria in 5 dimensions. Developed assessment prompt through 10 versions using Claude. Version 10: 89% agreement with human reviewers. Framework co-developed with Prof. John Hattie.",
```

**side-projects:**
```typescript
contentCompact: "Spaced-repetition app for paramedic trainees. Vocabulary trainer. German language app for refugees. All built with Claude Code, weeks instead of months. Same recurring problem: helping people learn what matters to them.",
```

**future-of-work:**
```typescript
contentCompact: "When implementation is no longer the bottleneck, what's left is taste, judgment, and knowing what's worth building. PMs who don't experience AI-native building firsthand will struggle to lead teams through the shift.",
```

**what-id-build:**
```typescript
contentCompact: "Learning experiences where AI helps the learner, not replaces the teacher. Systems that identify what you don't understand — not just what you got wrong. Success metric: did this person become more capable and more curious?",
```

**psychology-of-learning:**
```typescript
contentCompact: "M.Sc. thesis on motivation in CS education. Key finding: learners need autonomy, competence, and connection (Self-Determination Theory). Every product I've built since tries to hit all three.",
```

**research:**
```typescript
contentCompact: "Co-authored Springer book chapter on game-based learning with wife Anna (M.Sc. Neuroscience). Worked with Prof. John Hattie on two published studies validating a quality framework for teaching materials with 2,000+ teachers.",
```

**personal:**
```typescript
contentCompact: "34-year-old new dad in Cologne. Wife Anna (M.Sc. Neuroscience, co-author). Daughter Frieda, born August 2025. Fatherhood made education personal — I want her to stay curious. Specialty coffee nerd, road cyclist, ambitious home cook.",
```

- [ ] **Step 3: Add focus-based starter hooks**

Add after the `CONTENT_GRAPH` export and before the `nodeToBlock` function:

```typescript
import type { ContentFocus } from "./types";

export const FOCUS_STARTER_HOOKS: Record<ContentFocus, Hook[]> = {
  "product-builder": [
    { label: "The startup I built and sold", targetId: "startup-story" },
    { label: "My product management approach", targetId: "pm-approach" },
    { label: "What founding taught me", targetId: "founder-lessons" },
    { label: "What I'd want to build at Anthropic", targetId: "what-id-build" },
  ],
  "learning-scientist": [
    { label: "What I believe school gets wrong", targetId: "school-gets-wrong" },
    { label: "The psychology of learning", targetId: "psychology-of-learning" },
    { label: "Research I've published", targetId: "research" },
    { label: "What schools should teach instead", targetId: "what-schools-should-teach" },
  ],
  "ai-vision": [
    { label: "What I'm building with Claude right now", targetId: "building-with-claude" },
    { label: "My side projects", targetId: "side-projects" },
    { label: "How I used AI to assess teaching quality", targetId: "ai-in-education" },
    { label: "My vision for AI in education", targetId: "anthropic-education-vision" },
  ],
  "max-personal": [
    { label: "Who I am outside of work", targetId: "personal" },
    { label: "Why I want to work at Anthropic", targetId: "why-anthropic" },
    { label: "How becoming a father changed my perspective", targetId: "what-id-build" },
    { label: "The science of what motivates me", targetId: "psychology-of-learning" },
  ],
};
```

- [ ] **Step 4: Update `nodeToBlock` to accept depth preference**

Replace the existing `nodeToBlock` function:

```typescript
export function nodeToBlock(node: ContentNode, visitedNodes: Set<string>, depth: "overview" | "deep-dive" = "deep-dive"): ContentBlockData {
  const visibleHooks = node.hooks.filter((h) => {
    if (h.requiredVisited && !h.requiredVisited.every((id) => visitedNodes.has(id))) return false;
    if (h.minVisited && visitedNodes.size < h.minVisited) return false;
    return true;
  });

  const text = depth === "overview" ? node.contentCompact : node.content;

  return {
    id: node.id,
    questionTitle: node.id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    text,
    richType: node.image ? "photo" : null,
    richData: node.image ? { src: node.image.src, alt: node.image.alt } : null,
    hooks: visibleHooks.map((h) => ({
      label: h.label,
      question: h.label,
      targetId: h.targetId,
    })),
  };
}
```

- [ ] **Step 5: Verify build passes**

Run: `cd /Users/maximilianmarowsky/Code/CV && npx next build`
Expected: Build succeeds

- [ ] **Step 6: Commit**

```bash
git add src/lib/content-graph.ts
git commit -m "feat: add compact content variants and focus-based starter hooks"
```

---

### Task 4: Wire Up Preferences Provider in Layout

**Files:**
- Modify: `src/app/layout.tsx`
- Create: `src/app/ThemeApplicator.tsx`

- [ ] **Step 1: Create ThemeApplicator client component**

Create `src/app/ThemeApplicator.tsx` — this applies the `data-theme` attribute to `<html>`:

```tsx
"use client";

import { useEffect } from "react";
import { usePreferences } from "@/lib/preferences";

export default function ThemeApplicator({ children }: { children: React.ReactNode }) {
  const { preferences } = usePreferences();

  useEffect(() => {
    const html = document.documentElement;
    if (preferences?.visualStyle) {
      html.setAttribute("data-theme", preferences.visualStyle);
    } else {
      html.removeAttribute("data-theme");
    }
  }, [preferences?.visualStyle]);

  return <>{children}</>;
}
```

- [ ] **Step 2: Update layout.tsx to wrap with providers**

Replace `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { PreferencesProvider } from "@/lib/preferences";
import ThemeApplicator from "./ThemeApplicator";
import "./globals.css";

export const metadata: Metadata = {
  title: "Maximilian Marowsky — Product Manager",
  description:
    "Psychologist turned Product Manager, building the future of learning with AI.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <PreferencesProvider>
          <ThemeApplicator>
            {children}
          </ThemeApplicator>
        </PreferencesProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Verify build passes**

Run: `cd /Users/maximilianmarowsky/Code/CV && npx next build`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add src/app/layout.tsx src/app/ThemeApplicator.tsx
git commit -m "feat: wire preferences provider and theme applicator into layout"
```

---

### Task 5: Onboarding Chat Component

**Files:**
- Create: `src/components/OnboardingChat.tsx`

- [ ] **Step 1: Create the OnboardingChat component**

Create `src/components/OnboardingChat.tsx`:

```tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { UserPreferences, VisualStyle, InfoDepth, ContentFocus } from "@/lib/types";

interface OnboardingChatProps {
  onComplete: (prefs: UserPreferences) => void;
  onSkip: () => void;
}

interface ChatMessage {
  type: "bot" | "user";
  text: string;
}

type OnboardingStep = "visual-style" | "info-depth" | "content-focus" | "done";

const STEP_CONFIG = {
  "visual-style": {
    question: "Before we start — how do you prefer to take in information?",
    options: [
      { label: "Focused & clean", value: "focused" as VisualStyle, description: "Minimal, paper-like, typography-driven" },
      { label: "Bold & colorful", value: "colorful" as VisualStyle, description: "Expressive, energetic, neo-brutalist" },
    ],
  },
  "info-depth": {
    question: "Do you prefer a quick overview or a deeper dive?",
    options: [
      { label: "Quick overview", value: "overview" as InfoDepth, description: "Concise, scannable, information-dense" },
      { label: "Deep dive", value: "deep-dive" as InfoDepth, description: "Storytelling, context, full picture" },
    ],
  },
  "content-focus": {
    question: "What are you most curious about?",
    options: [
      { label: "Product Builder", value: "product-builder" as ContentFocus, description: "Startup, shipping, PM craft" },
      { label: "Learning Scientist", value: "learning-scientist" as ContentFocus, description: "Education theory, research" },
      { label: "AI & Vision", value: "ai-vision" as ContentFocus, description: "Claude, AI in education, future" },
      { label: "Max as a person", value: "max-personal" as ContentFocus, description: "Motivation, values, personality" },
    ],
  },
};

const STEPS: OnboardingStep[] = ["visual-style", "info-depth", "content-focus"];

export default function OnboardingChat({ onComplete, onSkip }: OnboardingChatProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { type: "bot", text: "Hi! I'm here to help you get to know Max. Let me tailor this experience to you." },
    { type: "bot", text: STEP_CONFIG["visual-style"].question },
  ]);
  const [selections, setSelections] = useState<Partial<UserPreferences>>({});
  const [isTransitioning, setIsTransitioning] = useState(false);

  const step = STEPS[currentStep];
  const config = step ? STEP_CONFIG[step] : null;

  // Show the current question after a brief delay when step changes
  const showQuestion = !isTransitioning && config;

  function handleSelect(value: string, label: string) {
    if (isTransitioning) return;
    setIsTransitioning(true);

    // Add user's choice as a message
    setMessages((prev) => [...prev, { type: "user", text: label }]);

    // Store selection
    const key = step === "visual-style" ? "visualStyle" : step === "info-depth" ? "infoDepth" : "contentFocus";
    const newSelections = { ...selections, [key]: value };
    setSelections(newSelections);

    setTimeout(() => {
      const nextStep = currentStep + 1;

      if (nextStep >= STEPS.length) {
        // All questions answered
        setMessages((prev) => [
          ...prev,
          { type: "bot", text: "Perfect — I'll tailor everything for you." },
        ]);
        setTimeout(() => {
          onComplete(newSelections as UserPreferences);
        }, 800);
      } else {
        // Move to next question
        const nextConfig = STEP_CONFIG[STEPS[nextStep]];
        setMessages((prev) => [
          ...prev,
          { type: "bot", text: nextConfig.question },
        ]);
        setCurrentStep(nextStep);
        setIsTransitioning(false);
      }
    }, 400);
  }

  return (
    <div className="pb-8 pt-20">
      <div className="mx-auto max-w-lg">
        {/* Chat messages */}
        <div className="space-y-3">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={msg.type === "bot" ? "text-left" : "text-right"}
              >
                <div
                  className={`inline-block rounded-2xl px-4 py-3 text-sm ${
                    msg.type === "bot"
                      ? "bg-white text-ink shadow-neu-sm"
                      : "bg-accent text-white"
                  }`}
                >
                  {msg.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Current options */}
        {showQuestion && (
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="mt-4 flex flex-wrap gap-2"
          >
            {config.options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleSelect(opt.value, opt.label)}
                className="rounded-xl border border-accent/20 bg-paper px-4 py-2.5 text-left text-sm transition-shadow hover:shadow-neu-sm"
              >
                <span className="font-medium text-accent">{opt.label}</span>
                <span className="ml-1.5 text-ink-light">— {opt.description}</span>
              </button>
            ))}
          </motion.div>
        )}

        {/* Skip link */}
        {currentStep === 0 && !isTransitioning && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            onClick={onSkip}
            className="mt-6 block text-xs text-ink-light/50 hover:text-ink-light"
          >
            Skip personalization →
          </motion.button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build passes**

Run: `cd /Users/maximilianmarowsky/Code/CV && npx next build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/components/OnboardingChat.tsx
git commit -m "feat: add conversational onboarding chat component"
```

---

### Task 6: Integrate Onboarding into ConversationView

**Files:**
- Modify: `src/components/ConversationView.tsx`
- Modify: `src/components/Opening.tsx`

- [ ] **Step 1: Update ConversationView to include onboarding phase**

Replace the full content of `src/components/ConversationView.tsx`:

```tsx
"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { ContentBlockData, AIResponse } from "@/lib/types";
import { CONTENT_GRAPH, nodeToBlock } from "@/lib/content-graph";
import { usePreferences } from "@/lib/preferences";
import OnboardingChat from "./OnboardingChat";
import Opening from "./Opening";
import ContentBlock from "./ContentBlock";
import SkeletonBlock from "./SkeletonBlock";
import InputBar from "./InputBar";
import ShareButton from "./ShareButton";
import PrintCV from "./PrintCV";
import SettingsPanel from "./SettingsPanel";
import type { UserPreferences } from "@/lib/types";

export default function ConversationView() {
  const [blocks, setBlocks] = useState<ContentBlockData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [visitedNodes, setVisitedNodes] = useState<Set<string>>(new Set());
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const blockCounter = useRef(0);
  const { preferences, setPreferences, isOnboarded } = usePreferences();

  const hasStarted = blocks.length > 0 || isLoading;

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [blocks.length, isLoading]);

  const addNodeBlock = useCallback((nodeId: string) => {
    const node = CONTENT_GRAPH[nodeId];
    if (!node) return;

    setVisitedNodes((prev) => {
      const next = new Set(prev);
      next.add(nodeId);
      return next;
    });

    const depth = preferences?.infoDepth ?? "deep-dive";
    const block = nodeToBlock(node, visitedNodes, depth);
    setBlocks((prev) => [...prev, block]);
    setMessages((prev) => [
      ...prev,
      { role: "user" as const, content: block.questionTitle },
      { role: "assistant" as const, content: block.text },
    ]);
  }, [visitedNodes, preferences?.infoDepth]);

  const submitFreeQuestion = useCallback(async (question: string) => {
    if (isLoading) return;
    setIsLoading(true);

    const updatedMessages = [
      ...messages,
      { role: "user" as const, content: question },
    ];

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          preferences: preferences ?? undefined,
        }),
      });

      if (!res.ok) throw new Error("Failed to get response");

      const data: AIResponse = await res.json();
      blockCounter.current += 1;

      const newBlock: ContentBlockData = {
        id: `ai-${blockCounter.current}`,
        questionTitle: data.questionTitle,
        text: data.text,
        richType: data.richType,
        richData: data.richData,
        hooks: data.hooks,
      };

      setBlocks((prev) => [...prev, newBlock]);
      setMessages([
        ...updatedMessages,
        { role: "assistant" as const, content: data.text },
      ]);
    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, messages, preferences]);

  const handleHookClick = useCallback((value: string, isNodeId: boolean) => {
    if (isNodeId) {
      addNodeBlock(value);
    } else {
      submitFreeQuestion(value);
    }
  }, [addNodeBlock, submitFreeQuestion]);

  function handleOnboardingComplete(prefs: UserPreferences) {
    setPreferences(prefs);
  }

  function handleSkip() {
    setPreferences({
      visualStyle: "focused",
      infoDepth: "deep-dive",
      contentFocus: "product-builder",
    });
  }

  // Show onboarding if not yet onboarded
  if (!isOnboarded) {
    return <OnboardingChat onComplete={handleOnboardingComplete} onSkip={handleSkip} />;
  }

  return (
    <>
      <Opening visible={!hasStarted} onHookClick={addNodeBlock} />

      {hasStarted && (
        <div className="space-y-6 pb-24 pt-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 overflow-hidden rounded-full shadow-neu-sm">
                <img src="/photo-coffee.jpg" alt="Max Marowsky" className="h-full w-full object-cover" />
              </div>
              <div>
                <div className="font-serif text-sm font-semibold text-ink">Max Marowsky</div>
                <div className="text-xs text-ink-light">Product Manager · Ex-Founder · Psychologist</div>
              </div>
            </div>
            <ShareButton blocks={blocks} />
          </div>
          {blocks.map((block, i) => (
            <ContentBlock
              key={block.id}
              block={block}
              onHookClick={handleHookClick}
              isReadOnly={i < blocks.length - 1}
            />
          ))}
          {isLoading && <SkeletonBlock />}
          <div ref={bottomRef} />
        </div>
      )}

      {hasStarted && (
        <InputBar onSubmit={(q) => submitFreeQuestion(q)} disabled={isLoading} />
      )}
      <SettingsPanel />
      <PrintCV />
    </>
  );
}
```

- [ ] **Step 2: Update Opening to use focus-based hooks**

Replace the full content of `src/components/Opening.tsx`:

```tsx
"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { usePreferences } from "@/lib/preferences";
import { FOCUS_STARTER_HOOKS, ROOT_HOOKS } from "@/lib/content-graph";

interface OpeningProps {
  onHookClick: (targetId: string) => void;
  visible: boolean;
}

export default function Opening({ onHookClick, visible }: OpeningProps) {
  const { preferences } = usePreferences();

  if (!visible) return null;

  const hooks = preferences?.contentFocus
    ? FOCUS_STARTER_HOOKS[preferences.contentFocus]
    : ROOT_HOOKS;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="pb-8 pt-20 text-center"
    >
      <div className="mx-auto mb-6 h-36 w-36 overflow-hidden rounded-full shadow-neu">
        <Image
          src="/photo-coffee.jpg"
          alt="Max Marowsky"
          width={144}
          height={144}
          className="h-full w-full object-cover"
          priority
        />
      </div>
      <h1 className="font-serif text-4xl font-bold text-ink">
        Max Marowsky
      </h1>
      <p className="mt-2 text-ink-light">
        Product Manager · Ex-Founder · Psychologist
      </p>
      <p className="mt-6 text-lg text-ink">
        Get to know me. Just ask.
      </p>
      <div className="mx-auto mt-6 flex max-w-md flex-wrap justify-center gap-2">
        {hooks.map((hook) => (
          <motion.button
            key={hook.label}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onHookClick(hook.targetId)}
            className="rounded-xl border border-accent/20 bg-paper px-4 py-2 text-sm text-accent shadow-neu-sm transition-shadow hover:shadow-neu"
          >
            {hook.label}
          </motion.button>
        ))}
      </div>
    </motion.section>
  );
}
```

- [ ] **Step 3: Verify build passes**

Run: `cd /Users/maximilianmarowsky/Code/CV && npx next build`
Expected: Build may fail because SettingsPanel doesn't exist yet. That's fine — we create it in the next task.

- [ ] **Step 4: Commit**

```bash
git add src/components/ConversationView.tsx src/components/Opening.tsx
git commit -m "feat: integrate onboarding flow and focus-based hooks into conversation"
```

---

### Task 7: Settings Panel Component

**Files:**
- Create: `src/components/SettingsPanel.tsx`

- [ ] **Step 1: Create the SettingsPanel component**

Create `src/components/SettingsPanel.tsx`:

```tsx
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
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
```

- [ ] **Step 2: Verify build passes**

Run: `cd /Users/maximilianmarowsky/Code/CV && npx next build`
Expected: Build succeeds — all imports now resolve

- [ ] **Step 3: Commit**

```bash
git add src/components/SettingsPanel.tsx
git commit -m "feat: add floating settings panel for mid-session preference changes"
```

---

### Task 8: Chat API — Preferences in System Prompt

**Files:**
- Modify: `src/app/api/chat/route.ts`

- [ ] **Step 1: Update the POST handler to accept and use preferences**

In `src/app/api/chat/route.ts`, replace the `sanitizeMessages` function and the `POST` handler:

First, add after the `sanitizeMessages` function:

```typescript
function buildPreferencesPrompt(prefs: { visualStyle?: string; infoDepth?: string; contentFocus?: string }): string {
  if (!prefs.infoDepth && !prefs.contentFocus) return "";

  return `\n\n## Recruiter Preferences
- Information depth: ${prefs.infoDepth ?? "deep-dive"}
  ${prefs.infoDepth === "overview" ? "- Keep responses concise (~2-3 sentences). Lead with the key fact. Skip narrative buildup." : "- Current behavior. Tell the story, provide context, make it personal."}
- Content focus: ${prefs.contentFocus ?? "none"}
  - Prioritize this angle when answering free-form questions. Weave in relevant examples from this domain. But don't ignore other dimensions if the user asks about them directly.`;
}
```

Then update the `POST` handler to extract preferences and append them:

Replace this line:
```typescript
const result = await generateText({
    model: "anthropic/claude-sonnet-4.5",
    output: Output.object({ schema: responseSchema }),
    system: SYSTEM_PROMPT,
    messages,
  });
```

With:
```typescript
  const prefs = (body as { preferences?: { visualStyle?: string; infoDepth?: string; contentFocus?: string } })?.preferences;
  const systemPrompt = SYSTEM_PROMPT + (prefs ? buildPreferencesPrompt(prefs) : "");

  const result = await generateText({
    model: "anthropic/claude-sonnet-4.5",
    output: Output.object({ schema: responseSchema }),
    system: systemPrompt,
    messages,
  });
```

Note: `body` is already parsed above. We just need to move `body` access before the `messages` validation, or extract prefs after. The current code already parses `body` before using it, so we just add the `prefs` extraction after the `messages` validation.

- [ ] **Step 2: Verify build passes**

Run: `cd /Users/maximilianmarowsky/Code/CV && npx next build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/app/api/chat/route.ts
git commit -m "feat: inject recruiter preferences into Claude system prompt"
```

---

### Task 9: Visual Verification and Polish

**Files:**
- Various (bug fixes only)

- [ ] **Step 1: Start dev server and test onboarding flow**

Run: `cd /Users/maximilianmarowsky/Code/CV && npm run dev`

Open http://localhost:3000 in browser. Verify:
1. Onboarding chat appears first
2. Three questions are asked in sequence
3. Selecting "Focused" applies the paperlike theme
4. Selecting "Colorful" applies the brutalist theme
5. After onboarding, Opening shows focus-based starter hooks
6. "Skip" link works and applies defaults

- [ ] **Step 2: Test settings panel**

1. Complete onboarding
2. Click a starter hook to enter conversation
3. Verify gear icon appears bottom-right
4. Click gear icon — panel opens with current selections
5. Switch visual style — UI transitions smoothly
6. Switch depth — no immediate visual change (affects next blocks)
7. Close panel

- [ ] **Step 3: Test content depth**

1. Set depth to "Overview" via settings panel
2. Click a hook that loads a content-graph node
3. Verify the text is the compact version (~60-80 words)
4. Switch to "Deep Dive"
5. Click another hook — verify full-length text

- [ ] **Step 4: Test free-form chat with preferences**

1. Type a free-form question
2. Verify Claude's response length/style matches the selected depth
3. Verify response content biases toward the selected focus

- [ ] **Step 5: Fix any issues found during testing**

Address any bugs discovered in steps 1-4. Common issues to watch for:
- Theme CSS not overriding correctly (specificity issues)
- Animation glitches during theme transition
- Settings panel z-index conflicts with InputBar
- Onboarding not transitioning to Opening properly

- [ ] **Step 6: Verify build passes**

Run: `cd /Users/maximilianmarowsky/Code/CV && npx next build`
Expected: Build succeeds with no errors

- [ ] **Step 7: Commit any fixes**

```bash
git add -A
git commit -m "fix: polish personalization UI and resolve theme issues"
```
