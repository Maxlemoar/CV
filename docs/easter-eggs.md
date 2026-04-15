# Easter Eggs & Hidden Gems

Internal reference for all hidden features on the CV site. Use this as a cheat sheet during interviews/demos.

All eggs are tracked centrally in `src/lib/egg-context.tsx` (`EGG_CATALOG`). Discovering one fires a toast (`EggToast.tsx`) and updates the floating counter badge (`EggCounter.tsx`). The total found is also surfaced in the Reveal screen as a fourth stat tile (`N/8`) inside the "Session data" card.

## Quick reference

| # | ID | Feature | Trigger | Visibility |
|---|---|---|---|---|
| 1 | `curious-mind` | Curious Mind | Submit your first free-form question | **Easy** — chat flow |
| 2 | `coffee` | Barista Mode / Pour-Over Game | Type "coffee" / "espresso" / "brew" etc. | Invisible |
| 3 | `gem-convergence` | The Convergence | Visit 3 specific nodes | Unlocks as amber hook |
| 4 | `gem-lab-to-product` | From Lab to Product | Visit 3 specific nodes | Unlocks as amber hook |
| 5 | `gem-full-picture` | The Full Picture | Visit 15+ nodes | Unlocks as amber hook |
| 6 | `science` | Behind the Science 🔬 | Click tiny 🔬 icon (15% opacity) | Near-invisible |
| 7 | `comparison` | The Benchmark | Click "Experiment #X — Result" on Reveal | Subtle hover hint |
| 8 | `konami` | Architect View | Konami code (`↑↑↓↓←→←→BA`) | Invisible |

**Total: 8 eggs.** Found count is persisted in `localStorage` under `cv-found-eggs-v1` and resets when the user starts a new journey.

---

## 0. Egg tracking system

**Files:**
- `src/lib/egg-context.tsx` — `EggProvider`, `useEggs()`, `EGG_CATALOG`, `TOTAL_EGGS`
- `src/components/EggToast.tsx` — toast shown when an egg is discovered
- `src/components/EggCounter.tsx` — floating badge (top-left) with expandable list

**Behavior:**
- Counter badge hides until the first egg is found (no spoilers)
- Expanded list shows found eggs by name/icon, undiscovered slots as ❓ "???"
- Toast shows in top-right for 4s with title + hint + `N/8`
- State persists across reloads via `localStorage`; wiped by "New Journey"
- Reveal screen surfaces the found count as a fourth stat tile ("Eggs found N/8") inside the existing "Session data" card, alongside topics explored, experiment #, and unique path

**Registration:** `EggProvider` wraps the app in `src/app/layout.tsx`. To add a new egg:
1. Add entry to `EGG_CATALOG` in `egg-context.tsx`
2. Call `discoverEgg("new-id")` from wherever the trigger lives

---

## 1. Curious Mind (new, easy)

**Trigger:** Submit the first free-form question in the input bar (any text that doesn't match a coffee keyword).

**Why this one:** It's the gateway egg — almost every visitor who engages with the chat naturally finds it. Designed to introduce recruiters to the concept that there are hidden features to find, without gating on anything obscure.

**Implementation:** `src/components/ConversationView.tsx` in `submitFreeQuestion` — discovers `curious-mind` when `freeQuestionCount === 0` at submit time.

**Discoverability:** Very high (~60%+ of visitors who type anything).

---

## 2. Konami Code → Architect View

**Trigger:** `↑ ↑ ↓ ↓ ← → ← → B A`
**Close:** `ESC`

Opens a full-screen terminal-style view (green-on-black, `bg-[#0a0a1a]`) showing:
- Content graph visualization with all nodes and hook connections
- Gem nodes highlighted in amber, visited nodes in green
- Architecture decision explanations (content graph design, personalization, interview rationale)
- Full tech stack

**Files:**
- `src/hooks/useKonamiCode.ts`
- `src/components/rabbit-holes/ArchitectView.tsx`

---

## 3. Pour-Over Mini-Game (Barista Mode)

**Trigger:** Type any of these keywords into the free question input:
`coffee`, `café`, `cafe`, `barista`, `pour over`, `pour-over`, `pourover`, `espresso`, `latte`, `cappuccino`, `brew`

Intercepts the question and launches an interactive brewing simulator with three sliders:
- **Grind Size** (1–5: Fine to Coarse)
- **Temperature** (85–96°C)
- **Brew Time** (2:00–5:00)

**Max's perfect recipe:** Grind 4 (Medium-Coarse), 94°C, 3:00.

**Scoring:** 0–6 points (2 per dimension). Results:
- **6 pts (5★):** "Bright and fruity — exactly how I like it." + shows `/photo-coffee.jpg`
- **4–5 pts (4★):** "Close — I'd drink this."
- **3 pts (3★):** "Drinkable. But Max would tweak the grind."
- **1–2 pts (2★):** "Brave choice. Max politely pours it out."
- **0 pts (1★):** "This is a war crime. Max is calling the coffee police."

**Files:**
- `src/components/ConversationView.tsx` (trigger logic, lines 137–151)
- `src/components/PourOverGame.tsx`
- `src/lib/content-graph.ts` (keyword list, lines 430–438)

---

## 4–6. Hidden Gem Nodes 💎

Three content blocks that unlock when specific node-visit conditions are met. They appear as **amber-tinted hook chips** with a shimmer animation in the last displayed block.

**Surfacing mechanism (post PR #8):** Master's new hook-router (`src/lib/hook-router.ts`) made Claude responsible for picking the 3 follow-up chips per block. That means authored gem hooks don't naturally surface. To guarantee gems are reachable, `ConversationView.addNodeBlock` post-processes `block.hooks` after the router resolves:

1. Compute `surfaceableGems` = any gem node whose `requiredNodes` / `minVisited` gate is satisfied and that the visitor hasn't visited yet (via `isNodeUnlocked` from `hook-router.ts`)
2. Build hook entries using the authored `gemTitle` (e.g. "The Convergence") — not Claude's generic labels
3. Prepend them to `block.hooks` and cap the total at 4

This is the only reliable path into a gem. Without it, gems live in `listCandidateIds` but Claude rarely picks them because their tags bias toward vision/psychology topics that don't always match the visitor's tilt.

**Amber chip styling:** `ConversationView` also computes a memoized `unlockedGems: Set<string>` from `visitedNodes` and passes it to every `<ContentBlock>`. `HookChip` uses it to decide whether `isGem` is true, activating the `animate-shimmer` amber treatment.

**Visual treatment:**
- Block background (once visited): `bg-amber-50/50`, border `border-amber-200/30`
- Chip (before visit): `bg-amber-50`, `text-amber-700`, `animate-shimmer` (2s cycle)

**Defined in:** `src/lib/content-graph.ts:345-394` (gem nodes + tags)
**Surfaced in:** `src/components/ConversationView.tsx` (`addNodeBlock` post-processing + `unlockedGems` memo)
**Styled in:** `src/components/ContentBlock.tsx` (`HookChip` `isGem` branch)

### Gem 1 — "The Convergence" (`gem-convergence`)
**Unlock:** Visit all of `psychology-of-learning`, `ai-in-education`, `building-with-claude`
**Intro:** "You connected the dots..."
**Content:** Psychology (autonomy/competence/connection) + AI capability + daily building experience → vision of adaptive learning at Anthropic.

### Gem 2 — "From Lab to Product" (`gem-lab-to-product`)
**Unlock:** Visit all of `startup-story`, `founder-lessons`, `research`
**Intro:** "You linked research to product..."
**Content:** How academic methodology (research design, inter-rater reliability) informs PM approach. AI assessor as proof (89% human-AI agreement).

### Gem 3 — "The Full Picture" (`gem-full-picture`)
**Unlock:** Visit 15+ total nodes (any combination)
**Intro:** "You've seen the full picture..."
**Content:** Career synthesis — psychologist → founder → PM → AI builder → father. "Lived, not just visited" all relevant domains.

---

## 7. Behind the Science 🔬

**Trigger:** Hover the tiny 🔬 button in the bottom-right corner of blocks with a `sciencePrinciple` prop. Starts at `opacity-[0.15]`, goes to `0.6` on hover.

Opens a blue-themed modal citing the learning science research behind the block:

| Principle | Citation |
|---|---|
| Testing Effect | Roediger & Karpicke 2006 |
| Spaced Retrieval | Karpicke & Bauernschmidt 2011 |
| Interleaving | Rohrer & Taylor 2007 |
| Adaptive Presentation | Kalyuga 2007 |

**Files:**
- `src/components/rabbit-holes/BehindTheScience.tsx` (lines 5–26 for principles)
- `src/components/ContentBlock.tsx:65-80` (trigger)

---

## 8. Comparison Modal (The Benchmark)

**Trigger:** On the Reveal screen, click the "Experiment #X — Result" header text. Only hint is a hover color change to orange.

Shows the visitor's own profile dimensions highlighted in orange ("← you") against aggregate visitor data across all 5 dimensions:

| Dimension | Options |
|---|---|
| Persuasion | Results 38% / Process 41% / Character 21% |
| Learning | Exploratory 45% / Structured 35% / Social 20% |
| Education | Practice 33% / Individualization 42% / Inspiration 25% |
| Motivation | Mastery 30% / Purpose 44% / Relatedness 26% |
| Sharing | Surprise 47% / Utility 31% / Emotion 22% |

Bars animate in sequence. Footer: "Based on anonymized visitor data."

**File:** `src/components/rabbit-holes/Comparison.tsx`

---

## 9. Visitor Profiling / Reveal (core feature, not an egg)

Not tracked in `EGG_CATALOG` — this is the core experience, not a hidden feature. The interview measures 5 dimensions (Persuasion, Learning, Motivation, Education, Sharing) and the `/api/frame` endpoint uses that profile to personalize intro text and hook labels per content block.

The **Reveal screen** (after 8+ nodes visited) explicitly surfaces:
- Dimension scores with progress bars
- "Here's what I learned about you"
- "What I did with it" — how preferences shaped the experience
- Punchline: "Every person who visits this site experiences a different version of me."

**Files:**
- `src/components/Interview.tsx`
- `src/components/Reveal.tsx`
- `src/lib/experiment-types.ts`
- `src/lib/framing-hints.ts`

---

## Discoverability estimates

For a typical recruiter session (2–4 minutes):

- **Gateway (near-certain):** Curious Mind (~60%+ — anyone who asks a free question)
- **Likely (now that gem surfacing is deterministic):** Gem 1 or 2 (35–55%), Comparison modal (~25%)
- **Long-tail:** Pour-Over game (10–15%, only if they ask about coffee/hobbies)
- **Effectively invisible:** Konami code (~0%), Behind the Science 🔬 (~2%), Gem 3 (requires 15+ nodes)

Konami, Science button, and Coffee game are effectively reward features for engineers doing a second pass — or for live demos during interviews.

Because Curious Mind is designed to be easy, most visitors will see the counter badge appear and will then know there are more to find — which is the whole point of adding it. And because gem surfacing is now deterministic (not Claude-luck), visitors who organically explore the required trifecta for Gem 1 or 2 will reliably see an amber-shimmer chip.
