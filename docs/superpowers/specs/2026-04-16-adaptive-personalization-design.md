# Adaptive Personalization Engine — Design Spec

## Overview

Transform the CV portfolio from a static content site with light personalization into a fully adaptive experience where every text is generated live by Claude, tailored to each visitor's inferred profile. The profile sharpens continuously through behavioral signals and chat interactions.

## Core Principles

1. **Every text is live-generated** — `content-graph.ts` becomes a structured fact base, not the final display layer
2. **No explicit role question** — Claude infers visitor type from behavior (clicks, questions, reading patterns)
3. **Dual profile system** — structured vector for deterministic routing + natural-language narrative for Claude's text generation
4. **Pre-generation + streaming fallback** — optimal UX through background generation of likely next nodes
5. **Reference texts as ground truth** — existing content texts remain as Claude's fact source to prevent hallucination

## Architecture: Specialized Pipeline

Three decoupled services replace the current `/api/frame` endpoint:

```
Visitor clicks hook
       |
       +---> POST /api/generate     (generate personalized content text)
       +---> POST /api/profile      (async profile update)
       +---> POST /api/generate x3  (pre-generate top-3 next nodes, background)
```

`/api/chat` remains for free-form questions, extended with full profile context.

---

## 1. Visitor Profile System

### Data Structure

The profile consists of three layers:

#### Layer 1: Structured Visitor Profile (Claude-inferred, updated after every interaction)

```typescript
interface VisitorProfile {
  // From interview (existing, unchanged)
  persuasion: "results" | "process" | "character"
  learning: "exploratory" | "structured" | "social"
  education: "practice" | "individualization" | "inspiration"
  motivation: "mastery" | "purpose" | "relatedness"
  sharing: "surprise" | "utility" | "emotion"

  // New: inferred by Claude, updated after every interaction
  inferredRole: string | null
  interests: Record<string, number>
  preferredDepth: "surface" | "moderate" | "deep"
  preferredTone: "analytical" | "narrative" | "conversational" | "formal"
  domainKnowledge: Record<string, "novice" | "familiar" | "expert">
}
```

- `inferredRole`: Free-text role inference, e.g. "engineering manager", "recruiter", "student". Starts null, sharpens over time.
- `interests`: Open-ended interest tags with weights (0-1), e.g. `{"technical-architecture": 0.8, "team-dynamics": 0.6}`. Not a fixed enum — Claude adds tags as they emerge.
- `preferredDepth`: How much detail the visitor seems to want. Inferred from question specificity and reading behavior.
- `preferredTone`: Communication style preference. Inferred from how the visitor phrases questions.
- `domainKnowledge`: Per-domain expertise level. Prevents over-explaining basics to experts and under-explaining to novices.

#### Layer 2: Signal Vector (existing, unchanged)

The existing `SignalVector` with persuasion, motivation, and topic dimensions. Continues to be nudged by clicks via `applyClickToSignals`. Used for deterministic hook scoring in `hook-router.ts`.

#### Layer 3: Natural-Language Narrative (new)

```typescript
interface ProfileNarrative {
  summary: string          // 3-5 sentences, grows with each interaction
  keyObservations: string[] // e.g. ["Asks repeatedly about team size — likely HM"]
  interactionCount: number
  lastUpdated: string
}
```

The narrative is the richest signal for Claude's text generation. It captures nuances that no structured schema can express.

### Profile Update Mechanics

After **every** interaction (hook click, chat question, chat answer read), an async call to `/api/profile` runs:

1. Claude receives: current profile + current narrative + the new interaction + visited nodes
2. Claude returns: updated structured profile + updated narrative
3. Profile is updated in ExperimentContext
4. Next content generation uses the new profile

The update does NOT block the UX. The visitor continues reading; the profile updates in the background. The next interaction benefits from the updated profile.

---

## 2. Content Generation Pipeline

### `/api/generate` — Content Generator

**Input:**
```typescript
{
  nodeId: string
  referenceText: string         // existing content from content-graph
  profile: VisitorProfile
  narrative: ProfileNarrative
  visitedNodes: string[]
  visitOrder: string[]
  previousNodeId?: string
}
```

**What Claude does:**
- Rewrites the reference text completely — adapted to the visitor's profile
- Chooses the right emphasis (e.g. technical details for engineers, strategy and impact for HMs)
- Adapts tonality to `preferredTone`
- Adapts detail level to `preferredDepth`
- Builds narrative bridges to previously visited nodes ("As you saw in [previous topic]...")
- Adapts language complexity to `domainKnowledge` (no explaining basics to experts)

**Output:**
```typescript
{
  title: string
  content: string                // rewritten text (Markdown)
  hooks: Array<{
    nodeId: string
    label: string                // individualized label
    teaser: string               // 1 sentence why this is relevant for THIS visitor
  }>
}
```

**Prompt constraints:**
- No inventing new facts — only reshape the reference text
- All core facts (numbers, names, dates) must be preserved
- Max 20% longer or shorter than reference text

### `/api/profile` — Profile Updater (async)

**Input:**
```typescript
{
  currentProfile: VisitorProfile
  currentNarrative: ProfileNarrative
  newInteraction: {
    type: "interview_complete" | "hook_click" | "chat_question" | "chat_answer_read"
    nodeId?: string
    question?: string
    answer?: string
    interviewAnswers?: ExperimentProfile
  }
  visitedNodes: string[]
}
```

**What Claude does:**
- Analyzes the new interaction in context of the existing profile
- Updates `inferredRole`, `interests`, `preferredDepth`, `preferredTone`, `domainKnowledge`
- Extends the narrative with new observations
- Returns a complete updated profile

**Output:**
```typescript
{
  profile: VisitorProfile
  narrative: ProfileNarrative
}
```

### `/api/chat` — Extended

Remains for free-form questions. Changes:

1. Receives full `visitorProfile` + `narrative` + `visitedNodes` in addition to messages
2. Answers are personalized to the same degree as content nodes
3. After every chat interaction, `/api/profile` is called async with both the question and the answer

---

## 3. Pre-Generation & Caching

### Pre-Generation Flow

When a node is rendered:

1. The 3 displayed hooks are known
2. For all 3, `/api/generate` is called in parallel (background)
3. Results are stored in a client-side cache (`Map<nodeId, GeneratedContent>`)
4. Visitor clicks a hook -> cache hit -> instant display
5. Cache miss (e.g. free question leads to new topic) -> streaming fallback

### Cache Strategy

- **Key:** `nodeId` (a node is only visited once per journey)
- **Invalidation:** After a chat interaction, the entire cache is cleared. Reason: a free question can significantly change the profile (e.g. "I'm a CTO looking for a Senior PM" -> completely different tone). Pre-generated texts based on the old profile would feel wrong.
- **Size:** Realistically 3-6 entries at any time (the currently displayed hooks)
- **Storage:** Client-side only (React `useRef` or Context state), no persistence needed

### Streaming Fallback

When no pre-generated content is available:
- The `/api/generate` response is streamed word-by-word
- The visitor sees the text building up in real-time, like a chat response
- This is the default experience for the first node (no pre-generation possible yet)

---

## 4. Client Architecture & State Management

### Extended ExperimentContext

```typescript
interface ExperimentState {
  // Existing
  profile: ExperimentProfile | null
  signals: SignalVector

  // New
  visitorProfile: VisitorProfile | null
  narrative: ProfileNarrative | null
  contentCache: Map<string, GeneratedContent>
  isProfileUpdating: boolean
}
```

### Interaction Lifecycle

```
1. Visitor clicks hook "startup-story"
   |
2. contentCache.has("startup-story")?
   |-- YES -> Render immediately, no streaming
   |-- NO  -> Streaming request to /api/generate
   |
3. In parallel (non-blocking):
   |  a) POST /api/profile { type: "hook_click", nodeId: "startup-story" }
   |     -> Response updates visitorProfile + narrative in Context
   |  b) recordClick("startup-story") -> nudge signal vector (as before)
   |
4. Node rendered, 3 hooks visible
   |
5. Pre-generation (non-blocking):
      POST /api/generate x3 (one per hook)
      -> Results stored in contentCache
```

### Chat Interaction Lifecycle

```
1. Visitor types question
   |
2. POST /api/chat { messages, visitorProfile, narrative, visitedNodes }
   -> Streaming response
   |
3. Response complete
   |
4. Async: POST /api/profile { type: "chat_question", question, answer }
   -> Profile update
   |
5. Clear contentCache (profile may have changed significantly)
   -> Next hook clicks generate fresh against new profile
```

---

## 5. Fallback Cascade

Graceful degradation — no state where the visitor sees an empty page:

| Priority | Condition | Behavior |
|----------|-----------|----------|
| 1 | `/api/generate` available + cache hit | Instant personalized text |
| 2 | `/api/generate` available + cache miss | Streaming personalized text |
| 3 | `/api/generate` down | Static reference text from content-graph |
| 4 | `/api/profile` down | Continue with last known profile |
| 5 | Everything down | Today's behavior (static + deterministic routing) |

---

## 6. Impact on Existing Features

### Interview — Minimal Changes

The 5 interview questions remain unchanged. After interview completion, an initial `/api/profile` call is made with `type: "interview_complete"` to generate the first `visitorProfile` + `narrative` from the 5 answers.

### Starter Hooks — Personalized Labels

The 4 `ROOT_HOOKS` are still the entry points, but their labels and teasers are now generated by `/api/generate`. While the interview completion animation plays, the 4 hooks are generated in parallel in the background.

Example: Instead of fixed "The startup I built and sold":
- Purpose-motivated visitor: "How two psychologists reached 150k teachers"
- Technically-inferred visitor: "From 0 to 1.5M ARR — the architecture behind it"

Note: Starter hooks use a lightweight variant of `/api/generate` — only label + teaser per hook, not full content. This keeps the initial load fast (4 small calls vs. 4 full content generations). Full content is pre-generated only after the visitor sees the hooks.

### Reveal — Dynamic Journey Summary

Reveal receives the full `narrative` + `visitorProfile`. Claude generates a personalized journey summary that explains:
- What the visitor seemed most interested in
- How the experience adapted to them
- What Max learned about the visitor's perspective

This makes the personalization transparent and serves as a demonstration of product thinking for the Anthropic application.

### Session Sharing — Extended Payload

Sessions store additional data:

```typescript
{
  // Existing
  experiment_number: number
  profile: ExperimentProfile
  visited_nodes: string[]

  // New
  visitor_profile: VisitorProfile
  narrative: ProfileNarrative
  generated_contents: Record<string, GeneratedContent>
}
```

Generated texts are stored because shared sessions should show the same personalized journey, not a newly generated one.

### Unchanged

- Gem mechanics (unlock conditions remain node-based)
- Easter eggs (remain behavior-triggered)
- `/cv` route (static document, no personalization)
- Experiment number system
- Interview UI

---

## 7. API Cost & Performance Considerations

Costs are explicitly not a constraint. The system prioritizes maximum personalization quality.

**Expected API calls per node visit:**
- 1x `/api/generate` (content, or cache hit)
- 1x `/api/profile` (async update)
- 3x `/api/generate` (pre-generation, background)
- Total: ~5 Claude calls per node visit

**Expected API calls per chat interaction:**
- 1x `/api/chat` (streaming response)
- 1x `/api/profile` (async update)
- Total: ~2 Claude calls per chat message

**Latency targets:**
- Pre-generated content: < 100ms (cache hit)
- Streaming first token: < 500ms
- Profile update: irrelevant (async, non-blocking)

---

## 8. Data Flow Summary

```
Interview (5 questions)
  -> ExperimentProfile (seed)
  -> POST /api/profile { type: "interview_complete" }
  -> Initial VisitorProfile + ProfileNarrative

Main Loop:
  Visitor clicks hook OR asks question
    -> Content: /api/generate (or cache) -> render personalized text
    -> Profile: /api/profile (async) -> update VisitorProfile + narrative
    -> Signals: recordClick() -> nudge SignalVector (deterministic)
    -> Pre-gen: /api/generate x3 (background) -> fill cache
    -> Gems: check isNodeUnlocked() (unchanged)

  After chat interaction:
    -> Clear content cache (profile may have shifted)

  When visitedNodes >= threshold:
    -> Reveal: Claude generates personalized journey summary
    -> Share: save full state including generated texts
```
