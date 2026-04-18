# Adaptive Interview Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the 5-question interview with 3 high-impact questions, add a `contentInterest` dimension, remove unused dimensions (learning/education/sharing), and extend the behavioral profiling layer.

**Architecture:** The change flows through the type system first (ExperimentProfile), then signal seeding, then downstream consumers (API routes, components). The behavioral layer enhancement is an additive change to the existing `/api/profile` prompt.

**Tech Stack:** TypeScript, Next.js App Router, Zod, Vercel AI SDK

---

### Task 1: Update Type Definitions

**Files:**
- Modify: `src/lib/experiment-types.ts`

- [ ] **Step 1: Replace type definitions and ExperimentProfile**

Replace the old types and profile with the new 3-dimension model:

```typescript
// src/lib/experiment-types.ts

export type Persuasion = 'results' | 'process' | 'character';
export type Motivation = 'mastery' | 'purpose' | 'relatedness';
export type ContentInterest = 'technical' | 'vision' | 'journey';

export interface ExperimentProfile {
  experimentNumber: number;
  persuasion: Persuasion;
  motivation: Motivation;
  contentInterest: ContentInterest;
}

// SignalVector: remove learning bucket, keep the rest
export interface SignalVector {
  persuasion: Record<Persuasion, number>;
  motivation: Record<Motivation, number>;
  topics: Record<string, number>;
}
```

Remove the old types: `Learning`, `Education`, `Sharing`.

- [ ] **Step 2: Update InterviewQuestion type and INTERVIEW_QUESTIONS**

```typescript
export interface InterviewQuestion {
  id: string;
  text: string;
  options: {
    label: string;
    value: string;
  }[];
  dimension: keyof Omit<ExperimentProfile, 'experimentNumber'>;
}

export const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  {
    id: 'persuasion',
    text: "Before you get to know me — may I ask you something? If you had to evaluate a candidate in 30 seconds — what do you look at first?",
    options: [
      { label: "What they've achieved", value: 'results' },
      { label: 'How they think and solve problems', value: 'process' },
      { label: 'Who they are — energy, values, personality', value: 'character' },
    ],
    dimension: 'persuasion',
  },
  {
    id: 'motivation',
    text: "What makes a really good work day — what needs to have happened?",
    options: [
      { label: 'I solved a hard problem', value: 'mastery' },
      { label: 'I moved something that has real impact', value: 'purpose' },
      { label: 'I had great conversations with smart people', value: 'relatedness' },
    ],
    dimension: 'motivation',
  },
  {
    id: 'contentInterest',
    text: "What interests you most when getting to know a candidate like me?",
    options: [
      { label: 'What you can do — projects, tech, outcomes', value: 'technical' },
      { label: 'How you think — vision, philosophy, beliefs', value: 'vision' },
      { label: 'Your path — story, milestones, decisions', value: 'journey' },
    ],
    dimension: 'contentInterest',
  },
];
```

- [ ] **Step 3: Update DIMENSION_LABELS and SharedSession**

```typescript
export const DIMENSION_LABELS: Record<string, Record<string, string>> = {
  persuasion: {
    results: 'Results & Impact',
    process: 'Thinking Processes & Frameworks',
    character: 'Personality & Values',
  },
  motivation: {
    mastery: 'Mastery & deep expertise',
    purpose: 'Purpose & real-world impact',
    relatedness: 'Connection & collaboration',
  },
  contentInterest: {
    technical: 'Projects, tech & outcomes',
    vision: 'Vision, philosophy & beliefs',
    journey: 'Story, milestones & decisions',
  },
};

export interface SharedSession {
  id: string;
  experimentNumber: number;
  profile: ExperimentProfile;
  visitedNodes: string[];
  createdAt: string;
}
```

- [ ] **Step 4: Verify the file compiles**

Run: `npx tsc --noEmit src/lib/experiment-types.ts 2>&1 | head -5`

Expected: Errors in downstream files referencing old types (this is expected — we'll fix them in subsequent tasks).

- [ ] **Step 5: Commit**

```bash
git add src/lib/experiment-types.ts
git commit -m "refactor: replace 5-dimension profile with 3-dimension model (persuasion, motivation, contentInterest)"
```

---

### Task 2: Update Signal Seeding and Scoring

**Files:**
- Modify: `src/lib/hook-router.ts`

- [ ] **Step 1: Remove Learning imports and keys, add ContentInterest**

At the top of `hook-router.ts`, update imports and constants:

```typescript
import type {
  ContentInterest,
  ExperimentProfile,
  Motivation,
  Persuasion,
  SignalVector,
} from "./experiment-types";

const PERSUASION_KEYS: Persuasion[] = ["results", "process", "character"];
const MOTIVATION_KEYS: Motivation[] = ["mastery", "purpose", "relatedness"];
```

Remove `LEARNING_KEYS` and the `Learning` import entirely.

- [ ] **Step 2: Update createEmptySignals — remove learning bucket**

```typescript
export function createEmptySignals(): SignalVector {
  return {
    persuasion: { results: 0, process: 0, character: 0 },
    motivation: { mastery: 0, purpose: 0, relatedness: 0 },
    topics: {},
  };
}
```

- [ ] **Step 3: Replace EDUCATION_TOPIC_AFFINITY with CONTENT_INTEREST_AFFINITY**

Replace the old `EDUCATION_TOPIC_AFFINITY` with:

```typescript
/** Topic affinities implied by the visitor's `contentInterest` answer. */
const CONTENT_INTEREST_AFFINITY: Record<ContentInterest, Partial<Record<NodeTopic, number>>> = {
  technical: { product: 1, startup: 0.8, ai: 1, anthropic: 0.5, education: 0.3, vision: 0.2, personal: 0.2, psychology: 0.2 },
  vision: { product: 0.3, startup: 0.3, ai: 0.7, anthropic: 1, education: 1, vision: 1, personal: 0.3, psychology: 0.7 },
  journey: { product: 0.5, startup: 1, ai: 0.3, anthropic: 0.5, education: 0.5, vision: 0.3, personal: 1, psychology: 0.7 },
};
```

- [ ] **Step 4: Update seedSignalsFromProfile**

```typescript
/** Seed the signal vector from the 3-question interview. Runs once. */
export function seedSignalsFromProfile(profile: ExperimentProfile): SignalVector {
  const s = createEmptySignals();
  s.persuasion[profile.persuasion] = 1;
  s.motivation[profile.motivation] = 1;
  const topicAffinity = CONTENT_INTEREST_AFFINITY[profile.contentInterest] ?? {};
  for (const [topic, weight] of Object.entries(topicAffinity)) {
    if (weight !== undefined) s.topics[topic] = weight;
  }
  return s;
}
```

- [ ] **Step 5: Update applyClickToSignals — remove learning nudge**

In the `applyClickToSignals` function, remove the `learning` spread from the `next` object:

```typescript
export function applyClickToSignals(
  signals: SignalVector,
  clickedNode: ContentNode | undefined,
): SignalVector {
  if (!clickedNode?.tags) return signals;
  const next: SignalVector = {
    persuasion: { ...signals.persuasion },
    motivation: { ...signals.motivation },
    topics: { ...signals.topics },
  };

  const tags = clickedNode.tags;
  if (tags.persuasion) {
    for (const k of PERSUASION_KEYS) {
      const w = tags.persuasion[k];
      if (w) next.persuasion[k] = clamp(next.persuasion[k] + CLICK_NUDGE * w);
    }
  }
  if (tags.motivation) {
    for (const k of MOTIVATION_KEYS) {
      const w = tags.motivation[k];
      if (w) next.motivation[k] = clamp(next.motivation[k] + CLICK_NUDGE * w);
    }
  }
  if (tags.topics) {
    for (const t of tags.topics) {
      next.topics[t] = clamp((next.topics[t] ?? 0) + CLICK_NUDGE);
    }
  }
  return next;
}
```

- [ ] **Step 6: Replace toneBonus to use contentInterest instead of learning**

Replace the `toneBonus` function and remove the `strongest` helper (no longer needed for learning):

```typescript
function toneBonus(
  tone: NonNullable<ContentNode["tags"]>["tone"],
  ctx: ScoreContext,
): number {
  if (!tone || !ctx.profile) return 0;
  const ci = ctx.profile.contentInterest;
  const matrix: Record<ContentInterest, Record<string, number>> = {
    technical: { data: 0.5, reflection: 0.3, vision: 0.1, story: 0.1 },
    vision: { vision: 0.5, reflection: 0.4, story: 0.2, data: 0.1 },
    journey: { story: 0.5, vision: 0.3, reflection: 0.2, data: 0.1 },
  };
  return matrix[ci]?.[tone] ?? 0;
}
```

Keep the `strongest` helper — it's still used by `describeSignals` implicitly. Actually, check: `strongest` is only used by the old `toneBonus`. Remove it.

- [ ] **Step 7: Update describeSignals — remove learning tilt line**

```typescript
export function describeSignals(signals: SignalVector): string {
  const fmt = (bucket: Record<string, number>) =>
    Object.entries(bucket)
      .filter(([, v]) => v > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `${k}:${v.toFixed(2)}`)
      .join(", ") || "—";

  return [
    `persuasion tilt: ${fmt(signals.persuasion)}`,
    `motivation tilt: ${fmt(signals.motivation)}`,
    `topic tilt: ${fmt(signals.topics)}`,
  ].join("\n");
}
```

- [ ] **Step 8: Update pickStarterHooks comment**

Change the JSDoc comment from "all 5 dimensions" to "all 3 dimensions":

```typescript
/**
 * Starter hooks for the Opening screen. Uses the full profile via the
 * signal vector — all 3 dimensions contribute.
 */
```

- [ ] **Step 9: Verify compilation**

Run: `npx tsc --noEmit src/lib/hook-router.ts 2>&1 | head -10`

Expected: May still error on downstream consumers, but hook-router itself should be clean.

- [ ] **Step 10: Commit**

```bash
git add src/lib/hook-router.ts
git commit -m "refactor: update signal seeding and scoring for 3-dimension profile"
```

---

### Task 3: Update Visitor Profile

**Files:**
- Modify: `src/lib/visitor-profile.ts`

- [ ] **Step 1: Replace VisitorProfile interface and createEmptyVisitorProfile**

```typescript
import type { Persuasion, Motivation, ContentInterest } from "./experiment-types";

export interface VisitorProfile {
  // From interview (mirrors ExperimentProfile minus experimentNumber)
  persuasion: Persuasion;
  motivation: Motivation;
  contentInterest: ContentInterest;

  // Inferred by Claude, updated after every interaction
  inferredRole: string | null;
  interests: Record<string, number>;
  preferredDepth: "surface" | "moderate" | "deep";
  preferredTone: "analytical" | "narrative" | "conversational" | "formal";
  domainKnowledge: Record<string, "novice" | "familiar" | "expert">;
}

export interface ProfileNarrative {
  summary: string;
  keyObservations: string[];
  interactionCount: number;
  lastUpdated: string;
}

export interface GeneratedContent {
  title: string;
  content: string;
  hooks: Array<{
    nodeId: string;
    label: string;
    teaser: string;
  }>;
}

export function createEmptyVisitorProfile(interview: {
  persuasion: Persuasion;
  motivation: Motivation;
  contentInterest: ContentInterest;
}): VisitorProfile {
  return {
    ...interview,
    inferredRole: interview.persuasion === "results"
      ? "technical evaluator"
      : interview.persuasion === "process"
        ? "product/strategy evaluator"
        : "culture/people evaluator",
    interests: {},
    preferredDepth: interview.motivation === "mastery" ? "deep" : "moderate",
    preferredTone: interview.motivation === "relatedness" ? "conversational"
      : interview.motivation === "mastery" ? "analytical"
      : "narrative",
    domainKnowledge: {},
  };
}

export function createEmptyNarrative(): ProfileNarrative {
  return {
    summary: "",
    keyObservations: [],
    interactionCount: 0,
    lastUpdated: new Date().toISOString(),
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/visitor-profile.ts
git commit -m "refactor: update VisitorProfile for 3-dimension model with role inference from persuasion"
```

---

### Task 4: Update Interview Component

**Files:**
- Modify: `src/components/Interview.tsx`

- [ ] **Step 1: Update profile construction in handleSelect**

The Interview component is already data-driven from `INTERVIEW_QUESTIONS`. The only change needed is in the profile construction when all questions are answered (around line 63):

Replace:
```typescript
        const profile: ExperimentProfile = {
          experimentNumber,
          persuasion: newAnswers.persuasion as ExperimentProfile["persuasion"],
          learning: newAnswers.learning as ExperimentProfile["learning"],
          education: newAnswers.education as ExperimentProfile["education"],
          motivation: newAnswers.motivation as ExperimentProfile["motivation"],
          sharing: newAnswers.sharing as ExperimentProfile["sharing"],
        };
```

With:
```typescript
        const profile: ExperimentProfile = {
          experimentNumber,
          persuasion: newAnswers.persuasion as ExperimentProfile["persuasion"],
          motivation: newAnswers.motivation as ExperimentProfile["motivation"],
          contentInterest: newAnswers.contentInterest as ExperimentProfile["contentInterest"],
        };
```

- [ ] **Step 2: Verify it renders correctly**

Run: `npm run dev` and navigate to the interview flow. Confirm 3 questions appear instead of 5.

- [ ] **Step 3: Commit**

```bash
git add src/components/Interview.tsx
git commit -m "refactor: update Interview to build 3-dimension profile"
```

---

### Task 5: Update ConversationView

**Files:**
- Modify: `src/components/ConversationView.tsx`

- [ ] **Step 1: Update the interview_complete interviewAnswers payload**

Around line 112, replace the `interviewAnswers` object in `updateProfileAsync`:

Replace:
```typescript
          interviewAnswers: {
            persuasion: profile.persuasion,
            learning: profile.learning,
            education: profile.education,
            motivation: profile.motivation,
            sharing: profile.sharing,
          },
```

With:
```typescript
          interviewAnswers: {
            persuasion: profile.persuasion,
            motivation: profile.motivation,
            contentInterest: profile.contentInterest,
          },
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ConversationView.tsx
git commit -m "refactor: update ConversationView interview payload for 3 dimensions"
```

---

### Task 6: Update /api/chat Route

**Files:**
- Modify: `src/app/api/chat/route.ts`

- [ ] **Step 1: Update local ExperimentProfile type**

Replace the inline type (around line 94):

```typescript
type ExperimentProfile = {
  experimentNumber: number;
  persuasion: "results" | "process" | "character";
  motivation: "mastery" | "purpose" | "relatedness";
  contentInterest: "technical" | "vision" | "journey";
};
```

- [ ] **Step 2: Replace LEARNING_GUIDANCE with CONTENT_INTEREST_GUIDANCE**

Replace:
```typescript
const LEARNING_GUIDANCE: Record<ExperimentProfile["learning"], string> = {
  exploratory: "encourage exploration, offer more paths",
  structured: "be organized and sequential",
  social: "be conversational and dialogue-driven",
};
```

With:
```typescript
const CONTENT_INTEREST_GUIDANCE: Record<ExperimentProfile["contentInterest"], string> = {
  technical: "Focus on concrete projects, technical decisions, measurable outcomes. Show code-level thinking and system design.",
  vision: "Focus on philosophy, beliefs about education and AI, why Anthropic. Show depth of thinking and conviction.",
  journey: "Focus on the narrative arc — transitions, decisions, lessons learned. Show growth and pattern recognition.",
};
```

- [ ] **Step 3: Update SignalPayload type — remove learning**

```typescript
type SignalPayload = {
  persuasion?: SignalBucket;
  motivation?: SignalBucket;
  topics?: SignalBucket;
};
```

- [ ] **Step 4: Update buildProfilePrompt**

Replace the `formatBucket` call for learning and the profile line referencing `profile.learning`:

In the `tiltBlock` section, remove the `Learning tilt` line:
```typescript
  const tiltBlock = signals
    ? `\n\nLIVE SIGNAL TILT (updated as they click through the portfolio):
- Persuasion tilt: ${formatBucket(signals.persuasion)}
- Motivation tilt: ${formatBucket(signals.motivation)}
- Topic interests: ${formatBucket(signals.topics)}`
    : "";
```

In the return string, replace the visitor profile section:
```typescript
  return `\n\nVISITOR PROFILE (personalize your responses subtly):
- Persuasion mode: ${profile.persuasion} — ${PERSUASION_GUIDANCE[profile.persuasion]}
- Content interest: ${profile.contentInterest} — ${CONTENT_INTEREST_GUIDANCE[profile.contentInterest]}
- Motivation: ${profile.motivation} — ${MOTIVATION_GUIDANCE[profile.motivation]}${tiltBlock}${visitorBlock}${narrativeBlock}${visitedBlock}

IMPORTANT: Never mention that you are personalizing. The adaptation should feel natural.`;
```

- [ ] **Step 5: Commit**

```bash
git add src/app/api/chat/route.ts
git commit -m "refactor: update chat route for 3-dimension profile with contentInterest guidance"
```

---

### Task 7: Update /api/opening Route

**Files:**
- Modify: `src/app/api/opening/route.ts`

- [ ] **Step 1: Update requestSchema**

Replace the profile schema inside `requestSchema`:

```typescript
const requestSchema = z.object({
  profile: z.object({
    experimentNumber: z.number(),
    persuasion: z.enum(["results", "process", "character"]),
    motivation: z.enum(["mastery", "purpose", "relatedness"]),
    contentInterest: z.enum(["technical", "vision", "journey"]),
  }),
  visitorProfile: z.any(),
  narrative: z.any(),
  signals: z.any().optional(),
});
```

- [ ] **Step 2: Update system prompt**

Replace the `INTERVIEW ANSWERS` section in `systemPrompt`:

```typescript
  const systemPrompt = `You are Max Marowsky. A visitor just completed your 3-question interview. Your job is to write a personalized transition that shows you listened, and to pick 4 starter hooks that match this visitor.

THE VISITOR'S INTERVIEW ANSWERS:
- What they look at first when evaluating a candidate: ${profile.persuasion} (${DIMENSION_LABELS.persuasion[profile.persuasion]})
- What makes a good work day: ${profile.motivation} (${DIMENSION_LABELS.motivation[profile.motivation]})
- What interests them about a candidate: ${profile.contentInterest} (${DIMENSION_LABELS.contentInterest[profile.contentInterest]})

INFERRED VISITOR PROFILE:
- Role: ${vp.inferredRole ?? "unknown yet"}
- Preferred depth: ${vp.preferredDepth}
- Preferred tone: ${vp.preferredTone}
```

Keep the rest of the prompt (VISITOR NARRATIVE, AVAILABLE STARTER NODES, RULES) unchanged.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/opening/route.ts
git commit -m "refactor: update opening route for 3-dimension profile"
```

---

### Task 8: Update /api/reveal Route

**Files:**
- Modify: `src/app/api/reveal/route.ts`

- [ ] **Step 1: Update requestSchema**

Replace the profile schema:

```typescript
  profile: z.object({
    experimentNumber: z.number(),
    persuasion: z.enum(["results", "process", "character"]),
    motivation: z.enum(["mastery", "purpose", "relatedness"]),
    contentInterest: z.enum(["technical", "vision", "journey"]),
  }),
```

- [ ] **Step 2: Update INTERVIEW ANSWERS in system prompt**

Replace the interview answers section:

```typescript
INTERVIEW ANSWERS (what the visitor told you about themselves):
- Evaluates candidates by: ${profile.persuasion} (${DIMENSION_LABELS.persuasion[profile.persuasion]})
- Good work day means: ${profile.motivation} (${DIMENSION_LABELS.motivation[profile.motivation]})
- Interested in: ${profile.contentInterest} (${DIMENSION_LABELS.contentInterest[profile.contentInterest]})
```

Remove the lines for `learning`, `education`, and `sharing`.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/reveal/route.ts
git commit -m "refactor: update reveal route for 3-dimension profile"
```

---

### Task 9: Update /api/profile Route

**Files:**
- Modify: `src/app/api/profile/route.ts`

- [ ] **Step 1: Update interactionSchema — replace interview answer types**

Replace the `interviewAnswers` field in `interactionSchema`:

```typescript
  interviewAnswers: z
    .object({
      persuasion: z.enum(["results", "process", "character"]),
      motivation: z.enum(["mastery", "purpose", "relatedness"]),
      contentInterest: z.enum(["technical", "vision", "journey"]),
    })
    .optional(),
```

- [ ] **Step 2: Update outputSchema — replace interview dimensions**

In the `profile` object of `outputSchema`, replace the 5 interview dimensions with 3:

```typescript
  profile: z.object({
    persuasion: z.enum(["results", "process", "character"]),
    motivation: z.enum(["mastery", "purpose", "relatedness"]),
    contentInterest: z.enum(["technical", "vision", "journey"]),
    inferredRole: z.string().nullable(),
    interests: z.record(z.string(), z.number()),
    preferredDepth: z.enum(["surface", "moderate", "deep"]),
    preferredTone: z.enum(["analytical", "narrative", "conversational", "formal"]),
    domainKnowledge: z.record(z.string(), z.enum(["novice", "familiar", "expert"])),
  }),
```

- [ ] **Step 3: Update system prompt — add behavioral signals context**

Replace the last paragraph of the system prompt rules:

```
The interview dimensions (persuasion, motivation, contentInterest) should NEVER change from their original values — they are set by the visitor's own answers.

BEHAVIORAL ADAPTATION:
When you have enough interaction data (3+ interactions), assess whether the visitor's behavior matches their stated preferences:
- If they stated "technical" interest but mostly click philosophy/vision nodes, note this divergence in keyObservations and adjust preferredTone/preferredDepth accordingly.
- If they stated "mastery" motivation but use chat heavily (conversational behavior), consider shifting preferredTone toward "conversational".
- The interview dimensions stay fixed, but inferredRole, preferredDepth, preferredTone, and interests should evolve based on actual behavior.

Be conservative — only update fields where you have real evidence. Don't hallucinate interests or roles from thin evidence.`;
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/profile/route.ts
git commit -m "refactor: update profile route for 3-dimension model with behavioral adaptation"
```

---

### Task 10: Update /api/generate Route

**Files:**
- Modify: `src/app/api/generate/route.ts`

- [ ] **Step 1: Update the buildGeneratePrompt visitor profile section**

In the `buildGeneratePrompt` function, the `VISITOR PROFILE` section references `profile.learning`. Replace it:

Find the line:
```typescript
- Learning: ${profile.learning}
```

Replace with:
```typescript
- Content interest: ${profile.contentInterest}
```

The line `- Persuasion: ${profile.persuasion}` and `- Motivation: ${profile.motivation}` stay unchanged.

- [ ] **Step 2: Commit**

```bash
git add src/app/api/generate/route.ts
git commit -m "refactor: update generate route for 3-dimension profile"
```

---

### Task 11: Update Reveal Component

**Files:**
- Modify: `src/components/Reveal.tsx`

- [ ] **Step 1: Update REVEAL_EXPLANATIONS — remove learning/sharing, add contentInterest**

Replace `REVEAL_EXPLANATIONS`:

```typescript
const REVEAL_EXPLANATIONS: Record<string, Record<string, string>> = {
  persuasion: {
    results:
      "Because you value results, I told you my story through impact numbers and concrete outcomes.",
    process:
      "Because you value thinking processes, I told you my startup story as a problem-solving journey, not a success story.",
    character:
      "Because you connect with personality, I led with personal stories and what drives me as a person.",
  },
  motivation: {
    mastery:
      "I emphasized the architecture decisions and technical depth behind my projects — because mastery drives you.",
    purpose:
      "I emphasized how my work impacts education and why it matters — because purpose drives you.",
    relatedness:
      "I emphasized the teams I've built and the people I've worked with — because connection drives you.",
  },
  contentInterest: {
    technical:
      "I prioritized my projects, technical decisions, and measurable outcomes — because that's what you wanted to see.",
    vision:
      "I led with my philosophy and vision for AI in education — because you're interested in how I think.",
    journey:
      "I walked you through my career arc and the decisions that shaped it — because you wanted to know my story.",
  },
};
```

- [ ] **Step 2: Update DIMENSION_TITLES**

```typescript
const DIMENSION_TITLES: Record<string, string> = {
  persuasion: "What convinces you",
  motivation: "What drives you",
  contentInterest: "What you wanted to see",
};
```

- [ ] **Step 3: Update dimensions array from 5 to 3**

Replace:
```typescript
  const dimensions = ["persuasion", "learning", "education", "motivation", "sharing"] as const;
```

With:
```typescript
  const dimensions = ["persuasion", "motivation", "contentInterest"] as const;
```

- [ ] **Step 4: Update "Your Profile" subtitle**

Replace:
```typescript
          Your Profile <span className="normal-case tracking-normal text-neutral-400">— from your 5 answers</span>
```

With:
```typescript
          Your Profile <span className="normal-case tracking-normal text-neutral-400">— from your 3 answers</span>
```

- [ ] **Step 5: Update static fallback — use 3 dimensions**

Replace:
```typescript
              {(["persuasion", "learning", "motivation", "sharing"] as const).map((dim) => (
```

With:
```typescript
              {(["persuasion", "motivation", "contentInterest"] as const).map((dim) => (
```

- [ ] **Step 6: Commit**

```bash
git add src/components/Reveal.tsx
git commit -m "refactor: update Reveal component for 3-dimension profile"
```

---

### Task 12: Update ShareableCard and OG Image

**Files:**
- Modify: `src/components/ShareableCard.tsx`
- Modify: `src/app/api/og/[id]/route.tsx`

- [ ] **Step 1: Update ShareableCard**

Replace the content to show the 3 new dimensions:

```typescript
"use client";

import type { ExperimentProfile } from "@/lib/experiment-types";
import { DIMENSION_LABELS } from "@/lib/experiment-types";

interface ShareableCardProps {
  profile: ExperimentProfile;
}

export default function ShareableCard({ profile }: ShareableCardProps) {
  return (
    <div className="w-full max-w-md mx-auto bg-gradient-to-br from-neutral-50 to-orange-50 dark:from-neutral-900 dark:to-orange-950/20 p-8 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-lg">
      <p className="text-[10px] tracking-[3px] text-neutral-400 mb-5 uppercase">
        Max Marowsky&apos;s Experiment
      </p>
      <p className="font-serif text-xl text-neutral-900 dark:text-neutral-100 mb-1 leading-snug">
        You are convinced by
      </p>
      <p className="font-serif text-xl font-bold text-orange-600 dark:text-orange-400 mb-5">
        {DIMENSION_LABELS.persuasion[profile.persuasion]}
      </p>
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div>
          <p className="text-[11px] text-neutral-400">Drive</p>
          <p className="text-sm text-neutral-700 dark:text-neutral-300">
            {DIMENSION_LABELS.motivation[profile.motivation]}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-neutral-400">Interest</p>
          <p className="text-sm text-neutral-700 dark:text-neutral-300">
            {DIMENSION_LABELS.contentInterest[profile.contentInterest]}
          </p>
        </div>
      </div>
      <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
        <p className="text-xs text-neutral-400">
          Every journey is unique · Start yours
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update OG image route**

Replace the "Learning style" section with "Interest":

```tsx
        <div style={{ display: "flex", gap: "60px", marginBottom: "40px" }}>
          <div>
            <p style={{ fontSize: "14px", color: "#999" }}>Drive</p>
            <p style={{ fontSize: "20px", color: "#333" }}>
              {DIMENSION_LABELS.motivation[profile.motivation]}
            </p>
          </div>
          <div>
            <p style={{ fontSize: "14px", color: "#999" }}>Interest</p>
            <p style={{ fontSize: "20px", color: "#333" }}>
              {DIMENSION_LABELS.contentInterest[profile.contentInterest]}
            </p>
          </div>
        </div>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ShareableCard.tsx src/app/api/og/[id]/route.tsx
git commit -m "refactor: update ShareableCard and OG image for 3-dimension profile"
```

---

### Task 13: Update ExperimentContext

**Files:**
- Modify: `src/lib/experiment-context.tsx`

- [ ] **Step 1: Update the updateProfileAsync interaction type**

The `interviewAnswers` type in the `updateProfileAsync` callback uses `Omit<ExperimentProfile, "experimentNumber">`. Since `ExperimentProfile` is already updated in Task 1, this type will automatically be correct. Verify that the type is inferred properly — no code change should be needed in this file beyond what was done in Task 5.

Run: `npx tsc --noEmit src/lib/experiment-context.tsx 2>&1 | head -5`

Expected: No errors (if Tasks 1-3 are complete).

- [ ] **Step 2: Commit (only if changes were needed)**

```bash
git add src/lib/experiment-context.tsx
git commit -m "refactor: verify experiment context compiles with new profile type"
```

---

### Task 14: Full Build Verification

**Files:** None (verification only)

- [ ] **Step 1: Run TypeScript compiler on entire project**

Run: `npx tsc --noEmit`

Expected: No errors. If there are errors, fix the remaining references to `learning`, `education`, or `sharing` in the reported files.

- [ ] **Step 2: Run the build**

Run: `npm run build`

Expected: Build succeeds.

- [ ] **Step 3: Smoke test**

Run: `npm run dev`

Test manually:
1. Navigate to the site
2. Start an experiment
3. Verify 3 questions appear (not 5)
4. Answer all 3
5. Verify the Opening shows personalized hooks
6. Click through a few nodes
7. Verify the Reveal shows 3 dimensions

- [ ] **Step 4: Final commit if any fixes were needed**

```bash
git add -A
git commit -m "fix: resolve remaining type errors from 3-dimension profile migration"
```
