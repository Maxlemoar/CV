# CV Portfolio Website — Maximilian Marowsky

## Project Overview
Personal portfolio/CV website for an application to Anthropic's "Senior Product Manager, Education Labs" position. The site showcases Max's career journey from psychology to EdTech product management with a focus on AI-powered education.

## Target Audience
Anthropic Hiring Team (recruiters, hiring managers, engineers). The site must demonstrate technical competence, product thinking, and deep education domain expertise.

## Tech Stack
- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS
- **Hosting**: Vercel
- **Language**: TypeScript

## Design Direction
- **Style**: Neo-skeuomorphism ("The Notebook" concept)
- **Layout**: Mobile-first, single-page scroll
- **Background**: Warm, slightly textured paper look (off-white/cream)
- **Cards**: Elevated with soft double shadows (neumorphic)
- **Accent color**: Warm orange/terracotta (Anthropic-adjacent)
- **Typography**: Serif headlines, sans-serif body
- **Interactions**: Pressed states (inset shadows), soft hover animations

## Routes
- **`/`** — Interactive conversation-style portfolio (main page)
- **`/cv`** — Classic CV / resume page (single-document layout, printable, PDF-exportable)
- **`/s/[id]`** — Shared conversation sessions

## Sections — Main Page (in order)
1. **Hero** — Name, tagline, photo
2. **About** — Personal pitch: Psychology + Education + AI
3. **Experience Timeline** — pearprogramming → eduki, visual timeline
4. **Projects** — Side projects (learning apps) with screenshots/links
5. **Philosophy** — Education philosophy (individualized learning, post-factual)
6. **Publications** — Book chapter (Springer), Hattie studies
7. **Skills & Tools** — Claude, PM skills, research, etc.
8. **Contact** — Email, LinkedIn, PDF export button

## CV Page (`/cv`)
Classic resume layout tailored to the Anthropic Senior PM Education Labs role. Content is hardcoded in `src/app/cv/CVDocument.tsx` (not from content-graph). Sections: Header, Summary, Experience, Education, Publications, Side Projects, Skills, Languages. Design: single white document card on paper background, print-optimized.

## Key Features
- PDF export functionality
- Responsive, mobile-first
- English language throughout — all UI text, content, and labels must be in English
- Optional gamification (progress ring, achievement toasts, hidden gem nodes) — opt-in via onboarding

## Content Sources
- **`PROFILE.md`** — Single source of truth for all personal information and content
- **`JOB_DESCRIPTION.md`** — Target role details (Senior PM, Education Labs at Anthropic). All content decisions should be aligned with the requirements and preferred qualifications described here.

## Factual Integrity — CRITICAL
- **PROFILE.md is the single source of truth for all numbers, metrics, dates, and claims.** Any number not explicitly stated in PROFILE.md must NOT be used — not in code, not in prompts, not in generated content.
- **Never invent, interpolate, or round numbers.** If PROFILE.md says "~10 people", use "~10 people" — not "12" or "2 to 12". If PROFILE.md has no ARR figure, there is no ARR figure.
- **This applies to LLM-generated content too.** Prompts that ask Claude to generate text (e.g. Reveal, Opening) must not produce metrics that aren't in the provided context. When in doubt, omit the number.

## Reveal Tone — Understated, Not Inspirational
- The Reveal's strength is **specificity**: "You clicked X, then asked about Y." That surprises the recruiter because it's accurate. Wild claims about Anthropic's mission or education philosophy dilute this.
- **Section 4 ("Why this matters")** should be quiet and personal — one connecting thought, not a TED Talk. No grand vision statements, no "this is the future of education" rhetoric.
- All inferences must be framed as **hypotheses** with hedging language. If data is thin, say so. Uncertainty is more credible than false confidence.
- Tone across all Reveal sections: **observant, honest, a little understated.** The reader should think "hm, that's surprisingly accurate" — not "this is trying too hard to impress me."

## Design Principles
- Content first — the design serves the story, not the other way around
- Show, don't tell — demonstrate technical fluency through the site itself
- Authentic — reflect who Max actually is, not a generic PM template
- Accessible — maintain WCAG AA contrast ratios despite neumorphic styling
