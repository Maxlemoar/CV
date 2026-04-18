# Personalized Opening & Reveal — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace generic Opening subtitle and static Reveal explanations with Claude-generated, evidence-based personalized content via two new dedicated endpoints.

**Architecture:** Two new API routes (`/api/opening`, `/api/reveal`) with focused prompts. Opening generates a transition text + personalized hook selection after interview. Reveal generates a 4-section narrative analysis of the visitor's journey. Both replace existing code in ConversationView and their respective components.

**Tech Stack:** Next.js 16 App Router, Vercel AI SDK v6, Claude Sonnet 4.5, TypeScript, Zod

---

## File Structure

### New Files
| File | Responsibility |
|------|---------------|
| `src/app/api/opening/route.ts` | Personalized opening transition text + hook selection |
| `src/app/api/reveal/route.ts` | Evidence-based narrative journey analysis |

### Modified Files
| File | Changes |
|------|---------|
| `src/components/ConversationView.tsx` | Replace `personalizedStarters` effect with `/api/opening` call; pass new data to Opening and Reveal |
| `src/components/Opening.tsx` | Accept and display `transitionText`; remove static subtitle |
| `src/components/Reveal.tsx` | Replace static `REVEAL_EXPLANATIONS` + punchline with Claude-generated sections; remove `/api/chat` wrapUp call |

---

## Task 1: Opening API Endpoint (`/api/opening`)

**Files:**
- Create: `src/app/api/opening/route.ts`

- [ ] **Step 1: Create the opening endpoint**

```typescript
// src/app/api/opening/route.ts
import { generateText, Output } from "ai";
import { z } from "zod";
import { DIMENSION_LABELS } from "@/lib/experiment-types";
import type { SignalVector } from "@/lib/experiment-types";
import type { VisitorProfile, ProfileNarrative } from "@/lib/visitor-profile";
import { describeCandidates, describeSignals } from "@/lib/hook-router";
import { CONTENT_GRAPH } from "@/lib/content-graph";

export const maxDuration = 15;

const STARTER_POOL = [
  "school-gets-wrong",
  "startup-story",
  "why-anthropic",
  "building-with-claude",
  "what-schools-should-teach",
  "anthropic-education-vision",
  "psychology-of-learning",
  "side-projects",
  "what-id-build",
  "personal",
];

const requestSchema = z.object({
  profile: z.object({
    experimentNumber: z.number(),
    persuasion: z.enum(["results", "process", "character"]),
    learning: z.enum(["exploratory", "structured", "social"]),
    education: z.enum(["practice", "individualization", "inspiration"]),
    motivation: z.enum(["mastery", "purpose", "relatedness"]),
    sharing: z.enum(["surprise", "utility", "emotion"]),
  }),
  visitorProfile: z.any(),
  narrative: z.any(),
  signals: z.any().optional(),
});

const outputSchema = z.object({
  transitionText: z.string().describe("2-4 sentences bridging the interview answers to the content hooks. Warm, personal, shows Max listened."),
  hooks: z.array(z.object({
    nodeId: z.string(),
    label: z.string().describe("3-8 word personalized hook label"),
  })).min(3).max(4),
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

  const { profile, visitorProfile, narrative } = parsed.data;
  const vp = visitorProfile as VisitorProfile;
  const narr = narrative as ProfileNarrative;

  // Build candidate descriptions for starter pool nodes
  const starterDescriptions = STARTER_POOL
    .filter((id) => CONTENT_GRAPH[id])
    .map((id) => {
      const node = CONTENT_GRAPH[id];
      const topics = node.tags?.topics?.join(", ") ?? "";
      const tone = node.tags?.tone ?? "";
      const summary = node.tags?.summary ?? id.replace(/-/g, " ");
      return `- ${id} [topics: ${topics}; tone: ${tone}] ${summary}`;
    })
    .join("\n");

  const systemPrompt = `You are Max Marowsky. A visitor just completed your 5-question interview. Your job is to write a personalized transition that shows you listened, and to pick 4 starter hooks that match this visitor.

THE VISITOR'S INTERVIEW ANSWERS:
- What they look at first when evaluating a candidate: ${profile.persuasion} (${DIMENSION_LABELS.persuasion[profile.persuasion]})
- How they learn something new: ${profile.learning} (${DIMENSION_LABELS.learning[profile.learning]})
- What school should have done better: ${profile.education} (${DIMENSION_LABELS.education[profile.education]})
- What makes a good work day: ${profile.motivation} (${DIMENSION_LABELS.motivation[profile.motivation]})
- What makes them share something: ${profile.sharing} (${DIMENSION_LABELS.sharing[profile.sharing]})

INFERRED VISITOR PROFILE:
- Role: ${vp.inferredRole ?? "unknown yet"}
- Preferred depth: ${vp.preferredDepth}
- Preferred tone: ${vp.preferredTone}

VISITOR NARRATIVE:
${narr.summary || "Just completed interview — no behavior data yet."}

AVAILABLE STARTER NODES (pick exactly 4):
${starterDescriptions}

RULES FOR transitionText:
1. Write 2-4 sentences that reference the visitor's ACTUAL answers — not generic text.
2. Bridge naturally from what they said to what you'll show them.
3. Speak as Max, warmly and personally. Use "you" and "I".
4. Don't analyze or psychologize — just acknowledge what they shared and connect it to your story.
5. Don't mention "interview", "questions", or "answers" — make it feel like a natural conversation.
6. Write in English.

RULES FOR hooks:
1. Pick 4 nodes from AVAILABLE STARTER NODES that best match this visitor's profile.
2. For each, write a 3-8 word label that feels like a natural continuation of the transition text.
3. Labels should be in the visitor's voice — what THEY would want to click.
4. A results-oriented visitor gets outcome-focused labels. A character-oriented visitor gets story-focused labels.
5. The 4 hooks together should offer variety — don't pick 4 nodes about the same topic.`;

  try {
    const result = await generateText({
      model: "anthropic/claude-sonnet-4.5",
      output: Output.object({ schema: outputSchema }),
      prompt: systemPrompt,
    });

    // Validate hooks — only allow starter pool IDs
    const starterSet = new Set(STARTER_POOL);
    const validHooks = (result.output.hooks ?? []).filter(
      (h) => starterSet.has(h.nodeId) && h.label.trim().length > 0,
    );

    return Response.json({
      transitionText: result.output.transitionText,
      hooks: validHooks.slice(0, 4),
    });
  } catch {
    // Fallback: no transition text, empty hooks (caller will use defaults)
    return Response.json({
      transitionText: "",
      hooks: [],
    });
  }
}
```

- [ ] **Step 2: Verify the file compiles**

Run: `npx tsc --noEmit 2>&1 | head -20`

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/opening/route.ts
git commit -m "feat: add /api/opening endpoint for personalized post-interview transition"
```

---

## Task 2: Reveal API Endpoint (`/api/reveal`)

**Files:**
- Create: `src/app/api/reveal/route.ts`

- [ ] **Step 1: Create the reveal endpoint**

```typescript
// src/app/api/reveal/route.ts
import { generateText, Output } from "ai";
import { z } from "zod";
import { DIMENSION_LABELS } from "@/lib/experiment-types";
import { CONTENT_GRAPH } from "@/lib/content-graph";
import type { VisitorProfile, ProfileNarrative } from "@/lib/visitor-profile";

export const maxDuration = 30;

const requestSchema = z.object({
  profile: z.object({
    experimentNumber: z.number(),
    persuasion: z.enum(["results", "process", "character"]),
    learning: z.enum(["exploratory", "structured", "social"]),
    education: z.enum(["practice", "individualization", "inspiration"]),
    motivation: z.enum(["mastery", "purpose", "relatedness"]),
    sharing: z.enum(["surprise", "utility", "emotion"]),
  }),
  visitorProfile: z.any(),
  narrative: z.any(),
  visitedNodes: z.array(z.string()),
  visitOrder: z.array(z.string()),
  messages: z.array(z.object({
    role: z.string(),
    content: z.string(),
  })),
  blocks: z.array(z.object({
    id: z.string(),
    questionTitle: z.string(),
  })),
});

const outputSchema = z.object({
  sections: z.array(z.object({
    heading: z.string().describe("Section heading, e.g. 'What I observed'"),
    content: z.string().describe("3-5 sentences of Markdown content for this section"),
  })).min(3).max(5),
  profileInsight: z.string().describe("1 sentence describing this specific visitor, used as page header"),
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

  const { profile, visitorProfile, narrative, visitedNodes, visitOrder, messages, blocks } = parsed.data;
  const vp = visitorProfile as VisitorProfile;
  const narr = narrative as ProfileNarrative;

  // Build a summary of what the visitor did
  const visitedNodeSummaries = visitOrder
    .map((id) => {
      const node = CONTENT_GRAPH[id];
      return node?.tags?.summary ?? id.replace(/-/g, " ");
    })
    .map((s, i) => `${i + 1}. ${s}`)
    .join("\n");

  const chatQuestions = messages
    .filter((m) => m.role === "user")
    .map((m) => `- "${m.content}"`)
    .join("\n");

  const blockTitles = blocks
    .map((b) => b.questionTitle)
    .join(", ");

  const systemPrompt = `You are Max Marowsky, a psychologist turned EdTech product manager. A visitor has just completed their journey through your portfolio. Your job is to write a deeply personal, evidence-based analysis of what you observed about this visitor.

INTERVIEW ANSWERS (what the visitor told you about themselves):
- Evaluates candidates by: ${profile.persuasion} (${DIMENSION_LABELS.persuasion[profile.persuasion]})
- Learns by: ${profile.learning} (${DIMENSION_LABELS.learning[profile.learning]})
- Wishes school had: ${profile.education} (${DIMENSION_LABELS.education[profile.education]})
- Good work day means: ${profile.motivation} (${DIMENSION_LABELS.motivation[profile.motivation]})
- Shares things that are: ${profile.sharing} (${DIMENSION_LABELS.sharing[profile.sharing]})

INFERRED PROFILE (built from their behavior):
- Inferred role: ${vp.inferredRole ?? "couldn't determine"}
- Interests: ${Object.entries(vp.interests).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} (${v.toFixed(1)})`).join(", ") || "not enough data"}
- Preferred depth: ${vp.preferredDepth}
- Preferred tone: ${vp.preferredTone}
- Domain knowledge: ${Object.entries(vp.domainKnowledge).map(([k, v]) => `${k}: ${v}`).join(", ") || "unknown"}

BEHAVIORAL NARRATIVE:
${narr.summary || "Minimal interaction data."}
${narr.keyObservations.length > 0 ? "\nKey observations:\n" + narr.keyObservations.map((o) => `- ${o}`).join("\n") : ""}

VISIT PATH (in order):
${visitedNodeSummaries || "No nodes visited."}

QUESTIONS THE VISITOR ASKED:
${chatQuestions || "No free-form questions asked."}

CONTENT BLOCKS SEEN:
${blockTitles || "None."}

TOTAL INTERACTIONS: ${narr.interactionCount}

YOUR TASK: Write a 4-section analysis. Each section should be 3-5 sentences.

SECTION 1 — "What I observed"
Concrete behavioral observations. What did they click? What did they ask? What was the order? What patterns emerged? Reference SPECIFIC nodes they visited, questions they asked, choices they made. Every statement must be traceable to the data above.

SECTION 2 — "What I conclude from that"
Your hypotheses about this person. What kind of professional might they be? What do they care about? What surprised you? ALWAYS frame these as hypotheses: "My guess is...", "This suggests...", "I'm not certain, but...". If data is thin, say so: "You asked few questions, which makes it harder to read you. What I can say is..."

SECTION 3 — "How I adapted"
Be transparent about what your portfolio did differently. Which details were emphasized? What was de-emphasized? How did the tone shift? Reference specific content they saw and how it was shaped for them. This section demonstrates your product thinking.

SECTION 4 — "Why this matters"
Connect to your mission. Why do you build adaptive experiences? What does this have to do with Anthropic Education Labs? Keep it authentic and specific to what this visitor experienced — not a generic mission statement.

ALSO: Write a 1-sentence "profileInsight" — a concise, specific description of this visitor for the page header. Example: "Someone who values how things work over what they achieve, and who learns by doing." This replaces the generic "Here's what I learned about you."

CRITICAL RULES:
- ONLY reference things that actually happened. The visit path, the questions, the interview answers. Nothing else.
- Frame inferences as hypotheses, NEVER as facts.
- If data is sparse, say so. Uncertainty is a strength, not a weakness.
- Speak as Max in first person: "I noticed", "I adapted", "I want to build".
- Be specific. "You asked about team dynamics twice" is good. "You showed interest in collaboration" is too vague.
- Write in English.
- Each section 3-5 sentences. Not longer.`;

  try {
    const result = await generateText({
      model: "anthropic/claude-sonnet-4.5",
      output: Output.object({ schema: outputSchema }),
      prompt: systemPrompt,
    });

    return Response.json(result.output);
  } catch {
    // Return null — caller falls back to static content
    return Response.json(null, { status: 500 });
  }
}
```

- [ ] **Step 2: Verify the file compiles**

Run: `npx tsc --noEmit 2>&1 | head -20`

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/reveal/route.ts
git commit -m "feat: add /api/reveal endpoint for evidence-based journey analysis"
```

---

## Task 3: Update Opening Component

**Files:**
- Modify: `src/components/Opening.tsx`

- [ ] **Step 1: Update props interface to accept transition text**

Replace the `OpeningProps` interface (lines 8-13) with:

```typescript
interface OpeningProps {
  onHookClick: (targetId: string) => void;
  visible: boolean;
  starterHooks?: Hook[];
  personalizedStarters?: Array<{ targetId: string; label: string; teaser: string }> | null;
  transitionText?: string | null;
}
```

- [ ] **Step 2: Destructure the new prop and update subtitle**

Update the function signature (line 15) to include `transitionText`:

```typescript
export default function Opening({ onHookClick, visible, starterHooks, personalizedStarters, transitionText }: OpeningProps) {
```

Replace the static subtitle (lines 58-65, the "Get to know me. Just ask." paragraph) with:

```tsx
<motion.p
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3, delay: 0.7 }}
  className="mt-6 max-w-md mx-auto text-lg text-ink leading-relaxed"
>
  {transitionText || "Get to know me. Just ask."}
</motion.p>
```

- [ ] **Step 3: Verify compilation**

Run: `npx tsc --noEmit 2>&1 | head -20`

- [ ] **Step 4: Commit**

```bash
git add src/components/Opening.tsx
git commit -m "feat: Opening accepts transitionText, falls back to static subtitle"
```

---

## Task 4: Wire Opening Endpoint into ConversationView

**Files:**
- Modify: `src/components/ConversationView.tsx`

- [ ] **Step 1: Add transitionText state**

After the `personalizedStarters` state declaration (line 67-69), add:

```typescript
const [transitionText, setTransitionText] = useState<string | null>(null);
```

- [ ] **Step 2: Replace the personalizedStarters effect with /api/opening call**

Replace the entire "Generate personalized starter hook labels after interview" useEffect (lines 123-157) with:

```typescript
// Generate personalized opening (transition text + hooks) after interview
useEffect(() => {
  if (!visitorProfile || !narrative || personalizedStarters) return;

  fetch("/api/opening", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      profile,
      visitorProfile,
      narrative,
      signals,
    }),
  })
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      if (data?.transitionText) {
        setTransitionText(data.transitionText);
      }
      if (data?.hooks?.length > 0) {
        setPersonalizedStarters(
          data.hooks.map((h: { nodeId: string; label: string }) => ({
            targetId: h.nodeId,
            label: h.label,
            teaser: "",
          })),
        );
        // Pre-generate content for the selected hooks
        for (const hook of data.hooks) {
          if (contentCache.has(hook.nodeId)) continue;
          fetch("/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nodeId: hook.nodeId,
              profile: visitorProfile,
              narrative,
              signals,
              visitedNodes: [],
              visitOrder: [],
            }),
          })
            .then((res) => (res.ok ? res.json() : null))
            .then((genData: GeneratedContent | null) => {
              if (genData) contentCache.set(hook.nodeId, genData);
            })
            .catch(() => {});
        }
      } else {
        // Fallback: use scored starter hooks with static labels
        setPersonalizedStarters(
          starterHooks.map((h) => ({
            targetId: h.targetId,
            label: h.label,
            teaser: "",
          })),
        );
      }
    })
    .catch(() => {
      // Full fallback
      setPersonalizedStarters(
        starterHooks.map((h) => ({
          targetId: h.targetId,
          label: h.label,
          teaser: "",
        })),
      );
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [visitorProfile, narrative]);
```

- [ ] **Step 3: Pass transitionText to Opening**

Find the Opening render (line 489):
```tsx
<Opening visible={!hasStarted} onHookClick={addNodeBlock} starterHooks={starterHooks} personalizedStarters={personalizedStarters} />
```

Replace with:
```tsx
<Opening visible={!hasStarted} onHookClick={addNodeBlock} starterHooks={starterHooks} personalizedStarters={personalizedStarters} transitionText={transitionText} />
```

- [ ] **Step 4: Reset transitionText in handleNewJourney**

In the `handleNewJourney` function (after `setPersonalizedStarters(null);`), add:

```typescript
setTransitionText(null);
```

- [ ] **Step 5: Verify compilation**

Run: `npx tsc --noEmit 2>&1 | head -20`

- [ ] **Step 6: Commit**

```bash
git add src/components/ConversationView.tsx
git commit -m "feat: wire /api/opening into ConversationView, replacing personalizedStarters effect"
```

---

## Task 5: Rewrite Reveal Component

**Files:**
- Modify: `src/components/Reveal.tsx`

- [ ] **Step 1: Add reveal data types and state**

Add to the imports at the top:

```typescript
import type { ContentBlockData } from "@/lib/types";
```

Update the `RevealProps` interface to include messages and blocks:

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
  messages?: Array<{ role: string; content: string }>;
  blocks?: Array<{ id: string; questionTitle: string }>;
}
```

- [ ] **Step 2: Replace the journey summary state and effect with /api/reveal call**

Replace the existing `journeySummary` state and the `/api/chat` wrapUp useEffect (lines 69-104) with:

```typescript
const [revealData, setRevealData] = useState<{
  sections: Array<{ heading: string; content: string }>;
  profileInsight: string;
} | null>(null);
const [revealLoading, setRevealLoading] = useState(false);

useEffect(() => {
  if (!narrative || !visitorProfile) return;
  setRevealLoading(true);

  fetch("/api/reveal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      profile,
      visitorProfile,
      narrative,
      visitedNodes,
      visitOrder,
      messages: messages ?? [],
      blocks: blocks ?? [],
    }),
  })
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      if (data?.sections) setRevealData(data);
    })
    .catch(() => {
      // Fall back to static reveal
    })
    .finally(() => setRevealLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
```

- [ ] **Step 3: Update the header to use profileInsight**

Replace the header h2 text (line 132-134):

```tsx
<h2 className="font-serif text-2xl md:text-3xl text-neutral-900 dark:text-neutral-100">
  {revealData?.profileInsight || "Thank you. Here\u0027s what I learned about you."}
</h2>
```

- [ ] **Step 4: Replace the journey summary and REVEAL_EXPLANATIONS sections**

Remove the old `{journeySummary && ...}` block (lines 137-149).

Replace the "What I did with it" section (lines 220-240, the one using `REVEAL_EXPLANATIONS`) and the "Punchline" section (lines 242-258) with:

```tsx
{/* Personalized analysis sections */}
{revealLoading && (
  <motion.div
    className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 mb-6"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 1.0 }}
  >
    <div className="animate-pulse space-y-3">
      <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3" />
      <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-full" />
      <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-5/6" />
      <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-4/6" />
    </div>
  </motion.div>
)}
{revealData?.sections.map((section, i) => (
  <motion.div
    key={section.heading}
    className={`${
      i === revealData.sections.length - 1
        ? "bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-200 dark:border-orange-800"
        : "bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700"
    } p-6 mb-6`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 1.0 + i * 0.3 }}
  >
    <p className="text-xs tracking-[2px] text-neutral-400 mb-4 uppercase">
      {section.heading}
    </p>
    <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed whitespace-pre-line">
      {section.content}
    </p>
  </motion.div>
))}
{!revealData && !revealLoading && (
  <>
    {/* Static fallback: original REVEAL_EXPLANATIONS */}
    <motion.div
      className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.0 }}
    >
      <p className="text-xs tracking-[2px] text-neutral-400 mb-5 uppercase">
        What I did with it
      </p>
      <div className="space-y-4">
        {(["persuasion", "learning", "motivation", "sharing"] as const).map((dim) => (
          <div key={dim} className="flex gap-3">
            <span className="text-orange-500 flex-shrink-0 mt-0.5">&rarr;</span>
            <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
              {REVEAL_EXPLANATIONS[dim][profile[dim]]}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
    <motion.div
      className="bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-200 dark:border-orange-800 p-6 mb-8 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.4 }}
    >
      <p className="text-base text-neutral-600 dark:text-neutral-300 leading-relaxed">
        Every person who visits this site experiences a different version of me.
        <br />
        Yours was unique.
      </p>
      <p className="text-base text-neutral-900 dark:text-neutral-100 mt-4 italic">
        This is what I want to build at Anthropic — learning experiences that adapt to the
        person, not the other way around.
      </p>
    </motion.div>
  </>
)}
```

- [ ] **Step 5: Destructure new props**

Update the component function signature (line 65) to destructure `messages` and `blocks`:

```typescript
export default function Reveal({ profile, visitedNodes, visitOrder, onShare, shareStatus, onNewJourney, narrative, visitorProfile, messages, blocks }: RevealProps) {
```

- [ ] **Step 6: Verify compilation**

Run: `npx tsc --noEmit 2>&1 | head -20`

- [ ] **Step 7: Commit**

```bash
git add src/components/Reveal.tsx
git commit -m "feat: rewrite Reveal with Claude-generated evidence-based analysis sections"
```

---

## Task 6: Pass Messages and Blocks to Reveal from ConversationView

**Files:**
- Modify: `src/components/ConversationView.tsx`

- [ ] **Step 1: Update Reveal rendering to pass messages and blocks**

Find the Reveal rendering (lines 465-474) and replace with:

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
  messages={messages}
  blocks={blocks.map((b) => ({ id: b.id, questionTitle: b.questionTitle }))}
/>
```

- [ ] **Step 2: Verify compilation**

Run: `npx tsc --noEmit 2>&1 | head -20`

- [ ] **Step 3: Verify build**

Run: `npm run build 2>&1 | tail -20`

Expected: Build succeeds with `/api/opening` and `/api/reveal` in the route list.

- [ ] **Step 4: Commit**

```bash
git add src/components/ConversationView.tsx
git commit -m "feat: pass messages and blocks to Reveal for journey analysis context"
```

---

## Task 7: Manual Smoke Test

**Files:** None (testing only)

- [ ] **Step 1: Start the dev server**

Run: `npm run dev`

- [ ] **Step 2: Test Opening personalization**

1. Open `http://localhost:3000`
2. Complete the 5-question interview
3. Verify: Opening screen shows personalized transition text (not "Get to know me. Just ask.")
4. Verify: Hook labels are personalized and feel like a continuation of the transition text
5. Check Network tab: `/api/opening` called once, followed by `/api/generate` pre-generation calls

- [ ] **Step 3: Test Reveal personalization**

1. Visit 8+ content nodes
2. Click "See result" on the AnalyseBar
3. Verify: Header shows a personalized `profileInsight` sentence
4. Verify: 4 Claude-generated sections appear (What I observed / What I conclude / How I adapted / Why this matters)
5. Verify: Sections reference actual visited nodes and questions asked
6. Verify: Last section has orange background styling
7. Check Network tab: `/api/reveal` called once

- [ ] **Step 4: Test fallback behavior**

1. Temporarily break `/api/opening` (add `throw new Error("test")` at top)
2. Complete interview → verify static "Get to know me. Just ask." appears with default hooks
3. Similarly break `/api/reveal` → verify static REVEAL_EXPLANATIONS appear
4. Remove deliberate errors

- [ ] **Step 5: Commit any fixes**

```bash
git add -A
git commit -m "fix: address issues found during smoke testing"
```
