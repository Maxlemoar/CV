# UI/UX Full Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace dated neumorphic design with cutting-edge typography, modern shadows, orchestrated motion, and polished UI components across all three themes.

**Architecture:** Bottom-up approach — foundations first (fonts, CSS variables, shadows), then component-level motion and UI upgrades. Each task produces a working, committable state. No task depends on uncommitted work from another.

**Tech Stack:** Next.js 16 (App Router), Tailwind CSS 4, Framer Motion 12, next/font, View Transitions API, CSS @property

**Spec:** `docs/superpowers/specs/2026-04-13-ui-overhaul-design.md`

---

## Task 1: Download Local Fonts (Satoshi, Clash Display)

**Files:**
- Create: `src/fonts/Satoshi-Variable.woff2`
- Create: `src/fonts/Satoshi-VariableItalic.woff2`
- Create: `src/fonts/ClashDisplay-Variable.woff2`

- [ ] **Step 1: Create fonts directory and download Satoshi from Fontshare**

```bash
mkdir -p src/fonts
curl -L "https://api.fontshare.com/v2/fonts/download/satoshi" -o /tmp/satoshi.zip
unzip -o /tmp/satoshi.zip -d /tmp/satoshi
cp /tmp/satoshi/Fonts/WEB/fonts/Satoshi-Variable.woff2 src/fonts/
cp /tmp/satoshi/Fonts/WEB/fonts/Satoshi-VariableItalic.woff2 src/fonts/
rm -rf /tmp/satoshi /tmp/satoshi.zip
```

- [ ] **Step 2: Download Clash Display from Fontshare**

```bash
curl -L "https://api.fontshare.com/v2/fonts/download/clash-display" -o /tmp/clash.zip
unzip -o /tmp/clash.zip -d /tmp/clash
cp /tmp/clash/Fonts/WEB/fonts/ClashDisplay-Variable.woff2 src/fonts/
rm -rf /tmp/clash /tmp/clash.zip
```

- [ ] **Step 3: Verify files exist**

```bash
ls -la src/fonts/
```

Expected: 3 woff2 files (Satoshi-Variable.woff2, Satoshi-VariableItalic.woff2, ClashDisplay-Variable.woff2)

- [ ] **Step 4: Commit**

```bash
git add src/fonts/
git commit -m "chore: add Satoshi and Clash Display font files from Fontshare"
```

---

## Task 2: Set Up Font Loading in layout.tsx

**Files:**
- Create: `src/lib/fonts.ts`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Create font configuration file**

Create `src/lib/fonts.ts`:

```typescript
import { Instrument_Serif, Literata, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";

// Default theme: Headlines
export const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-instrument-serif",
});

// Focused theme: Headlines + Body
export const literata = Literata({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-literata",
});

// Colorful theme: Body
export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
});

// Default theme: Body
export const satoshi = localFont({
  src: [
    { path: "../fonts/Satoshi-Variable.woff2", style: "normal" },
    { path: "../fonts/Satoshi-VariableItalic.woff2", style: "italic" },
  ],
  display: "swap",
  variable: "--font-satoshi",
});

// Colorful theme: Headlines
export const clashDisplay = localFont({
  src: [{ path: "../fonts/ClashDisplay-Variable.woff2", style: "normal" }],
  display: "swap",
  variable: "--font-clash-display",
});
```

- [ ] **Step 2: Update layout.tsx to inject font CSS variables**

Replace the contents of `src/app/layout.tsx`:

```typescript
import type { Metadata } from "next";
import { PreferencesProvider } from "@/lib/preferences";
import ThemeApplicator from "./ThemeApplicator";
import {
  instrumentSerif,
  literata,
  jetbrainsMono,
  satoshi,
  clashDisplay,
} from "@/lib/fonts";
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
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${satoshi.variable} ${literata.variable} ${clashDisplay.variable} ${jetbrainsMono.variable}`}
    >
      <body className="antialiased">
        <PreferencesProvider>
          <ThemeApplicator>
            {children}
          </ThemeApplicator>
        </PreferencesProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Run dev server to verify fonts load without errors**

```bash
npm run dev
```

Expected: No build errors. Page loads. Fonts don't apply yet (CSS variables defined but not used in styles).

- [ ] **Step 4: Commit**

```bash
git add src/lib/fonts.ts src/app/layout.tsx
git commit -m "feat: set up font loading with next/font for all themes"
```

---

## Task 3: Update CSS — Typography Variables & Font Stacks

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Replace font variables in @theme block**

In `src/app/globals.css`, replace the existing `@theme` block:

```css
@theme {
  --color-paper: #FAF6F1;
  --color-paper-dark: #F0EBE3;
  --color-ink: #2C2C2C;
  --color-ink-light: #6B6B6B;
  --color-accent: #D97706;
  --color-accent-hover: #B45309;

  --font-heading: var(--font-instrument-serif), Georgia, serif;
  --font-body: var(--font-satoshi), system-ui, sans-serif;

  --shadow-sm: 0 1px 2px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.04);
  --shadow-md: 0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06);
  --shadow-lg: 0 2px 4px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.08);
  --shadow-inset: inset 0 1px 3px rgba(0,0,0,0.06);
}
```

- [ ] **Step 2: Update body to use new font variables**

Replace the `body` rule:

```css
body {
  background-color: var(--color-paper);
  color: var(--color-ink);
  font-family: var(--font-body);
}
```

- [ ] **Step 3: Update Focused theme font overrides**

Replace the `[data-theme="focused"]` block:

```css
[data-theme="focused"] {
  --color-paper: #F7F3EE;
  --color-paper-dark: #E8E0D4;
  --color-ink: #2C2416;
  --color-ink-light: #A89F91;
  --color-accent: #5C4F3D;
  --color-accent-hover: #3D3529;
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.03);
  --shadow-md: 0 1px 2px rgba(0,0,0,0.04);
  --shadow-lg: 0 2px 4px rgba(0,0,0,0.05);
  --shadow-inset: inset 0 1px 2px rgba(0,0,0,0.04);
  --font-heading: var(--font-literata), Georgia, serif;
  --font-body: var(--font-literata), Georgia, serif;
}

[data-theme="focused"] body {
  font-family: var(--font-body);
}
```

- [ ] **Step 4: Update Colorful theme font overrides**

Replace the `[data-theme="colorful"]` block (just the variables and body rule — not the structural overrides):

```css
[data-theme="colorful"] {
  --color-paper: #FFFBE6;
  --color-paper-dark: #FFD6E0;
  --color-ink: #1a1a1a;
  --color-ink-light: #444444;
  --color-accent: #FF3366;
  --color-accent-hover: #E6004C;
  --shadow-sm: 4px 4px 0 #1a1a1a;
  --shadow-md: 6px 6px 0 #1a1a1a;
  --shadow-lg: 8px 8px 0 #1a1a1a;
  --shadow-inset: inset 3px 3px 0 rgba(0,0,0,0.15);
  --font-heading: var(--font-clash-display), system-ui, sans-serif;
  --font-body: var(--font-jetbrains-mono), monospace;
}

[data-theme="colorful"] body {
  font-family: var(--font-body);
  font-weight: 500;
}
```

- [ ] **Step 5: Add heading font-family rule**

Add after the body rules (this applies globally to all headings):

```css
h1, h2, h3, h4 {
  font-family: var(--font-heading);
}
```

- [ ] **Step 6: Verify fonts apply correctly in dev server**

Open the site, check:
1. Default: Instrument Serif headlines, Satoshi body
2. Switch to Focused (via settings): Literata everywhere
3. Switch to Colorful: Clash Display headlines, JetBrains Mono body

- [ ] **Step 7: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: apply distinctive font pairs per theme via CSS variables"
```

---

## Task 4: Update CSS — Shadow System Migration

**Files:**
- Modify: `src/app/globals.css`
- Modify: All component files using `shadow-neu` classes

- [ ] **Step 1: Update dark mode shadow variables in globals.css**

Replace the `[data-dark]` block:

```css
[data-dark] {
  --color-paper: #1C1917;
  --color-paper-dark: #292524;
  --color-ink: #E7E5E4;
  --color-ink-light: #A8A29E;
  --color-accent: #F59E0B;
  --color-accent-hover: #D97706;
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.15);
  --shadow-md: 0 1px 3px rgba(0,0,0,0.2), 0 4px 16px rgba(0,0,0,0.2);
  --shadow-lg: 0 2px 4px rgba(0,0,0,0.2), 0 8px 24px rgba(0,0,0,0.25);
  --shadow-inset: inset 0 2px 4px rgba(0,0,0,0.3);
}
```

- [ ] **Step 2: Update dark + focused shadow variables**

Replace the `[data-dark][data-theme="focused"]` block:

```css
[data-dark][data-theme="focused"] {
  --color-paper: #1A1814;
  --color-paper-dark: #262420;
  --color-ink: #D6D3CD;
  --color-ink-light: #8C857A;
  --color-accent: #A08B6D;
  --color-accent-hover: #7A6B52;
  --shadow-sm: 0 1px 1px rgba(0,0,0,0.15);
  --shadow-md: 0 1px 2px rgba(0,0,0,0.2);
  --shadow-lg: 0 2px 4px rgba(0,0,0,0.25);
  --shadow-inset: inset 0 1px 2px rgba(0,0,0,0.2);
}
```

- [ ] **Step 3: Update dark + colorful shadow variables**

Replace the `[data-dark][data-theme="colorful"]` block:

```css
[data-dark][data-theme="colorful"] {
  --color-paper: #1A1A2E;
  --color-paper-dark: #16213E;
  --color-ink: #E0E0E0;
  --color-ink-light: #9A9A9A;
  --color-accent: #FF3366;
  --color-accent-hover: #E6004C;
  --shadow-sm: 4px 4px 0 rgba(255,255,255,0.15);
  --shadow-md: 6px 6px 0 rgba(255,255,255,0.15);
  --shadow-lg: 8px 8px 0 rgba(255,255,255,0.15);
  --shadow-inset: inset 3px 3px 0 rgba(255,255,255,0.05);
}
```

- [ ] **Step 4: Rename shadow classes in all components**

Search-and-replace across the codebase. Replace in all `.tsx` files in `src/components/` and `src/app/`:

| Old | New |
|-----|-----|
| `shadow-neu-sm` | `shadow-sm` |
| `shadow-neu-inset` | `shadow-inset` |
| `shadow-neu` | `shadow-md` |

Order matters — replace `shadow-neu-sm` and `shadow-neu-inset` before `shadow-neu` to avoid partial matches.

Files to update (all in `src/`):
- `components/Landing.tsx`
- `components/Opening.tsx`
- `components/ContentBlock.tsx`
- `components/InputBar.tsx`
- `components/OnboardingChat.tsx`
- `components/SettingsPanel.tsx`
- `components/SkeletonBlock.tsx`
- `components/JourneyWrapUp.tsx`
- `components/ConversationView.tsx`
- `components/PourOverGame.tsx`
- `components/gamification/ProgressRing.tsx`
- `components/gamification/AchievementToast.tsx`
- `app/s/[id]/SharedSessionView.tsx`

- [ ] **Step 5: Remove old dark body::before opacity rule**

Delete the `[data-dark] body::before` rule (texture opacity will be handled per-theme in Task 7).

- [ ] **Step 6: Verify no remaining `shadow-neu` references in src/**

```bash
grep -r "shadow-neu" src/
```

Expected: No matches.

- [ ] **Step 7: Verify site renders correctly with new shadows**

Open the dev server, check all three themes + dark mode. Cards should have soft single-source shadows (default), minimal shadows (focused), hard shadows (colorful).

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: replace neumorphic shadows with modern layered elevation system"
```

---

## Task 5: Update CSS — Colorful Theme Palette & Texture System

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Update colorful stat block rotation to 3-color cycle**

Replace all the `[data-theme="colorful"] .bg-paper.rounded-xl.text-center:nth-child(...)` rules with a 3-color rotation:

```css
[data-theme="colorful"] .bg-paper.rounded-xl.text-center {
  border: 2.5px solid #1a1a1a;
}

[data-theme="colorful"] .bg-paper.rounded-xl.text-center:nth-child(3n+1) {
  background: #FF3366;
  color: white;
}
[data-theme="colorful"] .bg-paper.rounded-xl.text-center:nth-child(3n+1) .text-accent,
[data-theme="colorful"] .bg-paper.rounded-xl.text-center:nth-child(3n+1) .text-ink-light {
  color: rgba(255,255,255,0.85);
}

[data-theme="colorful"] .bg-paper.rounded-xl.text-center:nth-child(3n+2) {
  background: #EBFF00;
  color: #1a1a1a;
}
[data-theme="colorful"] .bg-paper.rounded-xl.text-center:nth-child(3n+2) .text-accent {
  color: #1a1a1a;
}

[data-theme="colorful"] .bg-paper.rounded-xl.text-center:nth-child(3n+3) {
  background: #7B61FF;
  color: white;
}
[data-theme="colorful"] .bg-paper.rounded-xl.text-center:nth-child(3n+3) .text-accent,
[data-theme="colorful"] .bg-paper.rounded-xl.text-center:nth-child(3n+3) .text-ink-light {
  color: rgba(255,255,255,0.85);
}
```

- [ ] **Step 2: Update colorful tag rotation to 3-color cycle**

Replace all the `[data-theme="colorful"] .rounded-lg.bg-paper:nth-child(...)` rules:

```css
[data-theme="colorful"] .rounded-lg.bg-paper {
  border: 2px solid #1a1a1a;
  font-weight: 600;
}
[data-theme="colorful"] .rounded-lg.bg-paper:nth-child(3n+1) {
  background: #FF3366;
  color: white;
}
[data-theme="colorful"] .rounded-lg.bg-paper:nth-child(3n+2) {
  background: #EBFF00;
  color: #1a1a1a;
}
[data-theme="colorful"] .rounded-lg.bg-paper:nth-child(3n+3) {
  background: #7B61FF;
  color: white;
}
```

- [ ] **Step 3: Update default paper texture opacity**

In the `body::before` rule, change `opacity: 0.03` to `opacity: 0.05`.

- [ ] **Step 4: Fix focused theme line spacing to match line-height**

In `[data-theme="focused"] body::before`, change the line spacing from 28px to 26px:

```css
[data-theme="focused"] body::before {
  opacity: 0.04;
  background-image:
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 25px,
      rgba(0,0,0,0.12) 25px,
      rgba(0,0,0,0.12) 26px
    );
}
```

- [ ] **Step 5: Add film grain texture for colorful theme**

Replace `[data-theme="colorful"] body::before { display: none; }` with:

```css
[data-theme="colorful"] body::before {
  opacity: 0.06;
  mix-blend-mode: multiply;
  background-image: url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)'/%3E%3C/svg%3E");
}
```

- [ ] **Step 6: Verify textures in all three themes**

Open dev server:
1. Default: Slightly more visible paper grain
2. Focused: Lines at correct spacing
3. Colorful: Visible film grain overlay

- [ ] **Step 7: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: update colorful palette to 3-color rotation, refine textures per theme"
```

---

## Task 6: Add CSS for Gradient Border Sweep & View Transitions

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add @property for animated angle**

Add at the top of `globals.css` (after the `@import`):

```css
@property --border-angle {
  syntax: "<angle>";
  initial-value: 0deg;
  inherits: false;
}
```

- [ ] **Step 2: Add gradient border sweep animation**

```css
@keyframes border-sweep {
  to { --border-angle: 360deg; }
}

.input-border-sweep {
  position: relative;
}

.input-border-sweep::before {
  content: "";
  position: absolute;
  inset: -1px;
  border-radius: 15px;
  background: conic-gradient(from var(--border-angle), transparent 60%, var(--color-accent) 100%);
  animation: border-sweep 2s linear infinite;
  z-index: -1;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.input-border-sweep.active::before {
  opacity: 1;
}
```

- [ ] **Step 3: Add View Transitions CSS**

```css
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 0.3s;
  animation-timing-function: ease-in-out;
}

::view-transition-old(root) {
  animation-name: fade-out;
}

::view-transition-new(root) {
  animation-name: fade-in;
}

@keyframes fade-out {
  from { opacity: 1; }
  to { opacity: 0.6; }
}

@keyframes fade-in {
  from { opacity: 0.6; }
  to { opacity: 1; }
}
```

- [ ] **Step 4: Add typing indicator animation**

```css
@keyframes typing-bounce {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-4px); }
}

.typing-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--color-accent);
  animation: typing-bounce 1.2s ease-in-out infinite;
}

.typing-dot:nth-child(2) { animation-delay: 0.15s; }
.typing-dot:nth-child(3) { animation-delay: 0.3s; }
```

- [ ] **Step 5: Add reduced motion support**

```css
@media (prefers-reduced-motion: reduce) {
  .input-border-sweep::before {
    animation: none;
    opacity: 0;
  }

  .typing-dot {
    animation: none;
  }

  ::view-transition-old(root),
  ::view-transition-new(root) {
    animation-duration: 0.01s;
  }

  [data-theme="colorful"] body::before {
    animation: none;
  }
}
```

- [ ] **Step 6: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: add CSS for gradient border sweep, view transitions, typing indicator"
```

---

## Task 7: Update ThemeApplicator — View Transitions API

**Files:**
- Modify: `src/app/ThemeApplicator.tsx`

- [ ] **Step 1: Add View Transitions support**

Replace `src/app/ThemeApplicator.tsx`:

```typescript
"use client";

import { useEffect, useRef } from "react";
import { usePreferences } from "@/lib/preferences";

export default function ThemeApplicator({ children }: { children: React.ReactNode }) {
  const { preferences } = usePreferences();
  const isFirstRender = useRef(true);

  useEffect(() => {
    const html = document.documentElement;

    function applyTheme() {
      if (preferences?.visualStyle) {
        html.setAttribute("data-theme", preferences.visualStyle);
      } else {
        html.removeAttribute("data-theme");
      }

      if (preferences?.darkMode) {
        html.setAttribute("data-dark", "");
      } else {
        html.removeAttribute("data-dark");
      }
    }

    // Skip View Transition on first render
    if (isFirstRender.current) {
      isFirstRender.current = false;
      applyTheme();
      return;
    }

    // Use View Transitions API if supported
    if (document.startViewTransition) {
      document.startViewTransition(applyTheme);
    } else {
      applyTheme();
    }
  }, [preferences?.visualStyle, preferences?.darkMode]);

  return <>{children}</>;
}
```

- [ ] **Step 2: Verify theme switching uses crossfade**

Open dev server, switch between themes in settings. In Chrome/Edge, you should see a brief crossfade. In Safari/Firefox without support, it falls back to instant swap (no error).

- [ ] **Step 3: Commit**

```bash
git add src/app/ThemeApplicator.tsx
git commit -m "feat: add View Transitions API for smooth theme switching"
```

---

## Task 8: Hero Landing — Staggered Cascade Animation

**Files:**
- Modify: `src/components/Landing.tsx`
- Modify: `src/components/Opening.tsx`

- [ ] **Step 1: Rewrite Landing.tsx with staggered cascade**

Replace `src/components/Landing.tsx`:

```typescript
"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

interface LandingProps {
  onStartJourney: () => void;
}

export default function Landing({ onStartJourney }: LandingProps) {
  return (
    <section className="pb-8 pt-20 text-center">
      {/* Photo — spring scale */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="mx-auto mb-6 max-w-md overflow-hidden rounded-2xl shadow-md"
      >
        <Image
          src="/Max_tafel.jpg"
          alt="Max Marowsky in front of a chalkboard with <Max> in chalk"
          width={600}
          height={400}
          className="h-auto w-full object-cover"
          priority
        />
      </motion.div>

      {/* Name — clip-path reveal */}
      <motion.h1
        initial={{ clipPath: "inset(0 100% 0 0)" }}
        animate={{ clipPath: "inset(0 0% 0 0)" }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
        className="font-heading text-4xl font-bold text-ink"
      >
        Max Marowsky
      </motion.h1>

      {/* Tagline — fade in */}
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.6 }}
        className="mt-2 text-ink-light"
      >
        Product Manager · Founder · EdTech
      </motion.p>

      {/* Buttons — stagger */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.1, delayChildren: 0.8 } },
        }}
        className="mx-auto mt-8 flex max-w-sm flex-col gap-3 sm:flex-row sm:justify-center"
      >
        <motion.button
          variants={{
            hidden: { opacity: 0, y: 12 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onStartJourney}
          className="w-full rounded-xl bg-accent px-6 py-3 text-base font-semibold text-white shadow-sm transition-shadow hover:shadow-md sm:flex-1"
        >
          Get to know me
        </motion.button>
        <Link href="/cv" className="w-full sm:flex-1">
          <motion.span
            variants={{
              hidden: { opacity: 0, y: 12 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-block w-full rounded-xl border border-accent/30 bg-paper px-6 py-3 text-center text-base font-semibold text-accent shadow-sm transition-shadow hover:shadow-md"
          >
            View Resume
          </motion.span>
        </Link>
      </motion.div>
    </section>
  );
}
```

- [ ] **Step 2: Update Opening.tsx with same stagger pattern**

Replace `src/components/Opening.tsx`:

```typescript
"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { usePreferences } from "@/lib/preferences";
import { FOCUS_STARTER_HOOKS, ROOT_HOOKS } from "@/lib/content-graph";

interface OpeningProps {
  onHookClick: (targetId: string) => void;
  visible: boolean;
}

export default function Opening({ onHookClick, visible }: OpeningProps) {
  const { preferences } = usePreferences();

  if (!visible) return null;

  const hooks = preferences?.contentFocus
    ? FOCUS_STARTER_HOOKS[preferences.contentFocus]
    : ROOT_HOOKS;

  return (
    <section className="pb-8 pt-20 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="mx-auto mb-6 max-w-md overflow-hidden rounded-2xl shadow-md"
      >
        <Image
          src="/Max_tafel.jpg"
          alt="Max Marowsky in front of a chalkboard with <Max> in chalk"
          width={600}
          height={400}
          className="h-auto w-full object-cover"
          priority
        />
      </motion.div>

      <motion.h1
        initial={{ clipPath: "inset(0 100% 0 0)" }}
        animate={{ clipPath: "inset(0 0% 0 0)" }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
        className="font-heading text-4xl font-bold text-ink"
      >
        Max Marowsky
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.6 }}
        className="mt-2 text-ink-light"
      >
        Product Manager · Founder · EdTech
      </motion.p>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.7 }}
        className="mt-6 text-lg text-ink"
      >
        Get to know me. Just ask.
      </motion.p>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.06, delayChildren: 0.85 } },
        }}
        className="mx-auto mt-6 flex max-w-md flex-wrap justify-center gap-2"
      >
        {hooks.map((hook) => (
          <motion.button
            key={hook.label}
            variants={{
              hidden: { opacity: 0, y: 12 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onHookClick(hook.targetId)}
            className="rounded-xl border border-accent/20 bg-paper px-4 py-2 text-sm text-accent shadow-sm transition-shadow hover:shadow-md"
          >
            {hook.label}
          </motion.button>
        ))}
      </motion.div>
    </section>
  );
}
```

- [ ] **Step 3: Add `font-heading` utility to Tailwind**

In `globals.css`, add after the `h1, h2, h3, h4` rule:

```css
.font-heading {
  font-family: var(--font-heading);
}
```

- [ ] **Step 4: Verify hero animation**

Open the landing page. Should see: Photo springs in → Name reveals left-to-right → Tagline fades → Buttons stagger in.

- [ ] **Step 5: Commit**

```bash
git add src/components/Landing.tsx src/components/Opening.tsx src/app/globals.css
git commit -m "feat: add staggered hero animation with spring physics and clip-path reveal"
```

---

## Task 9: Content Blocks — Scroll-Triggered Entry & Spring Hooks

**Files:**
- Modify: `src/components/ContentBlock.tsx`
- Modify: `src/components/RichElements.tsx`

- [ ] **Step 1: Rewrite ContentBlock.tsx with useInView and spring hooks**

Replace `src/components/ContentBlock.tsx`:

```typescript
"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import type { ContentBlockData, HookSuggestion } from "@/lib/types";
import RichElement from "./RichElements";
import { CONTENT_GRAPH } from "@/lib/content-graph";

interface ContentBlockProps {
  block: ContentBlockData;
  onHookClick: (targetIdOrQuestion: string, isNodeId: boolean) => void;
  isReadOnly?: boolean;
  unlockedGems?: Set<string>;
}

export default function ContentBlock({ block, onHookClick, isReadOnly = false, unlockedGems }: ContentBlockProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const isGemBlock = block.id.startsWith("gem-");
  const gemNode = isGemBlock ? CONTENT_GRAPH[block.id] : null;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`rounded-2xl p-6 shadow-md sm:p-8 transition-shadow hover:shadow-lg hover:-translate-y-0.5 ${
        isGemBlock ? "bg-amber-50/50 border border-amber-200/30" : "bg-white"
      }`}
    >
      <div className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-light">
        {gemNode?.gemTitle ?? block.questionTitle}
      </div>
      {gemNode?.gemIntro && (
        <p className="mb-3 text-sm italic text-amber-700/70">{gemNode.gemIntro}</p>
      )}
      <p className="leading-relaxed text-ink">{block.text}</p>
      {block.richType && block.richData && (
        <RichElement richType={block.richType} richData={block.richData} />
      )}
      {!isReadOnly && block.hooks.length > 0 && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.05, delayChildren: 0.2 } },
          }}
          className="mt-5 flex flex-wrap gap-2"
        >
          {block.hooks.map((hook) => (
            <HookChip
              key={hook.label}
              hook={hook}
              onClick={() => onHookClick(hook.targetId ?? hook.question, !!hook.targetId)}
              isGem={!!unlockedGems?.has(hook.targetId ?? "")}
            />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}

function HookChip({ hook, onClick, isGem = false }: { hook: HookSuggestion; onClick: () => void; isGem?: boolean }) {
  return (
    <motion.button
      variants={{
        hidden: { opacity: 0, y: 8 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`rounded-xl border px-4 py-2 text-sm transition-shadow hover:shadow-sm ${
        isGem
          ? "border-amber-400/40 bg-amber-50 text-amber-700 font-medium animate-shimmer"
          : "border-accent/20 bg-paper text-accent"
      }`}
    >
      {hook.label} →
    </motion.button>
  );
}
```

- [ ] **Step 2: Add stagger to RichElements.tsx Stats and Tags**

In `src/components/RichElements.tsx`, update the `Stats` function:

```typescript
function Stats({ items }: { items: StatItem[] }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.08 } },
      }}
      className="mt-4 flex gap-3"
    >
      {items.map((item) => (
        <motion.div
          key={item.label}
          variants={{
            hidden: { opacity: 0, y: 8 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="flex-1 rounded-xl bg-paper p-3 text-center"
        >
          <div className="text-lg font-bold text-accent">{item.value}</div>
          <div className="text-xs text-ink-light">{item.label}</div>
        </motion.div>
      ))}
    </motion.div>
  );
}
```

Update the `Tags` function similarly:

```typescript
function Tags({ data }: { data: TagsData }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.04 } },
      }}
      className="mt-4 flex flex-wrap gap-2"
    >
      {data.tags.map((tag) => (
        <motion.span
          key={tag}
          variants={{
            hidden: { opacity: 0, scale: 0.9 },
            visible: { opacity: 1, scale: 1 },
          }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="rounded-lg bg-paper px-3 py-1 text-xs text-ink-light"
        >
          {tag}
        </motion.span>
      ))}
    </motion.div>
  );
}
```

Add the `motion` import at the top of `RichElements.tsx`:

```typescript
import { motion } from "framer-motion";
```

- [ ] **Step 3: Verify content blocks animate on scroll**

Open the conversation, navigate a few topics. Blocks should spring into view as you scroll. Hook chips should stagger in.

- [ ] **Step 4: Commit**

```bash
git add src/components/ContentBlock.tsx src/components/RichElements.tsx
git commit -m "feat: add scroll-triggered entry and staggered spring animations to content blocks"
```

---

## Task 10: Input Bar Redesign

**Files:**
- Modify: `src/components/InputBar.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add --paper-rgb CSS variable for glassmorphism**

In `globals.css` `@theme` block, add:

```css
--paper-rgb: 250, 246, 241;
```

In the `[data-dark]` block, add:

```css
--paper-rgb: 28, 25, 23;
```

In `[data-dark][data-theme="focused"]`, add:

```css
--paper-rgb: 26, 24, 20;
```

In `[data-dark][data-theme="colorful"]`, add:

```css
--paper-rgb: 26, 26, 46;
```

- [ ] **Step 2: Rewrite InputBar.tsx**

Replace `src/components/InputBar.tsx`:

```typescript
"use client";

import { useState } from "react";

interface InputBarProps {
  onSubmit: (question: string) => void;
  disabled: boolean;
}

export default function InputBar({ onSubmit, disabled }: InputBarProps) {
  const [input, setInput] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
    setInput("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="fixed bottom-0 left-0 right-0 z-20 px-4 pb-[env(safe-area-inset-bottom,8px)] pt-3 no-print"
      style={{
        background: `rgba(var(--paper-rgb), 0.7)`,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderTop: "1px solid rgba(0,0,0,0.04)",
      }}
    >
      <div className="mx-auto flex max-w-3xl gap-2">
        <div className={`input-border-sweep flex-1 ${disabled ? "active" : ""}`}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={disabled ? "Thinking..." : "Ask me anything..."}
            disabled={disabled}
            className="w-full rounded-[14px] bg-white/80 px-4 py-3 text-sm text-ink shadow-sm placeholder:text-ink-light/50 focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-60"
            style={{ border: "1px solid rgba(0,0,0,0.06)" }}
          />
        </div>
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className="flex items-center justify-center rounded-[14px] bg-accent px-4 py-3 text-white shadow-sm transition-colors hover:bg-accent-hover disabled:opacity-40"
        >
          {disabled ? (
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2v4m0 12v4m-7.07-3.93l2.83-2.83m8.48-8.48l2.83-2.83M2 12h4m12 0h4m-3.93 7.07l-2.83-2.83M7.76 7.76L4.93 4.93" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 19V5M5 12l7-7 7 7"/>
            </svg>
          )}
        </button>
      </div>
    </form>
  );
}
```

- [ ] **Step 3: Verify input bar visuals**

Open the conversation view. Input bar should have blurred background, SVG arrow icon. When AI is thinking, gradient border should sweep around input and spinner should show on button.

- [ ] **Step 4: Commit**

```bash
git add src/components/InputBar.tsx src/app/globals.css
git commit -m "feat: redesign input bar with glassmorphism, gradient border sweep, and SVG icons"
```

---

## Task 11: Settings Panel → Bottom Drawer

**Files:**
- Modify: `src/components/SettingsPanel.tsx`

- [ ] **Step 1: Rewrite SettingsPanel.tsx as Bottom Drawer**

Replace `src/components/SettingsPanel.tsx`:

```typescript
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useDragControls, PanInfo } from "framer-motion";
import { usePreferences } from "@/lib/preferences";
import type { VisualStyle, InfoDepth, ContentFocus } from "@/lib/types";

const VISUAL_OPTIONS: { value: VisualStyle; label: string }[] = [
  { value: "focused", label: "Focused" },
  { value: "colorful", label: "Colorful" },
];

const DEPTH_OPTIONS: { value: InfoDepth; label: string }[] = [
  { value: "overview", label: "Overview" },
  { value: "deep-dive", label: "Deep Dive" },
];

const FOCUS_OPTIONS: { value: ContentFocus; label: string }[] = [
  { value: "product-builder", label: "Product Builder" },
  { value: "learning-scientist", label: "Learning Scientist" },
  { value: "ai-vision", label: "AI & Vision" },
  { value: "max-personal", label: "Max as a person" },
];

function ThemePreview({ theme }: { theme: "focused" | "colorful" }) {
  if (theme === "focused") {
    return (
      <div className="h-8 w-12 overflow-hidden rounded border border-[rgba(0,0,0,0.1)]" style={{ background: "#F7F3EE" }}>
        <div style={{ padding: "3px 4px" }}>
          <div style={{ height: 2, width: "80%", background: "#2C2416", borderRadius: 1, marginBottom: 2 }} />
          <div style={{ height: 1.5, width: "60%", background: "#A89F91", borderRadius: 1, marginBottom: 2 }} />
          <div style={{ height: 1.5, width: "70%", background: "#A89F91", borderRadius: 1 }} />
        </div>
      </div>
    );
  }
  return (
    <div className="h-8 w-12 overflow-hidden rounded" style={{ background: "#FFFBE6", border: "2px solid #1a1a1a" }}>
      <div style={{ padding: "2px 3px" }}>
        <div style={{ height: 3, width: "70%", background: "#FF3366", borderRadius: 1, marginBottom: 2 }} />
        <div style={{ display: "flex", gap: 2 }}>
          <div style={{ height: 6, flex: 1, background: "#EBFF00", border: "1px solid #1a1a1a", borderRadius: 2 }} />
          <div style={{ height: 6, flex: 1, background: "#7B61FF", border: "1px solid #1a1a1a", borderRadius: 2 }} />
        </div>
      </div>
    </div>
  );
}

export default function SettingsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { preferences, updatePreference, isOnboarded } = usePreferences();
  const dragControls = useDragControls();

  useEffect(() => {
    if (!isOpen) return;
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen]);

  if (!isOnboarded || !preferences) return null;

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.y > 100) setIsOpen(false);
  }

  return (
    <>
      {/* Gear trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="no-print fixed bottom-20 right-4 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink-light shadow-sm transition-all hover:shadow-md"
        aria-label="Personalization settings"
      >
        <motion.svg
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
          <circle cx="12" cy="12" r="3"/>
        </motion.svg>
      </button>

      {/* Bottom Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
              className="no-print fixed inset-0 z-40 bg-black/30"
              style={{ backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }}
            />

            {/* Drawer */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              drag="y"
              dragControls={dragControls}
              dragConstraints={{ top: 0 }}
              dragElastic={0.1}
              onDragEnd={handleDragEnd}
              className="no-print fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-md rounded-t-[20px] bg-white shadow-lg"
              style={{ paddingBottom: "env(safe-area-inset-bottom, 16px)" }}
              role="dialog"
              aria-modal="true"
              aria-label="Personalization settings"
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="h-1 w-10 rounded-full bg-ink-light/20" />
              </div>

              <div className="px-6 pb-6 pt-2">
                <div className="mb-5 text-xs font-medium uppercase tracking-wide text-ink-light">
                  Personalization
                </div>

                {/* Style */}
                <div className="mb-5">
                  <div className="mb-2 text-xs text-ink-light">Style</div>
                  <div className="flex gap-2">
                    {VISUAL_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => updatePreference("visualStyle", opt.value)}
                        className={`flex flex-1 items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs transition-colors ${
                          preferences.visualStyle === opt.value
                            ? "bg-accent text-white"
                            : "bg-paper text-ink-light hover:text-ink"
                        }`}
                      >
                        {preferences.visualStyle !== opt.value && <ThemePreview theme={opt.value} />}
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mode */}
                <div className="mb-5">
                  <div className="mb-2 text-xs text-ink-light">Mode</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updatePreference("darkMode", false)}
                      className={`flex-1 rounded-xl px-3 py-2.5 text-xs transition-colors ${
                        !preferences.darkMode ? "bg-accent text-white" : "bg-paper text-ink-light hover:text-ink"
                      }`}
                    >
                      Light
                    </button>
                    <button
                      onClick={() => updatePreference("darkMode", true)}
                      className={`flex-1 rounded-xl px-3 py-2.5 text-xs transition-colors ${
                        preferences.darkMode ? "bg-accent text-white" : "bg-paper text-ink-light hover:text-ink"
                      }`}
                    >
                      Dark
                    </button>
                  </div>
                </div>

                {/* Depth */}
                <div className="mb-5">
                  <div className="mb-2 text-xs text-ink-light">Depth</div>
                  <div className="flex gap-2">
                    {DEPTH_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => updatePreference("infoDepth", opt.value)}
                        className={`flex-1 rounded-xl px-3 py-2.5 text-xs transition-colors ${
                          preferences.infoDepth === opt.value
                            ? "bg-accent text-white"
                            : "bg-paper text-ink-light hover:text-ink"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Focus */}
                <div className="mb-5">
                  <div className="mb-2 text-xs text-ink-light">Focus</div>
                  <div className="grid grid-cols-2 gap-2">
                    {FOCUS_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => updatePreference("contentFocus", opt.value)}
                        className={`rounded-xl px-3 py-2.5 text-xs transition-colors ${
                          preferences.contentFocus === opt.value
                            ? "bg-accent text-white"
                            : "bg-paper text-ink-light hover:text-ink"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Gamification */}
                <div className="border-t border-paper-dark pt-5">
                  <div className="mb-2 text-xs text-ink-light">Gamification</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updatePreference("gamified", true)}
                      className={`flex-1 rounded-xl px-3 py-2.5 text-xs transition-colors ${
                        preferences.gamified ? "bg-accent text-white" : "bg-paper text-ink-light hover:text-ink"
                      }`}
                    >
                      On
                    </button>
                    <button
                      onClick={() => updatePreference("gamified", false)}
                      className={`flex-1 rounded-xl px-3 py-2.5 text-xs transition-colors ${
                        !preferences.gamified ? "bg-accent text-white" : "bg-paper text-ink-light hover:text-ink"
                      }`}
                    >
                      Off
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
```

- [ ] **Step 2: Verify drawer behavior**

Test: gear icon opens drawer from bottom with spring animation. Backdrop blur shows. Drag down to dismiss. Esc to close. Theme previews visible next to unselected style options. Gear rotates when open.

- [ ] **Step 3: Commit**

```bash
git add src/components/SettingsPanel.tsx
git commit -m "feat: replace settings popover with bottom drawer + theme previews"
```

---

## Task 12: Onboarding Polish — Typing Indicator & Theme Previews

**Files:**
- Modify: `src/components/OnboardingChat.tsx`

- [ ] **Step 1: Rewrite OnboardingChat.tsx with typing indicator and previews**

Replace `src/components/OnboardingChat.tsx`:

```typescript
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { UserPreferences, VisualStyle, InfoDepth, ContentFocus } from "@/lib/types";

interface OnboardingChatProps {
  onComplete: (prefs: UserPreferences) => void;
  onSkip: () => void;
}

interface ChatMessage {
  type: "bot" | "user" | "typing";
  text: string;
}

type OnboardingStep = "visual-style" | "dark-mode" | "info-depth" | "content-focus" | "gamification" | "done";

function StylePreview({ type }: { type: "focused" | "colorful" }) {
  if (type === "focused") {
    return (
      <div className="mt-2 w-full overflow-hidden rounded-lg" style={{ height: 48, background: "#F7F3EE", border: "1px solid #E8E0D4" }}>
        <div style={{ padding: "8px 12px" }}>
          <div style={{ height: 3, width: "60%", background: "#2C2416", borderRadius: 2, marginBottom: 4, fontFamily: "Georgia" }} />
          <div style={{ height: 2, width: "80%", background: "#A89F91", borderRadius: 1, marginBottom: 3 }} />
          <div style={{ height: 2, width: "65%", background: "#A89F91", borderRadius: 1 }} />
        </div>
      </div>
    );
  }
  return (
    <div className="mt-2 w-full overflow-hidden rounded-lg" style={{ height: 48, background: "#FFFBE6", border: "2.5px solid #1a1a1a" }}>
      <div style={{ padding: "6px 10px" }}>
        <div style={{ height: 4, width: "50%", background: "#FF3366", borderRadius: 2, marginBottom: 4 }} />
        <div style={{ display: "flex", gap: 4 }}>
          <div style={{ height: 10, flex: 1, background: "#EBFF00", border: "1.5px solid #1a1a1a", borderRadius: 3 }} />
          <div style={{ height: 10, flex: 1, background: "#7B61FF", border: "1.5px solid #1a1a1a", borderRadius: 3 }} />
        </div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="inline-flex items-center gap-1 rounded-2xl bg-white px-4 py-3 shadow-sm">
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
    </div>
  );
}

const STEP_CONFIG = {
  "visual-style": {
    question: "Before we start — how do you prefer to take in information?",
    options: [
      { label: "Focused & clean", value: "focused" as VisualStyle, description: "Minimal, paper-like, typography-driven", preview: "focused" as const },
      { label: "Bold & colorful", value: "colorful" as VisualStyle, description: "Expressive, energetic, neo-brutalist", preview: "colorful" as const },
    ],
  },
  "dark-mode": {
    question: "Light or darkness?",
    options: [
      { label: "Light", value: "light", description: "Warm paper tones, easy on the eyes" },
      { label: "Darkness", value: "dark", description: "Dark background, softer glow" },
    ],
  },
  "info-depth": {
    question: "Do you prefer a quick overview or a deeper dive?",
    options: [
      { label: "Quick overview", value: "overview" as InfoDepth, description: "Concise, scannable, information-dense" },
      { label: "Deep dive", value: "deep-dive" as InfoDepth, description: "Storytelling, context, full picture" },
    ],
  },
  "content-focus": {
    question: "What are you most curious about?",
    options: [
      { label: "Product Builder", value: "product-builder" as ContentFocus, description: "Startup, shipping, PM craft" },
      { label: "Learning Scientist", value: "learning-scientist" as ContentFocus, description: "Education theory, research" },
      { label: "AI & Vision", value: "ai-vision" as ContentFocus, description: "Claude, AI in education, future" },
      { label: "Max as a person", value: "max-personal" as ContentFocus, description: "Motivation, values, personality" },
    ],
  },
  "gamification": {
    question: "Would you like to gamify your experience?",
    options: [
      { label: "Yes, track my progress", value: "yes", description: "Discovery tracking, milestones & hidden content" },
      { label: "No thanks", value: "no", description: "Classic experience without gamification" },
    ],
  },
};

const STEPS: OnboardingStep[] = ["visual-style", "dark-mode", "info-depth", "content-focus", "gamification"];

export default function OnboardingChat({ onComplete, onSkip }: OnboardingChatProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([{ type: "typing", text: "" }]);
  const [selections, setSelections] = useState<Partial<UserPreferences>>({});
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [showOptions, setShowOptions] = useState(false);

  // Show first message after typing indicator
  useEffect(() => {
    const timer = setTimeout(() => {
      setMessages([{ type: "bot", text: STEP_CONFIG["visual-style"].question }]);
      setIsTransitioning(false);
      setTimeout(() => setShowOptions(true), 200);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const step = STEPS[currentStep] as Exclude<OnboardingStep, "done"> | undefined;
  const config = step && step in STEP_CONFIG ? STEP_CONFIG[step as keyof typeof STEP_CONFIG] : null;

  function handleSelect(value: string, label: string) {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setShowOptions(false);

    setMessages((prev) => [...prev, { type: "user", text: label }]);

    const key = step === "visual-style" ? "visualStyle"
      : step === "dark-mode" ? "darkMode"
      : step === "info-depth" ? "infoDepth"
      : step === "gamification" ? "gamified"
      : "contentFocus";
    const resolvedValue = step === "gamification" ? value === "yes"
      : step === "dark-mode" ? value === "dark"
      : value;
    const newSelections = { ...selections, [key]: resolvedValue };
    setSelections(newSelections);

    setTimeout(() => {
      const nextStep = currentStep + 1;

      if (nextStep >= STEPS.length) {
        setMessages((prev) => [...prev, { type: "typing", text: "" }]);
        setTimeout(() => {
          setMessages((prev) => [
            ...prev.filter((m) => m.type !== "typing"),
            { type: "bot", text: "Perfect — I'll tailor everything for you." },
          ]);
          setTimeout(() => onComplete(newSelections as UserPreferences), 800);
        }, 600);
      } else {
        // Show typing indicator
        setMessages((prev) => [...prev, { type: "typing", text: "" }]);
        setTimeout(() => {
          const nextConfig = STEP_CONFIG[STEPS[nextStep] as keyof typeof STEP_CONFIG];
          setMessages((prev) => [
            ...prev.filter((m) => m.type !== "typing"),
            { type: "bot", text: nextConfig.question },
          ]);
          setCurrentStep(nextStep);
          setIsTransitioning(false);
          setTimeout(() => setShowOptions(true), 200);
        }, 600);
      }
    }, 300);
  }

  const isContentFocusStep = step === "content-focus";

  return (
    <div className="pb-8 pt-20">
      <div className="mx-auto max-w-lg">
        <div className="space-y-3">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={`${i}-${msg.type}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className={msg.type === "user" ? "text-right" : "text-left"}
              >
                {msg.type === "typing" ? (
                  <TypingIndicator />
                ) : (
                  <div
                    className={`inline-block rounded-2xl px-4 py-3 text-sm ${
                      msg.type === "bot"
                        ? "bg-white text-ink shadow-sm"
                        : "bg-accent text-white"
                    }`}
                  >
                    {msg.text}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {showOptions && config && (
            <motion.div
              key={step}
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
              }}
              className={`mt-4 ${isContentFocusStep ? "grid grid-cols-2 gap-2" : "flex gap-2"}`}
            >
              {config.options.map((opt) => (
                <motion.button
                  key={opt.value}
                  variants={{
                    hidden: { opacity: 0, y: 8 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  onClick={() => handleSelect(opt.value, opt.label)}
                  className={`rounded-xl border border-accent/40 bg-paper px-4 py-2.5 text-left text-sm shadow-sm transition-all hover:border-accent hover:shadow-md active:shadow-inset ${
                    isContentFocusStep ? "" : "flex-1"
                  }`}
                >
                  <span className="font-semibold text-accent">{opt.label}</span>
                  <span className="ml-1.5 text-ink-light">— {opt.description}</span>
                  {"preview" in opt && opt.preview && <StylePreview type={opt.preview} />}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {currentStep === 0 && !isTransitioning && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            onClick={onSkip}
            className="mt-6 block text-xs text-ink hover:text-accent"
          >
            Skip personalization →
          </motion.button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify onboarding flow**

Open the site fresh (clear preferences). Start journey. Should see:
1. Typing dots appear briefly before first question
2. Theme options show mini previews inline
3. Options stagger in with spring
4. After selection, user bubble appears, typing dots, then next question
5. Content focus step uses 2x2 grid layout

- [ ] **Step 3: Commit**

```bash
git add src/components/OnboardingChat.tsx
git commit -m "feat: add typing indicator, theme previews, and spring animations to onboarding"
```

---

## Task 13: Update SkeletonBlock

**Files:**
- Modify: `src/components/SkeletonBlock.tsx`

- [ ] **Step 1: Update shadow class**

Replace `src/components/SkeletonBlock.tsx`:

```typescript
"use client";

export default function SkeletonBlock() {
  return (
    <div className="animate-pulse rounded-2xl bg-white p-6 shadow-md sm:p-8">
      <div className="mb-3 h-3 w-24 rounded bg-paper-dark/40" />
      <div className="space-y-2.5">
        <div className="h-4 w-full rounded bg-paper-dark/30" />
        <div className="h-4 w-5/6 rounded bg-paper-dark/30" />
        <div className="h-4 w-4/6 rounded bg-paper-dark/30" />
      </div>
      <div className="mt-5 flex gap-2">
        <div className="h-9 w-32 rounded-xl bg-paper-dark/20" />
        <div className="h-9 w-28 rounded-xl bg-paper-dark/20" />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/SkeletonBlock.tsx
git commit -m "feat: update skeleton block with modern shadows and improved pulse styling"
```

---

## Task 14: Update Remaining Components — Shadow & Font Classes

**Files:**
- Modify: `src/components/JourneyWrapUp.tsx`
- Modify: `src/components/ConversationView.tsx`
- Modify: `src/components/PourOverGame.tsx`
- Modify: `src/components/gamification/AchievementToast.tsx`
- Modify: `src/components/gamification/ProgressRing.tsx`
- Modify: `src/app/s/[id]/SharedSessionView.tsx`

- [ ] **Step 1: Update JourneyWrapUp.tsx**

Replace `shadow-neu` with `shadow-md` and `shadow-neu-sm` with `shadow-sm` throughout. Update `font-serif` to `font-heading` for the "Curious?" heading.

In the card wrapper: change `shadow-neu` → `shadow-md`.
In achievement badges: change `shadow-neu-sm` → `shadow-sm`.

- [ ] **Step 2: Update ConversationView.tsx**

Replace the profile image shadow: `shadow-neu-sm` → `shadow-sm`.

- [ ] **Step 3: Update PourOverGame.tsx**

Replace any `shadow-neu` or `shadow-neu-sm` references with `shadow-md` and `shadow-sm`.

- [ ] **Step 4: Update AchievementToast.tsx**

Replace `shadow-neu` → `shadow-md`.

- [ ] **Step 5: Update ProgressRing.tsx**

Replace any `shadow-neu-sm` → `shadow-sm`.

- [ ] **Step 6: Update SharedSessionView.tsx**

Replace any `shadow-neu` or `shadow-neu-sm` references with `shadow-md` and `shadow-sm`.

- [ ] **Step 7: Replace `font-serif` with `font-heading` in all components**

Search all component files for `font-serif` class usage and replace with `font-heading` where it's used for headings (not body text). This ensures headings use the theme-appropriate heading font.

Files to check: Landing.tsx, Opening.tsx, JourneyWrapUp.tsx, ContentBlock.tsx, RichElements.tsx (Citation component).

- [ ] **Step 8: Verify no remaining `shadow-neu` or old `font-serif` heading references**

```bash
grep -r "shadow-neu" src/
grep -r "font-serif" src/components/ src/app/
```

Expected: No matches for `shadow-neu`. `font-serif` may remain in RichElements Citation (body text — that's fine) and CVDocument (separate design system — fine).

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: update remaining components with new shadow classes and heading font"
```

---

## Task 15: Final Cleanup & Verification

**Files:**
- Modify: `src/app/globals.css` (cleanup only)

- [ ] **Step 1: Remove any orphaned old CSS rules**

Check `globals.css` for any remaining references to the old shadow variable names (`--shadow-neu`, `--shadow-neu-sm`, `--shadow-neu-inset`). Remove them.

- [ ] **Step 2: Full visual QA — Default theme light**

Open the site, go through the full flow:
1. Landing → staggered hero animation
2. Onboarding → typing dots, theme previews, spring options
3. Opening → staggered hooks
4. Conversation → scroll-triggered blocks, spring hook chips
5. Input bar → glassmorphism, gradient border during loading
6. Settings → bottom drawer with theme previews
7. Fonts → Instrument Serif headlines, Satoshi body

- [ ] **Step 3: Full visual QA — Focused theme light + dark**

Switch to Focused, verify:
1. Literata font everywhere
2. Minimal shadows, border-based depth
3. Lined paper texture at correct spacing
4. Dark mode: warm browns, muted gold accent

- [ ] **Step 4: Full visual QA — Colorful theme light + dark**

Switch to Colorful, verify:
1. Clash Display headlines, JetBrains Mono body
2. Hard shadows, thick borders
3. 3-color rotation (pink, yellow, indigo) on stats and tags
4. Film grain texture overlay
5. Dark mode: dark navy, maintained neon vibrancy

- [ ] **Step 5: Mobile viewport test**

Open Chrome DevTools, test at 375px width:
1. Bottom drawer is full-width
2. Input bar respects safe area
3. Staggered animations don't cause horizontal overflow
4. All text is readable

- [ ] **Step 6: Reduced motion test**

In Chrome DevTools > Rendering > Emulate CSS media feature `prefers-reduced-motion: reduce`:
1. No stagger animations
2. No border sweep
3. No film grain animation
4. View transitions are near-instant

- [ ] **Step 7: Commit final state**

```bash
git add -A
git commit -m "feat: complete UI/UX overhaul — typography, shadows, motion, drawer, onboarding"
```

---

## Summary

| Task | What | Files |
|------|------|-------|
| 1 | Download local fonts | `src/fonts/` |
| 2 | Font loading setup | `src/lib/fonts.ts`, `layout.tsx` |
| 3 | CSS typography & font stacks | `globals.css` |
| 4 | Shadow system migration | `globals.css`, all components |
| 5 | Colorful palette & textures | `globals.css` |
| 6 | CSS animations (border sweep, view transitions, typing) | `globals.css` |
| 7 | ThemeApplicator — View Transitions API | `ThemeApplicator.tsx` |
| 8 | Hero staggered cascade | `Landing.tsx`, `Opening.tsx` |
| 9 | Content blocks — scroll trigger & springs | `ContentBlock.tsx`, `RichElements.tsx` |
| 10 | Input bar redesign | `InputBar.tsx`, `globals.css` |
| 11 | Settings → bottom drawer | `SettingsPanel.tsx` |
| 12 | Onboarding polish | `OnboardingChat.tsx` |
| 13 | Skeleton block update | `SkeletonBlock.tsx` |
| 14 | Remaining component updates | 6 files |
| 15 | Cleanup & QA | `globals.css`, visual testing |
