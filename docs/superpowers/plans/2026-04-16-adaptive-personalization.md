# Adaptive Personalization Engine — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace static content display with fully adaptive, Claude-generated content personalized to each visitor's inferred profile — which sharpens with every interaction.

**Architecture:** Three decoupled API services (generate, profile, chat) backed by a dual profile system (structured VisitorProfile + natural-language ProfileNarrative). Client-side pre-generation cache for instant content delivery. Graceful fallback to today's static behavior when APIs fail.

**Tech Stack:** Next.js 16 App Router, Vercel AI SDK v6, Claude Sonnet 4.5, TypeScript, React Context, Zod

---

## File Structure

### New Files
| File | Responsibility |
|------|---------------|
| `src/lib/visitor-profile.ts` | VisitorProfile + ProfileNarrative types, empty defaults |
| `src/lib/content-cache.ts` | Pre-generation cache logic (store, lookup, invalidate) |
| `src/app/api/generate/route.ts` | Content generation endpoint |
| `src/app/api/profile/route.ts` | Async profile update endpoint |

### Modified Files
| File | Changes |
|------|---------|
| `src/lib/experiment-context.tsx` | Add visitorProfile, narrative, cache state + async profile update |
| `src/app/api/chat/route.ts` | Accept visitorProfile + narrative, trigger profile update |
| `src/app/api/sessions/route.ts` | Save/load extended session payload |
| `src/lib/session-store.ts` | Extended save/load with visitorProfile + narrative + generated contents |
| `src/components/ConversationView.tsx` | Rewire addNodeBlock + submitFreeQuestion to use /api/generate + cache |
| `src/components/Opening.tsx` | Accept personalized starter hook labels |
| `src/components/Reveal.tsx` | Accept narrative, call /api/chat for dynamic journey summary |

---

## Task 1: VisitorProfile & ProfileNarrative Types

**Files:**
- Create: `src/lib/visitor-profile.ts`

- [ ] **Step 1: Create the type definitions file**

```typescript
// src/lib/visitor-profile.ts
import type { Persuasion, Learning, Education, Motivation, Sharing } from "./experiment-types";

export interface VisitorProfile {
  // From interview (mirrors ExperimentProfile minus experimentNumber)
  persuasion: Persuasion;
  learning: Learning;
  education: Education;
  motivation: Motivation;
  sharing: Sharing;

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
  learning: Learning;
  education: Education;
  motivation: Motivation;
  sharing: Sharing;
}): VisitorProfile {
  return {
    ...interview,
    inferredRole: null,
    interests: {},
    preferredDepth: interview.learning === "structured" ? "moderate" : "deep",
    preferredTone: interview.learning === "social" ? "conversational" : "narrative",
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

- [ ] **Step 2: Verify the file compiles**

Run: `npx tsc --noEmit src/lib/visitor-profile.ts 2>&1 | head -20`

Expected: No errors (or only unrelated existing errors).

- [ ] **Step 3: Commit**

```bash
git add src/lib/visitor-profile.ts
git commit -m "feat: add VisitorProfile and ProfileNarrative types"
```

---

## Task 2: Profile Update API (`/api/profile`)

**Files:**
- Create: `src/app/api/profile/route.ts`

- [ ] **Step 1: Create the profile update endpoint**

```typescript
// src/app/api/profile/route.ts
import { generateText, Output } from "ai";
import { z } from "zod";
import type { VisitorProfile, ProfileNarrative } from "@/lib/visitor-profile";

export const maxDuration = 15;

const interactionSchema = z.object({
  type: z.enum(["interview_complete", "hook_click", "chat_question", "chat_answer_read"]),
  nodeId: z.string().optional(),
  question: z.string().optional(),
  answer: z.string().optional(),
  interviewAnswers: z
    .object({
      persuasion: z.enum(["results", "process", "character"]),
      learning: z.enum(["exploratory", "structured", "social"]),
      education: z.enum(["practice", "individualization", "inspiration"]),
      motivation: z.enum(["mastery", "purpose", "relatedness"]),
      sharing: z.enum(["surprise", "utility", "emotion"]),
    })
    .optional(),
});

const requestSchema = z.object({
  currentProfile: z.any(), // VisitorProfile — validated by runtime
  currentNarrative: z.any(), // ProfileNarrative
  newInteraction: interactionSchema,
  visitedNodes: z.array(z.string()),
});

const outputSchema = z.object({
  profile: z.object({
    persuasion: z.enum(["results", "process", "character"]),
    learning: z.enum(["exploratory", "structured", "social"]),
    education: z.enum(["practice", "individualization", "inspiration"]),
    motivation: z.enum(["mastery", "purpose", "relatedness"]),
    sharing: z.enum(["surprise", "utility", "emotion"]),
    inferredRole: z.string().nullable(),
    interests: z.record(z.string(), z.number()),
    preferredDepth: z.enum(["surface", "moderate", "deep"]),
    preferredTone: z.enum(["analytical", "narrative", "conversational", "formal"]),
    domainKnowledge: z.record(z.string(), z.enum(["novice", "familiar", "expert"])),
  }),
  narrative: z.object({
    summary: z.string(),
    keyObservations: z.array(z.string()),
    interactionCount: z.number(),
    lastUpdated: z.string(),
  }),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid body" }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const { currentProfile, currentNarrative, newInteraction, visitedNodes } = parsed.data;

  const systemPrompt = `You are a visitor profiling engine for Max Marowsky's portfolio website. Your job is to analyze visitor interactions and maintain an evolving profile.

CURRENT VISITOR PROFILE:
${JSON.stringify(currentProfile, null, 2)}

CURRENT NARRATIVE:
Summary: ${currentNarrative.summary || "(first interaction)"}
Key Observations: ${currentNarrative.keyObservations?.length ? currentNarrative.keyObservations.join("; ") : "(none yet)"}
Interaction Count: ${currentNarrative.interactionCount || 0}

VISITED NODES SO FAR: ${visitedNodes.join(", ") || "none"}

NEW INTERACTION:
Type: ${newInteraction.type}
${newInteraction.nodeId ? `Node clicked: ${newInteraction.nodeId}` : ""}
${newInteraction.question ? `Question asked: "${newInteraction.question}"` : ""}
${newInteraction.answer ? `Answer received: "${newInteraction.answer}"` : ""}
${newInteraction.interviewAnswers ? `Interview answers: ${JSON.stringify(newInteraction.interviewAnswers)}` : ""}

RULES:
- Update the profile based on what this interaction reveals about the visitor
- inferredRole: Infer what role/background this person likely has. Start with null, sharpen over time. Be specific (e.g. "engineering manager at a growth-stage startup" not just "engineer")
- interests: Add or strengthen interest tags based on what they click/ask about. Weight 0-1. Only add tags with evidence.
- preferredDepth: "surface" if they seem to skim, "deep" if they ask detailed/technical questions, "moderate" as default
- preferredTone: "analytical" for data-focused visitors, "narrative" for story-driven, "conversational" for dialogue-heavy, "formal" for business-focused
- domainKnowledge: Track what domains they seem knowledgeable in (novice/familiar/expert). Only add domains you have evidence for.
- summary: Write 3-5 sentences capturing who this visitor is and what they care about. Update with each interaction.
- keyObservations: Add specific behavioral observations. Keep max 10, remove stale ones.
- interactionCount: Increment by 1
- lastUpdated: Set to current ISO timestamp

The interview dimensions (persuasion, learning, education, motivation, sharing) should NEVER change from their original values — they are set by the visitor's own answers.

Be conservative — only update fields where you have real evidence. Don't hallucinate interests or roles from thin evidence.`;

  try {
    const result = await generateText({
      model: "anthropic/claude-sonnet-4.5",
      output: Output.object({ schema: outputSchema }),
      prompt: systemPrompt,
    });

    return Response.json(result.output);
  } catch (err) {
    // On failure, return the current profile unchanged
    return Response.json({
      profile: currentProfile,
      narrative: {
        ...currentNarrative,
        interactionCount: (currentNarrative.interactionCount || 0) + 1,
        lastUpdated: new Date().toISOString(),
      },
    });
  }
}
```

- [ ] **Step 2: Verify the file compiles**

Run: `npx tsc --noEmit 2>&1 | head -20`

Expected: No type errors in the new file.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/profile/route.ts
git commit -m "feat: add /api/profile endpoint for async visitor profiling"
```

---

## Task 3: Content Generation API (`/api/generate`)

**Files:**
- Create: `src/app/api/generate/route.ts`
- Read (reference): `src/app/api/frame/route.ts`, `src/lib/content-graph.ts`, `src/lib/framing-hints.ts`

- [ ] **Step 1: Create the content generation endpoint**

```typescript
// src/app/api/generate/route.ts
import { generateText, Output } from "ai";
import { z } from "zod";
import { NextResponse } from "next/server";
import { CONTENT_GRAPH } from "@/lib/content-graph";
import { FRAMING_HINTS } from "@/lib/framing-hints";
import {
  createEmptySignals,
  describeCandidates,
  describeSignals,
  listCandidateIds,
  pickFallbackHooks,
} from "@/lib/hook-router";
import type { SignalVector } from "@/lib/experiment-types";
import type { VisitorProfile, ProfileNarrative } from "@/lib/visitor-profile";

export const maxDuration = 30;

const requestSchema = z.object({
  nodeId: z.string(),
  profile: z.any(), // VisitorProfile
  narrative: z.any(), // ProfileNarrative
  signals: z.any().optional(), // SignalVector
  visitedNodes: z.array(z.string()),
  visitOrder: z.array(z.string()).optional(),
  previousNodeId: z.string().optional(),
  stream: z.boolean().optional(), // true = streaming response
});

const outputSchema = z.object({
  title: z.string().describe("Personalized title for this content block, 3-8 words"),
  content: z.string().describe("The rewritten content text in Markdown. Preserve all facts from the reference text."),
  hooks: z.array(z.object({
    nodeId: z.string(),
    label: z.string().describe("3-6 word chip label personalized to this visitor"),
    teaser: z.string().describe("1 sentence explaining why this is relevant for THIS visitor"),
  })).min(0).max(3),
});

function buildGeneratePrompt(
  nodeId: string,
  referenceText: string,
  profile: VisitorProfile,
  narrative: ProfileNarrative,
  visitedNodes: string[],
  visitOrder: string[],
  previousNodeId: string | undefined,
  candidateBlock: string,
  signalBlock: string,
  hints: Record<string, string> | undefined,
): string {
  const prevNode = previousNodeId ? CONTENT_GRAPH[previousNodeId] : null;
  const prevSummary = prevNode?.tags?.summary ?? prevNode?.id ?? "";

  return `You are Max Marowsky's portfolio content engine. You rewrite content nodes to be perfectly tailored to each visitor.

VISITOR PROFILE:
- Role: ${profile.inferredRole ?? "unknown (still learning)"}
- Interests: ${Object.entries(profile.interests).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}:${v.toFixed(1)}`).join(", ") || "not yet established"}
- Preferred depth: ${profile.preferredDepth}
- Preferred tone: ${profile.preferredTone}
- Domain knowledge: ${Object.entries(profile.domainKnowledge).map(([k, v]) => `${k}:${v}`).join(", ") || "unknown"}
- Persuasion: ${profile.persuasion}
- Learning: ${profile.learning}
- Motivation: ${profile.motivation}

VISITOR NARRATIVE (what we know about this person):
${narrative.summary || "First interaction — no observations yet."}
${narrative.keyObservations.length > 0 ? "\nKey observations:\n" + narrative.keyObservations.map(o => `- ${o}`).join("\n") : ""}

LIVE SIGNAL TILT:
${signalBlock}

REFERENCE TEXT (ground truth — all facts must be preserved):
---
${referenceText}
---

${hints ? `EMPHASIS HINTS:\n${Object.entries(hints).map(([k, v]) => `- ${k}: ${v}`).join("\n")}` : ""}

${prevNode ? `PREVIOUS NODE: "${previousNodeId}" — ${prevSummary}` : ""}
VISITED SO FAR: ${(visitOrder.length > 0 ? visitOrder : visitedNodes).join(" → ") || "none"}

AVAILABLE NEXT NODES (pick 3 for hooks):
${candidateBlock || "(none available)"}

RULES:
1. REWRITE the reference text — don't just copy it. Adapt emphasis, tone, detail level, and narrative framing to this visitor.
2. For a visitor interested in "${profile.interests ? Object.keys(profile.interests)[0] ?? "general" : "general"}", emphasize those aspects. For a "${profile.preferredTone}" tone preference, match that style.
3. If the visitor has domain expertise (${Object.entries(profile.domainKnowledge).filter(([,v]) => v === "expert").map(([k]) => k).join(", ") || "none detected"}), skip basic explanations in those areas.
4. Build narrative bridges to previously visited nodes when natural — "As you saw with [topic]..." or "This connects to [previous]..."
5. NEVER invent new facts. Every number, name, date must come from the reference text.
6. The rewritten text should be within 20% of the reference text length (not dramatically shorter or longer).
7. Title should be personalized — not just the generic topic name.
8. For hooks: pick from AVAILABLE NEXT NODES. Write labels in the visitor's voice. Add a teaser explaining relevance for THIS visitor.
9. Write in English. Be warm, concise, authentic. Never mention that you're personalizing.`;
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { nodeId, profile, narrative, visitedNodes, visitOrder, previousNodeId } = parsed.data;
  const node = CONTENT_GRAPH[nodeId];
  if (!node) {
    return NextResponse.json({ error: "Node not found" }, { status: 404 });
  }

  const signals: SignalVector = parsed.data.signals ?? createEmptySignals();
  const visited = new Set(visitedNodes);
  visited.add(nodeId);

  const candidateIds = listCandidateIds(visited);
  const candidateBlock = describeCandidates(candidateIds);
  const signalBlock = describeSignals(signals);
  const hints = FRAMING_HINTS[nodeId];

  const prompt = buildGeneratePrompt(
    nodeId,
    node.content,
    profile as VisitorProfile,
    narrative as ProfileNarrative,
    visitedNodes,
    visitOrder ?? visitedNodes,
    previousNodeId,
    candidateBlock,
    signalBlock,
    hints as Record<string, string> | undefined,
  );

  // NOTE: A streaming mode (stream: true) can be added later for real-time
  // text display on cache misses. For now, all requests use structured output
  // which returns complete JSON. The client shows a SkeletonBlock during loading.

  // Structured output mode (used for both live generation and pre-generation)
  try {
    const result = await generateText({
      model: "anthropic/claude-sonnet-4.5",
      output: Output.object({ schema: outputSchema }),
      prompt,
    });

    // Validate hooks — only allow candidate IDs
    const candidateSet = new Set(candidateIds);
    const validHooks = (result.output.hooks ?? []).filter(
      (h) => candidateSet.has(h.nodeId) && h.label.trim().length > 0,
    );

    // Fallback if Claude returns too few hooks
    let hooks = validHooks;
    if (hooks.length < 2 && profile) {
      const fallback = pickFallbackHooks(node, profile, signals, visited, 3);
      for (const h of fallback) {
        if (hooks.length >= 3) break;
        if (hooks.some((existing) => existing.nodeId === h.targetId)) continue;
        hooks.push({ nodeId: h.targetId, label: h.label, teaser: "" });
      }
    } else {
      hooks = hooks.slice(0, 3);
    }

    return NextResponse.json({
      ...result.output,
      hooks,
    });
  } catch {
    // Fallback: return reference text as-is
    const fallbackHooks = profile
      ? pickFallbackHooks(node, profile, signals, visited, 3).map((h) => ({
          nodeId: h.targetId,
          label: h.label,
          teaser: "",
        }))
      : node.hooks.slice(0, 3).map((h) => ({
          nodeId: h.targetId,
          label: h.label,
          teaser: "",
        }));

    return NextResponse.json({
      title: nodeId.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      content: node.content,
      hooks: fallbackHooks,
    });
  }
}
```

- [ ] **Step 2: Verify the file compiles**

Run: `npx tsc --noEmit 2>&1 | head -20`

Expected: No type errors in the new file.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/generate/route.ts
git commit -m "feat: add /api/generate endpoint for personalized content generation"
```

---

## Task 4: Content Cache Module

**Files:**
- Create: `src/lib/content-cache.ts`

- [ ] **Step 1: Create the cache module**

```typescript
// src/lib/content-cache.ts
import type { GeneratedContent } from "./visitor-profile";

/**
 * Simple in-memory cache for pre-generated content.
 * Key: nodeId, Value: generated content.
 * Cache is per-session (lives in React state), not persisted.
 */
export interface ContentCache {
  get(nodeId: string): GeneratedContent | undefined;
  set(nodeId: string, content: GeneratedContent): void;
  has(nodeId: string): boolean;
  clear(): void;
  entries(): Array<[string, GeneratedContent]>;
}

export function createContentCache(): ContentCache {
  const store = new Map<string, GeneratedContent>();

  return {
    get: (nodeId) => store.get(nodeId),
    set: (nodeId, content) => store.set(nodeId, content),
    has: (nodeId) => store.has(nodeId),
    clear: () => store.clear(),
    entries: () => Array.from(store.entries()),
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/content-cache.ts
git commit -m "feat: add content cache module for pre-generated nodes"
```

---

## Task 5: Extend ExperimentContext with VisitorProfile & Cache

**Files:**
- Modify: `src/lib/experiment-context.tsx`

- [ ] **Step 1: Add VisitorProfile, narrative, and cache state to ExperimentContext**

In `src/lib/experiment-context.tsx`, add imports at the top (after existing imports):

```typescript
import type { VisitorProfile, ProfileNarrative, GeneratedContent } from "./visitor-profile";
import { createEmptyVisitorProfile, createEmptyNarrative } from "./visitor-profile";
import { createContentCache, type ContentCache } from "./content-cache";
```

- [ ] **Step 2: Extend the ExperimentState interface**

Replace the existing `ExperimentState` interface (lines 12-19) with:

```typescript
interface ExperimentState {
  profile: ExperimentProfile | null;
  signals: SignalVector;
  setProfile: (profile: ExperimentProfile) => void;
  recordClick: (nodeId: string) => void;
  resetExperiment: () => void;
  isInterviewed: boolean;
  // Adaptive personalization state
  visitorProfile: VisitorProfile | null;
  narrative: ProfileNarrative | null;
  contentCache: ContentCache;
  isProfileUpdating: boolean;
  setVisitorProfile: (vp: VisitorProfile) => void;
  setNarrative: (n: ProfileNarrative) => void;
  setIsProfileUpdating: (v: boolean) => void;
  updateProfileAsync: (interaction: {
    type: "interview_complete" | "hook_click" | "chat_question" | "chat_answer_read";
    nodeId?: string;
    question?: string;
    answer?: string;
    interviewAnswers?: Omit<ExperimentProfile, "experimentNumber">;
  }, visitedNodes: string[]) => void;
}
```

- [ ] **Step 3: Add state and callbacks inside ExperimentProvider**

After the existing `useState` declarations (lines 24-25), add:

```typescript
const [visitorProfile, setVisitorProfile] = useState<VisitorProfile | null>(null);
const [narrative, setNarrative] = useState<ProfileNarrative | null>(null);
const [contentCacheRef] = useState(() => createContentCache());
const [isProfileUpdating, setIsProfileUpdating] = useState(false);
```

- [ ] **Step 4: Add the async profile update callback**

After the `resetExperiment` callback, add:

```typescript
const updateProfileAsync = useCallback(
  (
    interaction: {
      type: "interview_complete" | "hook_click" | "chat_question" | "chat_answer_read";
      nodeId?: string;
      question?: string;
      answer?: string;
      interviewAnswers?: Omit<ExperimentProfile, "experimentNumber">;
    },
    visitedNodes: string[],
  ) => {
    if (!visitorProfile || !narrative) return;
    setIsProfileUpdating(true);

    fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentProfile: visitorProfile,
        currentNarrative: narrative,
        newInteraction: interaction,
        visitedNodes,
      }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.profile) setVisitorProfile(data.profile);
        if (data?.narrative) setNarrative(data.narrative);
      })
      .catch(() => {
        // Silent failure — next interaction will try again with current profile
      })
      .finally(() => setIsProfileUpdating(false));
  },
  [visitorProfile, narrative],
);
```

- [ ] **Step 5: Update setProfile to initialize VisitorProfile**

Replace the existing `setProfile` callback (lines 27-30) with:

```typescript
const setProfile = useCallback((p: ExperimentProfile) => {
  setProfileState(p);
  setSignals(seedSignalsFromProfile(p));
  // Initialize visitor profile from interview answers
  const vp = createEmptyVisitorProfile(p);
  setVisitorProfile(vp);
  setNarrative(createEmptyNarrative());
}, []);
```

- [ ] **Step 6: Update resetExperiment to clear new state**

Replace the existing `resetExperiment` callback (lines 38-41) with:

```typescript
const resetExperiment = useCallback(() => {
  setProfileState(null);
  setSignals(createEmptySignals());
  setVisitorProfile(null);
  setNarrative(null);
  contentCacheRef.clear();
  setIsProfileUpdating(false);
}, [contentCacheRef]);
```

- [ ] **Step 7: Extend the Provider value**

Replace the `value` prop in the Provider (lines 45-52) with:

```typescript
value={{
  profile,
  signals,
  setProfile,
  recordClick,
  resetExperiment,
  isInterviewed: profile !== null,
  visitorProfile,
  narrative,
  contentCache: contentCacheRef,
  isProfileUpdating,
  setVisitorProfile,
  setNarrative,
  setIsProfileUpdating,
  updateProfileAsync,
}}
```

- [ ] **Step 8: Verify the file compiles**

Run: `npx tsc --noEmit 2>&1 | head -20`

Expected: No type errors. Existing consumers of `useExperiment()` still work (they just don't use the new fields yet).

- [ ] **Step 9: Commit**

```bash
git add src/lib/experiment-context.tsx
git commit -m "feat: extend ExperimentContext with VisitorProfile, narrative, and content cache"
```

---

## Task 6: Rewire ConversationView — addNodeBlock

**Files:**
- Modify: `src/components/ConversationView.tsx`

This is the core integration. `addNodeBlock` changes from "fetch framing + show static content" to "fetch generated content (or use cache) + trigger async profile update + pre-generate next nodes".

- [ ] **Step 1: Update imports and context usage**

Add to imports at top of `ConversationView.tsx`:

```typescript
import type { GeneratedContent } from "@/lib/visitor-profile";
```

Update the destructured context (line 54) to include new fields:

```typescript
const {
  profile, signals, setProfile, recordClick, isInterviewed, resetExperiment,
  visitorProfile, narrative, contentCache, updateProfileAsync, setVisitorProfile, setNarrative,
} = useExperiment();
```

- [ ] **Step 2: Add pre-generation helper function**

Add this function inside ConversationView, before `addNodeBlock`:

```typescript
const preGenerateHooks = useCallback(
  (hooks: Array<{ nodeId: string }>, currentVisitedNodes: string[], currentVisitOrder: string[], currentNodeId: string) => {
    if (!visitorProfile || !narrative) return;
    for (const hook of hooks) {
      if (contentCache.has(hook.nodeId)) continue;
      // Fire-and-forget pre-generation
      fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nodeId: hook.nodeId,
          profile: visitorProfile,
          narrative,
          signals,
          visitedNodes: currentVisitedNodes,
          visitOrder: currentVisitOrder,
          previousNodeId: currentNodeId,
        }),
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data: GeneratedContent | null) => {
          if (data) contentCache.set(hook.nodeId, data);
        })
        .catch(() => {
          // Silent — will stream on cache miss
        });
    }
  },
  [visitorProfile, narrative, signals, contentCache],
);
```

- [ ] **Step 3: Rewrite addNodeBlock to use /api/generate + cache**

Replace the entire `addNodeBlock` callback (lines 98-202) with:

```typescript
const addNodeBlock = useCallback(async (nodeId: string) => {
  if (isLoading) return;
  const node = CONTENT_GRAPH[nodeId];
  if (!node) return;

  const updatedVisited = new Set(visitedNodes);
  updatedVisited.add(nodeId);
  setVisitedNodes(updatedVisited);
  const updatedVisitOrder = visitOrder.includes(nodeId)
    ? visitOrder
    : [...visitOrder, nodeId];
  setVisitOrder(updatedVisitOrder);
  recordClick(nodeId);

  // Check pre-generation cache first
  const cached = contentCache.get(nodeId);

  let generatedContent: GeneratedContent | null = null;

  if (cached) {
    // Cache hit — use pre-generated content
    generatedContent = cached;
  } else if (visitorProfile && narrative) {
    // Cache miss — generate live
    setIsLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nodeId,
          profile: visitorProfile,
          narrative,
          signals,
          visitedNodes: Array.from(updatedVisited),
          visitOrder: updatedVisitOrder,
          previousNodeId: blocks.length > 0 ? blocks[blocks.length - 1].id : undefined,
        }),
      });
      if (res.ok) {
        generatedContent = await res.json();
      }
    } catch {
      // Fall through to static fallback
    } finally {
      setIsLoading(false);
    }
  }

  // Build the content block
  let block: ContentBlockData;

  if (generatedContent) {
    // Use Claude-generated content
    blockCounter.current += 1;
    block = {
      id: nodeId,
      questionTitle: generatedContent.title,
      text: generatedContent.content,
      richType: null,
      richData: null,
      hooks: generatedContent.hooks.map((h) => ({
        label: h.label,
        question: h.teaser || h.label,
        targetId: h.nodeId,
      })),
    };

    // Add image if the node has one
    if (node.image) {
      block.richType = "photo";
      block.richData = node.image;
    }
  } else {
    // Fallback: use static content (today's behavior)
    const depth = profile?.learning === "structured" ? "overview" : "deep-dive";
    block = nodeToBlock(node, updatedVisited, depth);
  }

  // Deterministic hidden-gem surfacing (unchanged)
  const surfaceableGems = Object.values(CONTENT_GRAPH).filter(
    (n) => n.gem && !updatedVisited.has(n.id) && isNodeUnlocked(n, updatedVisited),
  );
  if (surfaceableGems.length > 0) {
    const gemHooks = surfaceableGems.map((g) => ({
      label: g.gemTitle ?? g.id,
      question: g.gemTitle ?? g.id,
      targetId: g.id,
    }));
    const existingIds = new Set(block.hooks.map((h) => h.targetId));
    const deduped = gemHooks.filter((g) => !existingIds.has(g.targetId));
    block.hooks = [...deduped, ...block.hooks].slice(0, 4);
  }

  setBlocks((prev) => [...prev, block]);
  setMessages((prev) => [
    ...prev,
    { role: "user" as const, content: block.questionTitle },
    { role: "assistant" as const, content: block.text },
  ]);

  // Async profile update (non-blocking)
  updateProfileAsync(
    { type: "hook_click", nodeId },
    Array.from(updatedVisited),
  );

  // Pre-generate next hooks (non-blocking)
  if (generatedContent?.hooks) {
    preGenerateHooks(
      generatedContent.hooks,
      Array.from(updatedVisited),
      updatedVisitOrder,
      nodeId,
    );
  }

  // Easter egg discovery (unchanged)
  if (nodeId === "gem-convergence" || nodeId === "gem-lab-to-product" || nodeId === "gem-full-picture") {
    discoverEgg(nodeId);
  }
}, [isLoading, visitedNodes, visitOrder, profile, signals, blocks, recordClick, discoverEgg,
    visitorProfile, narrative, contentCache, updateProfileAsync, preGenerateHooks]);
```

- [ ] **Step 4: Verify the file compiles**

Run: `npx tsc --noEmit 2>&1 | head -20`

- [ ] **Step 5: Commit**

```bash
git add src/components/ConversationView.tsx
git commit -m "feat: rewire addNodeBlock to use /api/generate with cache + pre-generation"
```

---

## Task 7: Rewire ConversationView — submitFreeQuestion + Cache Invalidation

**Files:**
- Modify: `src/components/ConversationView.tsx`

- [ ] **Step 1: Update submitFreeQuestion to pass visitorProfile + narrative and invalidate cache**

Replace the `submitFreeQuestion` callback (lines 204-271 in original, now shifted) with:

```typescript
const submitFreeQuestion = useCallback(async (question: string) => {
  if (isLoading) return;

  // Coffee Easter Egg (unchanged)
  if (matchesCoffeeKeyword(question)) {
    setCoffeeGameActive(true);
    discoverEgg("coffee");
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

  setIsLoading(true);
  setFreeQuestionCount((prev) => {
    if (prev === 0) discoverEgg("curious-mind");
    return prev + 1;
  });

  const updatedMessages = [
    ...messages,
    { role: "user" as const, content: question },
  ];

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: updatedMessages,
        profile,
        signals,
        visitorProfile,
        narrative,
        visitedNodes: Array.from(visitedNodes),
      }),
    });

    if (!res.ok) throw new Error("Failed to get response");

    const data: AIResponse = await res.json();
    blockCounter.current += 1;

    const newBlock: ContentBlockData = {
      id: `ai-${blockCounter.current}`,
      questionTitle: data.questionTitle,
      text: data.text,
      richType: data.richType,
      richData: data.richData,
      hooks: data.hooks,
    };

    setBlocks((prev) => [...prev, newBlock]);
    const newMessages = [
      ...updatedMessages,
      { role: "assistant" as const, content: data.text },
    ];
    setMessages(newMessages);

    // Invalidate pre-generation cache — profile may have shifted significantly
    contentCache.clear();

    // Async profile update with both question and answer
    updateProfileAsync(
      { type: "chat_question", question, answer: data.text },
      Array.from(visitedNodes),
    );
  } catch (err) {
    console.error("Chat error:", err);
  } finally {
    setIsLoading(false);
  }
}, [isLoading, messages, profile, signals, discoverEgg, visitorProfile, narrative,
    visitedNodes, contentCache, updateProfileAsync]);
```

- [ ] **Step 2: Verify the file compiles**

Run: `npx tsc --noEmit 2>&1 | head -20`

- [ ] **Step 3: Commit**

```bash
git add src/components/ConversationView.tsx
git commit -m "feat: extend submitFreeQuestion with profile context and cache invalidation"
```

---

## Task 8: Trigger Initial Profile Update After Interview

**Files:**
- Modify: `src/components/ConversationView.tsx`

- [ ] **Step 1: Add effect to trigger initial profile update after interview**

Add this effect after the existing `useEffect` blocks (around line 96):

```typescript
// Trigger initial profile update from interview answers
useEffect(() => {
  if (visitorProfile && narrative && narrative.interactionCount === 0 && profile) {
    updateProfileAsync(
      {
        type: "interview_complete",
        interviewAnswers: {
          persuasion: profile.persuasion,
          learning: profile.learning,
          education: profile.education,
          motivation: profile.motivation,
          sharing: profile.sharing,
        },
      },
      [],
    );
  }
  // Only run once when interview completes
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [visitorProfile !== null]);
```

- [ ] **Step 2: Verify the file compiles**

Run: `npx tsc --noEmit 2>&1 | head -20`

- [ ] **Step 3: Commit**

```bash
git add src/components/ConversationView.tsx
git commit -m "feat: trigger initial profile update after interview completion"
```

---

## Task 9: Personalize Starter Hooks on Opening Screen

**Files:**
- Modify: `src/components/ConversationView.tsx`
- Modify: `src/components/Opening.tsx`

- [ ] **Step 1: Add state for personalized starter hook labels**

In ConversationView, add a new state variable after `starterHooks`:

```typescript
const [personalizedStarters, setPersonalizedStarters] = useState<
  Array<{ targetId: string; label: string; teaser: string }> | null
>(null);
```

- [ ] **Step 2: Add effect to generate personalized starter labels**

After the initial profile update effect, add:

```typescript
// Generate personalized starter hook labels after interview
useEffect(() => {
  if (!visitorProfile || !narrative || personalizedStarters) return;
  // Generate labels for each starter hook in parallel
  Promise.all(
    starterHooks.map((hook) =>
      fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nodeId: hook.targetId,
          profile: visitorProfile,
          narrative,
          signals,
          visitedNodes: [],
          visitOrder: [],
        }),
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          // Cache the full content for when they click
          if (data) contentCache.set(hook.targetId, data);
          return {
            targetId: hook.targetId,
            label: data?.title ?? hook.label,
            teaser: data?.hooks?.[0]?.teaser ?? "",
          };
        })
        .catch(() => ({
          targetId: hook.targetId,
          label: hook.label,
          teaser: "",
        })),
    ),
  ).then(setPersonalizedStarters);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [visitorProfile, narrative]);
```

- [ ] **Step 3: Update Opening component props**

In `src/components/Opening.tsx`, update the interface to accept personalized starters:

```typescript
interface OpeningProps {
  onHookClick: (targetId: string) => void;
  visible: boolean;
  starterHooks?: Hook[];
  personalizedStarters?: Array<{ targetId: string; label: string; teaser: string }> | null;
}
```

- [ ] **Step 4: Update Opening to prefer personalized labels**

In the hook rendering section of Opening.tsx, update the button rendering to use personalized labels when available:

```typescript
const hooks = personalizedStarters
  ? personalizedStarters.map((ps) => ({ targetId: ps.targetId, label: ps.label }))
  : (starterHooks ?? ROOT_HOOKS);
```

- [ ] **Step 5: Pass personalizedStarters from ConversationView to Opening**

In ConversationView, update the Opening render:

```typescript
<Opening
  visible={!hasStarted}
  onHookClick={addNodeBlock}
  starterHooks={starterHooks}
  personalizedStarters={personalizedStarters}
/>
```

- [ ] **Step 6: Reset personalizedStarters in handleNewJourney**

Add to `handleNewJourney`:

```typescript
setPersonalizedStarters(null);
```

- [ ] **Step 7: Verify compilation**

Run: `npx tsc --noEmit 2>&1 | head -20`

- [ ] **Step 8: Commit**

```bash
git add src/components/ConversationView.tsx src/components/Opening.tsx
git commit -m "feat: personalize starter hook labels via /api/generate"
```

---

## Task 10: Extend `/api/chat` with Full Profile Context

**Files:**
- Modify: `src/app/api/chat/route.ts`

- [ ] **Step 1: Add VisitorProfile and narrative to the request handling**

In `src/app/api/chat/route.ts`, after extracting `profile` and `signals` from the body (around line 193-194), add:

```typescript
const visitorProfile = (body as { visitorProfile?: unknown })?.visitorProfile ?? null;
const narrativeData = (body as { narrative?: unknown })?.narrative ?? null;
const visitedNodesList = (body as { visitedNodes?: string[] })?.visitedNodes ?? [];
```

- [ ] **Step 2: Extend buildProfilePrompt to include visitor profile and narrative**

Replace the existing `buildProfilePrompt` function (lines 138-152) with:

```typescript
function buildProfilePrompt(
  profile: ExperimentProfile,
  signals?: SignalPayload,
  visitorProfile?: unknown,
  narrativeData?: unknown,
  visitedNodesList?: string[],
): string {
  const tiltBlock = signals
    ? `\n\nLIVE SIGNAL TILT (updated as they click through the portfolio):
- Persuasion tilt: ${formatBucket(signals.persuasion)}
- Motivation tilt: ${formatBucket(signals.motivation)}
- Learning tilt: ${formatBucket(signals.learning)}
- Topic interests: ${formatBucket(signals.topics)}`
    : "";

  const vp = visitorProfile as Record<string, unknown> | null;
  const narr = narrativeData as Record<string, unknown> | null;

  const visitorBlock = vp
    ? `\n\nINFERRED VISITOR PROFILE:
- Role: ${vp.inferredRole ?? "unknown"}
- Interests: ${JSON.stringify(vp.interests ?? {})}
- Preferred depth: ${vp.preferredDepth ?? "moderate"}
- Preferred tone: ${vp.preferredTone ?? "narrative"}
- Domain knowledge: ${JSON.stringify(vp.domainKnowledge ?? {})}`
    : "";

  const narrativeBlock = narr?.summary
    ? `\n\nVISITOR NARRATIVE:\n${narr.summary}${
        Array.isArray(narr.keyObservations) && narr.keyObservations.length > 0
          ? "\nObservations: " + narr.keyObservations.join("; ")
          : ""
      }`
    : "";

  const visitedBlock = visitedNodesList?.length
    ? `\n\nNODES ALREADY VISITED: ${visitedNodesList.join(", ")}`
    : "";

  return `\n\nVISITOR PROFILE (personalize your responses subtly):
- Persuasion mode: ${profile.persuasion} — ${PERSUASION_GUIDANCE[profile.persuasion]}
- Learning style: ${profile.learning} — ${LEARNING_GUIDANCE[profile.learning]}
- Motivation: ${profile.motivation} — ${MOTIVATION_GUIDANCE[profile.motivation]}${tiltBlock}${visitorBlock}${narrativeBlock}${visitedBlock}

IMPORTANT: Never mention that you are personalizing. The adaptation should feel natural.`;
}
```

- [ ] **Step 3: Update the buildProfilePrompt call in POST handler**

Replace the system prompt construction (around line 196-199) with:

```typescript
const systemPrompt =
  SYSTEM_PROMPT +
  (profile ? buildProfilePrompt(profile, signals, visitorProfile, narrativeData, visitedNodesList) : "") +
  (wrapUp ? WRAPUP_PROMPT : "");
```

- [ ] **Step 4: Verify compilation**

Run: `npx tsc --noEmit 2>&1 | head -20`

- [ ] **Step 5: Commit**

```bash
git add src/app/api/chat/route.ts
git commit -m "feat: extend /api/chat with full visitor profile and narrative context"
```

---

## Task 11: Dynamic Reveal with Journey Summary

**Files:**
- Modify: `src/components/Reveal.tsx`
- Modify: `src/components/ConversationView.tsx`

- [ ] **Step 1: Add narrative prop and dynamic summary to Reveal**

In `src/components/Reveal.tsx`, update the props interface:

```typescript
interface RevealProps {
  profile: ExperimentProfile;
  visitedNodes: string[];
  visitOrder: string[];
  onShare: () => void;
  shareStatus: "idle" | "saving" | "copied" | "error";
  onNewJourney: () => void;
  narrative?: ProfileNarrative | null;
  visitorProfile?: VisitorProfile | null;
}
```

Add imports at the top:

```typescript
import type { ProfileNarrative } from "@/lib/visitor-profile";
import type { VisitorProfile } from "@/lib/visitor-profile";
```

- [ ] **Step 2: Add dynamic journey summary generation**

Inside the Reveal component, add state and effect for the dynamic summary:

```typescript
const [journeySummary, setJourneySummary] = useState<string | null>(null);

useEffect(() => {
  if (!narrative?.summary || !visitorProfile) return;

  fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [
        {
          role: "user",
          content: "Generate a personalized journey summary for this visitor.",
        },
      ],
      profile,
      visitorProfile,
      narrative,
      visitedNodes,
      wrapUp: true,
    }),
  })
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      if (data?.text) setJourneySummary(data.text);
    })
    .catch(() => {
      // Fall back to static reveal
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
```

- [ ] **Step 3: Display the dynamic summary in the Reveal UI**

In the Reveal JSX, after the header section and before the profile grid, add:

```tsx
{journeySummary && (
  <div className="rounded-xl bg-paper-light/50 p-6 shadow-inner">
    <p className="font-body text-base leading-relaxed text-ink">
      {journeySummary}
    </p>
  </div>
)}
```

- [ ] **Step 4: Pass narrative and visitorProfile from ConversationView to Reveal**

In ConversationView, update the Reveal rendering:

```tsx
<Reveal
  profile={profile}
  visitedNodes={Array.from(visitedNodes)}
  visitOrder={visitOrder}
  onShare={handleShare}
  shareStatus={shareStatus}
  onNewJourney={handleNewJourney}
  narrative={narrative}
  visitorProfile={visitorProfile}
/>
```

- [ ] **Step 5: Verify compilation**

Run: `npx tsc --noEmit 2>&1 | head -20`

- [ ] **Step 6: Commit**

```bash
git add src/components/Reveal.tsx src/components/ConversationView.tsx
git commit -m "feat: add dynamic journey summary to Reveal screen"
```

---

## Task 12: Extend Session Sharing with Full Profile Data

**Files:**
- Modify: `src/lib/session-store.ts`
- Modify: `src/app/api/sessions/route.ts`
- Modify: `src/components/ConversationView.tsx`

- [ ] **Step 1: Extend saveSession and loadSession**

In `src/lib/session-store.ts`, update the `saveSession` function signature and body to accept new fields:

```typescript
export async function saveSession(
  id: string,
  experimentNumber: number,
  profile: ExperimentProfile,
  visitedNodes: string[],
  visitorProfile?: unknown,
  narrative?: unknown,
  generatedContents?: Record<string, unknown>,
): Promise<void> {
```

Add the new fields to the Supabase insert:

```typescript
visitor_profile: visitorProfile ? JSON.stringify(visitorProfile) : null,
narrative: narrative ? JSON.stringify(narrative) : null,
generated_contents: generatedContents ? JSON.stringify(generatedContents) : null,
```

Update `loadSession` to parse and return the new fields:

```typescript
return {
  id: row.id,
  experimentNumber: row.experiment_number,
  profile: JSON.parse(row.profile),
  visitedNodes: JSON.parse(row.visited_nodes),
  createdAt: row.created_at,
  visitorProfile: row.visitor_profile ? JSON.parse(row.visitor_profile) : null,
  narrative: row.narrative ? JSON.parse(row.narrative) : null,
  generatedContents: row.generated_contents ? JSON.parse(row.generated_contents) : null,
};
```

- [ ] **Step 2: Update sessions API route**

In `src/app/api/sessions/route.ts`, update the POST handler to pass new fields:

```typescript
const { experimentNumber, profile, visitedNodes, visitorProfile, narrative, generatedContents } = body;
await saveSession(id, experimentNumber, profile, visitedNodes, visitorProfile, narrative, generatedContents);
```

- [ ] **Step 3: Update handleShare in ConversationView**

In the `handleShare` function, include the new fields:

```typescript
body: JSON.stringify({
  experimentNumber: profile.experimentNumber,
  profile,
  visitedNodes: Array.from(visitedNodes),
  visitorProfile,
  narrative,
  generatedContents: Object.fromEntries(contentCache.entries()),
}),
```

- [ ] **Step 4: Verify compilation**

Run: `npx tsc --noEmit 2>&1 | head -20`

- [ ] **Step 5: Commit**

```bash
git add src/lib/session-store.ts src/app/api/sessions/route.ts src/components/ConversationView.tsx
git commit -m "feat: extend session sharing with visitor profile, narrative, and generated contents"
```

---

## Task 13: Manual End-to-End Smoke Test

**Files:** None (testing only)

- [ ] **Step 1: Start the dev server**

Run: `npm run dev`

- [ ] **Step 2: Test the full flow**

1. Open `http://localhost:3000`
2. Complete the 5-question interview
3. Verify: Starter hooks appear (may take a few seconds for personalized labels)
4. Click a starter hook → verify Claude-generated content appears (not static text)
5. Check browser DevTools Network tab:
   - `/api/generate` called for the clicked node
   - `/api/profile` called async after the click
   - 3x `/api/generate` called for pre-generation of hook targets
6. Click a second hook → verify it loads faster (cache hit from pre-generation)
7. Type a free-form question → verify personalized response
8. Check that pre-gen cache was cleared after the chat interaction (next hook click should stream, not instant)
9. Visit 8+ nodes → verify Reveal screen shows dynamic journey summary
10. Click "Share" → verify the URL works and shows the same content

- [ ] **Step 3: Test fallback behavior**

1. Stop the dev server
2. Temporarily break `/api/generate` (add `throw new Error("test")` at the top)
3. Restart dev server
4. Complete interview → click a hook → verify static fallback content appears
5. Remove the deliberate error

- [ ] **Step 4: Commit any fixes discovered during testing**

```bash
git add -A
git commit -m "fix: address issues found during smoke testing"
```

---

## Task 14: Clean Up Legacy `/api/frame` Route

**Files:**
- Delete: `src/app/api/frame/route.ts`
- Modify: `src/lib/experiment-types.ts` (remove FrameRequest, FrameResponse if unused)

- [ ] **Step 1: Verify no remaining references to /api/frame**

Run: `grep -r "/api/frame" src/` — should only find the route file itself (and possibly this plan doc).

If there are still references in ConversationView or elsewhere, those need to be addressed first (they should have been removed in Task 6).

- [ ] **Step 2: Delete the frame route**

```bash
rm src/app/api/frame/route.ts
```

- [ ] **Step 3: Remove unused FrameRequest/FrameResponse types if no longer imported**

Run: `grep -r "FrameRequest\|FrameResponse" src/` — if nothing imports them, remove from `experiment-types.ts`.

- [ ] **Step 4: Verify build still passes**

Run: `npm run build 2>&1 | tail -20`

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove legacy /api/frame route (replaced by /api/generate)"
```
