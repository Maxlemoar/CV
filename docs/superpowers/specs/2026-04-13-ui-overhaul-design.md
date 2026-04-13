# UI/UX Full Overhaul — Design Spec

**Date:** 2026-04-13
**Scope:** Full Overhaul (all three themes + cross-cutting UX improvements)
**Goal:** Bring the portfolio's visual design from "solid 2020" to cutting-edge 2026 by replacing dated patterns (neumorphic shadows, generic fonts, uniform animations) with modern, intentional design choices per theme.

---

## 1. Typography System

Replace Inter + Georgia with distinctive font pairs per theme. All fonts loaded via `next/font` (local or Google) to eliminate FOUT.

### Default Theme — "The Notebook"
- **Headlines:** Instrument Serif (Google Fonts, variable weight)
- **Body:** Satoshi (local, from Fontshare — geometric humanist sans)
- **Character:** Warm editorial. Instrument Serif has ink-trap details and slight quirks that give it personality without being fussy. Satoshi is clean but distinctive — not Inter.

### Focused Theme — "The Journal"
- **Headlines + Body:** Literata (Google Fonts, variable with optical sizing)
- **Character:** All-serif, designed for long-form reading. The optical size axis adapts weight and shape to font size automatically. Replaces Georgia everywhere.

### Colorful Theme — "The Poster"
- **Headlines:** Clash Display (local, from Fontshare — geometric, ultra-bold)
- **Body:** JetBrains Mono (Google Fonts — monospace with code-culture edge)
- **Character:** Neo-brutalism meets hacker culture. Clash Display for impact, JetBrains Mono for body adds technical attitude.

### Implementation Notes
- Use `next/font/google` for Instrument Serif, Literata, JetBrains Mono
- Use `next/font/local` for Satoshi and Clash Display (Fontshare license, download WOFF2)
- Define CSS variables: `--font-heading`, `--font-body` per theme
- Variable fonts where available for smooth weight transitions

---

## 2. Shadow & Elevation System

Replace the dual-direction neumorphic shadow system with modern, single-source elevation.

### Default Theme
```css
--shadow-sm: 0 1px 2px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.04);
--shadow-md: 0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06);
--shadow-lg: 0 2px 4px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.08);
```
Cards use `--shadow-md` at rest, `--shadow-lg` on hover with `translateY(-2px)`.

### Focused Theme
```css
--shadow-sm: 0 1px 2px rgba(0,0,0,0.03);
--shadow-md: 0 1px 2px rgba(0,0,0,0.04);
--shadow-lg: 0 2px 4px rgba(0,0,0,0.05);
```
Minimal shadows. Cards use `border: 1px solid rgba(0,0,0,0.06)` as primary depth cue. Shadows are barely visible — the border does the work.

### Colorful Theme
No change — hard shadows (`6px 6px 0 #1a1a1a`) stay. They are on-trend for neo-brutalism. Hover behavior (translate -2px/-2px, shadow grows) also stays.

### Dark Mode Shadows
```css
/* Default dark */
--shadow-sm: 0 1px 2px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.15);
--shadow-md: 0 1px 3px rgba(0,0,0,0.2), 0 4px 16px rgba(0,0,0,0.2);
--shadow-lg: 0 2px 4px rgba(0,0,0,0.2), 0 8px 24px rgba(0,0,0,0.25);
```
Deeper blacks, no white highlight component.

### Hover Behavior (All Themes)
- Cards: `translateY(-2px)` + shadow escalates one level (sm→md, md→lg)
- Buttons: Spring physics (`type: "spring", stiffness: 400, damping: 25`)
- Hook chips: Staggered appearance (0.05s between each), spring hover

### Migration
- Rename CSS variables: `--shadow-neu` → `--shadow-md`, `--shadow-neu-sm` → `--shadow-sm`, `--shadow-neu-inset` → `--shadow-inset`
- Update all component classes: `shadow-neu` → `shadow-md`, `shadow-neu-sm` → `shadow-sm`
- Remove the neumorphic white-highlight shadow component entirely

---

## 3. Motion System

Replace uniform `opacity 0, y 12` fade-ins with orchestrated, varied animations.

### Hero Landing (Staggered Cascade)
```
0.0s — Photo: opacity 0→1, scale 0.95→1.0 (spring, stiffness: 300, damping: 20)
0.3s — Name: clip-path reveal (inset(0 100% 0 0) → inset(0 0% 0 0)), 0.5s ease-out
0.6s — Tagline: opacity 0→1, y 8→0, 0.3s
0.8s — Buttons: staggerChildren 0.1s, opacity 0→1, y 12→0 (spring)
```
Total sequence: ~1.2s. Runs once on mount.

### Content Blocks (Scroll-Triggered)
- Use Framer Motion `useInView` with `once: true, margin: "-80px"`
- Entry: `opacity 0→1, y 20→0` with spring transition
- Hook chips within a block: `staggerChildren: 0.05`
- Rich elements (stats, timeline, tags): `staggerChildren: 0.08`

### Buttons & Interactive Elements
- Replace `whileHover={{ scale: 1.03 }}` with `whileHover={{ scale: 1.03 }}` using `transition: { type: "spring", stiffness: 400, damping: 25 }`
- Replace `whileTap={{ scale: 0.97 }}` with `whileTap={{ scale: 0.97 }}` using `transition: { type: "spring", stiffness: 600, damping: 30 }`
- Add `translateY(-2px)` on card hover (not scale — lift)

### Theme Transitions (View Transitions API)
- Use `document.startViewTransition()` when switching themes via SettingsPanel
- CSS: `::view-transition-old(root)` and `::view-transition-new(root)` with crossfade
- Fallback: current CSS transitions (0.4s ease) for browsers without support
- Implementation: Wrap theme-change in ThemeApplicator with View Transition check

### Onboarding Animations
- Bot messages: Typing indicator (3 dots, sequential bounce, 0.15s stagger) for 600ms before message appears
- Option buttons: `staggerChildren: 0.06`, spring entry
- Step transitions: exit current options (fade out 0.15s), enter new message (slide in from bottom)

---

## 4. Input Bar Redesign

Transform from generic to polished, with better state communication.

### Visual Changes
- **Background:** `backdrop-filter: blur(12px)` + `background: rgba(var(--paper-rgb), 0.7)` — glassmorphism
- **Border:** Replace opaque `border-t border-paper-dark` with `border-top: 1px solid rgba(0,0,0,0.04)`
- **Input field:** Remove neumorphic shadow. Add: `border: 1px solid rgba(0,0,0,0.06)`, `box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)`
- **Submit button:** SVG arrow icon (ChevronUp or ArrowUp) instead of text `↑`
- **Border radius:** 14px (slightly larger than current 12px)

### Focus State
- Animated gradient border: `background: conic-gradient(from var(--angle), transparent 60%, var(--color-accent) 100%)`
- CSS `@property --angle` animates 0→360deg over 2s linear infinite
- Applied as a pseudo-element behind the input with 1px inset, creating a sweeping accent border
- Subtle, not flashy — single accent color sweep, not rainbow

### Thinking State (AI Processing)
- Input field: Disabled + gradient border sweep continues (signals "processing")
- Content area: Enhanced skeleton block with improved pulse animation
- Submit button: Arrow morphs to a small spinner (CSS animation, not a full icon swap)

### Placeholder Text
- Default: "Ask me anything..."
- While thinking: "Thinking..." (swap via state)

---

## 5. Settings Panel → Bottom Drawer

Replace the floating popover with a mobile-native bottom drawer.

### Structure
```
<Backdrop> (click to dismiss, opacity 0.3 black, backdrop-blur: 4px)
  <Drawer> (slides up from bottom)
    <DragHandle> (40px wide, 4px tall, centered, rounded)
    <Title> "Personalization"
    <Section: Style> (with mini theme preview thumbnails)
    <Section: Mode> (Light / Dark)
    <Section: Depth> (Overview / Deep Dive)
    <Section: Focus> (4 options)
    <Section: Gamification> (On / Off)
  </Drawer>
</Backdrop>
```

### Layout
- **Mobile:** Full-width, `border-radius: 20px 20px 0 0` (top corners only)
- **Desktop:** `max-width: 28rem`, centered horizontally, same top-corner radius
- **Safe area:** `padding-bottom: env(safe-area-inset-bottom, 16px)`

### Theme Preview Thumbnails
- 48x32px mini previews next to each style option
- Default preview: cream bg, soft shadow card
- Focused preview: lined paper bg, serif text
- Colorful preview: yellow bg, thick border card, pink accent
- Generated as small inline SVGs or styled divs (not images)

### Animation
- Open: `y: "100%" → y: 0` with spring (stiffness: 300, damping: 30)
- Close: `y: 0 → y: "100%"` with ease-out 0.2s
- Backdrop: opacity 0→0.3 with 0.2s ease

### Trigger
- Same gear icon, same position (bottom-20, right-4)
- Gear icon rotates 90° when drawer is open

### Drag to Dismiss
- Track touch/mouse drag on the drawer
- If dragged down > 100px, dismiss
- Rubber-band effect if dragged up (slight resistance)

---

## 6. Colorful Theme Color Palette (Revised)

Replace the 5-color Dribbble rotation with a focused 3+2 palette.

### Accent Colors (Rotation)
1. **Hot Pink** `#FF3366` — Primary accent, buttons, links
2. **Electric Yellow** `#EBFF00` — Secondary, stat cards, tags
3. **Electric Indigo** `#7B61FF` — Tertiary, special elements (PourOver game, gems)

### Structural Colors
- **Black** `#1A1A1A` — Borders, text, hard shadows
- **White** `#FFFFFF` — Card backgrounds

### Rotation Rules
- Stat blocks: `nth-child(3n+1)` pink, `(3n+2)` yellow, `(3n+3)` indigo
- Tags: Same 3-cycle rotation
- Timeline dots: Alternate pink/yellow
- Background stays `#FFFBE6` (warm yellow-white)

### Dark Mode Colorful
- Background: `#1A1A2E` (dark navy, unchanged)
- Accents: Same pink/yellow/indigo (they pop on dark)
- Borders: `rgba(255,255,255,0.2)` instead of black
- Hard shadows: `rgba(255,255,255,0.15)` instead of black

---

## 7. Texture System

Each theme gets a distinctive background texture.

### Default — Paper Noise
- Current SVG turbulence approach, kept
- Increase opacity from 0.03 → 0.05 for more visible grain
- No other changes — the paper feel is working

### Focused — Lined Paper + Halftone
- Lined paper: `repeating-linear-gradient` — adjust line spacing to match actual `line-height` (currently 28px, should match body text line-height which is `1.6 * 16px = 25.6px`, round to 26px)
- Add subtle halftone dot pattern: radial-gradient dots at very low opacity (0.02)
- Combined effect: ruled notebook with barely-visible texture

### Colorful — Film Grain
- Replace current `display: none` (no texture) with animated film grain
- CSS: SVG turbulence with `seed` changing via CSS animation (creates moving grain)
- Opacity: 0.06 (noticeable but not overwhelming)
- `mix-blend-mode: multiply` for natural integration
- Animation: Step-wise `seed` change every 100ms (10fps grain flicker)

---

## 8. Onboarding Polish

Improve the onboarding chat flow with visual personality.

### Typing Indicator
- Before each bot message, show 3 dots with sequential bounce animation
- Dots: 6px circles, accent color, bouncing with 0.15s stagger
- Display for 500-700ms before message appears
- Adds conversational pacing — feels like talking to someone

### Theme Preview in Style Selection
- "Focused & clean" option: Inline mini-preview showing cream bg, serif text, ruled lines
- "Bold & colorful" option: Inline mini-preview showing yellow bg, thick borders, pink accent
- Previews are 100% width, 60px tall styled divs within the option buttons
- Live-rendered (not images), so they adapt to dark mode

### Option Button Layout
- 2-option steps (style, dark mode, depth, gamification): Side-by-side, equal width
- 4-option step (content focus): 2x2 grid
- Each option: Spring animation on appearance, stagger 0.06s

### Step Transitions
- Outgoing options: Fade out + scale down slightly (0.2s)
- Incoming bot message: Typing indicator → message slides in from below
- Incoming options: Stagger in from below with spring

---

## 9. Cross-Cutting Concerns

### Dark Mode Adaptation
All new patterns must work in dark mode:
- Glassmorphism input bar: `rgba(var(--paper-rgb), 0.7)` adapts via CSS variable
- Layered shadows: Darker values defined in `[data-dark]` block
- Textures: Paper noise and film grain opacity reduced slightly in dark (0.03 and 0.04 respectively)
- Bottom drawer: Same backdrop-blur approach, darker card bg
- Font choices: Same fonts, no dark-mode-specific font changes

### CSS Variable Naming
Rename for clarity:
- `--shadow-neu` → `--shadow-md`
- `--shadow-neu-sm` → `--shadow-sm`
- `--shadow-neu-inset` → `--shadow-inset`
- Add: `--shadow-lg` (new, for hover states)
- Add: `--font-heading`, `--font-body` (per-theme font stacks)
- Add: `--paper-rgb` (RGB components for rgba usage in glassmorphism)

### Performance
- `next/font` handles font loading — no FOUT, preloaded
- View Transitions API: Progressive enhancement, CSS transition fallback
- Film grain animation (colorful): GPU-accelerated via `will-change: contents` on the pseudo-element, or `transform: translateZ(0)`
- Staggered animations: Use `staggerChildren` in Framer Motion (not manual delays)

### Accessibility
- All shadow/elevation changes maintain WCAG AA contrast ratios
- Focus rings remain visible in all themes
- Bottom drawer: Focus trap when open, Esc to close, `aria-modal="true"`
- Typing indicator: `aria-live="polite"` region
- Reduced motion: Respect `prefers-reduced-motion` — skip stagger, reduce spring to ease, disable film grain animation

### Print Styles
- No changes needed — print already strips shadows, textures, and interactive elements
- New fonts should have print fallbacks in the font stack

---

## 10. Files to Modify

### Core Changes
- `src/app/globals.css` — Shadow variables, texture overrides, colorful palette, animations, View Transitions CSS
- `src/app/layout.tsx` — Font imports via `next/font`, CSS variable injection
- `src/app/ThemeApplicator.tsx` — View Transitions API integration

### Component Changes
- `src/components/Landing.tsx` — Staggered hero animation
- `src/components/ContentBlock.tsx` — Scroll-triggered entry, spring hooks, shadow classes
- `src/components/InputBar.tsx` — Glassmorphism, gradient border, SVG icon, thinking states
- `src/components/SettingsPanel.tsx` — Full rewrite → Bottom Drawer
- `src/components/OnboardingChat.tsx` — Typing indicator, theme previews, spring animations
- `src/components/Opening.tsx` — Staggered hook appearance
- `src/components/SkeletonBlock.tsx` — Improved loading animation
- `src/components/RichElements.tsx` — Staggered children for stats/tags/timeline

### New Files
- `src/fonts/` — Directory for local font files (Satoshi, Clash Display WOFF2)
- No new components expected — all changes are modifications to existing files

### No Changes
- `src/components/JourneyWrapUp.tsx` — Only inherits shadow/font changes via CSS
- `src/components/PourOverGame.tsx` — Only inherits theme changes via CSS
- `src/components/ShareButton.tsx` — No visual changes
- `src/components/gamification/` — No visual changes (ProgressRing, AchievementToast)
- `src/lib/content-graph.ts` — No content changes
- `src/app/cv/CVDocument.tsx` — No changes (separate design system)
- `src/app/api/` — No backend changes
