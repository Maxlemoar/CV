# The Unfolding — Conversation-Driven Portfolio

## Overview

Replace the current graph-based card exploration with a conversation-first experience. The visitor (recruiter) learns about Max by asking questions — typing or clicking suggested hooks. Each answer materializes as a designed content block, and the page grows into a living document unique to each visitor.

The site is not a CV and not a chatbot. It is an intelligent space that responds.

## Core Concept

The recruiter arrives at a near-empty page: Max's photo, name, a short line, and an invitation — "Lern mich kennen. Frag einfach drauf los." From there, every interaction adds a content block. The page becomes a personalized document the recruiter built through curiosity.

After enough exploration, the meta-reflection surfaces organically: the experience itself was designed around learning principles (agency, progressive disclosure, adaptive content, conversational AI) — and that is exactly what Max wants to build at Anthropic.

## Language

The site is in English throughout (per CLAUDE.md). German example text in this spec is illustrative only — all UI copy will be English in implementation.

## Opening Screen

- **Header**: Photo (existing portrait) + "Max Marowsky" + "Product Manager · Ex-Founder · Psychologist"
- **Invitation**: "Get to know me. Just ask." (or similar — casual, direct)
- **Input field**: Placeholder "What do you want to know?"
- **Starter hooks** as clickable chips (4): "Why Anthropic?", "What I've built", "How I think about education", "Who are you, really?"
- No navigation, no sections, no scroll content. The page is empty until the recruiter acts.

## Content Blocks

Each response renders as a styled block, not a chat bubble. Structure:

1. **Question as title**: Small, uppercase, muted — provides context without chat aesthetics
2. **Answer body**: Readable text, 14-16px, warm tone
3. **Rich elements when appropriate**:
   - Stats/numbers → highlighted stat boxes (e.g., "10 Team | 2022 Acquired | EXIST Gefördert")
   - Career progression → mini timeline with dots and dates
   - Projects → image/logo + description card
   - Simple answers → just text, no decoration
4. **Follow-up hooks**: 2-3 contextual chip-buttons at the bottom of each block. Clicking a hook is equivalent to typing the question.

Design language: Neumorphic cards on paper-texture background, consistent with current design system (rounded-2xl, soft shadows, warm orange accent, serif headings).

### Rich Element Types

| Content type | Visual treatment |
|---|---|
| Startup/project | Logo/image + stat boxes |
| Career timeline | Vertical dot-timeline |
| Philosophy/opinion | Text-only, possibly with a pull quote |
| Skills/tools | Tag chips or small grid |
| Publications | Citation card with link |
| Personal | Photo + casual text |

### Block Behavior

- Blocks appear with a brief fade-in animation (no slide, no bounce — subtle)
- Skeleton loading animation while AI generates response
- Page auto-scrolls to new block
- Blocks are not editable or removable — the document only grows
- Sticky input field at bottom of viewport, always accessible

## Input Modes

Two equal paths:

1. **Typing**: Free-text input. The AI interprets and responds with a structured content block.
2. **Clicking hooks**: Pre-suggested follow-ups at the end of each block. Same result — a new content block.

No mode switching, no tabs. The input field and hooks coexist naturally.

## AI Backend

- Model: Claude (via Vercel AI SDK, existing `/api/chat` route pattern)
- System prompt: PROFILE.md as knowledge base + formatting instructions
- Response format: Structured JSON containing:
  - `text`: The answer content (markdown)
  - `richType`: Optional — "stats", "timeline", "project", "quote", "tags", "citation", "photo", or null
  - `richData`: Optional — structured data for the rich element
  - `hooks`: Array of 2-3 follow-up suggestions (label + full question text)
  - `questionTitle`: Short label for the block header
- The frontend parses this and renders the appropriate content block component
- Responses arrive as complete blocks (no streaming) — skeleton loader shown during generation

## Meta-Reflection

- Triggered organically: After sufficient exploration (roughly 5+ blocks, but the AI judges based on conversation depth — 3 deep questions can be enough), one of the follow-up hooks becomes something like "Have you noticed what's happening here?"
- When activated: A content block that explains the 4 design principles at work:
  1. **Agency** — you chose what to explore, nobody directed you
  2. **Progressive Disclosure** — the page was empty, you filled it
  3. **Adaptive Content** — your document is unique to your curiosity
  4. **Conversational AI** — you talked to a space, not a chatbot
- Closes with: "Genau das will ich bei Anthropic bauen."
- Tone: Casual, conversational — not a manifesto. Part of the document, not separate from it.

## Shareable Sessions

### Creating a Share Link

- Header contains a subtle "Teilen" button (share icon)
- Clicking copies a unique URL: `<domain>/s/<session-id>`
- Session ID is a short random string (e.g., `a3k9f2`)
- Toast confirmation: "Link kopiert"

### Shared View

- Read-only: Shows all content blocks in the order they were created
- No input field, no hooks — a finished document
- Header indicates this is a shared view: "Max Marowsky — entdeckt von einem Besucher"
- CTA at bottom: "Willst du selbst mit Max reden?" → links to main page

### Storage

- Vercel-compatible database (Supabase or similar via Marketplace)
- Schema: `sessions` table with `id` (short string), `blocks` (JSON array), `created_at` (timestamp)
- No user accounts, no cookies, no analytics
- Sessions are anonymous — Max has no dashboard to view them
- Shared sessions are immutable (no further edits)

## PDF Export

- Accessible via header link or as a conversational hook ("Hast du auch einen klassischen Lebenslauf?")
- Triggers `window.print()` with a print stylesheet
- Print view: Linear, section-organized CV generated from PROFILE.md content (reuse existing `getPrintNodes()` logic)
- Clean white background, no shadows, no texture — professional print layout

## Design System

Continues existing neumorphic design:

- **Background**: `#FAF6F1` paper texture
- **Cards**: `#FFFFFF` with soft double shadows
- **Accent**: `#D97706` warm orange for hooks and interactive elements
- **Typography**: Georgia/serif for headings, Inter/system sans for body
- **Visited hooks**: Darker background + inset shadow (pressed state)
- **Unvisited hooks**: Orange border, light background, raised shadow

New elements:
- **Skeleton loader**: Pulsing blocks in card shape while AI responds
- **Block entrance**: Subtle opacity + translateY fade-in (200ms)
- **Toast notification**: Small pill at top for "Link kopiert" etc.

## Mobile

- Single column by default — no layout changes needed
- Sticky input at bottom with safe area inset padding
- Hooks wrap naturally as chips
- Rich elements (stats, timelines) stack vertically on narrow screens
- Share button in header remains accessible

## Out of Scope

- No analytics dashboard or session viewer for Max
- No user accounts or authentication
- No canvas/spatial layout
- No referrer-based personalization
- No quiz elements
- No cross-session memory
- No streaming responses (complete blocks only)

## Architecture (High Level)

```
src/
  app/
    page.tsx              → Opening screen + conversation container
    s/[id]/page.tsx       → Shared session view (read-only)
    api/chat/route.ts     → Claude backend (structured responses)
    api/sessions/route.ts → Save/load shared sessions
  components/
    Opening.tsx           → Photo, name, invitation, starter hooks
    ContentBlock.tsx      → Single content block (question + answer + hooks)
    RichElements/         → Stats, Timeline, ProjectCard, Quote, Tags, Citation
    SkeletonBlock.tsx     → Loading state
    InputBar.tsx          → Sticky input field
    ShareButton.tsx       → Copy share link
    MetaReflection.tsx    → The meta-layer content block
    PrintCV.tsx           → Print stylesheet layout (existing logic adapted)
  lib/
    content-graph.ts      → Can be simplified or replaced — AI generates content dynamically now
    session-store.ts      → Save/load sessions from DB
    format-response.ts    → Parse AI response JSON into component props
```
