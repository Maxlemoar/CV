# Easter Eggs & Shareable Discovery Path Design

## Goal

Transform gamification from mechanical tracking into genuine moments of delight. Two features: (1) rework existing gems into subtler Easter Eggs and add a hidden Pour-Over coffee mini-game, (2) upgrade the journey wrap-up with a shareable visual discovery path.

## Part 1: Gems Become Subtle Easter Eggs

### Current State

The three hidden gem nodes (gem-convergence, gem-lab-to-product, gem-full-picture) unlock when the user visits certain node combinations. Currently: an `AchievementToast` says "Hidden content unlocked" and a 💎-prefixed hook appears in the last block. This is too explicit — it announces itself instead of letting the user discover it.

### New Behavior

**Remove gem-specific toasts.** When a gem unlocks, no toast appears. Instead:

1. The gem hook appears in the last block with a **subtle shimmer CSS animation** — a gentle pulse/glow that draws attention without being flashy. No 💎 emoji prefix — instead a slightly different styling (amber border, soft glow) that feels "different" without screaming "special."

2. When the user clicks the gem hook and the gem node renders, it gets a **distinct visual treatment**:
   - Background: warm amber/gold tint instead of white (`bg-amber-50/50`)
   - A personal intro line before the main content: *"You connected the dots..."* (for gem-convergence), *"You linked research to product..."* (for gem-lab-to-product), *"You've seen the full picture..."* (for gem-full-picture)
   - The `questionTitle` is the gem's name (e.g., "The Convergence") instead of the auto-generated kebab-case title

3. The discovery is **acknowledged only in the wrap-up** — the JourneyWrapUp shows which gems were found, but the moment of finding them is quiet and personal.

### Changes Required

**AchievementToast / useGamification:** Stop queueing toasts for gem unlocks. Keep gem tracking in `unlockedGems` — it's still needed for the wrap-up and ContentBlock styling.

**ConversationView:** Remove 💎 emoji prefix from gem hook labels. Change to simple labels:
- `gem-convergence` → "The Convergence"
- `gem-lab-to-product` → "From Lab to Product"
- `gem-full-picture` → "The Full Picture"

**ContentBlock:** When rendering a block whose `id` starts with `gem-`, apply the amber tint background and prepend the personal intro line.

**content-graph.ts:** Add a `gemIntro` field to each gem node with the personal intro text. Add a `gemTitle` field for the display name.

## Part 2: Coffee Pour-Over Easter Egg

### Trigger

When the user types a message containing any of these keywords (case-insensitive): `coffee`, `café`, `cafe`, `barista`, `pour over`, `pour-over`, `pourover`, `espresso`, `latte`.

The check happens in `ConversationView.submitFreeQuestion` before the API call. If a coffee keyword is detected, instead of calling the API, a special `PourOverGame` block is rendered.

### The Game

A `PourOverGame` component that renders as a block in the conversation (same card styling as ContentBlock).

**Header:**
- Title: "Max's Pour-Over Lab"
- Subtitle: "You found my secret café."

**Controls (3 sliders):**

| Parameter | Range | Step | Default | Max's Recipe |
|-----------|-------|------|---------|-------------|
| Grind Size | 1 (Fine) – 5 (Coarse) | 1 | 3 (Medium) | 2 (Medium-Fine) |
| Temperature | 85°C – 96°C | 1 | 90°C | 92°C |
| Brew Time | 2:00 – 5:00 | 0:15 | 3:00 | 3:30 |

Each slider shows its current value. Labels on the slider ends (e.g., "Fine" / "Coarse").

**Brew Button:** Centered, accent-colored. Label: "Brew".

**Rating (appears after brew):**

Calculate score based on distance from Max's recipe:
- Grind: |selected - 2| → 0=perfect, 1=close, 2+=far
- Temperature: |selected - 92| → 0-1=perfect, 2-3=close, 4+=far  
- Brew time (in seconds): |selected - 210| → 0-15=perfect, 16-45=close, 46+=far

Map total "closeness" to a 1-5 star rating:

| Stars | Condition | Comment |
|-------|-----------|---------|
| 5 | All three perfect or near-perfect | "That's my exact recipe. You'd survive a shift." |
| 4 | Two perfect, one close | "Close — I'd drink this. Almost barista-level." |
| 3 | Mix of close and off | "Drinkable. But Max would tweak the grind." |
| 2 | One or more way off | "Brave choice. Max politely pours it out." |
| 1 | Everything wrong | "This is a war crime. Max is calling the coffee police." |

Stars rendered as filled/empty star characters. Comment in italic below.

**After rating:** A button "Back to the conversation →" that dismisses the game state and returns to normal conversation flow.

**Gamification integration:** If gamification is on, discovering the coffee game unlocks a special achievement:
- ID: `coffee-hunter`
- Emoji: ☕
- Name: "Coffee Hunter"
- Description: "Found Max's secret café"

This achievement is tracked separately — it's not a gem (no required nodes), it's triggered by finding the Easter Egg.

### Component

New file: `src/components/PourOverGame.tsx`

Self-contained component with local state for slider values, brew state, and rating. Props: `onClose: () => void` to return to conversation.

### Integration

In `ConversationView.submitFreeQuestion`: before the API call, check if the question matches a coffee keyword. If yes:
- Set a `coffeeGameActive: boolean` state to `true`
- Add a block placeholder to the conversation
- Render `PourOverGame` instead of the normal content for that block
- When the user clicks "Back to the conversation", set `coffeeGameActive` to `false`

Track `foundCoffeeEasterEgg: boolean` in ConversationView state. Pass to `useGamification` for the achievement.

## Part 3: Shareable Discovery Path

### Current State

JourneyWrapUp shows: AI narrative, gamification badges (if enabled), and CTAs. The share functionality exists via `ShareButton` (saves session to Supabase, returns `/s/[id]` URL) but is in the conversation header, not in the wrap-up.

### New Feature: Discovery Path Visualization

Add a visual summary section between the gamification badges and the CTAs in JourneyWrapUp.

**Layout:**

A horizontal "journey line" showing which thematic clusters the user explored, in the order they first visited them:

```
🚀 Founder  →  🔬 Research  →  🤖 AI  →  💎 The Convergence
```

**Cluster mapping:**
- 🚀 Founder: startup-story, product-magic, after-acquisition, founder-lessons
- 📋 Product: pm-approach, my-fit
- 🎓 Education: school-gets-wrong, what-schools-should-teach, anthropic-education-vision
- 🧠 Psychology: psychology-of-learning
- 🤖 AI: building-with-claude, ai-in-education, side-projects, future-of-work
- 🔬 Research: research
- 💡 Vision: what-id-build, why-anthropic
- 👤 Personal: personal

Each cluster appears in the path only once, when the user first visits a node in that cluster. Gems appear with 💎 prefix.

If the coffee Easter Egg was found, show ☕ at the end.

**Stats line below the path:**
`18/21 topics · 2 gems · ☕ found`

(Adapt based on what was actually discovered. Only show gem/coffee counts if they were found.)

**Share button:**
"Share your discovery path" button that uses the existing share infrastructure — calls the same `/api/sessions` POST endpoint to save the session, then copies the `/s/[id]` URL. The shared session view already shows the conversation blocks.

### Data Requirements

To render the discovery path, we need to know the **order** in which nodes were visited. Currently `visitedNodes` is a `Set<string>` (unordered). Change to track visit order:

- Add `visitOrder: string[]` state in ConversationView (append each new nodeId when visited)
- Pass `visitOrder` to JourneyWrapUp
- The cluster path is derived by mapping each visited nodeId to its cluster, deduplicating in order

### Changes to JourneyWrapUp

New props:
- `visitOrder: string[]`
- `foundCoffeeEasterEgg: boolean`
- `onShare: () => void` (triggers the session save)

New section between badges and CTAs rendering the discovery path.

## New Files

| File | Purpose |
|------|---------|
| `src/components/PourOverGame.tsx` | Coffee pour-over mini-game |

## Modified Files

| File | Changes |
|------|---------|
| `src/lib/content-graph.ts` | Add `gemIntro` and `gemTitle` fields to gem nodes. Add `coffee-hunter` to ACHIEVEMENT_DEFINITIONS. Add `NODE_CLUSTERS` mapping. |
| `src/hooks/useGamification.ts` | Accept `foundCoffeeEasterEgg` param. Add coffee-hunter achievement check. Remove gem toast queueing. |
| `src/components/gamification/AchievementToast.tsx` | No changes needed (gems just won't be queued anymore) |
| `src/components/ConversationView.tsx` | Add coffee keyword detection, `coffeeGameActive` state, `visitOrder` tracking, `foundCoffeeEasterEgg` state. Pass new props to JourneyWrapUp. |
| `src/components/ContentBlock.tsx` | Detect gem blocks (id starts with `gem-`), apply amber tint and prepend intro text. |
| `src/components/JourneyWrapUp.tsx` | Add discovery path visualization, stats line, share button. Accept new props. |

## Constraints

- **Mobile-first:** Sliders must be touch-friendly (min 44px hit target). Discovery path wraps on small screens.
- **Performance:** Coffee game is pure client-side (no API calls). Slider state is local.
- **Accessibility:** Sliders need `aria-label`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow`. Star rating needs `aria-label`.
- **No new dependencies:** Sliders use native `<input type="range">` styled with Tailwind/CSS.
- **Theme compatibility:** All new elements use CSS custom properties for colors, work in both focused and colorful themes.

## Out of Scope

- Coffee game leaderboard or score persistence
- Animated latte art or complex coffee visuals
- Social media share cards (Open Graph images)
- Discovery path as downloadable image
