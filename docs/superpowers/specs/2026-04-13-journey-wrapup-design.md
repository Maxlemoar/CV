# Journey Wrap-Up / Learning Product Design

## Goal

Give every journey a meaningful ending. Instead of the conversation fading out, the user receives a personalized "learning product" — a narrative summary of what they discovered about Max — followed by clear CTAs to either reach out or start a new journey.

## Concept

The portfolio is framed as a learning experience. The onboarding asks "what are you curious about?", the journey lets the user explore, and the wrap-up delivers a takeaway: "here's what you learned." This mirrors the education product thinking Max wants to demonstrate for Anthropic Education Labs.

## Triggers

Two ways the wrap-up can be initiated:

### 1. Wrap-Up Link (manual)

A subtle link next to the Share button in the conversation header. Visible once the user has explored 3+ blocks (enough to generate a meaningful summary). Label: "Wrap up".

### 2. Dead-End Hook (proactive)

When the last ContentBlock has no unvisited hook targets remaining (all `targetId` values are already in `visitedNodes`), a special hook is injected: **"See what you've discovered →"**. Clicking it triggers the wrap-up. This is the natural end-of-path signal — no timers, no scroll tracking.

## The Learning Product

A dedicated `JourneyWrapUp` component that renders as the final block in the conversation. It replaces the InputBar and hooks — the journey is over.

### Structure

```
┌─────────────────────────────────────────┐
│  What you've learned about Max          │  ← headline
│                                         │
│  [AI-generated narrative, 2-3 sentences │  ← personalized summary
│   summarizing what the user discovered] │
│                                         │
│  ┌─────────────────────────────────┐    │  ← gamification section
│  │ 🚀 Founder  🤖 AI Native       │    │     (only if gamified)
│  │ 💎 The Convergence              │    │
│  │ 8/21 topics discovered          │    │
│  └─────────────────────────────────┘    │
│                                         │
│  Curious?                               │  ← CTA headline
│                                         │
│  [ Invite Max to a conversation ]       │  ← primary CTA (mailto)
│  [ Start a new journey           ]       │  ← secondary CTA (reset)
└─────────────────────────────────────────┘
```

### AI-Generated Narrative

The wrap-up sends the full conversation history (`messages`) to `/api/chat` with a special system prompt addition instructing Claude to generate a journey summary instead of a regular response.

**Prompt addition:**

```
The user has finished exploring. Generate a personalized 2-3 sentence summary
of what they discovered about Max during this conversation. Focus on the specific
facets they explored — don't be generic. Reference the actual topics they engaged
with. Write as if you're telling them what they now know about Max that they
didn't before. Do not use phrases like "Thank you for visiting" or "I hope you
enjoyed." Be specific and insightful.
```

**Response format:** The API returns an `AIResponse` as usual. The `text` field contains the narrative. No `richType`, no `hooks` needed.

### Gamification Section (conditional)

Only shown when `preferences.gamified === true`. Displays:

- **Unlocked achievements** as a horizontal row of emoji + name badges
- **Unlocked hidden gems** highlighted with the 💎 indicator
- **Final progress count** (e.g., "8/21 topics discovered")

This data is already available from the `useGamification` hook: `unlockedAchievements`, `unlockedGems`, `discoveredCount`, `totalNodes`.

### CTAs

**Primary: "Invite Max to a conversation"**

Mailto link: `mailto:m.marowsky@googlemail.com?subject=Let's chat — re: your portfolio`

Styled as the primary action button (accent color, full width on mobile).

**Secondary: "Start a new journey"**

Triggers a full reset:
- `blocks` → `[]`
- `visitedNodes` → `new Set()`
- `messages` → `[]`
- `freeQuestionCount` → `0`
- Gamification state resets (handled by `useGamification` since inputs reset)
- `isOnboarded` → `false` (reset preferences so user goes through onboarding again with a new `contentFocus`)

Styled as secondary button (outlined, below primary).

## Integration Points

### ConversationView.tsx

- New state: `isWrappedUp: boolean` (default `false`)
- When `isWrappedUp` is true:
  - Hide `InputBar`
  - Render `JourneyWrapUp` as the last element in the conversation
  - Keep all existing blocks visible above it (the journey stays readable)
- `triggerWrapUp()` function: sets `isWrappedUp = true`, calls the API for the narrative
- `handleNewJourney()` function: resets all state, sets preferences to `null` to trigger onboarding

### Dead-End Detection

A utility function that checks whether a ContentBlock's hooks all point to already-visited nodes:

```typescript
function isDeadEnd(block: ContentBlockData, visitedNodes: Set<string>): boolean {
  if (block.hooks.length === 0) return true;
  return block.hooks.every((h) => h.targetId && visitedNodes.has(h.targetId));
}
```

When `isDeadEnd` is true for the last block, inject a wrap-up hook: `{ label: "See what you've discovered →", question: "__wrapup__", targetId: undefined }`.

The `handleHookClick` function intercepts the `__wrapup__` sentinel and calls `triggerWrapUp()` instead of the normal flow.

### Wrap-Up Link in Header

Add a "Wrap up" link next to `ShareButton` in the conversation header. Only visible when `blocks.length >= 3 && !isWrappedUp && !isLoading`. Clicking it calls `triggerWrapUp()`. Disabled while `isLoading` is true.

### API Route (route.ts)

No new endpoint needed. The existing `/api/chat` receives the messages array plus a flag `wrapUp: true` in the request body. When `wrapUp` is true, the system prompt is extended with the summary generation instruction. The response is a standard `AIResponse`.

## New Components

| Component | File | Purpose |
|-----------|------|---------|
| `JourneyWrapUp` | `src/components/JourneyWrapUp.tsx` | Renders the learning product: narrative, gamification badges, CTAs |

## Modified Files

| File | Changes |
|------|---------|
| `src/components/ConversationView.tsx` | Add `isWrappedUp` state, `triggerWrapUp()`, `handleNewJourney()`, dead-end detection, wrap-up link, conditional InputBar |
| `src/app/api/chat/route.ts` | Handle `wrapUp: true` flag, extend system prompt for summary generation |
| `src/lib/preferences.tsx` | Add `resetPreferences()` method to context (sets state to `null`) |

## Constraints

- **Mobile-first:** JourneyWrapUp must work on 375px+. CTAs full-width on mobile, side-by-side on desktop.
- **Loading state:** While the AI narrative is generating, show a skeleton/loading state in the JourneyWrapUp component.
- **Shared sessions:** Shared sessions (`/s/[id]`) do NOT show the wrap-up. They are read-only snapshots.
- **Print:** JourneyWrapUp should have `no-print` class — it's not part of the CV.
- **No persistence:** Wrap-up state is session-only, like everything else.

## Out of Scope

- Saving the learning product / sharing it separately
- Analytics on wrap-up conversion rates
- Multiple wrap-up styles based on journey type
- Email template customization
