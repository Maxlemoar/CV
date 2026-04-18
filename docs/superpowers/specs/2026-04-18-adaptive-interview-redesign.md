# Adaptive Interview Redesign — Smart 3 + Behavioral

**Date:** 2026-04-18
**Status:** Approved
**Approach:** C — 3 explicit questions + behavioral profiling layer

## Problem

The current 5-question interview has structural issues:
- **Sharing (Q5)** is collected but never used downstream — zero personalization impact
- **Education (Q3)** only lightly seeds topic affinities — low ROI for the friction it costs
- **Learning (Q2)** is moderately used but inferable from behavior
- **No role detection** — the most impactful personalization dimension (recruiter vs. engineer vs. PM) is never captured
- The visitor enters via a job application form with no URL customization possible — all profiling must happen on-site

Research confirms: 3 adaptive forced-choice questions outperform 5-7 fixed questions when each has high discrimination power. First clicks are 85% predictive of primary intent.

## Design

### Section 1: The New Question Set

3 questions, each serving 2-3 downstream dimensions.

#### Q1: Role + Persuasion
> "Wenn du einen Kandidaten in 30 Sekunden bewerten müsstest — was schaust du dir zuerst an?"

| Answer | `persuasion` | Role Inference | Content Effect |
|--------|-------------|----------------|----------------|
| "Was er erreicht hat" | `results` | Engineer / PM | Numbers, outcomes, projects first |
| "Wie er denkt und Probleme löst" | `process` | PM / Technical HM | Frameworks, decision logic |
| "Wer er ist — Energie, Werte, Fit" | `character` | Recruiter / People HM | Stories, personality, culture fit |

#### Q2: Motivation + Depth + Tone
> "Was macht einen richtig guten Arbeitstag — was muss passiert sein?"

| Answer | `motivation` | Depth Default | Tone Default |
|--------|-------------|---------------|-------------|
| "Ich hab ein schwieriges Problem gelöst" | `mastery` | `deep` | `analytical` |
| "Ich hab etwas bewegt, das echten Impact hat" | `purpose` | `moderate` | `narrative` |
| "Ich hatte gute Gespräche mit klugen Leuten" | `relatedness` | `moderate` | `conversational` |

#### Q3: Content Interest (NEW)
> "Was interessiert dich am meisten an einem Kandidaten wie mir?"

| Answer | `contentInterest` | Topic Seeding | Section Priority |
|--------|-------------------|--------------|-----------------|
| "Was du fachlich drauf hast — Projekte, Tech, Ergebnisse" | `technical` | product, startup, ai high | Projects & Skills first |
| "Wie du denkst — Vision, Philosophie, Überzeugungen" | `vision` | education, vision, anthropic high | Philosophy & Why Anthropic first |
| "Dein Weg — Geschichte, Stationen, Entscheidungen" | `journey` | personal, startup, education high | Experience Timeline & Story first |

#### Removed Dimensions
- **Learning** — inferred from behavior (click tempo, chat usage, path linearity)
- **Education** — topic seeding replaced by contentInterest
- **Sharing** — was never used downstream

#### New Profile Structure

```typescript
interface ExperimentProfile {
  persuasion: 'results' | 'process' | 'character';
  motivation: 'mastery' | 'purpose' | 'relatedness';
  contentInterest: 'technical' | 'vision' | 'journey';
  experimentNumber: number;
}
```

### Section 2: Downstream Integration

#### Signal Vector Seeding

```
persuasion[chosen] = 1.0
motivation[chosen] = 1.0
topics = CONTENT_INTEREST_AFFINITY[contentInterest]
```

Learning is no longer seeded — filled only through click nudges.

#### Content-Interest Topic Affinity

| `contentInterest` | product | startup | ai | anthropic | education | vision | personal | psychology |
|---|---|---|---|---|---|---|---|---|
| `technical` | 1.0 | 0.8 | 1.0 | 0.5 | 0.3 | 0.2 | 0.2 | 0.2 |
| `vision` | 0.3 | 0.3 | 0.7 | 1.0 | 1.0 | 1.0 | 0.3 | 0.7 |
| `journey` | 0.5 | 1.0 | 0.3 | 0.5 | 0.5 | 0.3 | 1.0 | 0.7 |

#### Node Scoring — Tone Bonus (replaces Learning-based bonus)

| `contentInterest` | Bonus on Node Tone |
|---|---|
| `technical` | `data` +0.5, `reflection` +0.3 |
| `vision` | `vision` +0.5, `reflection` +0.4 |
| `journey` | `story` +0.5, `vision` +0.3 |

#### Chat Guidance (replaces LEARNING_GUIDANCE)

```typescript
const CONTENT_INTEREST_GUIDANCE = {
  technical: "Focus on concrete projects, technical decisions, measurable outcomes. Show code-level thinking and system design.",
  vision: "Focus on philosophy, beliefs about education and AI, why Anthropic. Show depth of thinking and conviction.",
  journey: "Focus on the narrative arc — transitions, decisions, lessons learned. Show growth and pattern recognition.",
};
```

PERSUASION_GUIDANCE and MOTIVATION_GUIDANCE remain unchanged.

#### Visitor Profile Initialization

From `motivation`:
| `motivation` | → `preferredDepth` | → `preferredTone` |
|---|---|---|
| `mastery` | `deep` | `analytical` |
| `purpose` | `moderate` | `narrative` |
| `relatedness` | `moderate` | `conversational` |

From `persuasion` → initial `inferredRole`:
| `persuasion` | → `inferredRole` |
|---|---|
| `results` | `"technical evaluator"` |
| `process` | `"product/strategy evaluator"` |
| `character` | `"culture/people evaluator"` |

Claude refines `inferredRole` via `/api/profile` after each interaction.

#### Opening Hook Selection

`pickStarterHooks()` uses the full signal vector — works automatically with new topic affinities and tone bonuses. No algorithm change needed.

#### Reveal

Reduced from 5 dimensions to 3: Persuasion, Motivation, Content Interest.

### Section 3: Behavioral Layer

#### Learning-Style Inference (replaces interview question)

| Signal | Measurement | Inference |
|--------|-------------|-----------|
| First click | Which of 4 opening hooks chosen first? | `exploratory`: unexpected/non-obvious hook |
| Click tempo | Time between content load and next click | `exploratory`: <15s, `structured`: >30s |
| Chat usage | Does user ask free questions? | `social`: yes → conversational learner |
| Path linearity | Follows hook recommendations or jumps? | `structured`: follows, `exploratory`: deviates |

**No new tracking needed.** Uses existing data: `visitedNodes[]` with timestamps, chat message count, first hook click.

#### Self-Correction

When behavior consistently diverges from stated preferences after 4+ clicks, behavioral inference overrides interview defaults. This happens through two existing mechanisms:

1. **Signal vector click nudges** — shift topic weightings automatically
2. **`/api/profile` Claude inference** — updates VisitorProfile

The `/api/profile` prompt is extended with behavioral signals:

```
Behavioral signals this session:
- Nodes visited: [list with timestamps]
- Avg time between clicks: Xs
- Chat questions asked: N
- Content interest (stated): technical
- Actual click pattern: 3/5 nodes are philosophy/vision topics
→ Consider whether stated preferences match observed behavior.
   Update inferredRole, preferredDepth, preferredTone accordingly.
```

#### What We Explicitly Don't Build

- No scroll tracking — complex, low signal, privacy concerns
- No dwell-time tracking per section — disproportionate effort
- No return-visit recognition — edge case for this audience
- No mouse tracking or heatmaps — creepy, misaligned with Anthropic values

## Files to Change

| File | Change |
|------|--------|
| `src/lib/experiment-types.ts` | 3 questions, new `ExperimentProfile` type |
| `src/components/Interview.tsx` | Render 3 questions instead of 5 |
| `src/lib/hook-router.ts` | New topic seeding (`CONTENT_INTEREST_AFFINITY`), new tone bonus, remove learning seeding |
| `src/lib/visitor-profile.ts` | New defaults from motivation + contentInterest, role from persuasion |
| `src/app/api/profile/route.ts` | Extended prompt with behavioral signals |
| `src/app/api/chat/route.ts` | `CONTENT_INTEREST_GUIDANCE` replaces `LEARNING_GUIDANCE` |
| `src/app/api/opening/route.ts` | Profile context updated to 3 dimensions |
| `src/app/api/reveal/route.ts` | 3 dimensions instead of 5 |
| `src/components/Reveal.tsx` | Display 3 dimensions instead of 5 |

## What Does NOT Change

- Signal vector bucket structure (stays, seeded differently)
- Click-nudge mechanics (CLICK_NUDGE = 0.25, SIGNAL_CAP = 2.0)
- ContentCache and pre-generation
- `/api/generate` prompt structure (gets new dimension labels)
- Supabase session schema (profile is JSON, flexible)
- Content graph node tags (persuasion/motivation tags already exist)
