# Recruiter Experience Personalization

## Overview

The recruiter personalizes their experience through a conversational onboarding flow before entering the main conversation. Three dimensions — visual style, information depth, and content focus — adapt the UI, content, and AI behavior to how the recruiter prefers to explore Max's profile.

This feature embodies the core thesis of the portfolio: personalized, adaptive learning. The recruiter doesn't just read about it — they experience it.

## Personalization Dimensions

### 1. Visual Style (2 options)

**Fokussiert (Paperlike)**
- Background: warm paper beige (#F7F3EE) with subtle line texture
- Typography: Georgia serif for all content, italic for questions
- Colors: warm browns (#2C2416 ink, #A89F91 secondary, #DDD5C9 borders)
- Stats: light serif numerals, separated by thin rules
- Hooks: italic serif in rounded pills with warm borders
- Cards: no heavy shadows, thin warm borders, generous whitespace
- Overall: feels like reading a well-typeset book or journal

**Farbenfroh (Neo-Brutalist)**
- Background: warm cream (#FFF5E1)
- Typography: bold sans-serif, heavy weights (700-900)
- Colors: multi-color palette — orange (#FF6B35), teal (#4ECDC4), yellow (#FFEF5C)
- Borders: thick (2.5px) black (#222) with offset box-shadows (3-4px)
- Stats: colored card blocks with black borders
- Hooks: bold chips with borders and box-shadows, emoji accents
- Highlights: yellow marker effect on key phrases in text
- Overall: energetic, playful, visually loud

### 2. Information Depth (2 options)

**Überblick (Overview)**
- Each ContentNode gets a `contentCompact` field (~60-80 words)
- Same core message, stripped of narrative buildup and storytelling
- Information-dense, scannable, but still readable as prose
- Claude system prompt instructs shorter, more direct responses for free-form questions

**Deep Dive (current default)**
- Current `content` field unchanged (~100-150 words)
- Narrative style with context, storytelling, and personality
- Claude system prompt allows longer, more exploratory responses

### 3. Content Focus (4 options, single select)

Each focus changes the starter hooks on the Opening screen and biases Claude's system prompt to emphasize that angle. All content remains reachable through conversation — focus priorisiert, filtert nicht.

**Product Builder**
- Starter hooks prioritize: startup-story, pm-approach, founder-lessons, what-id-build
- Claude emphasis: shipping experience, product decisions, startup journey
- Maps to JD: "Build at the Frontier", zero-to-one track record, founder experience

**Learning Scientist**
- Starter hooks prioritize: school-gets-wrong, psychology-of-learning, research, what-schools-should-teach
- Claude emphasis: education theory, research methodology, learning science
- Maps to JD: learning science background, research collaboration, curriculum design

**AI & Vision**
- Starter hooks prioritize: building-with-claude, side-projects, ai-in-education, anthropic-education-vision
- Claude emphasis: AI fluency, Claude usage, future of AI in education
- Maps to JD: technical fluency with AI, Claude prototyping, frontier AI curiosity

**Max als Mensch**
- Starter hooks prioritize: personal, why-anthropic, what-id-build (fatherhood angle), psychology-of-learning (personal motivation)
- Claude emphasis: motivation, personality, values, cultural fit
- Maps to JD: belief in education building agency, communication skills, team fit

## Conversational Onboarding Flow

The personalization happens as a mini-conversation that seamlessly transitions into the main experience. No separate page or modal — it IS the conversation.

### Flow

1. **Opening state**: The page loads with a welcome message from Claude, already styled in the current default theme (neo-skeuomorphic notebook). The first message asks the visual style question.

2. **Question 1 — Visual Style**: "Before we start — how do you prefer to take in information?" Two chip options. On selection, the UI transitions smoothly to the chosen style. This is the "wow" moment — the recruiter sees the page transform.

3. **Question 2 — Information Depth**: "Do you prefer a quick overview or a deeper dive?" Two chip options. No visible UI change, but acknowledged.

4. **Question 3 — Content Focus**: "What are you most curious about?" Four chip options. On selection, the starter hooks update to match.

5. **Transition**: Brief acknowledgment ("Perfect — I'll tailor everything for you."), then the adapted Opening with personalized starter hooks appears. The conversation continues normally from here.

### Skip / Default behavior

If a recruiter navigates directly to a shared link or somehow bypasses onboarding, the default preferences apply:
- Visual style: current neo-skeuomorphic notebook (neither "focused" nor "colorful")
- Info depth: deep-dive
- Content focus: no focus (current ROOT_HOOKS)

The onboarding is not blocking — a "skip" option is available that applies these defaults.

### State persistence

Preferences are stored in React state (via context or zustand) and passed to:
- **CSS**: visual style switches a theme class on a root element (e.g., `data-theme="focused"` or `data-theme="colorful"`)
- **Content Graph**: `nodeToBlock()` reads depth preference to choose `content` vs. `contentCompact`
- **Chat API**: preferences sent as part of the request, injected into Claude's system prompt
- **Opening component**: starter hooks filtered/reordered by focus

No server-side persistence needed — preferences live for the session. If the recruiter shares the link, the shared view uses the default theme (the preferences are personal to the active session).

### Settings floating button

A small icon button (bottom-right or top-right) opens a compact panel where the recruiter can change any of the three preferences mid-conversation. Changes apply immediately:
- Visual style: CSS transition to new theme
- Depth: affects next content blocks rendered (already-rendered blocks stay as-is)
- Focus: updates Claude's system prompt and available hooks going forward

## Architecture

### Content Graph changes

```typescript
export interface ContentNode {
  id: string;
  content: string;           // Deep Dive version (existing, ~100-150 words)
  contentCompact: string;    // Overview version (new, ~60-80 words)
  image?: { src: string; alt: string };
  quiz?: QuizData;
  hooks: Hook[];
  printSection?: PrintSection;
  printOrder?: number;
}
```

### Preferences type

```typescript
export type VisualStyle = "focused" | "colorful";
export type InfoDepth = "overview" | "deep-dive";
export type ContentFocus = "product-builder" | "learning-scientist" | "ai-vision" | "max-personal";

export interface UserPreferences {
  visualStyle: VisualStyle;
  infoDepth: InfoDepth;
  contentFocus: ContentFocus;
}
```

### Focus-to-hooks mapping

```typescript
export const FOCUS_STARTER_HOOKS: Record<ContentFocus, Hook[]> = {
  "product-builder": [
    { label: "The startup I built and sold", targetId: "startup-story" },
    { label: "My product management approach", targetId: "pm-approach" },
    { label: "What founding taught me", targetId: "founder-lessons" },
    { label: "What I'd want to build at Anthropic", targetId: "what-id-build" },
  ],
  "learning-scientist": [
    { label: "What I believe school gets wrong", targetId: "school-gets-wrong" },
    { label: "The psychology of learning", targetId: "psychology-of-learning" },
    { label: "Research I've published", targetId: "research" },
    { label: "What schools should teach instead", targetId: "what-schools-should-teach" },
  ],
  "ai-vision": [
    { label: "What I'm building with Claude right now", targetId: "building-with-claude" },
    { label: "My side projects", targetId: "side-projects" },
    { label: "How I used AI to assess teaching quality", targetId: "ai-in-education" },
    { label: "My vision for AI in education", targetId: "anthropic-education-vision" },
  ],
  "max-personal": [
    { label: "Who I am outside of work", targetId: "personal" },
    { label: "Why I want to work at Anthropic", targetId: "why-anthropic" },
    { label: "How becoming a father changed my perspective", targetId: "what-id-build" },
    { label: "The science of what motivates me", targetId: "psychology-of-learning" },
  ],
};
```

### Theme implementation

Two approaches, recommend CSS custom properties:

```css
/* Default / Neo-Skeuomorphic (current) applies when no data-theme is set */

[data-theme="focused"] {
  --color-paper: #F7F3EE;
  --color-paper-dark: #E8E0D4;
  --color-ink: #2C2416;
  --color-ink-light: #A89F91;
  --color-accent: #5C4F3D;
  --color-accent-hover: #3D3529;
  --shadow-neu: none;
  --shadow-neu-sm: none;
  --shadow-neu-inset: none;
  --font-headline: Georgia, 'Times New Roman', serif;
  --font-body: Georgia, 'Times New Roman', serif;
  --border-card: 1px solid #DDD5C9;
  /* Remove paper texture overlay */
}

[data-theme="colorful"] {
  --color-paper: #FFF5E1;
  --color-paper-dark: #FFE8C2;
  --color-ink: #222222;
  --color-ink-light: #555555;
  --color-accent: #FF6B35;
  --color-accent-hover: #E55A2B;
  --shadow-neu: 4px 4px 0 #222;
  --shadow-neu-sm: 3px 3px 0 #222;
  --shadow-neu-inset: inset 2px 2px 0 #222;
  --font-headline: system-ui, sans-serif;
  --font-body: system-ui, sans-serif;
  --border-card: 2.5px solid #222;
  /* Additional brutalist tokens */
  --color-stat-1: #4ECDC4;
  --color-stat-2: #FF6B35;
  --color-stat-3: #FFEF5C;
  --color-highlight: #FFEF5C;
}
```

Components read these variables. The theme class is toggled on `<html>` or a root wrapper, triggering a CSS transition for smooth style switching.

### System prompt additions

The chat API route appends a preferences block to the system prompt:

```
## Recruiter Preferences
- Visual style: {focused|colorful} (informational only — does not affect your response)
- Information depth: {overview|deep-dive}
  - If "overview": Keep responses concise (~2-3 sentences). Lead with the key fact. Skip narrative buildup.
  - If "deep-dive": Current behavior. Tell the story, provide context, make it personal.
- Content focus: {product-builder|learning-scientist|ai-vision|max-personal}
  - Prioritize this angle when answering free-form questions. Weave in relevant examples from this domain. But don't ignore other dimensions if the user asks about them directly.
```

### Component changes

| Component | Change |
|-----------|--------|
| `ConversationView` | Manages `UserPreferences` state. New onboarding phase before main conversation. Passes preferences to child components and API. |
| `Opening` | Receives `contentFocus` to determine which starter hooks to show. Hidden during onboarding phase. |
| `ContentBlock` | Reads `infoDepth` to choose `content` vs `contentCompact` from node. Styled by theme CSS variables. |
| `RichElements` | Styled by theme CSS variables (stat colors, border styles, shadow styles). |
| `InputBar` | No functional change, styled by theme. |
| `globals.css` | New `[data-theme]` blocks for focused and colorful themes. |
| **New: `OnboardingChat`** | Renders the 3-question conversational flow. Emits `UserPreferences` on completion. |
| **New: `SettingsPanel`** | Floating button + dropdown/modal to change preferences mid-session. |

### Chat API changes

`/api/chat/route.ts` receives preferences in the request body and injects them into the system prompt. No other API changes needed.

## What stays the same

- The current neo-skeuomorphic design becomes the default when no preference is set (and the shared session view)
- Content graph node structure (IDs, hooks, print sections) — only `contentCompact` field added
- Session sharing — shared links show default theme
- Print/PDF export — uses default theme
- The `/cv` route — unaffected

## Content work required

Each of the 18 content nodes needs a `contentCompact` version (~60-80 words). This is a writing task, not a code task. The compact versions should:
- Preserve the core message and key facts/numbers
- Remove narrative framing ("Let me tell you about...", "The interesting thing is...")
- Lead with the strongest point
- Maintain Max's voice (direct, confident, specific)
