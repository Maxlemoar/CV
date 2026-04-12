# Portfolio Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a neo-skeuomorphic portfolio/CV website for Max Marowsky's Anthropic application, with PDF export.

**Architecture:** Next.js App Router with a single-page scroll layout. All content is hardcoded (no CMS). Styling via Tailwind CSS with custom neumorphic utility classes. PDF export via browser print stylesheet. Deployed to Vercel.

**Tech Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS 4, Vercel

---

## File Structure

```
src/
  app/
    layout.tsx          — Root layout: fonts, metadata, global styles
    page.tsx            — Main page: composes all sections
    globals.css         — Tailwind directives, paper texture, neumorphic utilities, print styles
  components/
    Nav.tsx             — Sticky notebook-tab navigation
    Hero.tsx            — Name, tagline, photo
    About.tsx           — Personal pitch section
    Experience.tsx      — Timeline: pearprogramming → eduki
    Projects.tsx        — Side projects grid
    Philosophy.tsx      — Education philosophy
    Publications.tsx    — Book chapter, studies
    Skills.tsx          — Skills & tools
    Personal.tsx        — Hobbies / beyond work
    Contact.tsx         — Email, LinkedIn, PDF export button
    SectionCard.tsx     — Reusable neumorphic card wrapper
    TimelineItem.tsx    — Single timeline entry component
    ProjectCard.tsx     — Single project card
public/
    photo.jpg           — Profile photo (user provides)
    og-image.png        — Open Graph image (optional, later)
tailwind.config.ts      — Custom theme: colors, fonts, shadows
next.config.ts          — Next.js config
```

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `.gitignore`

- [ ] **Step 1: Initialize Next.js project**

Run:
```bash
cd /Users/maximilianmarowsky/Code/CV
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --no-turbopack
```
Expected: Project scaffolded with Next.js, Tailwind, TypeScript.

- [ ] **Step 2: Initialize git**

```bash
cd /Users/maximilianmarowsky/Code/CV
git init
git add -A
git commit -m "chore: scaffold Next.js project with Tailwind CSS"
```

- [ ] **Step 3: Configure Tailwind theme**

Replace `tailwind.config.ts` with:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#FAF6F1",
        "paper-dark": "#F0EBE3",
        ink: "#2C2C2C",
        "ink-light": "#6B6B6B",
        accent: "#D97706",
        "accent-hover": "#B45309",
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", '"Times New Roman"', "serif"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        neu: "6px 6px 12px rgba(0,0,0,0.08), -6px -6px 12px rgba(255,255,255,0.9)",
        "neu-inset": "inset 4px 4px 8px rgba(0,0,0,0.06), inset -4px -4px 8px rgba(255,255,255,0.7)",
        "neu-sm": "3px 3px 6px rgba(0,0,0,0.06), -3px -3px 6px rgba(255,255,255,0.8)",
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 4: Set up globals.css**

Replace `src/app/globals.css` with:

```css
@import "tailwindcss";

@theme {
  --color-paper: #FAF6F1;
  --color-paper-dark: #F0EBE3;
  --color-ink: #2C2C2C;
  --color-ink-light: #6B6B6B;
  --color-accent: #D97706;
  --color-accent-hover: #B45309;

  --font-serif: Georgia, Cambria, "Times New Roman", serif;
  --font-sans: "Inter", system-ui, sans-serif;

  --shadow-neu: 6px 6px 12px rgba(0,0,0,0.08), -6px -6px 12px rgba(255,255,255,0.9);
  --shadow-neu-inset: inset 4px 4px 8px rgba(0,0,0,0.06), inset -4px -4px 8px rgba(255,255,255,0.7);
  --shadow-neu-sm: 3px 3px 6px rgba(0,0,0,0.06), -3px -3px 6px rgba(255,255,255,0.8);
}

html {
  scroll-behavior: smooth;
}

body {
  background-color: var(--color-paper);
  color: var(--color-ink);
  font-family: var(--font-sans);
}

/* Paper texture overlay */
body::before {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
}

/* Print / PDF export styles */
@media print {
  body::before {
    display: none;
  }

  nav {
    display: none !important;
  }

  .no-print {
    display: none !important;
  }

  section {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  * {
    box-shadow: none !important;
  }

  body {
    background: white;
    font-size: 11pt;
  }
}
```

- [ ] **Step 5: Set up root layout**

Replace `src/app/layout.tsx` with:

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Maximilian Marowsky — Product Manager",
  description:
    "Psychologist turned Product Manager, building the future of learning with AI.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
```

- [ ] **Step 6: Minimal page.tsx placeholder**

Replace `src/app/page.tsx` with:

```tsx
export default function Home() {
  return (
    <main className="relative z-10 min-h-screen">
      <div className="mx-auto max-w-3xl px-6 py-20">
        <h1 className="font-serif text-4xl text-ink">Maximilian Marowsky</h1>
        <p className="mt-2 text-ink-light">Coming soon.</p>
      </div>
    </main>
  );
}
```

- [ ] **Step 7: Verify dev server runs**

Run: `cd /Users/maximilianmarowsky/Code/CV && npm run dev`
Expected: Site loads at localhost:3000, shows name on paper-colored background.

- [ ] **Step 8: Commit**

```bash
git add tailwind.config.ts src/app/globals.css src/app/layout.tsx src/app/page.tsx
git commit -m "feat: configure theme, fonts, neumorphic shadows, paper texture"
```

---

### Task 2: SectionCard Component & Nav

**Files:**
- Create: `src/components/SectionCard.tsx`, `src/components/Nav.tsx`

- [ ] **Step 1: Create SectionCard**

Create `src/components/SectionCard.tsx`:

```tsx
interface SectionCardProps {
  id: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export default function SectionCard({ id, title, children, className = "" }: SectionCardProps) {
  return (
    <section id={id} className={`mb-12 rounded-2xl bg-paper-dark p-8 shadow-neu ${className}`}>
      <h2 className="mb-6 font-serif text-2xl text-ink">{title}</h2>
      {children}
    </section>
  );
}
```

- [ ] **Step 2: Create Nav**

Create `src/components/Nav.tsx`:

```tsx
"use client";

import { useState, useEffect } from "react";

const links = [
  { href: "#about", label: "About" },
  { href: "#experience", label: "Experience" },
  { href: "#projects", label: "Projects" },
  { href: "#philosophy", label: "Philosophy" },
  { href: "#publications", label: "Publications" },
  { href: "#skills", label: "Skills" },
  { href: "#personal", label: "Beyond Work" },
  { href: "#contact", label: "Contact" },
];

export default function Nav() {
  const [active, setActive] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActive(`#${visible[0].target.id}`);
        }
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );

    links.forEach(({ href }) => {
      const el = document.querySelector(href);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <nav className="no-print sticky top-0 z-50 overflow-x-auto border-b border-paper-dark bg-paper/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-3xl gap-1 px-4 py-2">
        {links.map(({ href, label }) => (
          <a
            key={href}
            href={href}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-sm transition-all ${
              active === href
                ? "bg-paper-dark shadow-neu-inset text-accent font-medium"
                : "text-ink-light hover:text-ink"
            }`}
          >
            {label}
          </a>
        ))}
      </div>
    </nav>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/SectionCard.tsx src/components/Nav.tsx
git commit -m "feat: add SectionCard and sticky Nav components"
```

---

### Task 3: Hero Section

**Files:**
- Create: `src/components/Hero.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Create Hero**

Create `src/components/Hero.tsx`:

```tsx
import Image from "next/image";

export default function Hero() {
  return (
    <section className="mx-auto max-w-3xl px-6 pb-8 pt-20 text-center">
      <div className="mx-auto mb-6 h-36 w-36 overflow-hidden rounded-full shadow-neu">
        <Image
          src="/photo.jpg"
          alt="Maximilian Marowsky"
          width={144}
          height={144}
          className="h-full w-full object-cover"
          priority
        />
      </div>
      <h1 className="font-serif text-4xl font-bold text-ink md:text-5xl">
        Maximilian Marowsky
      </h1>
      <p className="mt-3 text-lg text-ink-light">
        Psychologist turned Product Manager,{" "}
        <span className="text-accent">building the future of learning with AI.</span>
      </p>
    </section>
  );
}
```

- [ ] **Step 2: Update page.tsx**

Replace `src/app/page.tsx` with:

```tsx
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";

export default function Home() {
  return (
    <>
      <Nav />
      <main className="relative z-10 min-h-screen">
        <Hero />
        <div className="mx-auto max-w-3xl px-6 pb-20">
          {/* Sections will be added here */}
        </div>
      </main>
    </>
  );
}
```

- [ ] **Step 3: Add placeholder photo**

Note: User will provide `public/photo.jpg`. For now, create a placeholder so the build doesn't break. If no photo exists, the Image component will error — we can add a fallback div temporarily.

- [ ] **Step 4: Verify in browser**

Run: `npm run dev`
Expected: Hero section with name, tagline, photo placeholder. Sticky nav at top.

- [ ] **Step 5: Commit**

```bash
git add src/components/Hero.tsx src/app/page.tsx
git commit -m "feat: add Hero section with photo and tagline"
```

---

### Task 4: About Section

**Files:**
- Create: `src/components/About.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Create About**

Create `src/components/About.tsx`:

```tsx
import SectionCard from "./SectionCard";

export default function About() {
  return (
    <SectionCard id="about" title="About">
      <div className="space-y-4 text-ink-light leading-relaxed">
        <p>
          I&apos;m a psychologist who became a product manager because I believe technology 
          can transform how we learn. My journey started with a Master&apos;s thesis on motivation 
          in computer science education — and hasn&apos;t stopped since.
        </p>
        <p>
          I co-founded{" "}
          <span className="font-medium text-ink">pearprogramming</span>, a game-based 
          learning app that taught students to code by building their own virtual startup. 
          After our acquisition by{" "}
          <span className="font-medium text-ink">eduki</span> — Germany&apos;s largest 
          marketplace for teaching materials — I led the product integration and went on to 
          optimize core commerce experiences and build an AI-powered quality assessment system 
          in collaboration with Prof. John Hattie.
        </p>
        <p>
          Today, I use Claude daily to build learning applications — from a paramedic training 
          app to an inclusion tool helping refugees learn German. I&apos;m looking to bring my 
          unique blend of psychology, education science, and product craft to Anthropic&apos;s 
          Education Labs.
        </p>
      </div>
    </SectionCard>
  );
}
```

- [ ] **Step 2: Add About to page.tsx**

In `src/app/page.tsx`, add import and component inside the `max-w-3xl` div:

```tsx
import About from "@/components/About";
// ... inside the div:
<About />
```

- [ ] **Step 3: Commit**

```bash
git add src/components/About.tsx src/app/page.tsx
git commit -m "feat: add About section"
```

---

### Task 5: Experience Timeline

**Files:**
- Create: `src/components/TimelineItem.tsx`, `src/components/Experience.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Create TimelineItem**

Create `src/components/TimelineItem.tsx`:

```tsx
interface TimelineItemProps {
  period: string;
  title: string;
  org: string;
  description: string;
  highlights?: string[];
}

export default function TimelineItem({ period, title, org, description, highlights }: TimelineItemProps) {
  return (
    <div className="relative border-l-2 border-accent/30 pb-8 pl-6 last:pb-0">
      <div className="absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-accent shadow-neu-sm" />
      <p className="text-sm font-medium text-accent">{period}</p>
      <h3 className="mt-1 font-serif text-lg text-ink">{title}</h3>
      <p className="text-sm font-medium text-ink-light">{org}</p>
      <p className="mt-2 text-sm leading-relaxed text-ink-light">{description}</p>
      {highlights && (
        <ul className="mt-2 space-y-1">
          {highlights.map((h) => (
            <li key={h} className="text-sm text-ink-light">
              <span className="mr-2 text-accent">&#8226;</span>
              {h}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create Experience**

Create `src/components/Experience.tsx`:

```tsx
import SectionCard from "./SectionCard";
import TimelineItem from "./TimelineItem";

export default function Experience() {
  return (
    <SectionCard id="experience" title="Experience">
      <div>
        <TimelineItem
          period="Q1 2026"
          title="Product Manager — Make Quality Visible"
          org="eduki"
          description="Led a quarter-long initiative to surface pedagogical quality on the platform. Built the 'Best of eduki' label powered by an AI assessor."
          highlights={[
            "Co-developed quality framework with Prof. John Hattie, validated with 2,000+ teachers",
            "Built AI assessor (Gemini Flash) evaluating 12 criteria across 5 quality dimensions",
            "Personally iterated the prompt (v10) using Claude — 89% agreement with human reviewers",
            "Shipped label on product pages, search results (with filter), and dedicated landing page",
          ]}
        />
        <TimelineItem
          period="2023 – 2025"
          title="Product Manager — Commerce"
          org="eduki"
          description="Owned product page, cart, checkout, and favorites — core commerce surfaces of the marketplace."
          highlights={[
            "Ran extensive discovery cycles across all product spaces",
            "Optimized through incremental improvements, frequently as A/B tests",
          ]}
        />
        <TimelineItem
          period="2022 – 2023"
          title="Product Manager — eduki Interactive"
          org="eduki (formerly pearprogramming)"
          description="Led integration of the acquired pearprogramming app into the eduki marketplace. Ran as an intrapreneurship team searching for product-market fit."
          highlights={[
            "Team: 2 backend, 2 frontend, 1 QA, 1 UX/UI designer",
            "Responsible for product strategy and PMF discovery",
          ]}
        />
        <TimelineItem
          period="2018 – 2022"
          title="Co-Founder & CEO"
          org="pearprogramming GmbH"
          description="Co-founded an EdTech startup teaching students to code through a game-based learning app. Students built a virtual startup while learning programming — from visual blocks (Google Blockly) to text-based languages."
          highlights={[
            "EXIST Gründerstipendium recipient (federal startup grant)",
            "Team of ~10, responsible for product vision, strategy, and business operations",
            "Successfully acquired by eduki in 2022",
          ]}
        />
        <TimelineItem
          period="2016 – 2019"
          title="M.Sc. Psychology"
          org="Universität Witten/Herdecke"
          description="Grade: 1.5 (excellent). Thesis on motivation in learning within computer science education."
        />
        <TimelineItem
          period="2015 – 2017"
          title="Research Assistant"
          org="Deutsches Kinderschmerzzentrum, Datteln"
          description="Research, test diagnostics, data entry and analysis alongside studies."
        />
      </div>
    </SectionCard>
  );
}
```

- [ ] **Step 3: Add Experience to page.tsx**

```tsx
import Experience from "@/components/Experience";
// ... after <About />:
<Experience />
```

- [ ] **Step 4: Verify timeline renders correctly on mobile and desktop**

Run: `npm run dev`
Expected: Vertical timeline with orange dots, connecting line, all entries visible.

- [ ] **Step 5: Commit**

```bash
git add src/components/TimelineItem.tsx src/components/Experience.tsx src/app/page.tsx
git commit -m "feat: add Experience timeline section"
```

---

### Task 6: Projects Section

**Files:**
- Create: `src/components/ProjectCard.tsx`, `src/components/Projects.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Create ProjectCard**

Create `src/components/ProjectCard.tsx`:

```tsx
interface ProjectCardProps {
  title: string;
  description: string;
  tags: string[];
  status: string;
  url?: string;
}

export default function ProjectCard({ title, description, tags, status, url }: ProjectCardProps) {
  return (
    <div className="rounded-xl bg-paper p-6 shadow-neu-sm transition-shadow hover:shadow-neu">
      <div className="mb-2 flex items-start justify-between">
        <h3 className="font-serif text-lg text-ink">{title}</h3>
        <span className="shrink-0 rounded-full bg-accent/10 px-2 py-0.5 text-xs text-accent">
          {status}
        </span>
      </div>
      <p className="text-sm leading-relaxed text-ink-light">{description}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded-md bg-paper-dark px-2 py-0.5 text-xs text-ink-light shadow-neu-inset"
          >
            {tag}
          </span>
        ))}
      </div>
      {url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block text-sm font-medium text-accent hover:text-accent-hover transition-colors"
        >
          View Project &rarr;
        </a>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create Projects**

Create `src/components/Projects.tsx`:

```tsx
import SectionCard from "./SectionCard";
import ProjectCard from "./ProjectCard";

export default function Projects() {
  return (
    <SectionCard id="projects" title="Projects">
      <p className="mb-6 text-sm text-ink-light">
        Side projects I&apos;m building with Claude Code — because the best way to understand AI is to build with it.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <ProjectCard
          title="Paramedic Trainer"
          description="A learning app for paramedic trainees (Rettungssanitäter) — adaptive quizzes and scenario-based learning for emergency medical training."
          tags={["Education", "Claude Code", "Next.js"]}
          status="In Development"
        />
        <ProjectCard
          title="Vocabulary App"
          description="A vocabulary learning application with spaced repetition and contextual learning."
          tags={["Education", "Claude Code", "Spaced Repetition"]}
          status="In Development"
        />
        <ProjectCard
          title="Inclusion App"
          description="Helping refugees arriving in Germany learn German — making language learning accessible and culturally sensitive."
          tags={["Education", "Inclusion", "Claude Code"]}
          status="In Development"
        />
        <ProjectCard
          title="pearprogramming"
          description="Game-based coding education — students build a virtual startup while learning to program. From visual blocks to real code."
          tags={["EdTech", "Game-Based Learning", "Startup"]}
          status="Acquired by eduki"
        />
      </div>
    </SectionCard>
  );
}
```

- [ ] **Step 3: Add Projects to page.tsx**

```tsx
import Projects from "@/components/Projects";
// ... after <Experience />:
<Projects />
```

- [ ] **Step 4: Commit**

```bash
git add src/components/ProjectCard.tsx src/components/Projects.tsx src/app/page.tsx
git commit -m "feat: add Projects section with project cards"
```

---

### Task 7: Philosophy, Publications, Skills, Personal Sections

**Files:**
- Create: `src/components/Philosophy.tsx`, `src/components/Publications.tsx`, `src/components/Skills.tsx`, `src/components/Personal.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Create Philosophy**

Create `src/components/Philosophy.tsx`:

```tsx
import SectionCard from "./SectionCard";

export default function Philosophy() {
  return (
    <SectionCard id="philosophy" title="Education Philosophy">
      <div className="space-y-4 text-ink-light leading-relaxed">
        <p>
          Learning is deeply individual. Every student brings unique interests, inclinations, 
          and challenges. The task of education is to identify these and specifically nurture them — 
          not to apply a one-size-fits-all curriculum.
        </p>
        <p>
          I don&apos;t believe fact-oriented learning is a future model. In a world where all 
          information is available within seconds and increasingly capable AI systems are emerging, 
          we must dare to question our fundamental paradigms in education.
        </p>
        <p>
          The goal isn&apos;t to fill minds with answers — it&apos;s to build{" "}
          <span className="font-medium text-ink">agency</span>,{" "}
          <span className="font-medium text-ink">curiosity</span>, and the ability to{" "}
          <span className="font-medium text-ink">think critically</span> in a world where 
          knowledge itself is becoming a commodity.
        </p>
      </div>
    </SectionCard>
  );
}
```

- [ ] **Step 2: Create Publications**

Create `src/components/Publications.tsx`:

```tsx
import SectionCard from "./SectionCard";

export default function Publications() {
  return (
    <SectionCard id="publications" title="Publications">
      <div className="space-y-4">
        <div className="rounded-xl bg-paper p-5 shadow-neu-sm">
          <h3 className="font-serif text-base text-ink">
            The Teacher-Centered Perspective on Digital Game-Based Learning
          </h3>
          <p className="mt-1 text-sm text-ink-light">
            Book chapter in &ldquo;Game-based Learning Across the Disciplines&rdquo;
          </p>
          <p className="mt-1 text-sm text-ink-light">
            Springer, August 2021 &middot; Co-authored with Anna Fehrenbach et al.
          </p>
          <a
            href="https://link.springer.com/book/10.1007/978-3-030-75142-5"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-sm font-medium text-accent hover:text-accent-hover transition-colors"
          >
            View on Springer &rarr;
          </a>
        </div>
        <div className="rounded-xl bg-paper p-5 shadow-neu-sm">
          <h3 className="font-serif text-base text-ink">
            Quality Framework for Teaching Materials
          </h3>
          <p className="mt-1 text-sm text-ink-light">
            Two published studies co-developed with Prof. John Hattie, validating a framework 
            for assessing pedagogical quality of teaching materials across 7 factors and 5 
            applicable dimensions.
          </p>
        </div>
      </div>
    </SectionCard>
  );
}
```

- [ ] **Step 3: Create Skills**

Create `src/components/Skills.tsx`:

```tsx
import SectionCard from "./SectionCard";

const skillGroups = [
  {
    label: "Product Management",
    skills: ["Discovery & Research", "A/B Testing", "Roadmapping", "Stakeholder Management", "Zero-to-One"],
  },
  {
    label: "AI & Tools",
    skills: ["Claude (daily)", "Claude Code", "Prompt Engineering", "AI Assessment Systems", "Gemini"],
  },
  {
    label: "Education & Research",
    skills: ["Learning Science", "Game-Based Learning", "Curriculum Design", "Quantitative Methods", "Academic Publishing"],
  },
  {
    label: "Leadership",
    skills: ["Startup CEO", "Cross-functional Teams", "Intrapreneurship", "EXIST Grant Recipient"],
  },
];

export default function Skills() {
  return (
    <SectionCard id="skills" title="Skills & Tools">
      <div className="grid gap-6 sm:grid-cols-2">
        {skillGroups.map((group) => (
          <div key={group.label}>
            <h3 className="mb-2 text-sm font-medium text-accent">{group.label}</h3>
            <div className="flex flex-wrap gap-2">
              {group.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-lg bg-paper px-3 py-1 text-sm text-ink-light shadow-neu-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
```

- [ ] **Step 4: Create Personal**

Create `src/components/Personal.tsx`:

```tsx
import SectionCard from "./SectionCard";

export default function Personal() {
  return (
    <SectionCard id="personal" title="Beyond Work">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-paper p-5 shadow-neu-sm">
          <p className="mb-1 text-lg">&#9749;</p>
          <h3 className="font-serif text-base text-ink">Specialty Coffee</h3>
          <p className="mt-1 text-sm text-ink-light">
            Pour-over enthusiast, former barista, and unashamed coffee nerd. 
            Filter coffee is my love language. Dream: opening my own cafe someday.
          </p>
        </div>
        <div className="rounded-xl bg-paper p-5 shadow-neu-sm">
          <p className="mb-1 text-lg">&#127859;</p>
          <h3 className="font-serif text-base text-ink">Cooking & Baking</h3>
          <p className="mt-1 text-sm text-ink-light">
            Passionate cook and bread baker. Once dreamed of becoming a chef — 
            the kitchen is still where I think best.
          </p>
        </div>
        <div className="rounded-xl bg-paper p-5 shadow-neu-sm">
          <p className="mb-1 text-lg">&#128692;</p>
          <h3 className="font-serif text-base text-ink">Road Cycling</h3>
          <p className="mt-1 text-sm text-ink-light">
            Recently discovered road cycling. Love being outdoors — 
            hiking, running, anything that gets me moving in nature.
          </p>
        </div>
      </div>
    </SectionCard>
  );
}
```

- [ ] **Step 5: Add all four to page.tsx**

Update `src/app/page.tsx`:

```tsx
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Experience from "@/components/Experience";
import Projects from "@/components/Projects";
import Philosophy from "@/components/Philosophy";
import Publications from "@/components/Publications";
import Skills from "@/components/Skills";
import Personal from "@/components/Personal";

export default function Home() {
  return (
    <>
      <Nav />
      <main className="relative z-10 min-h-screen">
        <Hero />
        <div className="mx-auto max-w-3xl px-6 pb-20">
          <About />
          <Experience />
          <Projects />
          <Philosophy />
          <Publications />
          <Skills />
          <Personal />
        </div>
      </main>
    </>
  );
}
```

- [ ] **Step 6: Verify all sections render**

Run: `npm run dev`
Expected: All sections visible, scrollable, nav highlights correct section.

- [ ] **Step 7: Commit**

```bash
git add src/components/Philosophy.tsx src/components/Publications.tsx src/components/Skills.tsx src/components/Personal.tsx src/app/page.tsx
git commit -m "feat: add Philosophy, Publications, Skills, and Personal sections"
```

---

### Task 8: Contact Section & PDF Export

**Files:**
- Create: `src/components/Contact.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Create Contact**

Create `src/components/Contact.tsx`:

```tsx
"use client";

import SectionCard from "./SectionCard";

export default function Contact() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <SectionCard id="contact" title="Get in Touch">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
          <a
            href="mailto:m.marowsky@googlemail.com"
            className="text-ink-light hover:text-accent transition-colors text-sm"
          >
            m.marowsky@googlemail.com
          </a>
          <a
            href="https://www.linkedin.com/in/maximilian-marowsky-416bb3164/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-ink-light hover:text-accent transition-colors text-sm"
          >
            LinkedIn
          </a>
        </div>
        <button
          onClick={handlePrint}
          className="no-print rounded-xl bg-paper px-6 py-3 text-sm font-medium text-ink shadow-neu transition-all hover:shadow-neu-sm active:shadow-neu-inset"
        >
          Export as PDF
        </button>
      </div>
    </SectionCard>
  );
}
```

- [ ] **Step 2: Add Contact to page.tsx**

```tsx
import Contact from "@/components/Contact";
// ... after <Personal />:
<Contact />
```

- [ ] **Step 3: Test PDF export**

Run: `npm run dev`
Click "Export as PDF" button. Expected: Browser print dialog opens. Nav is hidden, shadows removed, clean printable layout.

- [ ] **Step 4: Commit**

```bash
git add src/components/Contact.tsx src/app/page.tsx
git commit -m "feat: add Contact section with PDF export"
```

---

### Task 9: Polish & Deploy

**Files:**
- Modify: `src/app/globals.css` (if needed for polish)
- Modify: various components for responsive fine-tuning

- [ ] **Step 1: Run production build**

```bash
cd /Users/maximilianmarowsky/Code/CV && npm run build
```
Expected: Build succeeds with no errors.

- [ ] **Step 2: Fix any build errors**

Address TypeScript or build errors if any.

- [ ] **Step 3: Test mobile responsiveness**

Open dev tools, test at 375px (iPhone SE) and 390px (iPhone 14) widths. Verify:
- Nav scrolls horizontally
- Cards stack vertically
- Text is readable
- Timeline looks correct

- [ ] **Step 4: Commit final state**

```bash
git add -A
git commit -m "feat: production-ready portfolio website"
```

- [ ] **Step 5: Deploy to Vercel**

Use the Vercel deployment skill or CLI:
```bash
npx vercel
```

- [ ] **Step 6: Verify deployed site**

Check the deployment URL. Verify all sections load, nav works, PDF export works.

---

## Notes

- **Photo**: User needs to provide `public/photo.jpg` before deploying
- **Side project URLs**: Can be added to ProjectCard components when apps go live
- **Hattie study links**: Can be added to Publications when user provides URLs
- **Content updates**: All personal content lives in component files; reference PROFILE.md for accuracy
