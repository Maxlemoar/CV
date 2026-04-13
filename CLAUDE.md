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
- English language throughout

## Content Sources
- **`PROFILE.md`** — Single source of truth for all personal information and content
- **`JOB_DESCRIPTION.md`** — Target role details (Senior PM, Education Labs at Anthropic). All content decisions should be aligned with the requirements and preferred qualifications described here.

## Design Principles
- Content first — the design serves the story, not the other way around
- Show, don't tell — demonstrate technical fluency through the site itself
- Authentic — reflect who Max actually is, not a generic PM template
- Accessible — maintain WCAG AA contrast ratios despite neumorphic styling
