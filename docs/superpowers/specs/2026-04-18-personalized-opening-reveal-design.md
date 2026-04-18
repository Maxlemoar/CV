# Personalized Opening & Reveal — Design Spec

## Overview

Elevate two key moments of the visitor journey:
1. **Opening Screen** — replace the generic "Get to know me. Just ask." with a Claude-generated transition that references the visitor's interview answers and leads naturally into personalized starter hooks.
2. **Reveal Screen** — replace static `REVEAL_EXPLANATIONS` and fixed punchline with a fully Claude-generated, evidence-based narrative analysis of the visitor's journey.

## Core Principles

- **Evidence-based only** — every claim must reference observable behavior (clicks, questions, interview answers). No invented facts.
- **Hypotheses, not assertions** — inferences are explicitly marked as hypotheses. Uncertainty is verbalized, not hidden.
- **Scientific tone** — "I observed..." / "My hypothesis is..." / "I'm not certain, but..." — reflecting Max's psychology background.
- **Max speaks in first person** — "I noticed", not "The system detected".
- **English throughout** — consistent with the rest of the site.

---

## 1. Personalized Opening Screen

### New Endpoint: `POST /api/opening`

**Input:**
```typescript
{
  profile: ExperimentProfile       // 5 interview answers + experimentNumber
  visitorProfile: VisitorProfile   // initial inferred profile (after interview_complete)
  narrative: ProfileNarrative      // initial narrative
  signals: SignalVector
}
```

**What Claude generates — a cohesive unit:**

1. **Transition text** (2-4 sentences): References the visitor's actual interview answers and bridges into the hooks. Warm, personal, not analytical. Shows the visitor that Max listened.

   Example for a visitor who chose "process" + "individualization" + "mastery":
   > "You want to understand how someone thinks — not just what they've achieved. And you know from experience that education improves when it adapts to the individual. Let me show you how exactly that became my path."

2. **4 starter hooks** (nodeId + personalized label): Selection AND wording based on the profile. Claude chooses from the STARTER_POOL and formulates labels that feel like a natural continuation of the transition text.

**Output:**
```typescript
{
  transitionText: string
  hooks: Array<{
    nodeId: string
    label: string            // 3-8 words, personalized
  }>
}
```

**Prompt constraints:**
- Transition text MUST reference the actual interview answers — not be generic
- No facts about Max — the text only describes the observation of the visitor and bridges to content
- Hooks must come from STARTER_POOL (provided in prompt)
- Max 4 hooks, labels 3-8 words
- Write in English

### Opening Screen Changes

- The subtitle "Get to know me. Just ask." is replaced by `transitionText`
- Hook buttons show the personalized labels from the `/api/opening` response
- While the call is in flight (during interview completion animation), show a subtle loading state or skeleton text
- Fallback if call fails: today's behavior (static text + `pickStarterHooks` labels)

### Timing

The `/api/opening` call fires as soon as `setProfile()` is called — before the Opening screen is visible. The visitor sees the interview completion animation (~800ms), during which the call runs. In most cases the response arrives before the Opening screen fades in.

The response also pre-seeds the content cache: the 4 hooks' full content can be pre-generated after the Opening response arrives (same as current `personalizedStarters` effect, but now the opening call handles hook selection).

---

## 2. Fully Personalized Reveal

### New Endpoint: `POST /api/reveal`

**Input:**
```typescript
{
  profile: ExperimentProfile
  visitorProfile: VisitorProfile
  narrative: ProfileNarrative
  visitedNodes: string[]
  visitOrder: string[]
  messages: Array<{ role: string; content: string }>
  blocks: Array<{ id: string; questionTitle: string }>
}
```

**What Claude generates — a narrative analysis in 4 sections:**

**Section 1: "What I observed"** (3-5 sentences)
Concrete behavioral observations. What did the visitor click, ask, in what order? What was notable?

> "You started with the startup story — but you didn't ask about the numbers, you asked about the architecture. Then you asked about team dynamics twice, even though you initially said you value results most."

**Section 2: "What I conclude from that"** (3-5 sentences)
Hypotheses — explicitly framed as such. What can be inferred about the visitor? Uncertainty is verbalized.

> "My hypothesis: you're someone who sees results as table stakes — but what you really want to know is how those results came about. The interest in team dynamics suggests you lead or have led teams yourself — but that's a hypothesis, not a certainty."

**Section 3: "How I adapted"** (3-5 sentences)
Transparency about the personalization. What did Max's portfolio do differently based on these observations?

> "That's why I showed you the technical decisions at eduki in more detail than the business metrics. And when you asked about the team, I told you the co-founder story instead of the investor pitch version."

**Section 4: "Why this matters"** (2-3 sentences)
Connection to Max's mission. Why does he build adaptive experiences? What does this say about his fit for Anthropic Education Labs?

> "This is exactly what I want to build at Anthropic: learning experiences that listen and adapt. Not because technology should impress — but because every person learns differently. Your journey here was the prototype."

**Output:**
```typescript
{
  sections: Array<{
    heading: string        // e.g. "What I observed"
    content: string        // Markdown, 3-5 sentences
  }>
  profileInsight: string   // 1 sentence describing this visitor (used as header)
}
```

**Prompt constraints:**
- **Only reference observable facts.** Which nodes visited, which questions asked, which interview answers given, in what order. No inventions.
- **Mark hypotheses as hypotheses.** "My guess:", "This suggests:", "I'm not sure, but..."
- **Uncertainty is a strength.** If the profile is thin (few interactions), Claude should say so: "You asked few questions — that makes it harder to read you. What I can say is..."
- **No generic statements.** Every sentence must refer to something concrete this specific visitor did.
- **Max speaks in first person.** "I observed", "I adapted", "I want to build".
- **Each section 3-5 sentences.** Not longer — this is a reveal, not an essay.

### Reveal Screen Changes

**What stays:**
- Header with experiment number (clickable for Comparison modal)
- Session data tiles (Topics explored, Experiment #, Unique path, Eggs found)
- Profile dimension grid (5 dimensions with visitor's values)
- CTAs (Share, Invite Max)
- Visual structure (tiles, grid, animations, staggered reveals)
- Egg counter

**What changes:**
- **Header text**: "Thank you. Here's what I learned about you." → replaced by `profileInsight` (Claude-generated 1-sentence description of this visitor)
- **Journey summary**: The current `/api/chat` wrapUp call is removed — the `/api/reveal` response replaces it entirely
- **REVEAL_EXPLANATIONS sections**: The 4 static dimension explanations are replaced by the 4 Claude-generated sections (What I observed / What I conclude / How I adapted / Why this matters)
- **Punchline box**: The fixed "Every person experiences a different version of me" text is removed — Claude's "Why this matters" section serves this purpose with more authenticity

### Fallback

If `/api/reveal` fails: today's behavior — static `REVEAL_EXPLANATIONS` + fixed punchline text. The screen is never empty.

---

## 3. What Gets Removed

| Component | Reason |
|-----------|--------|
| Static `REVEAL_EXPLANATIONS` constant in Reveal.tsx | Replaced by Claude-generated sections |
| Fixed punchline text in Reveal.tsx | Replaced by "Why this matters" section |
| `/api/chat` wrapUp call in Reveal | Replaced by `/api/reveal` |
| `personalizedStarters` effect in ConversationView | Replaced by `/api/opening` call |
| Static "Get to know me. Just ask." in Opening | Replaced by `transitionText` |

---

## 4. Data Flow

### Opening Flow
```
Interview completes
  → setProfile(p)
  → POST /api/opening { profile, visitorProfile, narrative, signals }
     (fires immediately, runs during interview exit animation)
  → Response: { transitionText, hooks: [{nodeId, label}] }
  → Opening screen renders with transitionText + personalized hooks
  → Pre-generate content for 4 hooks via /api/generate (background)
```

### Reveal Flow
```
visitedNodes >= 8 → AnalyseBar shows "See result"
  → User clicks
  → POST /api/reveal { profile, visitorProfile, narrative, visitedNodes,
                        visitOrder, messages, blocks }
  → Response: { sections: [{heading, content}], profileInsight }
  → Reveal screen renders with:
     - profileInsight as header
     - Session data tiles (unchanged)
     - Profile dimension grid (unchanged)
     - 4 Claude-generated sections (animated, staggered)
     - CTAs (unchanged)
```

---

## 5. API Cost & Performance

**Opening:**
- 1x `/api/opening` call (replaces the current 4x `/api/generate` calls for personalizedStarters)
- Net effect: fewer API calls than today, faster because one call instead of four
- Latency target: < 3s (runs during interview exit animation)

**Reveal:**
- 1x `/api/reveal` call (replaces the current 1x `/api/chat` wrapUp call)
- Net effect: same number of calls, but richer prompt → slightly longer response time
- Latency target: < 5s (acceptable — user just clicked "See result" and expects a reveal)
- Show loading state while generating

---

## 6. Unchanged

- Interview questions and flow
- Main conversation loop (addNodeBlock, submitFreeQuestion, /api/generate, /api/profile)
- Gem mechanics and easter eggs
- `/cv` route
- Session sharing
- Content cache and pre-generation logic (except: hook pre-gen now triggered by /api/opening response instead of personalizedStarters effect)
