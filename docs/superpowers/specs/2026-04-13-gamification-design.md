# Gamification Design — CV Portfolio

## Goal

Maximize exploration. Motivate recruiters to discover as many facets of Max's profile as possible through visible but unobtrusive gamification elements. Opt-in via onboarding.

## Target Audience

Anthropic recruiters and hiring managers — people who value substance and understand gamification as a concept.

## Design Decisions

- **Prominence level:** Visible but unobtrusive (Level B). No XP, no levels, no sounds.
- **Opt-in mechanism:** Fourth onboarding step — "Möchtest du deine Erfahrung gamifizieren?" (Ja/Nein). Toggleable at any time via SettingsPanel.
- **Theoretical foundation:** Self-Determination Theory (competence via progress visibility, autonomy via opt-in) and Octalysis Core Drives (Development & Accomplishment, Unpredictability & Curiosity via Hidden Gems).

## Elements

### 1. Progress Ring / Discovery Meter

A circular progress indicator showing how many content nodes the user has discovered.

**Behavior:**
- Displays `visitedNodes.size / totalNodes` as a filling ring with counter
- Animates smoothly when a new node is visited (Framer Motion)
- Position: fixed, non-overlapping with existing UI elements
  - Desktop: top-right corner, 72px diameter
  - Mobile: bottom-right corner, 48px diameter (above InputBar, left of SettingsPanel gear icon — stacked vertically if needed)
- On mobile: shows only the number (e.g., "12"), with "von 30" as subtle label below
- On desktop: shows "12/30" inside ring, "Themen entdeckt" label below

**Visual style:**
- Ring track: `#E5DDD3` (paper-adjacent neutral)
- Ring fill: `#D97706` (accent color, matches existing theme)
- Neumorphic shadow consistent with site design
- Must adapt to both "focused" and "colorful" themes

**Data source:** `visitedNodes` Set already exists in ConversationView state. Total count derived from `Object.keys(CONTENT_GRAPH).length`.

### 2. Achievement Toasts (6 total)

Short, elegant notifications that appear when the user reaches specific milestones. Not inflationary — only 6 carefully chosen achievements.

**Behavior:**
- Appear at top-center of viewport
- Auto-dismiss after 4 seconds
- Framer Motion entrance (slide down + fade in) and exit (fade out)
- Queue system: if two achievements trigger simultaneously, show sequentially with 500ms gap
- Each achievement can only trigger once per session

**Achievement definitions:**

| ID | Emoji | Name | Trigger | Description |
|----|-------|------|---------|-------------|
| `founder` | 🚀 | Founder | All startup cluster nodes visited: `startup-story`, `product-magic`, `after-acquisition`, `founder-lessons` | "Alle Startup-Themen entdeckt" |
| `learning-scientist` | 🔬 | Learning Scientist | All education cluster nodes visited: `school-gets-wrong`, `what-schools-should-teach`, `psychology-of-learning`, `anthropic-education-vision` | "Alle Education-Themen entdeckt" |
| `ai-native` | 🤖 | AI Native | All AI cluster nodes visited: `building-with-claude`, `ai-in-education`, `side-projects` | "Alle AI-Themen entdeckt" |
| `deep-diver` | 💬 | Deep Diver | 5+ free-text questions submitted | "5+ eigene Fragen gestellt" |
| `explorer` | 🗺️ | Explorer | 15+ nodes visited (≥50%) | "Über die Hälfte entdeckt" |
| `completionist` | 🏆 | Completionist | All nodes visited (100%) | "Alles entdeckt" |

**Note:** The exact node IDs per cluster must be verified against the current content-graph at implementation time. The clusters above are approximate groupings.

**Toast layout:**
- Max width: 360px
- Background: paper color with subtle border and shadow
- Left: emoji (24px), Right: title (bold 14px) + description (12px muted)

**Tracking:** New `unlockedAchievements: Set<string>` in gamification state. Check conditions after each `visitedNodes` update or free-text submission.

### 3. Hidden Gems (3 total)

Exclusive content nodes that only appear when the user has visited specific combinations of nodes. These nodes are part of the content-graph but are hidden until their unlock condition is met.

**Behavior:**
- When unlock condition is met: an Achievement Toast announces the gem, AND a new hook appears in the most recently rendered ContentBlock's hook list
- The hook is visually distinct: subtle sparkle/gem indicator to signal it's special
- Hidden Gem nodes have richer, more personal content than regular nodes
- Hidden Gems count toward the Progress Ring total (i.e., total becomes 33 when gamified)

**Gem definitions:**

| ID | Name | Trigger Nodes | Content Theme |
|----|------|---------------|---------------|
| `gem-convergence` | Die Konvergenz | `psychology-of-learning` + `ai-in-education` + `building-with-claude` | How learning psychology and AI converge — Max's personal vision for what Anthropic Education Labs should build. The most forward-looking content on the site. |
| `gem-lab-to-product` | Vom Labor ins Produkt | `startup-story` + `founder-lessons` + `research` | How Max transfers research methodology into product discovery. Concrete examples of hypothesis-driven PM. |
| `gem-full-picture` | Das ganze Bild | 25+ nodes visited | Meta-reflection on why Max is uniquely suited for this role. Connects all threads. The ultimate pitch. |

**Data model:** Hidden Gems are stored as regular `ContentNode` entries in the content-graph with an additional `gem` field:

```typescript
gem?: {
  requiredNodes?: string[];  // nodes that must all be visited
  minVisited?: number;       // minimum total nodes visited
}
```

The `nodeToBlock()` helper already filters hooks by `requiredVisited` — gem unlocks follow the same pattern but for entire nodes rather than individual hooks.

**Tracking:** New `unlockedGems: Set<string>` in gamification state.

## Integration Points

### Onboarding (OnboardingChat.tsx)

Add a fourth step to `STEP_CONFIG`:

```typescript
"gamification": {
  question: "Möchtest du deine Erfahrung gamifizieren?",
  options: [
    { label: "Ja, zeig mir meinen Fortschritt", value: "yes", description: "Entdeckungs-Tracking, Meilensteine & versteckte Inhalte" },
    { label: "Nein danke", value: "no", description: "Klassisches Erlebnis ohne Gamification" },
  ],
}
```

Step order: visual-style → info-depth → content-focus → gamification.

### UserPreferences (types.ts)

Extend the `UserPreferences` interface:

```typescript
interface UserPreferences {
  visualStyle: VisualStyle;
  infoDepth: InfoDepth;
  contentFocus: ContentFocus;
  gamified: boolean;  // new
}
```

Default (on skip): `gamified: false`.

### Gamification State

New state managed alongside `visitedNodes` in ConversationView:

```typescript
const [unlockedAchievements, setUnlockedAchievements] = useState<Set<string>>(new Set());
const [unlockedGems, setUnlockedGems] = useState<Set<string>>(new Set());
const [toastQueue, setToastQueue] = useState<Achievement[]>([]);
```

A `useEffect` hook watches `visitedNodes` and `freeQuestionCount` to check achievement and gem conditions after each change.

### SettingsPanel (SettingsPanel.tsx)

Add a toggle for gamification:

```
Gamification: [On] [Off]
```

When toggled off mid-session: hide Progress Ring and stop showing toasts. Already-unlocked Hidden Gem nodes remain visible (content shouldn't disappear). When toggled back on: restore Progress Ring state, don't re-trigger already-shown toasts.

### ConversationView (ConversationView.tsx)

- Render `<ProgressRing>` and `<AchievementToast>` conditionally on `preferences.gamified`
- After each node visit: run achievement/gem check logic
- When a gem unlocks: inject its hook into the current block's hook list
- Track `freeQuestionCount` for the Deep Diver achievement

## New Components

| Component | Purpose | File |
|-----------|---------|------|
| `ProgressRing` | Circular progress indicator | `src/components/gamification/ProgressRing.tsx` |
| `AchievementToast` | Toast notification for achievements | `src/components/gamification/AchievementToast.tsx` |
| `useGamification` | Hook for achievement/gem check logic | `src/hooks/useGamification.ts` |

## Modified Files

| File | Changes |
|------|---------|
| `src/lib/types.ts` | Add `gamified: boolean` to `UserPreferences` |
| `src/lib/content-graph.ts` | Add 3 Hidden Gem nodes with `gem` field, add achievement cluster definitions |
| `src/components/OnboardingChat.tsx` | Add gamification step |
| `src/components/ConversationView.tsx` | Integrate gamification hook, render new components |
| `src/components/SettingsPanel.tsx` | Add gamification toggle |
| `src/components/ContentBlock.tsx` | Visual distinction for gem hooks (sparkle indicator) |

## Constraints

- **Mobile-first:** All elements must work on 375px+ screens. Progress Ring adapts size. Toasts are full-width on mobile.
- **Performance:** Achievement checks are simple Set operations — no performance concern.
- **Accessibility:** Toasts must have `role="status"` and `aria-live="polite"`. Progress Ring needs `aria-label` with current count.
- **Theme compatibility:** All gamification elements must respect both "focused" and "colorful" themes via CSS custom properties.
- **No persistence:** Gamification state is session-only (no localStorage, no Supabase). Fresh start on each visit. Shared sessions show content but not gamification state.

## Out of Scope

- Endscreen / summary view (potential Phase 2)
- Exploration Map visualization (too complex for mobile)
- Streak / momentum nudges (too pushy for recruiter audience)
- Sound effects
- Leaderboards
- XP / level system
- Cross-session persistence
