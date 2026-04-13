# Gamification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add opt-in gamification (progress ring, achievement toasts, hidden gems) to the conversation-based CV portfolio to maximize recruiter exploration.

**Architecture:** Three new components (`ProgressRing`, `AchievementToast`, `useGamification` hook) integrate with the existing `visitedNodes` tracking and `PreferencesContext`. A `gamified: boolean` preference gates all gamification rendering. Hidden Gems are regular `ContentNode` entries with a `gem` unlock condition.

**Tech Stack:** React 19, Framer Motion, Tailwind CSS, TypeScript. No new dependencies.

---

## File Structure

| File | Role |
|------|------|
| `src/lib/types.ts` | Add `gamified` to `UserPreferences`, add `AchievementDefinition` type |
| `src/lib/content-graph.ts` | Add 3 Hidden Gem nodes, export `ACHIEVEMENT_DEFINITIONS` and `getNodeCounts()` |
| `src/hooks/useGamification.ts` | Hook: check achievements & gems against visitedNodes, manage toast queue |
| `src/components/gamification/ProgressRing.tsx` | Circular SVG progress indicator |
| `src/components/gamification/AchievementToast.tsx` | Animated toast notification |
| `src/components/OnboardingChat.tsx` | Add 4th step for gamification opt-in |
| `src/components/ConversationView.tsx` | Wire up gamification hook & components |
| `src/components/SettingsPanel.tsx` | Add gamification toggle |
| `src/components/ContentBlock.tsx` | Visual distinction for gem hooks |

---

## Task 1: Extend Types

**Files:**
- Modify: `src/lib/types.ts`

- [ ] **Step 1: Add gamified field and achievement types**

In `src/lib/types.ts`, add `gamified` to `UserPreferences` and add the `AchievementDefinition` type:

```typescript
// After the existing UserPreferences interface (line 71-75), replace with:
export interface UserPreferences {
  visualStyle: VisualStyle;
  infoDepth: InfoDepth;
  contentFocus: ContentFocus;
  gamified: boolean;
}

// Add after UserPreferences:
export interface AchievementDefinition {
  id: string;
  emoji: string;
  name: string;
  description: string;
  requiredNodes?: string[];
  minVisited?: number;
  minFreeQuestions?: number;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd /Users/maximilianmarowsky/Code/CV && npx tsc --noEmit 2>&1 | head -30`

Expected: Type errors in files that reference `UserPreferences` without `gamified` — this is expected and will be fixed in subsequent tasks. Note which files error for reference.

- [ ] **Step 3: Commit**

```bash
git add src/lib/types.ts
git commit -m "feat(gamification): add gamified preference and AchievementDefinition type"
```

---

## Task 2: Add Achievement Definitions and Hidden Gem Nodes to Content Graph

**Files:**
- Modify: `src/lib/content-graph.ts`

- [ ] **Step 1: Add gem field to ContentNode interface**

At the top of `src/lib/content-graph.ts`, extend the `ContentNode` interface (after line 22, before the closing `}`):

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
}
```

- [ ] **Step 2: Add 3 Hidden Gem nodes to CONTENT_GRAPH**

Add these nodes at the end of `CONTENT_GRAPH`, before the closing `};` (after the `personal` node):

```typescript
  // ── HIDDEN GEMS (gamification-only) ────────────────────────

  "gem-convergence": {
    id: "gem-convergence",
    content:
      "You found a hidden thread. Psychology taught me that learning is deeply personal — it depends on autonomy, competence, and connection. AI gives us the first real tool to honor that at scale. Not by replacing teachers, but by building systems that adapt to each learner the way a great tutor does: noticing what you don't understand yet, adjusting the challenge, and knowing when to step back. That's what I'd want to build at Anthropic Education Labs — products where the AI makes the learner more capable, not more dependent. Everything in my career has been building toward this convergence.",
    contentCompact:
      "Psychology taught me learning is personal — autonomy, competence, connection. AI is the first tool to honor that at scale. Not replacing teachers, but adapting like a great tutor: noticing gaps, adjusting challenge, knowing when to step back. That's what I'd build at Anthropic Education Labs.",
    hooks: [
      { label: "What I'd want to build at Anthropic", targetId: "what-id-build" },
      { label: "Why I want to work at Anthropic", targetId: "why-anthropic" },
    ],
    gem: {
      requiredNodes: ["psychology-of-learning", "ai-in-education", "building-with-claude"],
    },
  },

  "gem-lab-to-product": {
    id: "gem-lab-to-product",
    content:
      "You connected the dots between my research and my product work. Here's the link: when I studied what makes teaching materials effective with Prof. Hattie, we used structured rubrics, inter-rater reliability, and iterative validation — the same methodology I use in product discovery. My PM approach isn't just 'hypothesis-driven' as a buzzword. I literally run my product work like a research study: define the construct, operationalize it, test with real users, measure agreement, iterate. The AI assessor I built at eduki is the purest example — 10 prompt versions, each evaluated against human reviewers, until we hit 89% agreement. That's not engineering. That's applied research methodology in production.",
    contentCompact:
      "The link between research and product: I run PM like a research study — define constructs, operationalize, test, measure agreement, iterate. The AI assessor is the purest example: 10 prompt versions evaluated against human reviewers until 89% agreement. Applied research methodology in production.",
    hooks: [
      { label: "The AI assessor I built", targetId: "ai-in-education" },
      { label: "My product management approach", targetId: "pm-approach" },
    ],
    gem: {
      requiredNodes: ["startup-story", "founder-lessons", "research"],
    },
  },

  "gem-full-picture": {
    id: "gem-full-picture",
    content:
      "You've seen almost everything. Here's what ties it all together: I'm a psychologist who founded an EdTech startup, sold it, and spent the last four years building products at the intersection of education, AI, and quality. I've published research with one of the world's most cited education researchers. I build working apps with Claude Code every evening — not because I have to, but because I can't stop. I'm a new father who thinks about what his daughter should learn. And I believe the next generation of AI learning products needs someone who has lived in all of these worlds — research, product, education, and AI — not just visited them. That's what I bring to Anthropic Education Labs.",
    contentCompact:
      "Psychologist, founder, PM at the intersection of education, AI, and quality. Published with one of the world's most cited education researchers. Building with Claude Code daily. New father thinking about what his daughter should learn. Lived in research, product, education, and AI — not just visited them.",
    hooks: [
      { label: "Why I want to work at Anthropic", targetId: "why-anthropic" },
      { label: "What I'd want to build there", targetId: "what-id-build" },
    ],
    gem: {
      minVisited: 15,
    },
  },
```

- [ ] **Step 3: Add achievement cluster definitions**

Add after `FOCUS_STARTER_HOOKS` (after line 345), before the `nodeToBlock` function:

```typescript
import type { AchievementDefinition } from "@/lib/types";

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  {
    id: "founder",
    emoji: "🚀",
    name: "Founder",
    description: "Alle Startup-Themen entdeckt",
    requiredNodes: ["startup-story", "product-magic", "after-acquisition", "founder-lessons"],
  },
  {
    id: "learning-scientist",
    emoji: "🔬",
    name: "Learning Scientist",
    description: "Alle Education-Themen entdeckt",
    requiredNodes: ["school-gets-wrong", "what-schools-should-teach", "psychology-of-learning", "anthropic-education-vision"],
  },
  {
    id: "ai-native",
    emoji: "🤖",
    name: "AI Native",
    description: "Alle AI-Themen entdeckt",
    requiredNodes: ["building-with-claude", "ai-in-education", "side-projects"],
  },
  {
    id: "deep-diver",
    emoji: "💬",
    name: "Deep Diver",
    description: "5+ eigene Fragen gestellt",
    minFreeQuestions: 5,
  },
  {
    id: "explorer",
    emoji: "🗺️",
    name: "Explorer",
    description: "Über die Hälfte entdeckt",
    minVisited: 10,
  },
  {
    id: "completionist",
    emoji: "🏆",
    name: "Completionist",
    description: "Alles entdeckt",
  },
];
```

Note: The `completionist` achievement's `minVisited` will be set dynamically in the hook (= total node count), so it doesn't need a hardcoded value here.

- [ ] **Step 4: Add helper to get non-gem node count**

Add after `ACHIEVEMENT_DEFINITIONS`:

```typescript
export function getNodeCounts() {
  const allNodes = Object.values(CONTENT_GRAPH);
  const regularNodes = allNodes.filter((n) => !n.gem);
  const gemNodes = allNodes.filter((n) => n.gem);
  return { total: allNodes.length, regular: regularNodes.length, gems: gemNodes.length };
}
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/content-graph.ts
git commit -m "feat(gamification): add hidden gem nodes, achievement definitions, and node count helper"
```

---

## Task 3: Create useGamification Hook

**Files:**
- Create: `src/hooks/useGamification.ts`

- [ ] **Step 1: Create the hooks directory and the hook file**

```bash
mkdir -p /Users/maximilianmarowsky/Code/CV/src/hooks
```

- [ ] **Step 2: Write the useGamification hook**

Create `src/hooks/useGamification.ts`:

```typescript
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { CONTENT_GRAPH, ACHIEVEMENT_DEFINITIONS, getNodeCounts } from "@/lib/content-graph";
import type { AchievementDefinition } from "@/lib/types";

export interface GamificationState {
  unlockedAchievements: Set<string>;
  unlockedGems: Set<string>;
  currentToast: AchievementDefinition | null;
  dismissToast: () => void;
  totalNodes: number;
  discoveredCount: number;
}

export function useGamification(
  visitedNodes: Set<string>,
  freeQuestionCount: number,
  gamified: boolean,
): GamificationState {
  const [unlockedAchievements, setUnlockedAchievements] = useState<Set<string>>(new Set());
  const [unlockedGems, setUnlockedGems] = useState<Set<string>>(new Set());
  const [toastQueue, setToastQueue] = useState<AchievementDefinition[]>([]);
  const [currentToast, setCurrentToast] = useState<AchievementDefinition | null>(null);
  const isShowingToast = useRef(false);

  const { total, regular } = getNodeCounts();

  // Count discovered nodes (only regular nodes count for display, gems are bonus)
  const discoveredCount = visitedNodes.size;

  // Process toast queue
  useEffect(() => {
    if (isShowingToast.current || toastQueue.length === 0) return;

    isShowingToast.current = true;
    const next = toastQueue[0];
    setCurrentToast(next);
    setToastQueue((q) => q.slice(1));

    const timer = setTimeout(() => {
      setCurrentToast(null);
      isShowingToast.current = false;
    }, 4000);

    return () => clearTimeout(timer);
  }, [toastQueue]);

  const dismissToast = useCallback(() => {
    setCurrentToast(null);
    isShowingToast.current = false;
  }, []);

  // Check achievements when visitedNodes or freeQuestionCount changes
  useEffect(() => {
    if (!gamified) return;

    const newAchievements: AchievementDefinition[] = [];

    for (const achievement of ACHIEVEMENT_DEFINITIONS) {
      if (unlockedAchievements.has(achievement.id)) continue;

      let earned = true;

      if (achievement.requiredNodes) {
        earned = achievement.requiredNodes.every((id) => visitedNodes.has(id));
      }

      if (earned && achievement.minVisited) {
        earned = visitedNodes.size >= achievement.minVisited;
      }

      if (earned && achievement.minFreeQuestions) {
        earned = freeQuestionCount >= achievement.minFreeQuestions;
      }

      // Completionist: all regular nodes visited
      if (earned && achievement.id === "completionist") {
        earned = visitedNodes.size >= total;
      }

      if (earned) {
        newAchievements.push(achievement);
      }
    }

    if (newAchievements.length > 0) {
      setUnlockedAchievements((prev) => {
        const next = new Set(prev);
        newAchievements.forEach((a) => next.add(a.id));
        return next;
      });
      setToastQueue((prev) => [...prev, ...newAchievements]);
    }
  }, [visitedNodes, freeQuestionCount, gamified, unlockedAchievements, total]);

  // Check gem unlocks
  useEffect(() => {
    if (!gamified) return;

    const gemNodes = Object.values(CONTENT_GRAPH).filter((n) => n.gem);

    for (const gemNode of gemNodes) {
      if (unlockedGems.has(gemNode.id)) continue;
      if (visitedNodes.has(gemNode.id)) continue;

      const gem = gemNode.gem!;
      let unlocked = true;

      if (gem.requiredNodes) {
        unlocked = gem.requiredNodes.every((id) => visitedNodes.has(id));
      }

      if (unlocked && gem.minVisited) {
        unlocked = visitedNodes.size >= gem.minVisited;
      }

      if (unlocked) {
        setUnlockedGems((prev) => {
          const next = new Set(prev);
          next.add(gemNode.id);
          return next;
        });

        // Queue a toast for the gem unlock
        const gemToast: AchievementDefinition = {
          id: gemNode.id,
          emoji: "💎",
          name: gemNode.id === "gem-convergence" ? "Die Konvergenz" :
                gemNode.id === "gem-lab-to-product" ? "Vom Labor ins Produkt" :
                "Das ganze Bild",
          description: "Versteckter Inhalt freigeschaltet",
        };
        setToastQueue((prev) => [...prev, gemToast]);
      }
    }
  }, [visitedNodes, gamified, unlockedGems]);

  return {
    unlockedAchievements,
    unlockedGems,
    currentToast,
    dismissToast,
    totalNodes: total,
    discoveredCount,
  };
}
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useGamification.ts
git commit -m "feat(gamification): add useGamification hook with achievement and gem checking"
```

---

## Task 4: Create ProgressRing Component

**Files:**
- Create: `src/components/gamification/ProgressRing.tsx`

- [ ] **Step 1: Create the gamification components directory**

```bash
mkdir -p /Users/maximilianmarowsky/Code/CV/src/components/gamification
```

- [ ] **Step 2: Write the ProgressRing component**

Create `src/components/gamification/ProgressRing.tsx`:

```typescript
"use client";

import { motion } from "framer-motion";

interface ProgressRingProps {
  discovered: number;
  total: number;
}

export default function ProgressRing({ discovered, total }: ProgressRingProps) {
  const progress = total > 0 ? discovered / total : 0;

  // Desktop ring: 72px, radius 30, circumference = 2 * π * 30
  const desktopRadius = 30;
  const desktopCircumference = 2 * Math.PI * desktopRadius;
  const desktopOffset = desktopCircumference * (1 - progress);

  // Mobile ring: 48px, radius 19, circumference = 2 * π * 19
  const mobileRadius = 19;
  const mobileCircumference = 2 * Math.PI * mobileRadius;
  const mobileOffset = mobileCircumference * (1 - progress);

  return (
    <div className="no-print fixed z-20 bottom-32 right-4 sm:bottom-auto sm:top-4 sm:right-4">
      {/* Desktop version */}
      <div className="hidden sm:flex flex-col items-center">
        <div className="relative h-[72px] w-[72px] rounded-full bg-white shadow-neu-sm">
          <svg width="72" height="72" viewBox="0 0 72 72" className="rotate-[-90deg]">
            <circle
              cx="36" cy="36" r={desktopRadius}
              fill="none" stroke="var(--color-paper-dark, #E5DDD3)" strokeWidth="4"
            />
            <motion.circle
              cx="36" cy="36" r={desktopRadius}
              fill="none" stroke="var(--color-accent)" strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={desktopCircumference}
              initial={{ strokeDashoffset: desktopCircumference }}
              animate={{ strokeDashoffset: desktopOffset }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-semibold text-ink">
              {discovered}/{total}
            </span>
          </div>
        </div>
        <span className="mt-1 text-[10px] text-ink-light">Themen entdeckt</span>
      </div>

      {/* Mobile version */}
      <div className="flex sm:hidden flex-col items-center">
        <div className="relative h-12 w-12 rounded-full bg-white shadow-neu-sm">
          <svg width="48" height="48" viewBox="0 0 48 48" className="rotate-[-90deg]">
            <circle
              cx="24" cy="24" r={mobileRadius}
              fill="none" stroke="var(--color-paper-dark, #E5DDD3)" strokeWidth="3"
            />
            <motion.circle
              cx="24" cy="24" r={mobileRadius}
              fill="none" stroke="var(--color-accent)" strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={mobileCircumference}
              initial={{ strokeDashoffset: mobileCircumference }}
              animate={{ strokeDashoffset: mobileOffset }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-semibold text-ink">{discovered}</span>
          </div>
        </div>
        <span className="mt-0.5 text-[9px] text-ink-light">von {total}</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/gamification/ProgressRing.tsx
git commit -m "feat(gamification): add ProgressRing component with responsive desktop/mobile variants"
```

---

## Task 5: Create AchievementToast Component

**Files:**
- Create: `src/components/gamification/AchievementToast.tsx`

- [ ] **Step 1: Write the AchievementToast component**

Create `src/components/gamification/AchievementToast.tsx`:

```typescript
"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { AchievementDefinition } from "@/lib/types";

interface AchievementToastProps {
  achievement: AchievementDefinition | null;
  onDismiss: () => void;
}

export default function AchievementToast({ achievement, onDismiss }: AchievementToastProps) {
  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          key={achievement.id}
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="no-print fixed top-4 left-1/2 z-50 -translate-x-1/2"
          role="status"
          aria-live="polite"
        >
          <button
            onClick={onDismiss}
            className="flex max-w-[360px] items-center gap-3 rounded-2xl border border-[var(--color-paper-dark,#E5DDD3)] bg-white px-5 py-3 shadow-neu cursor-pointer hover:shadow-neu-sm transition-shadow"
          >
            <span className="text-2xl" role="img" aria-label={achievement.name}>
              {achievement.emoji}
            </span>
            <div className="text-left">
              <div className="text-sm font-semibold text-ink">{achievement.name}</div>
              <div className="text-xs text-ink-light">{achievement.description}</div>
            </div>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/gamification/AchievementToast.tsx
git commit -m "feat(gamification): add AchievementToast component with slide-down animation"
```

---

## Task 6: Add Gamification Step to Onboarding

**Files:**
- Modify: `src/components/OnboardingChat.tsx`

- [ ] **Step 1: Add gamification step to STEP_CONFIG and STEPS**

In `src/components/OnboardingChat.tsx`:

1. Update the `OnboardingStep` type (line 17):

```typescript
type OnboardingStep = "visual-style" | "info-depth" | "content-focus" | "gamification" | "done";
```

2. Add the gamification entry to `STEP_CONFIG` (after the `content-focus` entry, before the closing `};`):

```typescript
  "gamification": {
    question: "Möchtest du deine Erfahrung gamifizieren?",
    options: [
      { label: "Ja, zeig mir meinen Fortschritt", value: "yes", description: "Entdeckungs-Tracking, Meilensteine & versteckte Inhalte" },
      { label: "Nein danke", value: "no", description: "Klassisches Erlebnis ohne Gamification" },
    ],
  },
```

3. Update the `STEPS` array (line 45):

```typescript
const STEPS: OnboardingStep[] = ["visual-style", "info-depth", "content-focus", "gamification"];
```

- [ ] **Step 2: Update handleSelect to handle the gamification key**

In the `handleSelect` function (line 67), update the key mapping:

```typescript
    const key = step === "visual-style" ? "visualStyle"
      : step === "info-depth" ? "infoDepth"
      : step === "gamification" ? "gamified"
      : "contentFocus";
    const resolvedValue = step === "gamification" ? value === "yes" : value;
    const newSelections = { ...selections, [key]: resolvedValue };
```

Replace the line:
```typescript
    const newSelections = { ...selections, [key]: value };
```
with the three lines above.

- [ ] **Step 3: Verify the component renders correctly**

Run: `cd /Users/maximilianmarowsky/Code/CV && npx next build 2>&1 | tail -20`

Expected: Build succeeds without errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/OnboardingChat.tsx
git commit -m "feat(gamification): add gamification opt-in as 4th onboarding step"
```

---

## Task 7: Update Default Preferences and ConversationView

**Files:**
- Modify: `src/components/ConversationView.tsx`

- [ ] **Step 1: Update skip defaults to include gamified**

In `src/components/ConversationView.tsx`, update the `handleSkip` function (line 110-115) to include `gamified: false`:

```typescript
  function handleSkip() {
    setPreferences({
      visualStyle: "focused",
      infoDepth: "deep-dive",
      contentFocus: "product-builder",
      gamified: false,
    });
  }
```

- [ ] **Step 2: Add freeQuestionCount tracking and gamification hook**

Add imports at the top:

```typescript
import { useGamification } from "@/hooks/useGamification";
import ProgressRing from "./gamification/ProgressRing";
import AchievementToast from "./gamification/AchievementToast";
```

Add state for free question counting (after `blockCounter` ref, line 23):

```typescript
  const [freeQuestionCount, setFreeQuestionCount] = useState(0);
```

Add the gamification hook (after `hasStarted`, line 27):

```typescript
  const gamification = useGamification(
    visitedNodes,
    freeQuestionCount,
    preferences?.gamified ?? false,
  );
```

In `submitFreeQuestion`, increment the counter. Add after `setIsLoading(true)` (line 55):

```typescript
    setFreeQuestionCount((prev) => prev + 1);
```

- [ ] **Step 3: Render gamification components**

In the JSX return, add after `<SettingsPanel />` (line 156):

```typescript
      {preferences?.gamified && (
        <>
          <ProgressRing
            discovered={gamification.discoveredCount}
            total={gamification.totalNodes}
          />
          <AchievementToast
            achievement={gamification.currentToast}
            onDismiss={gamification.dismissToast}
          />
        </>
      )}
```

- [ ] **Step 4: Pass unlockedGems to ContentBlock for gem hooks**

Update the ContentBlock rendering to pass `unlockedGems` (line 141-146):

```typescript
            <ContentBlock
              key={block.id}
              block={block}
              onHookClick={handleHookClick}
              isReadOnly={i < blocks.length - 1}
              unlockedGems={preferences?.gamified ? gamification.unlockedGems : undefined}
            />
```

- [ ] **Step 5: Inject gem hooks into the last block when a gem unlocks**

Add a `useEffect` that watches `gamification.unlockedGems` and injects gem hooks into the current last block. Add after the scroll effect (line 33):

```typescript
  // Inject gem hooks into the last block when a gem unlocks
  useEffect(() => {
    if (!preferences?.gamified || gamification.unlockedGems.size === 0) return;

    setBlocks((prev) => {
      if (prev.length === 0) return prev;
      const lastBlock = prev[prev.length - 1];

      const gemHooks: Array<{ label: string; question: string; targetId: string }> = [];
      for (const gemId of gamification.unlockedGems) {
        // Only add if not already in hooks and not already visited
        if (visitedNodes.has(gemId)) continue;
        if (lastBlock.hooks.some((h) => h.targetId === gemId)) continue;

        const gemNode = CONTENT_GRAPH[gemId];
        if (!gemNode) continue;

        const gemLabel = gemId === "gem-convergence" ? "💎 Die Konvergenz entdecken"
          : gemId === "gem-lab-to-product" ? "💎 Vom Labor ins Produkt"
          : "💎 Das ganze Bild";

        gemHooks.push({ label: gemLabel, question: gemLabel, targetId: gemId });
      }

      if (gemHooks.length === 0) return prev;

      const updatedLast = { ...lastBlock, hooks: [...lastBlock.hooks, ...gemHooks] };
      return [...prev.slice(0, -1), updatedLast];
    });
  }, [gamification.unlockedGems, preferences?.gamified, visitedNodes]);
```

- [ ] **Step 6: Commit**

```bash
git add src/components/ConversationView.tsx
git commit -m "feat(gamification): wire up gamification hook, progress ring, toasts, and gem injection"
```

---

## Task 8: Add Gamification Toggle to SettingsPanel

**Files:**
- Modify: `src/components/SettingsPanel.tsx`

- [ ] **Step 1: Add gamification toggle**

In `src/components/SettingsPanel.tsx`, add a new section after the Content Focus section (after line 117, before the closing `</motion.div>`):

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/SettingsPanel.tsx
git commit -m "feat(gamification): add gamification on/off toggle to settings panel"
```

---

## Task 9: Add Visual Distinction for Gem Hooks in ContentBlock

**Files:**
- Modify: `src/components/ContentBlock.tsx`

- [ ] **Step 1: Update ContentBlock to accept and render gem hooks differently**

In `src/components/ContentBlock.tsx`, update the props interface (line 8-12):

```typescript
interface ContentBlockProps {
  block: ContentBlockData;
  onHookClick: (targetIdOrQuestion: string, isNodeId: boolean) => void;
  isReadOnly?: boolean;
  unlockedGems?: Set<string>;
}
```

Update the component signature (line 13):

```typescript
export default function ContentBlock({ block, onHookClick, isReadOnly = false, unlockedGems }: ContentBlockProps) {
```

Update the `HookChip` call to pass whether it's a gem (line 31):

```typescript
            <HookChip
              key={hook.label}
              hook={hook}
              onClick={() => onHookClick(hook.targetId ?? hook.question, !!hook.targetId)}
              isGem={!!unlockedGems?.has(hook.targetId ?? "")}
            />
```

Update the `HookChip` component (line 39-49):

```typescript
function HookChip({ hook, onClick, isGem = false }: { hook: HookSuggestion; onClick: () => void; isGem?: boolean }) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`rounded-xl border px-4 py-2 text-sm transition-shadow hover:shadow-neu-sm ${
        isGem
          ? "border-amber-400/40 bg-amber-50 text-amber-700 font-medium"
          : "border-accent/20 bg-paper text-accent"
      }`}
    >
      {hook.label} →
    </motion.button>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ContentBlock.tsx
git commit -m "feat(gamification): add visual distinction for gem hooks in content blocks"
```

---

## Task 10: Fix Remaining TypeScript Errors and Verify Build

**Files:**
- Possibly modify: any files with `UserPreferences` references that need `gamified`

- [ ] **Step 1: Run TypeScript check**

Run: `cd /Users/maximilianmarowsky/Code/CV && npx tsc --noEmit 2>&1`

Check for any type errors related to missing `gamified` property. Common places to check:
- `src/lib/preferences.tsx` — no changes needed (it uses generic `UserPreferences`)
- `src/app/api/chat/route.ts` — if it constructs `UserPreferences`, add `gamified`
- Any test files referencing `UserPreferences`

- [ ] **Step 2: Fix any type errors found**

For each error, add `gamified: false` (or `gamified: boolean`) as needed.

- [ ] **Step 3: Run the full build**

Run: `cd /Users/maximilianmarowsky/Code/CV && npm run build 2>&1 | tail -30`

Expected: Build succeeds.

- [ ] **Step 4: Commit if any fixes were needed**

```bash
git add -u
git commit -m "fix(gamification): resolve remaining TypeScript errors for gamified preference"
```

---

## Task 11: Manual Smoke Test

- [ ] **Step 1: Start dev server**

Run: `cd /Users/maximilianmarowsky/Code/CV && npm run dev`

- [ ] **Step 2: Test the onboarding flow**

1. Open `http://localhost:3000` in browser
2. Go through onboarding — verify 4th step appears: "Möchtest du deine Erfahrung gamifizieren?"
3. Select "Ja" — verify the experience loads

- [ ] **Step 3: Test Progress Ring**

1. Click a starter hook — verify the Progress Ring appears (top-right on desktop, bottom-right on mobile)
2. Click more hooks — verify the ring fills and counter increments
3. Check mobile viewport (375px) — verify compact ring renders

- [ ] **Step 4: Test Achievement Toasts**

1. Navigate through all startup cluster nodes (`startup-story` → `product-magic` → `after-acquisition` → `founder-lessons`) — verify "Founder" toast appears
2. Visit 10+ nodes — verify "Explorer" toast appears
3. Verify toasts auto-dismiss after 4 seconds

- [ ] **Step 5: Test Hidden Gems**

1. Visit `psychology-of-learning`, `ai-in-education`, and `building-with-claude` — verify "Die Konvergenz" gem toast appears and a 💎 hook shows in the last block
2. Click the gem hook — verify the gem content loads
3. Verify gem hook has amber/gold visual styling

- [ ] **Step 6: Test Settings Toggle**

1. Open settings panel (gear icon)
2. Toggle gamification off — verify Progress Ring disappears
3. Toggle back on — verify Progress Ring reappears with correct count
4. Verify already-visited gem content blocks remain visible when toggling off

- [ ] **Step 7: Test Skip Flow**

1. Open in incognito — click "Skip personalization"
2. Verify gamification is OFF by default (no Progress Ring)
3. Open settings, toggle gamification ON — verify it activates

- [ ] **Step 8: Final commit**

```bash
git add -A
git commit -m "feat(gamification): complete gamification system — progress ring, achievements, hidden gems"
```
