# Journey Wrap-Up Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a personalized "learning product" at the end of each journey — an AI-generated summary of what the user discovered, with CTAs to contact Max or start a new journey.

**Architecture:** A new `JourneyWrapUp` component renders after the user triggers wrap-up (manually via link or proactively via dead-end detection). The existing `/api/chat` endpoint handles summary generation via a `wrapUp` flag. A `resetPreferences()` method on the PreferencesContext enables full journey reset.

**Tech Stack:** React 19, Framer Motion, Tailwind CSS, TypeScript. AI SDK (`generateText`). No new dependencies.

---

## File Structure

| File | Role |
|------|------|
| `src/components/JourneyWrapUp.tsx` | Renders the learning product: AI narrative, gamification badges, CTAs |
| `src/components/ConversationView.tsx` | Add wrap-up state, triggers, dead-end detection, conditional InputBar |
| `src/app/api/chat/route.ts` | Handle `wrapUp: true` flag with summary system prompt |
| `src/lib/preferences.tsx` | Add `resetPreferences()` to context |

---

## Task 1: Add resetPreferences to PreferencesContext

**Files:**
- Modify: `src/lib/preferences.tsx`

- [ ] **Step 1: Add resetPreferences to context type and provider**

In `src/lib/preferences.tsx`, update the context type to include `resetPreferences`:

```typescript
const PreferencesContext = createContext<{
  preferences: UserPreferences | null;
  setPreferences: (prefs: UserPreferences) => void;
  updatePreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
  resetPreferences: () => void;
  isOnboarded: boolean;
}>({
  preferences: null,
  setPreferences: () => {},
  updatePreference: () => {},
  resetPreferences: () => {},
  isOnboarded: false,
});
```

Add the `resetPreferences` callback inside `PreferencesProvider`, after `updatePreference`:

```typescript
  const resetPreferences = useCallback(() => {
    setPreferencesState(null);
  }, []);
```

Update the Provider value to include `resetPreferences`:

```typescript
    <PreferencesContext.Provider value={{ preferences, setPreferences, updatePreference, resetPreferences, isOnboarded: preferences !== null }}>
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/preferences.tsx
git commit -m "feat(wrapup): add resetPreferences to PreferencesContext"
```

---

## Task 2: Add wrapUp flag to chat API

**Files:**
- Modify: `src/app/api/chat/route.ts`

- [ ] **Step 1: Add wrap-up system prompt extension**

In `src/app/api/chat/route.ts`, add the wrap-up prompt constant after `buildPreferencesPrompt` (after line 108):

```typescript
const WRAPUP_PROMPT = `

## SPECIAL MODE: Journey Summary

The visitor has finished exploring. Instead of answering a question, generate a personalized 2-3 sentence summary of what they discovered about Max during this conversation.

RULES FOR THE SUMMARY:
- Focus on the specific facets they explored — don't be generic
- Reference the actual topics they engaged with
- Write as if you're telling them what they now know about Max that they didn't before
- Do NOT use phrases like "Thank you for visiting" or "I hope you enjoyed"
- Be specific and insightful
- The questionTitle should be "What you've learned about Max"
- Do NOT include hooks — return an empty hooks array
- Do NOT include rich elements — return null for richType and richData`;
```

- [ ] **Step 2: Update the POST handler to check for wrapUp flag**

In the `POST` function, after parsing `prefs` (line 133), add:

```typescript
  const wrapUp = (body as { wrapUp?: boolean })?.wrapUp === true;
```

Then update the system prompt construction (line 134). Change:

```typescript
  const systemPrompt = SYSTEM_PROMPT + (prefs ? buildPreferencesPrompt(prefs) : "");
```

To:

```typescript
  const systemPrompt = SYSTEM_PROMPT + (prefs ? buildPreferencesPrompt(prefs) : "") + (wrapUp ? WRAPUP_PROMPT : "");
```

- [ ] **Step 3: Update response schema for wrapUp (allow empty hooks)**

The current schema requires `hooks` to have `.min(2)`. For wrap-up responses, hooks should be empty. Update the `responseSchema` (line 13-16). Change:

```typescript
  hooks: z.array(z.object({
    label: z.string().describe("Short button label, 3-6 words"),
    question: z.string().describe("The full question this hook represents"),
  })).min(2).max(3).describe("Follow-up suggestions for the visitor"),
```

To:

```typescript
  hooks: z.array(z.object({
    label: z.string().describe("Short button label, 3-6 words"),
    question: z.string().describe("The full question this hook represents"),
  })).min(0).max(3).describe("Follow-up suggestions for the visitor. Empty array for wrap-up summaries."),
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/chat/route.ts
git commit -m "feat(wrapup): add wrapUp flag to chat API for journey summary generation"
```

---

## Task 3: Create JourneyWrapUp component

**Files:**
- Create: `src/components/JourneyWrapUp.tsx`

- [ ] **Step 1: Create the component**

Create `src/components/JourneyWrapUp.tsx`:

```typescript
"use client";

import { motion } from "framer-motion";
import type { AchievementDefinition } from "@/lib/types";
import { ACHIEVEMENT_DEFINITIONS } from "@/lib/content-graph";

interface JourneyWrapUpProps {
  narrative: string | null;
  isLoading: boolean;
  gamified: boolean;
  unlockedAchievements: Set<string>;
  unlockedGems: Set<string>;
  discoveredCount: number;
  totalNodes: number;
  onNewJourney: () => void;
}

export default function JourneyWrapUp({
  narrative,
  isLoading,
  gamified,
  unlockedAchievements,
  unlockedGems,
  discoveredCount,
  totalNodes,
  onNewJourney,
}: JourneyWrapUpProps) {
  const earnedAchievements = ACHIEVEMENT_DEFINITIONS.filter((a) =>
    unlockedAchievements.has(a.id)
  );

  const gemNames: Record<string, string> = {
    "gem-convergence": "The Convergence",
    "gem-lab-to-product": "From Lab to Product",
    "gem-full-picture": "The Full Picture",
  };

  const earnedGems = Array.from(unlockedGems).map((id) => ({
    id,
    emoji: "💎",
    name: gemNames[id] ?? id,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="no-print rounded-2xl bg-white p-6 shadow-neu sm:p-8"
    >
      {/* Headline */}
      <div className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-light">
        What you've learned about Max
      </div>

      {/* AI Narrative */}
      {isLoading ? (
        <div className="space-y-3 py-2">
          <div className="h-4 w-full animate-pulse rounded bg-paper-dark/30" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-paper-dark/30" />
          <div className="h-4 w-4/6 animate-pulse rounded bg-paper-dark/30" />
        </div>
      ) : (
        <p className="leading-relaxed text-ink">{narrative}</p>
      )}

      {/* Gamification badges */}
      {gamified && (earnedAchievements.length > 0 || earnedGems.length > 0) && (
        <div className="mt-5 rounded-xl border border-[var(--color-paper-dark,#E5DDD3)] bg-paper p-4">
          <div className="flex flex-wrap gap-2">
            {earnedAchievements.map((a) => (
              <span
                key={a.id}
                className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-medium text-ink shadow-neu-sm"
              >
                <span role="img" aria-label={a.name}>{a.emoji}</span>
                {a.name}
              </span>
            ))}
            {earnedGems.map((g) => (
              <span
                key={g.id}
                className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 shadow-neu-sm"
              >
                <span role="img" aria-label={g.name}>{g.emoji}</span>
                {g.name}
              </span>
            ))}
          </div>
          <div className="mt-2 text-xs text-ink-light">
            {discoveredCount}/{totalNodes} topics discovered
          </div>
        </div>
      )}

      {/* CTAs */}
      <div className="mt-6 border-t border-[var(--color-paper-dark,#E5DDD3)] pt-6">
        <div className="mb-4 font-serif text-lg font-semibold text-ink">
          Curious?
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href="mailto:m.marowsky@googlemail.com?subject=Let's chat — re: your portfolio"
            className="flex-1 rounded-xl bg-accent px-5 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-accent-hover"
          >
            Invite Max to a conversation
          </a>
          <button
            onClick={onNewJourney}
            className="flex-1 rounded-xl border border-accent/20 bg-paper px-5 py-3 text-center text-sm font-medium text-accent transition-shadow hover:shadow-neu-sm"
          >
            Start a new journey
          </button>
        </div>
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/JourneyWrapUp.tsx
git commit -m "feat(wrapup): add JourneyWrapUp component with narrative, badges, and CTAs"
```

---

## Task 4: Integrate wrap-up into ConversationView

**Files:**
- Modify: `src/components/ConversationView.tsx`

- [ ] **Step 1: Add imports**

Add at the top, after existing imports:

```typescript
import JourneyWrapUp from "./JourneyWrapUp";
```

- [ ] **Step 2: Add wrap-up state**

After `const [freeQuestionCount, setFreeQuestionCount] = useState(0);` (line 27), add:

```typescript
  const [isWrappedUp, setIsWrappedUp] = useState(false);
  const [wrapUpNarrative, setWrapUpNarrative] = useState<string | null>(null);
  const [isWrapUpLoading, setIsWrapUpLoading] = useState(false);
```

- [ ] **Step 3: Add dead-end detection utility**

Add after the `usePreferences` hook (after line 29), before `hasStarted`:

```typescript
  function isDeadEnd(block: ContentBlockData): boolean {
    if (block.hooks.length === 0) return true;
    return block.hooks.every((h) => h.targetId && visitedNodes.has(h.targetId));
  }
```

- [ ] **Step 4: Add dead-end hook injection effect**

Add after the gem hooks injection effect (after line 73):

```typescript
  // Inject wrap-up hook when last block is a dead end
  useEffect(() => {
    if (isWrappedUp || blocks.length === 0) return;

    const lastBlock = blocks[blocks.length - 1];
    if (!isDeadEnd(lastBlock)) return;
    if (lastBlock.hooks.some((h) => h.question === "__wrapup__")) return;

    setBlocks((prev) => {
      const last = prev[prev.length - 1];
      const wrapUpHook = { label: "See what you've discovered →", question: "__wrapup__", targetId: undefined };
      return [...prev.slice(0, -1), { ...last, hooks: [...last.hooks, wrapUpHook] }];
    });
  }, [blocks, visitedNodes, isWrappedUp]);
```

- [ ] **Step 5: Add triggerWrapUp function**

Add after `handleSkip` (after line 158):

```typescript
  const triggerWrapUp = useCallback(async () => {
    if (isWrapUpLoading || isWrappedUp) return;
    setIsWrappedUp(true);
    setIsWrapUpLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages,
          preferences: preferences ?? undefined,
          wrapUp: true,
        }),
      });

      if (!res.ok) throw new Error("Failed to get wrap-up");

      const data = await res.json();
      setWrapUpNarrative(data.text);
    } catch (err) {
      console.error("Wrap-up error:", err);
      setWrapUpNarrative("You explored several facets of Max's background. Thank you for your curiosity.");
    } finally {
      setIsWrapUpLoading(false);
    }
  }, [isWrapUpLoading, isWrappedUp, messages, preferences]);
```

- [ ] **Step 6: Add handleNewJourney function**

First, update the existing `usePreferences()` destructuring (line 29). Change:

```typescript
  const { preferences, setPreferences, isOnboarded } = usePreferences();
```

To:

```typescript
  const { preferences, setPreferences, resetPreferences, isOnboarded } = usePreferences();
```

Then add `handleNewJourney` after `triggerWrapUp`:

```typescript
  function handleNewJourney() {
    setBlocks([]);
    setVisitedNodes(new Set());
    setMessages([]);
    setFreeQuestionCount(0);
    setIsWrappedUp(false);
    setWrapUpNarrative(null);
    setIsWrapUpLoading(false);
    blockCounter.current = 0;
    resetPreferences();
  }
```

- [ ] **Step 7: Intercept __wrapup__ sentinel in handleHookClick**

Update `handleHookClick` (currently lines 139-145). Change:

```typescript
  const handleHookClick = useCallback((value: string, isNodeId: boolean) => {
    if (isNodeId) {
      addNodeBlock(value);
    } else {
      submitFreeQuestion(value);
    }
  }, [addNodeBlock, submitFreeQuestion]);
```

To:

```typescript
  const handleHookClick = useCallback((value: string, isNodeId: boolean) => {
    if (value === "__wrapup__") {
      triggerWrapUp();
      return;
    }
    if (isNodeId) {
      addNodeBlock(value);
    } else {
      submitFreeQuestion(value);
    }
  }, [addNodeBlock, submitFreeQuestion, triggerWrapUp]);
```

- [ ] **Step 8: Add wrap-up link in conversation header**

In the JSX, update the header section (around line 179-180). Change:

```typescript
            <ShareButton blocks={blocks} />
```

To:

```typescript
            <div className="flex items-center gap-3">
              {blocks.length >= 3 && !isWrappedUp && !isLoading && (
                <button
                  onClick={triggerWrapUp}
                  className="text-xs text-ink-light/60 transition-colors hover:text-accent"
                >
                  Wrap up
                </button>
              )}
              <ShareButton blocks={blocks} />
            </div>
```

- [ ] **Step 9: Add JourneyWrapUp component and conditional InputBar**

After the `{isLoading && <SkeletonBlock />}` line, before `<div ref={bottomRef} />`, add:

```typescript
          {isWrappedUp && (
            <JourneyWrapUp
              narrative={wrapUpNarrative}
              isLoading={isWrapUpLoading}
              gamified={preferences?.gamified ?? false}
              unlockedAchievements={gamification.unlockedAchievements}
              unlockedGems={gamification.unlockedGems}
              discoveredCount={gamification.discoveredCount}
              totalNodes={gamification.totalNodes}
              onNewJourney={handleNewJourney}
            />
          )}
```

Update the InputBar rendering. Change:

```typescript
      {hasStarted && (
        <InputBar onSubmit={(q) => submitFreeQuestion(q)} disabled={isLoading} />
      )}
```

To:

```typescript
      {hasStarted && !isWrappedUp && (
        <InputBar onSubmit={(q) => submitFreeQuestion(q)} disabled={isLoading} />
      )}
```

- [ ] **Step 10: Commit**

```bash
git add src/components/ConversationView.tsx
git commit -m "feat(wrapup): integrate wrap-up triggers, dead-end detection, and JourneyWrapUp rendering"
```

---

## Task 5: Build Verification and Smoke Test

**Files:**
- No file changes

- [ ] **Step 1: TypeScript check**

Run: `npx tsc --noEmit`

Expected: No errors.

- [ ] **Step 2: Build**

Run: `npm run build`

Expected: Build succeeds.

- [ ] **Step 3: Manual smoke test**

Start: `npm run dev`

Test scenarios:
1. Go through onboarding, explore 3+ nodes. Verify "Wrap up" link appears in header.
2. Click "Wrap up" — verify loading skeleton appears, then AI narrative loads, InputBar disappears, CTAs show.
3. Click "Invite Max to a conversation" — verify mailto link opens.
4. Click "Start a new journey" — verify full reset back to onboarding.
5. Navigate to a dead-end (visit all targets of a node's hooks) — verify "See what you've discovered →" hook appears.
6. Click the dead-end hook — verify wrap-up triggers.
7. With gamification on: verify achievements and gems display in the wrap-up card.
8. With gamification off: verify no badges section appears.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat(wrapup): complete journey wrap-up with learning product, dead-end detection, and CTAs"
```
