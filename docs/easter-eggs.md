# Easter Eggs & Hidden Gems

Internal reference for all hidden features on the CV site. Use this as a cheat sheet during interviews/demos.

## Quick reference

| # | Feature | Trigger | Visibility |
|---|---|---|---|
| 1 | Architect View | Konami code (`↑↑↓↓←→←→BA`) | Invisible |
| 2 | Pour-Over Game | Type "coffee" / "espresso" / "brew" etc. | Invisible |
| 3 | Gem: The Convergence | Visit 3 specific nodes | Unlocks as amber hook |
| 4 | Gem: From Lab to Product | Visit 3 specific nodes | Unlocks as amber hook |
| 5 | Gem: The Full Picture | Visit 15+ nodes | Unlocks as amber hook |
| 6 | Behind the Science 🔬 | Hover tiny icon (15% opacity) | Near-invisible |
| 7 | Comparison Modal | Click "Experiment #X — Result" on Reveal | Subtle hover hint |
| 8 | Reveal / Profiling | Complete interview + 8 nodes | Core feature |

---

## 1. Konami Code → Architect View

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

## 2. Pour-Over Mini-Game

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

## 3–5. Hidden Gem Nodes 💎

Three content blocks that unlock when specific node-visit conditions are met. They appear as **amber-tinted hooks** with a subtle shimmer animation in the last displayed block.

**Visual treatment:**
- Background: `bg-amber-50/50`
- Border: `border-amber-200/30`
- Hooks: `bg-amber-50`, `text-amber-700`, `animate-shimmer` (2s cycle)

**Defined in:** `src/lib/content-graph.ts:345-394`

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

## 6. Behind the Science 🔬

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

## 7. Comparison Modal

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

## 8. Visitor Profiling / Reveal

Not strictly an easter egg — the interview measures 5 dimensions (Persuasion, Learning, Motivation, Education, Sharing) and the `/api/frame` endpoint uses that profile to personalize intro text and hook labels per content block.

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

- **Most likely to hit:** Reveal (60–80%), Gem 1 or 2 (20–40%), Comparison modal (~25%)
- **Long-tail:** Pour-Over game (10–15%, only if they ask about hobbies)
- **Effectively invisible:** Konami code (~0%), Behind the Science 🔬 (~2%), Gem 3 (requires 15+ nodes)

Konami, Science button, and Coffee game are effectively reward features for engineers doing a second pass — or for live demos during interviews.
