# The Experiment — Design Spec

**Date:** 2026-04-13
**Status:** Draft
**Scope:** Complete reimagining of the portfolio user journey as an interactive psychological experiment

## Overview

The portfolio website transforms from a conversation-style CV into "The Experiment" — an interactive experience where the recruiter is subtly profiled through an interview, then experiences a fully personalized journey through Max's story. At the end, a reveal shows the recruiter what was learned about them and how the entire experience was tailored accordingly. The goal: create a shareable, addictive experience that Anthropic recruiters forward to colleagues.

## Core Concept

The recruiter visits Max's portfolio and is greeted as "Experiment #[unique number]". Instead of configuring preferences, they answer 5 psychologically interesting questions in a conversational interview format — a role reversal where the candidate interviews the recruiter. The answers subtly measure 5 dimensions that invisibly personalize the entire subsequent journey. After exploring 8 content nodes, the recruiter is offered "The Reveal" — a personalized profile showing who they are and exactly how the website adapted to them. A shareable card (Spotify Wrapped-style) drives viral sharing.

## Target Personas (in priority order)

1. **The Recruiter (30s)** — Needs an immediate hook. "Experiment #234" creates instant curiosity. Even if they bounce, they remember it.
2. **The Forwarder (2min)** — Needs a concrete share-worthy moment. The Shareable Card is the viral trigger: "Look what this application website figured out about me."
3. **The Technical Evaluator (5min+)** — Needs depth. Hidden Rabbit Holes show architecture, learning science, and analytics sophistication.

## Act 1: The Hook

### What the recruiter sees

A minimal screen:

```
EXPERIMENT #[unique-number]

Let's get to know each other.

[Start Experiment]

~5 minutes · No data stored · Prefer the classic CV?
```

### Requirements

- Experiment number is randomly generated and globally unique (never repeats)
- Implementation: timestamp-based counter or UUID mapped to a 3-4 digit number, stored in database
- "Prefer the classic CV?" links to `/cv`
- The entire screen is minimal — no navigation, no hero image, no noise
- All text in English (site language is English)

## Act 2: The Interview

### Concept

Replaces the current onboarding completely. Chat-style UI where Max asks 5 questions. The questions sound like genuine conversation starters but subtly measure psychological dimensions. The role reversal (candidate interviews recruiter) is the first surprise.

### The 5 Questions

#### Q1: Persuasion Mode
**Recruiter sees:** "Before you get to know me — may I ask you something? If you had to evaluate a candidate in 30 seconds — what do you look at first?"
- **Option A:** What they've achieved (→ Results)
- **Option B:** How they think and solve problems (→ Process)
- **Option C:** Who they are — energy, values, personality (→ Character)

**Measures:** Persuasion trigger
**Personalizes:** Content tonality. Results-types get metrics and impact numbers prominently. Process-types get frameworks and decision rationale. Character-types get personal stories and motivation.

#### Q2: Learning Strategy
**Recruiter sees:** "Imagine you need to understand a topic you know nothing about. What do you do first?"
- **Option A:** Just start and learn along the way (→ Exploratory)
- **Option B:** Research first, then proceed systematically (→ Structured)
- **Option C:** Ask someone who knows (→ Social)

**Measures:** Learning strategy
**Personalizes:** Navigation structure. Exploratory types get more hooks per block (5 vs 3), more freedom, deep-dive as default. Structured types get clearer sequencing, fewer but more targeted hooks, overview as default. Social types get conversational framing, emphasis on dialogue and free-form questions.

#### Q3: Education Resonance
**Recruiter sees:** "When you think back to school or university — what could have been better?"
- **Option A:** More practical application — too much theory, too little doing (→ Practice)
- **Option B:** More individualization — everyone was treated the same (→ Individualization)
- **Option C:** More inspiration — it lacked passion and curiosity (→ Inspiration)

**Measures:** Education perspective
**Personalizes:** Topic entry point. Practice-types see applied projects and side-projects first (Max as builder). Individualization-types see adaptive systems and learning research first (Max as researcher). Inspiration-types see vision and philosophy first (Max as visionary).

**Bonus:** This question creates emotional connection to Max's mission — everyone has an opinion about education.

#### Q4: Intrinsic Motivation (Self-Determination Theory)
**Recruiter sees:** "What makes a really good work day — what needs to have happened?"
- **Option A:** I solved a hard problem (→ Mastery)
- **Option B:** I moved something that has real impact (→ Purpose)
- **Option C:** I had great conversations with smart people (→ Relatedness)

**Measures:** Intrinsic motivation
**Personalizes:** Content framing. Mastery-types get technical depth, complexity, craftsmanship emphasized. Purpose-types get mission, educational impact, societal contribution. Relatedness-types get team dynamics, collaboration, mentoring.

#### Q5: Sharing Trigger
**Recruiter sees:** "Last question. When was the last time you showed someone something and said: 'You have to see this'?"
- **Option A:** Something surprising — it broke my expectations (→ Surprise)
- **Option B:** Something useful — it could help you too (→ Utility)
- **Option C:** Something moving — it touched me emotionally (→ Emotion)

**Measures:** Sharing motivation
**Personalizes:** Reveal style and Shareable Card tone. Surprise-types get "Did you expect that...?" framing. Utility-types get "Here's what you can take away for your own hiring." Emotion-types get "This is why education matters so deeply to me."

**Meta-layer:** The reveal sentence for this dimension is self-referential: "You like to share [surprising things] — and that's exactly how I designed this reveal."

### Visual Style & Dark Mode

Not part of the interview. Available via Settings panel (gear icon), accessible at any time during the experience. Defaults: system preference for dark mode, "focused" for visual style.

### Technical Notes

- Interview responses stored in a new `ExperimentProfile` context (replaces `PreferencesContext`)
- Profile shape: `{ persuasion: 'results'|'process'|'character', learning: 'exploratory'|'structured'|'social', education: 'practice'|'individualization'|'inspiration', motivation: 'mastery'|'purpose'|'relatedness', sharing: 'surprise'|'utility'|'emotion' }`
- Visual preferences (dark mode, visual style) remain in a separate lightweight settings store

## Act 3: The Exploration

### Hybrid Personalization

The content graph remains the backbone. Content nodes keep their existing `content` and `contentCompact` fields (static, handwritten). The AI personalizes the dynamic layer around the static content:

**Static (Content Graph):**
- Core content per node (facts, stories, data)
- Node connections and hook targets
- Rich elements (photos, timelines)

**Dynamic (AI-personalized):**
- Transition text between blocks ("Since you mentioned you value [X], here's something relevant...")
- Hook labels (adapted to the recruiter's vocabulary/interests)
- Framing and introductions per block
- Learning mechanic insertions (see below)

### Personalization Mapping

| Dimension | What it controls |
|---|---|
| Persuasion Mode | Content tonality — which aspects of each node are emphasized in framing |
| Learning Strategy | Navigation — number of hooks, freedom vs. structure, default depth |
| Education Resonance | Starter hooks — which 4-6 entry points appear after interview |
| Motivation | Content framing — craft/impact/team angle on each story |
| Sharing Trigger | Reveal style (Act 4) — not used during exploration |

### Learning Mechanics (embedded in exploration)

Three evidence-based learning principles are woven into the conversation flow:

1. **Testing Effect** — Between content blocks, occasional estimation questions appear: "How many teachers do you think use eduki?" The recruiter guesses, clicks — the answer appears with context. Active guessing anchors information 2x better than passive reading.

2. **Spaced Retrieval** — Details from earlier blocks resurface in new context: "Remember the Hattie study from earlier? That's exactly the principle I built into pearprogramming." Creates aha-moments through cross-topic connections.

3. **Interleaving** — Instead of all startup content → all research content, the system deliberately mixes topics. Startup → Research → Personal → Startup-deepdive. Feels more natural AND promotes deeper understanding.

These mechanics are inserted by the AI during framing generation, not hardcoded into the content graph.

### Analyse-Balken (Progress Indicator)

Replaces the current Progress Ring entirely.

- Slim bar at top or bottom of viewport
- Fills incrementally with each visited node
- Text phases:
  - 0-50%: "Collecting data..."
  - 50-79%: "Analyzing patterns..."
  - 80-99%: "Almost there..."
  - 100% (threshold reached): "Enough data collected — result available"
- At threshold (8 nodes), a prompt appears: "I think I know you well enough now. Want to see what I've learned?"
- Recruiter can dismiss and continue exploring — bar stays at "Result available"
- Visual style: matches experiment aesthetic, not gamification

### What happens to existing gamification

The current gamification system (achievements, gems, toasts, progress ring) is **fully replaced** by the experiment metaphor:

| Old | New Equivalent |
|---|---|
| Progress Ring | Analyse-Balken |
| Achievements (6 badges) | The Reveal (personalized profile) |
| Gem Nodes (3 hidden) | Rabbit Holes (3 easter eggs) |
| Achievement Toasts | Reveal moment |
| `gamified` preference toggle | Removed — experiment IS the gamification |

## Act 4: The Reveal

### Trigger

After 8 visited nodes, the analyse-balken reaches threshold. A message appears within the conversation flow:

> "I think I know you well enough now. Want to see what I've learned?"
> [Show me] [Keep exploring]

If dismissed, the option remains available via the analyse-balken.

### Reveal Content

**Part 1: Your Profile**
Visual display of 4-5 dimensions with labels and progress bars:
- "What convinces you: **Thinking processes & frameworks**"
- "How you learn: **Exploratory & self-directed**"
- "What drives you: **Mastery & autonomy**"
- "Your education wish: **More individualization**"
- "What you share: **Unexpected insights**"

**Part 2: What I did with it**
Concrete breakdown of how each dimension affected the experience:
- "→ Because you value thinking processes, I told you my startup story as a problem-solving journey, not a success story."
- "→ You got more freedom to explore (5 hooks per block instead of 3) — because you learn by doing."
- "→ I emphasized the architecture decisions behind my projects — because mastery drives you."
- "→ You're seeing this reveal right now — because you like to share surprising things. *Hint hint.*"

**Part 3: Punchline**
> "Every person who visits this site experiences a different version of me. Yours was unique.
>
> This is what I want to build at Anthropic — learning experiences that adapt to the person, not the other way around."

**CTAs:**
- "Share my result" → generates Shareable Card
- "Invite Max to a conversation" → mailto with pre-filled subject

### Reveal Generation

The reveal is generated by the AI based on:
- Interview responses (the 5 dimensions)
- Visited nodes (what content was explored)
- Exploration behavior (order of visits, time patterns if tracked)
- The personalization decisions that were actually made during the journey

## Act 5: The Rabbit Holes

Three hidden easter eggs, each with its own discovery mechanism. These are NOT revealed after Act 4 — they must be found through exploration.

### Rabbit Hole 1: Behind the Science
**Discovery:** A tiny, subtle icon on each content block (barely visible). Clicking it reveals which learning principle was used in that block, with a paper reference and brief explanation.
**Purpose:** Demonstrates depth of learning science knowledge. Appeals to the scientific/academic evaluator.

### Rabbit Hole 2: The Architect View
**Discovery:** Konami code (↑↑↓↓←→←→BA) or similar hidden input sequence.
**Content:** The entire page transforms. Shows:
- Content graph as an interactive network diagram (nodes and edges visualized)
- System architecture overview
- Max's commentary on design decisions
- The personalization engine explained
**Purpose:** Demonstrates technical competence. The code IS the application argument.

### Rabbit Hole 3: The Comparison
**Discovery:** Hidden interactive element (e.g., clicking the experiment number on the hook screen, or a specific pattern in the conversation).
**Content:** Anonymized aggregates — "12% of visitors explore like you." Comparison of own journey with average. Distribution charts for each dimension.
**Purpose:** Shows analytics capability and makes the result even more personal through social comparison.

## Sharing & Viral Loop

### Shareable Card

Generated image (Spotify Wrapped-style) containing:
- Header: "MAX MAROWSKY'S EXPERIMENT"
- Primary dimension: "You are convinced by **[X]**"
- Secondary dimensions: Learning style, Drive (2-3 words each)
- Footer: "Every journey is unique · Start yours: [url]"

Technical implementation: OG Image API (Vercel) or Canvas-to-PNG generation. Optimized for Slack link preview dimensions.

### Shared Links (/s/[id])

Complete behavior change from current implementation:

**Current:** Shared link shows read-only conversation journey
**New:** Shared link shows ONLY the sender's Shareable Card + prominent CTA: "Start your own experiment"

The recipient should NOT see the sender's journey — they should want to create their own. This maximizes the viral loop:

1. Recruiter completes experiment → gets card
2. Shares card in Slack → colleagues see the profile
3. Colleagues want their own → click the link
4. Each gets a unique result → more conversations about Max

### Experiment Number in Shared Context

The shared card displays the sender's experiment number, reinforcing uniqueness.

## Routes

- **`/`** — The Experiment (Hook → Interview → Exploration → Reveal)
- **`/cv`** — Classic CV (unchanged, linked from Hook screen)
- **`/s/[id]`** — Shared result (Card + CTA only)

## Data Model Changes

### New: ExperimentProfile

```typescript
interface ExperimentProfile {
  experimentNumber: number;        // unique, never repeats
  persuasion: 'results' | 'process' | 'character';
  learning: 'exploratory' | 'structured' | 'social';
  education: 'practice' | 'individualization' | 'inspiration';
  motivation: 'mastery' | 'purpose' | 'relatedness';
  sharing: 'surprise' | 'utility' | 'emotion';
}
```

### Modified: UserPreferences

```typescript
interface UserPreferences {
  // Visual settings only (moved out of onboarding)
  visualStyle: 'focused' | 'colorful';
  darkMode: boolean;
}
```

### Modified: Session (for sharing)

```typescript
interface SharedSession {
  id: string;                      // nanoid
  experimentNumber: number;
  profile: ExperimentProfile;
  visitedNodes: string[];          // for card generation context
  createdAt: Date;
  // blocks array removed — no longer sharing the journey
}
```

## Components Changed

| Component | Change |
|---|---|
| `Landing.tsx` | Complete rewrite → Experiment Hook screen |
| `OnboardingChat.tsx` | Rewrite → Interview (5 psychological questions) |
| `ConversationView.tsx` | Add hybrid personalization layer, analyse-balken, reveal trigger |
| `ProgressRing.tsx` | Replace → `AnalyseBar.tsx` |
| `JourneyWrapUp.tsx` | Replace → `Reveal.tsx` (profile + personalization breakdown) |
| `ShareButton.tsx` | Update → generates Shareable Card instead of session link |
| `useGamification.ts` | Remove entirely |
| `AchievementToast.tsx` | Remove entirely |
| `preferences.tsx` | Split into `ExperimentContext` + lightweight `SettingsContext` |
| `/s/[id]/page.tsx` | Rewrite → Card + CTA view (no read-only journey) |
| `/api/chat/route.ts` | Update system prompt with personalization instructions |
| `/api/sessions/route.ts` | Update to store profile + card data instead of blocks |

### New Components

| Component | Purpose |
|---|---|
| `AnalyseBar.tsx` | Progress bar with experiment-themed labels |
| `Reveal.tsx` | Profile display + personalization breakdown + punchline |
| `ShareableCard.tsx` | Card generation (canvas/OG image) |
| `Interview.tsx` | 5-question chat-style interview |
| `ExperimentContext.tsx` | Profile state management |
| `RabbitHole*.tsx` | Three easter egg components |

### New API Routes

| Route | Purpose |
|---|---|
| `/api/experiment-number` | Generate unique experiment number |
| `/api/og/[id]` | Generate Shareable Card as OG image |

## Content Graph Changes

The content graph structure (`ContentNode`) remains unchanged. The following additions are needed:

- **Starter hook mappings** per education-resonance dimension (which 4-6 hooks appear after interview)
- **Framing hints** per node: short metadata indicating what aspect to emphasize per persuasion mode (e.g., `framingHints: { results: "150k teachers, 1.5M ARR", process: "hypothesis-driven iteration", character: "two psychologists in a 20sqm apartment" }`)
- **Learning mechanic insertion points**: markers in the graph where testing-effect questions or spaced-retrieval callbacks can be inserted

## Resolved Design Decisions

1. **Experiment number storage:** Supabase atomic counter (single row, `nextval`-style). Simple, guaranteed unique, no collision risk. Falls back to `Date.now()` if DB is unreachable.
2. **Analyse-balken threshold:** Fixed at 8 nodes. This is roughly 30-40% of the content graph — enough to have seen multiple topic clusters and generated meaningful personalization data.
3. **Rabbit Hole discovery hints:** Completely hidden. No indication that easter eggs exist. The discovery IS the reward. If someone finds one, the surprise is maximized.
4. **Free-form question personalization:** The experiment profile is included in the AI system prompt for free-form responses. The AI adapts tone and emphasis to match the profile (e.g., more data-driven language for results-types), but does not fabricate facts or change Max's actual story.
5. **Returning visitors:** No cross-session persistence. Each visit is a fresh experiment with a new number. This is intentional — it reinforces "every journey is unique" and avoids stale state bugs. The `/cv` route serves returning visitors who just want the facts.

## AI Framing API

The existing `/api/chat` route is extended to handle personalized framing. When a content node is loaded, a lightweight API call generates the dynamic layer:

**Request:**
```typescript
{
  type: 'frame',
  nodeId: string,                    // which content node
  profile: ExperimentProfile,        // the 5 dimensions
  visitedNodes: string[],            // for spaced retrieval callbacks
  previousNodeId?: string,           // for transition text
}
```

**Response:**
```typescript
{
  introduction: string,              // 1-2 sentences, personalized framing
  transition?: string,               // connects to previous block
  hookLabels?: Record<string, string>, // override default hook labels
  learningMechanic?: {               // optional insertion
    type: 'testing-effect' | 'spaced-retrieval',
    content: string,                 // the question or callback text
    answer?: string,                 // for testing-effect questions
  }
}
```

The static content from the content graph is rendered as-is. The AI-generated framing wraps around it. This keeps the core content reliable while the personalization layer adapts.
