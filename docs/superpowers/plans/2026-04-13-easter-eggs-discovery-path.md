# Easter Eggs & Discovery Path Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework gems into subtle Easter Eggs, add a hidden Pour-Over coffee mini-game, and upgrade the journey wrap-up with a shareable visual discovery path.

**Architecture:** Three changes layered on existing gamification: (1) gems lose their toasts and gain subtle visual treatment in ContentBlock, (2) a new `PourOverGame` component intercepts coffee-related free-text input, (3) `JourneyWrapUp` gets a discovery path visualization derived from a new `visitOrder` array and a `NODE_CLUSTERS` mapping.

**Tech Stack:** React 19, Framer Motion, Tailwind CSS, TypeScript. No new dependencies.

---

## File Structure

| File | Role |
|------|------|
| `src/lib/content-graph.ts` | Add `gemIntro`, `gemTitle` to gem nodes. Add `coffee-hunter` achievement. Add `NODE_CLUSTERS` and `COFFEE_KEYWORDS`. |
| `src/hooks/useGamification.ts` | Accept `foundCoffeeEasterEgg`. Add coffee-hunter check. Remove gem toast queueing. |
| `src/components/ContentBlock.tsx` | Detect gem blocks, apply amber tint and intro text. Add shimmer to gem hooks. |
| `src/components/PourOverGame.tsx` | Coffee pour-over mini-game (new file) |
| `src/components/ConversationView.tsx` | Coffee keyword detection, `visitOrder` tracking, `foundCoffeeEasterEgg` state. Remove 💎 emoji from gem labels. Pass new props. |
| `src/components/JourneyWrapUp.tsx` | Add discovery path visualization, stats, share button. Accept new props. |

---

## Task 1: Extend Content Graph with Gem Metadata, Coffee Achievement, and Clusters

**Files:**
- Modify: `src/lib/content-graph.ts`

- [ ] **Step 1: Add gemIntro and gemTitle fields to ContentNode interface**

Add after the `gem` field in the `ContentNode` interface (around line 22):

```typescript
  gemIntro?: string;
  gemTitle?: string;
```

- [ ] **Step 2: Add gemIntro and gemTitle to each gem node**

For `gem-convergence` (around line 323), add after the `gem` field:

```typescript
    gemTitle: "The Convergence",
    gemIntro: "You connected the dots...",
```

For `gem-lab-to-product` (around line 338), add after the `gem` field:

```typescript
    gemTitle: "From Lab to Product",
    gemIntro: "You linked research to product...",
```

For `gem-full-picture` (around line 353), add after the `gem` field:

```typescript
    gemTitle: "The Full Picture",
    gemIntro: "You've seen the full picture...",
```

- [ ] **Step 3: Add coffee-hunter to ACHIEVEMENT_DEFINITIONS**

Add at the end of the `ACHIEVEMENT_DEFINITIONS` array (before the closing `];`):

```typescript
  {
    id: "coffee-hunter",
    emoji: "☕",
    name: "Coffee Hunter",
    description: "Found Max's secret café",
    requiredEasterEgg: "coffee",
  },
```

Also update the `AchievementDefinition` type in `src/lib/types.ts` to add the optional field:

```typescript
export interface AchievementDefinition {
  id: string;
  emoji: string;
  name: string;
  description: string;
  requiredNodes?: string[];
  minVisited?: number;
  minFreeQuestions?: number;
  requiredEasterEgg?: string;
}
```

- [ ] **Step 4: Add NODE_CLUSTERS mapping and COFFEE_KEYWORDS**

Add after `getNodeCounts()`:

```typescript
export const NODE_CLUSTERS: Record<string, { emoji: string; name: string }> = {
  "startup-story": { emoji: "🚀", name: "Founder" },
  "product-magic": { emoji: "🚀", name: "Founder" },
  "after-acquisition": { emoji: "🚀", name: "Founder" },
  "founder-lessons": { emoji: "🚀", name: "Founder" },
  "pm-approach": { emoji: "📋", name: "Product" },
  "my-fit": { emoji: "📋", name: "Product" },
  "school-gets-wrong": { emoji: "🎓", name: "Education" },
  "what-schools-should-teach": { emoji: "🎓", name: "Education" },
  "anthropic-education-vision": { emoji: "🎓", name: "Education" },
  "psychology-of-learning": { emoji: "🧠", name: "Psychology" },
  "building-with-claude": { emoji: "🤖", name: "AI" },
  "ai-in-education": { emoji: "🤖", name: "AI" },
  "side-projects": { emoji: "🤖", name: "AI" },
  "future-of-work": { emoji: "🤖", name: "AI" },
  "research": { emoji: "🔬", name: "Research" },
  "what-id-build": { emoji: "💡", name: "Vision" },
  "why-anthropic": { emoji: "💡", name: "Vision" },
  "personal": { emoji: "👤", name: "Personal" },
  "gem-convergence": { emoji: "💎", name: "The Convergence" },
  "gem-lab-to-product": { emoji: "💎", name: "From Lab to Product" },
  "gem-full-picture": { emoji: "💎", name: "The Full Picture" },
};

export const COFFEE_KEYWORDS = [
  "coffee", "café", "cafe", "barista", "pour over", "pour-over",
  "pourover", "espresso", "latte", "cappuccino", "brew",
];

export function matchesCoffeeKeyword(text: string): boolean {
  const lower = text.toLowerCase();
  return COFFEE_KEYWORDS.some((kw) => lower.includes(kw));
}
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/content-graph.ts src/lib/types.ts
git commit -m "feat(easter-eggs): add gem metadata, coffee achievement, node clusters, and coffee keywords"
```

---

## Task 2: Update useGamification — Remove Gem Toasts, Add Coffee Achievement

**Files:**
- Modify: `src/hooks/useGamification.ts`

- [ ] **Step 1: Update function signature to accept foundCoffeeEasterEgg**

Change the function signature (line 16-19):

```typescript
export function useGamification(
  visitedNodes: Set<string>,
  freeQuestionCount: number,
  gamified: boolean,
  foundCoffeeEasterEgg: boolean,
): GamificationState {
```

- [ ] **Step 2: Add coffee-hunter achievement check**

In the achievement checking effect (line 54-94), add a check for `requiredEasterEgg` inside the for loop, after the `minFreeQuestions` check (after line 73):

```typescript
      if (earned && achievement.requiredEasterEgg) {
        earned = achievement.requiredEasterEgg === "coffee" && foundCoffeeEasterEgg;
      }
```

Add `foundCoffeeEasterEgg` to the dependency array of this effect (line 94):

```typescript
  }, [visitedNodes, freeQuestionCount, gamified, unlockedAchievements, total, foundCoffeeEasterEgg]);
```

- [ ] **Step 3: Remove gem toast queueing**

In the gem unlock effect (lines 96-135), remove the toast queueing block. Delete lines 124-132 (the `const gemToast` and `setToastQueue` lines). The effect should just update `unlockedGems` without queueing any toast:

```typescript
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
      }
    }
  }, [visitedNodes, gamified, unlockedGems]);
```

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useGamification.ts
git commit -m "feat(easter-eggs): remove gem toasts, add coffee-hunter achievement check"
```

---

## Task 3: Update ContentBlock — Gem Visual Treatment and Shimmer Hooks

**Files:**
- Modify: `src/components/ContentBlock.tsx`

- [ ] **Step 1: Import CONTENT_GRAPH for gem detection**

Add at the top:

```typescript
import { CONTENT_GRAPH } from "@/lib/content-graph";
```

- [ ] **Step 2: Detect gem blocks and apply distinct styling**

Update the component to check if the block is a gem and render accordingly. Replace the entire `ContentBlock` function body:

```typescript
export default function ContentBlock({ block, onHookClick, isReadOnly = false, unlockedGems }: ContentBlockProps) {
  const isGemBlock = block.id.startsWith("gem-");
  const gemNode = isGemBlock ? CONTENT_GRAPH[block.id] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-2xl p-6 shadow-neu sm:p-8 ${
        isGemBlock ? "bg-amber-50/50 border border-amber-200/30" : "bg-white"
      }`}
    >
      <div className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-light">
        {gemNode?.gemTitle ?? block.questionTitle}
      </div>
      {gemNode?.gemIntro && (
        <p className="mb-3 text-sm italic text-amber-700/70">{gemNode.gemIntro}</p>
      )}
      <p className="leading-relaxed text-ink">{block.text}</p>
      {block.richType && block.richData && (
        <RichElement richType={block.richType} richData={block.richData} />
      )}
      {!isReadOnly && block.hooks.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {block.hooks.map((hook) => (
            <HookChip
              key={hook.label}
              hook={hook}
              onClick={() => onHookClick(hook.targetId ?? hook.question, !!hook.targetId)}
              isGem={!!unlockedGems?.has(hook.targetId ?? "")}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
```

- [ ] **Step 3: Add shimmer animation to gem hooks**

Update the `HookChip` gem styling to include a subtle shimmer. Replace the gem branch of the className:

```typescript
function HookChip({ hook, onClick, isGem = false }: { hook: HookSuggestion; onClick: () => void; isGem?: boolean }) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`rounded-xl border px-4 py-2 text-sm transition-shadow hover:shadow-neu-sm ${
        isGem
          ? "border-amber-400/40 bg-amber-50 text-amber-700 font-medium animate-shimmer"
          : "border-accent/20 bg-paper text-accent"
      }`}
    >
      {hook.label} →
    </motion.button>
  );
}
```

Add the shimmer keyframe animation to `src/app/globals.css`. Add at the end of the file:

```css
@keyframes shimmer {
  0%, 100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); }
  50% { box-shadow: 0 0 8px 2px rgba(251, 191, 36, 0.15); }
}

.animate-shimmer {
  animation: shimmer 2s ease-in-out infinite;
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/ContentBlock.tsx src/app/globals.css
git commit -m "feat(easter-eggs): add amber tint for gem blocks, shimmer for gem hooks"
```

---

## Task 4: Create PourOverGame Component

**Files:**
- Create: `src/components/PourOverGame.tsx`

- [ ] **Step 1: Create the component**

Create `src/components/PourOverGame.tsx`:

```typescript
"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface PourOverGameProps {
  onClose: () => void;
}

const MAX_RECIPE = { grind: 2, temp: 92, time: 210 };

function calculateRating(grind: number, temp: number, timeSeconds: number): { stars: number; comment: string } {
  const grindDist = Math.abs(grind - MAX_RECIPE.grind);
  const tempDist = Math.abs(temp - MAX_RECIPE.temp);
  const timeDist = Math.abs(timeSeconds - MAX_RECIPE.time);

  const grindScore = grindDist === 0 ? 2 : grindDist === 1 ? 1 : 0;
  const tempScore = tempDist <= 1 ? 2 : tempDist <= 3 ? 1 : 0;
  const timeScore = timeDist <= 15 ? 2 : timeDist <= 45 ? 1 : 0;

  const total = grindScore + tempScore + timeScore; // 0-6

  if (total >= 6) return { stars: 5, comment: "That's my exact recipe. You'd survive a shift." };
  if (total >= 4) return { stars: 4, comment: "Close — I'd drink this. Almost barista-level." };
  if (total >= 3) return { stars: 3, comment: "Drinkable. But Max would tweak the grind." };
  if (total >= 1) return { stars: 2, comment: "Brave choice. Max politely pours it out." };
  return { stars: 1, comment: "This is a war crime. Max is calling the coffee police." };
}

const GRIND_LABELS = ["", "Fine", "Medium-Fine", "Medium", "Medium-Coarse", "Coarse"];

function formatTime(seconds: number): string {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

export default function PourOverGame({ onClose }: PourOverGameProps) {
  const [grind, setGrind] = useState(3);
  const [temp, setTemp] = useState(90);
  const [time, setTime] = useState(180);
  const [result, setResult] = useState<{ stars: number; comment: string } | null>(null);

  function handleBrew() {
    setResult(calculateRating(grind, temp, time));
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl bg-white p-6 shadow-neu sm:p-8"
    >
      <div className="mb-1 text-xs font-medium uppercase tracking-wide text-ink-light">
        Max's Pour-Over Lab
      </div>
      <p className="mb-6 text-sm italic text-ink-light">You found my secret café.</p>

      <div className="space-y-5">
        {/* Grind Size */}
        <div>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="text-ink-light">Grind Size</span>
            <span className="font-medium text-ink">{GRIND_LABELS[grind]}</span>
          </div>
          <input
            type="range"
            min={1} max={5} step={1} value={grind}
            onChange={(e) => setGrind(Number(e.target.value))}
            className="slider w-full"
            aria-label="Grind Size"
            aria-valuemin={1} aria-valuemax={5} aria-valuenow={grind}
            disabled={result !== null}
          />
          <div className="flex justify-between text-[10px] text-ink-light/50">
            <span>Fine</span><span>Coarse</span>
          </div>
        </div>

        {/* Temperature */}
        <div>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="text-ink-light">Temperature</span>
            <span className="font-medium text-ink">{temp}°C</span>
          </div>
          <input
            type="range"
            min={85} max={96} step={1} value={temp}
            onChange={(e) => setTemp(Number(e.target.value))}
            className="slider w-full"
            aria-label="Temperature"
            aria-valuemin={85} aria-valuemax={96} aria-valuenow={temp}
            disabled={result !== null}
          />
          <div className="flex justify-between text-[10px] text-ink-light/50">
            <span>85°C</span><span>96°C</span>
          </div>
        </div>

        {/* Brew Time */}
        <div>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="text-ink-light">Brew Time</span>
            <span className="font-medium text-ink">{formatTime(time)}</span>
          </div>
          <input
            type="range"
            min={120} max={300} step={15} value={time}
            onChange={(e) => setTime(Number(e.target.value))}
            className="slider w-full"
            aria-label="Brew Time"
            aria-valuemin={120} aria-valuemax={300} aria-valuenow={time}
            disabled={result !== null}
          />
          <div className="flex justify-between text-[10px] text-ink-light/50">
            <span>2:00</span><span>5:00</span>
          </div>
        </div>
      </div>

      {/* Brew / Result */}
      {!result ? (
        <button
          onClick={handleBrew}
          className="mt-6 w-full rounded-xl bg-accent px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
        >
          Brew
        </button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 rounded-xl border border-[var(--color-paper-dark,#E5DDD3)] bg-paper p-4 text-center"
        >
          <div className="text-2xl" aria-label={`${result.stars} out of 5 stars`}>
            {"★".repeat(result.stars)}{"☆".repeat(5 - result.stars)}
          </div>
          <p className="mt-2 text-sm italic text-ink">{result.comment}</p>
        </motion.div>
      )}

      {/* Back button */}
      {result && (
        <button
          onClick={onClose}
          className="mt-4 w-full rounded-xl border border-accent/20 bg-paper px-5 py-3 text-sm font-medium text-accent transition-shadow hover:shadow-neu-sm"
        >
          Back to the conversation →
        </button>
      )}
    </motion.div>
  );
}
```

- [ ] **Step 2: Add slider styling to globals.css**

Add at the end of `src/app/globals.css`:

```css
.slider {
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  border-radius: 3px;
  background: var(--color-paper-dark, #E5DDD3);
  outline: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-accent);
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-accent);
  cursor: pointer;
  border: none;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.slider:disabled {
  opacity: 0.5;
  cursor: default;
}

.slider:disabled::-webkit-slider-thumb {
  cursor: default;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/PourOverGame.tsx src/app/globals.css
git commit -m "feat(easter-eggs): add PourOverGame component with slider controls and rating system"
```

---

## Task 5: Integrate Coffee Easter Egg and Visit Order into ConversationView

**Files:**
- Modify: `src/components/ConversationView.tsx`

- [ ] **Step 1: Add imports**

Add at the top:

```typescript
import PourOverGame from "./PourOverGame";
import { matchesCoffeeKeyword } from "@/lib/content-graph";
```

- [ ] **Step 2: Add new state variables**

After the existing state declarations (after line 33), add:

```typescript
  const [visitOrder, setVisitOrder] = useState<string[]>([]);
  const [foundCoffeeEasterEgg, setFoundCoffeeEasterEgg] = useState(false);
  const [coffeeGameActive, setCoffeeGameActive] = useState(false);
```

- [ ] **Step 3: Update useGamification call to pass foundCoffeeEasterEgg**

Change:

```typescript
  const gamification = useGamification(
    visitedNodes,
    freeQuestionCount,
    preferences?.gamified ?? false,
  );
```

To:

```typescript
  const gamification = useGamification(
    visitedNodes,
    freeQuestionCount,
    preferences?.gamified ?? false,
    foundCoffeeEasterEgg,
  );
```

- [ ] **Step 4: Track visit order in addNodeBlock**

Inside `addNodeBlock`, after `setVisitedNodes(updatedVisited);` (line 107), add:

```typescript
    setVisitOrder((prev) => prev.includes(nodeId) ? prev : [...prev, nodeId]);
```

- [ ] **Step 5: Remove 💎 emoji from gem hook labels**

In the gem hooks injection effect, update the labels. Change:

```typescript
        const gemLabel = gemId === "gem-convergence" ? "💎 Discover the Convergence"
          : gemId === "gem-lab-to-product" ? "💎 From Lab to Product"
          : "💎 The Full Picture";
```

To:

```typescript
        const gemLabel = gemId === "gem-convergence" ? "The Convergence"
          : gemId === "gem-lab-to-product" ? "From Lab to Product"
          : "The Full Picture";
```

- [ ] **Step 6: Add coffee keyword interception in submitFreeQuestion**

At the beginning of `submitFreeQuestion`, after `if (isLoading) return;`, add:

```typescript
    // Coffee Easter Egg
    if (matchesCoffeeKeyword(question)) {
      setFoundCoffeeEasterEgg(true);
      setCoffeeGameActive(true);
      blockCounter.current += 1;
      const coffeeBlock: ContentBlockData = {
        id: `coffee-${blockCounter.current}`,
        questionTitle: "Max's Pour-Over Lab",
        text: "",
        richType: null,
        richData: null,
        hooks: [],
      };
      setBlocks((prev) => [...prev, coffeeBlock]);
      return;
    }
```

- [ ] **Step 7: Render PourOverGame for coffee blocks**

In the blocks map, update the rendering to handle coffee blocks. Change:

```typescript
          {blocks.map((block, i) => (
            <ContentBlock
              key={block.id}
              block={block}
              onHookClick={handleHookClick}
              isReadOnly={i < blocks.length - 1}
              unlockedGems={preferences?.gamified ? gamification.unlockedGems : undefined}
            />
          ))}
```

To:

```typescript
          {blocks.map((block, i) => (
            block.id.startsWith("coffee-") ? (
              <PourOverGame
                key={block.id}
                onClose={() => setCoffeeGameActive(false)}
              />
            ) : (
              <ContentBlock
                key={block.id}
                block={block}
                onHookClick={handleHookClick}
                isReadOnly={i < blocks.length - 1}
                unlockedGems={preferences?.gamified ? gamification.unlockedGems : undefined}
              />
            )
          ))}
```

- [ ] **Step 8: Pass new props to JourneyWrapUp**

Update the JourneyWrapUp rendering. Change:

```typescript
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
```

To:

```typescript
            <JourneyWrapUp
              narrative={wrapUpNarrative}
              isLoading={isWrapUpLoading}
              gamified={preferences?.gamified ?? false}
              unlockedAchievements={gamification.unlockedAchievements}
              unlockedGems={gamification.unlockedGems}
              discoveredCount={gamification.discoveredCount}
              totalNodes={gamification.totalNodes}
              onNewJourney={handleNewJourney}
              visitOrder={visitOrder}
              foundCoffeeEasterEgg={foundCoffeeEasterEgg}
              blocks={blocks}
            />
```

- [ ] **Step 9: Reset new state in handleNewJourney**

Add to `handleNewJourney`, before `resetPreferences()`:

```typescript
    setVisitOrder([]);
    setFoundCoffeeEasterEgg(false);
    setCoffeeGameActive(false);
```

- [ ] **Step 10: Commit**

```bash
git add src/components/ConversationView.tsx
git commit -m "feat(easter-eggs): integrate coffee game trigger, visit order tracking, and gem label cleanup"
```

---

## Task 6: Upgrade JourneyWrapUp with Discovery Path and Share

**Files:**
- Modify: `src/components/JourneyWrapUp.tsx`

- [ ] **Step 1: Update imports and props**

Add import:

```typescript
import { NODE_CLUSTERS } from "@/lib/content-graph";
import type { ContentBlockData } from "@/lib/types";
```

Update the interface:

```typescript
interface JourneyWrapUpProps {
  narrative: string | null;
  isLoading: boolean;
  gamified: boolean;
  unlockedAchievements: Set<string>;
  unlockedGems: Set<string>;
  discoveredCount: number;
  totalNodes: number;
  onNewJourney: () => void;
  visitOrder: string[];
  foundCoffeeEasterEgg: boolean;
  blocks: ContentBlockData[];
}
```

Update the destructuring to include the new props:

```typescript
export default function JourneyWrapUp({
  narrative,
  isLoading,
  gamified,
  unlockedAchievements,
  unlockedGems,
  discoveredCount,
  totalNodes,
  onNewJourney,
  visitOrder,
  foundCoffeeEasterEgg,
  blocks,
}: JourneyWrapUpProps) {
```

- [ ] **Step 2: Add discovery path derivation and share logic**

Add at the top of the component body (after the destructuring), before `earnedAchievements`:

```typescript
  const [shareStatus, setShareStatus] = useState<"idle" | "saving" | "copied">("idle");

  // Derive cluster path from visit order
  const clusterPath: Array<{ emoji: string; name: string }> = [];
  const seenClusters = new Set<string>();
  for (const nodeId of visitOrder) {
    const cluster = NODE_CLUSTERS[nodeId];
    if (!cluster || seenClusters.has(cluster.name)) continue;
    seenClusters.add(cluster.name);
    clusterPath.push(cluster);
  }

  async function handleShare() {
    if (shareStatus === "saving") return;
    setShareStatus("saving");
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocks }),
      });
      if (!res.ok) throw new Error("Failed to save");
      const { id } = await res.json();
      const url = `${window.location.origin}/s/${id}`;
      await navigator.clipboard.writeText(url);
      setShareStatus("copied");
      setTimeout(() => setShareStatus("idle"), 2000);
    } catch {
      setShareStatus("idle");
    }
  }
```

Add the `useState` import — update the top import:

```typescript
import { useState } from "react";
```

- [ ] **Step 3: Add discovery path section**

Add after the gamification badges section and before the CTAs section (`{/* CTAs */}`):

```typescript
      {/* Discovery Path */}
      {visitOrder.length > 0 && (
        <div className="mt-5 rounded-xl border border-[var(--color-paper-dark,#E5DDD3)] bg-paper p-4">
          <div className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-light">
            Your Discovery Path
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-sm">
            {clusterPath.map((cluster, i) => (
              <span key={cluster.name} className="inline-flex items-center">
                {i > 0 && <span className="mx-1 text-ink-light/40">→</span>}
                <span className="text-ink">
                  {cluster.emoji} {cluster.name}
                </span>
              </span>
            ))}
            {foundCoffeeEasterEgg && (
              <span className="inline-flex items-center">
                <span className="mx-1 text-ink-light/40">·</span>
                <span className="text-ink">☕</span>
              </span>
            )}
          </div>
          <div className="mt-2 text-xs text-ink-light">
            {discoveredCount}/{totalNodes} topics
            {unlockedGems.size > 0 && ` · ${unlockedGems.size} gem${unlockedGems.size > 1 ? "s" : ""}`}
            {foundCoffeeEasterEgg && " · ☕ found"}
          </div>
          <button
            onClick={handleShare}
            disabled={shareStatus === "saving"}
            className="mt-3 w-full rounded-lg border border-accent/20 bg-white px-3 py-2 text-xs font-medium text-accent transition-shadow hover:shadow-neu-sm disabled:opacity-50"
          >
            {shareStatus === "copied" ? "Link copied!" : shareStatus === "saving" ? "Saving..." : "Share your discovery path"}
          </button>
        </div>
      )}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/JourneyWrapUp.tsx
git commit -m "feat(easter-eggs): add discovery path visualization and share button to JourneyWrapUp"
```

---

## Task 7: Build Verification

**Files:**
- No file changes

- [ ] **Step 1: TypeScript check**

Run: `npx tsc --noEmit`

Expected: No errors.

- [ ] **Step 2: Build**

Run: `npm run build`

Expected: Build succeeds.

- [ ] **Step 3: Commit any fixes if needed**

```bash
git add -A
git commit -m "fix(easter-eggs): resolve any remaining type or build errors"
```
