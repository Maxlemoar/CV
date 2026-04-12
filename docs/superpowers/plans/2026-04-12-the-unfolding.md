# The Unfolding — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the graph-based card exploration with a conversation-first experience where each AI response renders as a designed content block, building a personalized living document.

**Architecture:** Single-page Next.js app. The visitor types or clicks hooks → POST to `/api/chat` → Claude returns structured JSON → frontend renders as a styled content block with rich elements and follow-up hooks. Sessions are stored in Supabase for shareable URLs. The existing neumorphic design system carries over unchanged.

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind CSS 4, Framer Motion, Vercel AI SDK 6 (via AI Gateway), Supabase (via `@supabase/supabase-js`), `nanoid` for session IDs.

**Spec:** `docs/superpowers/specs/2026-04-12-the-unfolding-design.md`

---

## File Structure

```
src/
  app/
    page.tsx                    → Rewrite: Opening screen + ConversationView
    s/[id]/page.tsx             → New: Shared session read-only view
    api/chat/route.ts           → Rewrite: Structured JSON responses (no streaming)
    api/sessions/route.ts       → New: POST to save session, GET to load
    layout.tsx                  → Minor edit: keep as-is
    globals.css                 → Add: skeleton animation, toast styles
  components/
    Opening.tsx                 → New: Photo, name, invitation, starter hooks
    ConversationView.tsx        → New: Main orchestrator (replaces ExplorationView)
    ContentBlock.tsx            → New: Single block (question + answer + hooks)
    RichElements.tsx            → New: Stats, Timeline, ProjectCard, Tags, Citation
    SkeletonBlock.tsx           → New: Loading placeholder
    InputBar.tsx                → New: Sticky input field
    ShareButton.tsx             → New: Copy share link
    PrintCV.tsx                 → New: Print layout (adapted from existing getPrintNodes)
  lib/
    types.ts                    → New: Shared type definitions
    profile-content.ts          → Keep as-is
    content-graph.ts            → Keep for PDF export (getPrintNodes)
    session-store.ts            → New: Supabase save/load helpers
```

**Removed (after all tasks complete):**
- `src/components/ExplorationView.tsx`
- `src/components/ContentNode.tsx`
- `src/components/HookButton.tsx`
- `src/components/ChatWidget.tsx`
- `src/components/Hero.tsx`
- `src/components/MetaReflection.tsx`
- `src/components/Quiz.tsx`

---

## Task 1: Type Definitions

**Files:**
- Create: `src/lib/types.ts`

- [ ] **Step 1: Create the shared types file**

```ts
// src/lib/types.ts

export type RichType = "stats" | "timeline" | "project" | "quote" | "tags" | "citation" | "photo" | null;

export interface StatItem {
  value: string;
  label: string;
}

export interface TimelineItem {
  year: string;
  text: string;
}

export interface ProjectData {
  name: string;
  description: string;
  emoji?: string;
}

export interface TagsData {
  tags: string[];
}

export interface CitationData {
  title: string;
  authors: string;
  publication: string;
  year: string;
  url?: string;
}

export interface PhotoData {
  src: string;
  alt: string;
}

export type RichData = StatItem[] | TimelineItem[] | ProjectData | TagsData | CitationData | PhotoData;

export interface HookSuggestion {
  label: string;
  question: string;
}

export interface AIResponse {
  questionTitle: string;
  text: string;
  richType: RichType;
  richData: RichData | null;
  hooks: HookSuggestion[];
}

export interface ContentBlockData {
  id: string;
  questionTitle: string;
  text: string;
  richType: RichType;
  richData: RichData | null;
  hooks: HookSuggestion[];
}

export interface SessionData {
  id: string;
  blocks: ContentBlockData[];
  createdAt: string;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit src/lib/types.ts`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/lib/types.ts
git commit -m "feat: add type definitions for conversation blocks and sessions"
```

---

## Task 2: Opening Component

**Files:**
- Create: `src/components/Opening.tsx`

- [ ] **Step 1: Create the Opening component**

```tsx
// src/components/Opening.tsx
"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const STARTER_HOOKS = [
  { label: "Why Anthropic?", question: "Why do you want to work at Anthropic?" },
  { label: "What I've built", question: "What have you built in your career?" },
  { label: "How I think about education", question: "How do you think about education and learning?" },
  { label: "Who are you, really?", question: "Who are you as a person, beyond work?" },
];

interface OpeningProps {
  onSubmit: (question: string) => void;
  visible: boolean;
}

export default function Opening({ onSubmit, visible }: OpeningProps) {
  if (!visible) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="pb-8 pt-20 text-center"
    >
      <div className="mx-auto mb-6 h-36 w-36 overflow-hidden rounded-full shadow-neu">
        <Image
          src="/photo-coffee.jpg"
          alt="Max Marowsky"
          width={144}
          height={144}
          className="h-full w-full object-cover"
          priority
        />
      </div>
      <h1 className="font-serif text-4xl font-bold text-ink">
        Max Marowsky
      </h1>
      <p className="mt-2 text-ink-light">
        Product Manager · Ex-Founder · Psychologist
      </p>
      <p className="mt-6 text-lg text-ink">
        Get to know me. Just ask.
      </p>
      <div className="mx-auto mt-6 flex max-w-md flex-wrap justify-center gap-2">
        {STARTER_HOOKS.map((hook) => (
          <motion.button
            key={hook.label}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSubmit(hook.question)}
            className="rounded-xl border border-accent/20 bg-paper px-4 py-2 text-sm text-accent shadow-neu-sm transition-shadow hover:shadow-neu"
          >
            {hook.label}
          </motion.button>
        ))}
      </div>
    </motion.section>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/Opening.tsx
git commit -m "feat: add Opening component with photo, invitation, starter hooks"
```

---

## Task 3: Rich Elements

**Files:**
- Create: `src/components/RichElements.tsx`

- [ ] **Step 1: Create the rich element renderers**

```tsx
// src/components/RichElements.tsx
"use client";

import Image from "next/image";
import type { RichType, RichData, StatItem, TimelineItem, ProjectData, TagsData, CitationData, PhotoData } from "@/lib/types";

interface RichElementProps {
  richType: RichType;
  richData: RichData;
}

export default function RichElement({ richType, richData }: RichElementProps) {
  switch (richType) {
    case "stats":
      return <Stats items={richData as StatItem[]} />;
    case "timeline":
      return <Timeline items={richData as TimelineItem[]} />;
    case "project":
      return <Project data={richData as ProjectData} />;
    case "tags":
      return <Tags data={richData as TagsData} />;
    case "citation":
      return <Citation data={richData as CitationData} />;
    case "photo":
      return <Photo data={richData as PhotoData} />;
    default:
      return null;
  }
}

function Stats({ items }: { items: StatItem[] }) {
  return (
    <div className="mt-4 flex gap-3">
      {items.map((item) => (
        <div key={item.label} className="flex-1 rounded-xl bg-paper p-3 text-center">
          <div className="text-lg font-bold text-accent">{item.value}</div>
          <div className="text-xs text-ink-light">{item.label}</div>
        </div>
      ))}
    </div>
  );
}

function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <div className="mt-4 flex flex-col gap-0">
      {items.map((item, i) => (
        <div key={item.year} className="flex items-start gap-3">
          <div className="flex flex-col items-center">
            <div className="h-2.5 w-2.5 rounded-full bg-accent" />
            {i < items.length - 1 && <div className="w-0.5 grow bg-paper-dark" style={{ minHeight: 28 }} />}
          </div>
          <p className="pb-3 text-sm text-ink">
            <span className="font-semibold">{item.year}</span> — {item.text}
          </p>
        </div>
      ))}
    </div>
  );
}

function Project({ data }: { data: ProjectData }) {
  return (
    <div className="mt-4 flex items-center gap-3 rounded-xl bg-paper p-4">
      {data.emoji && <span className="text-2xl">{data.emoji}</span>}
      <div>
        <div className="font-semibold text-ink">{data.name}</div>
        <div className="text-sm text-ink-light">{data.description}</div>
      </div>
    </div>
  );
}

function Tags({ data }: { data: TagsData }) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {data.tags.map((tag) => (
        <span key={tag} className="rounded-lg bg-paper px-3 py-1 text-xs text-ink-light">
          {tag}
        </span>
      ))}
    </div>
  );
}

function Citation({ data }: { data: CitationData }) {
  return (
    <div className="mt-4 rounded-xl border border-paper-dark bg-paper p-4">
      <div className="font-serif text-sm font-semibold text-ink">{data.title}</div>
      <div className="mt-1 text-xs text-ink-light">{data.authors} · {data.publication} · {data.year}</div>
      {data.url && (
        <a href={data.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs text-accent hover:underline">
          View publication →
        </a>
      )}
    </div>
  );
}

function Photo({ data }: { data: PhotoData }) {
  return (
    <div className="relative mt-4 h-48 w-full overflow-hidden rounded-xl">
      <Image src={data.src} alt={data.alt} fill className="object-cover" />
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/RichElements.tsx
git commit -m "feat: add rich element renderers (stats, timeline, project, tags, citation, photo)"
```

---

## Task 4: Content Block + Skeleton

**Files:**
- Create: `src/components/ContentBlock.tsx`
- Create: `src/components/SkeletonBlock.tsx`

- [ ] **Step 1: Create the SkeletonBlock**

```tsx
// src/components/SkeletonBlock.tsx
"use client";

export default function SkeletonBlock() {
  return (
    <div className="animate-pulse rounded-2xl bg-white p-6 shadow-neu sm:p-8">
      <div className="mb-3 h-3 w-24 rounded bg-paper-dark" />
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-paper-dark" />
        <div className="h-4 w-5/6 rounded bg-paper-dark" />
        <div className="h-4 w-4/6 rounded bg-paper-dark" />
      </div>
      <div className="mt-5 flex gap-2">
        <div className="h-8 w-32 rounded-xl bg-paper-dark" />
        <div className="h-8 w-28 rounded-xl bg-paper-dark" />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create the ContentBlock**

```tsx
// src/components/ContentBlock.tsx
"use client";

import { motion } from "framer-motion";
import type { ContentBlockData, HookSuggestion } from "@/lib/types";
import RichElement from "./RichElements";

interface ContentBlockProps {
  block: ContentBlockData;
  onHookClick: (question: string) => void;
  isReadOnly?: boolean;
}

export default function ContentBlock({ block, onHookClick, isReadOnly = false }: ContentBlockProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl bg-white p-6 shadow-neu sm:p-8"
    >
      <div className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-light">
        {block.questionTitle}
      </div>
      <p className="leading-relaxed text-ink">{block.text}</p>
      {block.richType && block.richData && (
        <RichElement richType={block.richType} richData={block.richData} />
      )}
      {!isReadOnly && block.hooks.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {block.hooks.map((hook) => (
            <HookChip key={hook.label} hook={hook} onClick={() => onHookClick(hook.question)} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

function HookChip({ hook, onClick }: { hook: HookSuggestion; onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="rounded-xl border border-accent/20 bg-paper px-4 py-2 text-sm text-accent transition-shadow hover:shadow-neu-sm"
    >
      {hook.label} →
    </motion.button>
  );
}
```

- [ ] **Step 3: Verify both compile**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/components/ContentBlock.tsx src/components/SkeletonBlock.tsx
git commit -m "feat: add ContentBlock and SkeletonBlock components"
```

---

## Task 5: Input Bar

**Files:**
- Create: `src/components/InputBar.tsx`

- [ ] **Step 1: Create the InputBar**

```tsx
// src/components/InputBar.tsx
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
      className="fixed bottom-0 left-0 right-0 z-20 border-t border-paper-dark bg-paper/95 px-4 pb-[env(safe-area-inset-bottom,8px)] pt-3 backdrop-blur-sm no-print"
    >
      <div className="mx-auto flex max-w-3xl gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What do you want to know?"
          disabled={disabled}
          className="flex-1 rounded-xl bg-white px-4 py-3 text-sm text-ink shadow-neu-sm placeholder:text-ink-light/50 focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className="rounded-xl bg-accent px-4 py-3 text-sm font-medium text-white shadow-neu-sm transition-colors hover:bg-accent-hover disabled:opacity-40"
        >
          ↑
        </button>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/InputBar.tsx
git commit -m "feat: add sticky InputBar component"
```

---

## Task 6: AI Backend — Structured Responses

**Files:**
- Modify: `src/app/api/chat/route.ts`

- [ ] **Step 1: Rewrite the chat route for structured JSON responses**

Replace the entire contents of `src/app/api/chat/route.ts` with:

```ts
// src/app/api/chat/route.ts
import { generateText, Output } from "ai";
import { z } from "zod";
import { PROFILE_CONTENT } from "@/lib/profile-content";

export const maxDuration = 30;

const responseSchema = z.object({
  questionTitle: z.string().describe("Short label for the block header, 2-5 words, e.g. 'Why Anthropic' or 'The Startup Story'"),
  text: z.string().describe("The answer text. Warm, authentic, concise. Under 150 words unless the question demands detail."),
  richType: z.enum(["stats", "timeline", "project", "quote", "tags", "citation", "photo"]).nullable().describe("Type of rich visual element to include, or null for text-only answers"),
  richData: z.any().nullable().describe("Structured data for the rich element. Must match the richType schema."),
  hooks: z.array(z.object({
    label: z.string().describe("Short button label, 3-6 words"),
    question: z.string().describe("The full question this hook represents"),
  })).min(2).max(3).describe("Follow-up suggestions for the visitor"),
});

const SYSTEM_PROMPT = `You are the intelligence behind Max Marowsky's portfolio website. A visitor is getting to know Max by asking questions. You answer based on Max's profile below.

RULES:
- Write in third person about Max, but keep it warm and personal — like a friend introducing him
- Be concise: under 150 words unless the question needs more
- Be honest: if something isn't in the profile, say so
- Suggest follow-up hooks that create a natural flow of discovery
- Use rich elements when they genuinely help (stats for numbers, timeline for career, project for startups, tags for skills, citation for publications, photo for personal moments)
- Don't force rich elements — many answers are better as plain text

RICH ELEMENT SCHEMAS:
- stats: array of { value: string, label: string } (2-4 items)
- timeline: array of { year: string, text: string } (2-6 items)
- project: { name: string, description: string, emoji?: string }
- tags: { tags: string[] }
- citation: { title: string, authors: string, publication: string, year: string, url?: string }
- photo: { src: string, alt: string } — ONLY use these existing photos: /photo-coffee.jpg, /photo-cycling.jpg, /photo-frieda.jpg, /photo-wedding.jpg

META-REFLECTION:
After the conversation has sufficient depth (you judge — roughly 5+ exchanges or 3+ deep questions), include a hook like "Have you noticed what's happening here?" among the suggestions. When the visitor clicks it, explain that this experience itself demonstrates learning principles: agency (they chose the path), progressive disclosure (the page was empty, they filled it), adaptive content (their document is unique), and conversational AI (they talked to a space, not a chatbot). Close with: "That's exactly what Max wants to build at Anthropic." Keep it natural, not preachy.

PROFILE:
${PROFILE_CONTENT}`;

export async function POST(req: Request) {
  const { messages } = await req.json() as {
    messages: Array<{ role: "user" | "assistant"; content: string }>;
  };

  const result = await generateText({
    model: "anthropic/claude-sonnet-4.5",
    output: Output.object({ schema: responseSchema }),
    system: SYSTEM_PROMPT,
    messages,
  });

  return Response.json(result.output);
}
```

- [ ] **Step 2: Install zod dependency and remove direct Anthropic provider**

Run: `npm install zod`
Expected: Added zod to dependencies

- [ ] **Step 3: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/app/api/chat/route.ts package.json package-lock.json
git commit -m "feat: rewrite chat API for structured JSON responses with generateObject"
```

---

## Task 7: Conversation View (Main Orchestrator)

**Files:**
- Create: `src/components/ConversationView.tsx`

- [ ] **Step 1: Create the ConversationView**

```tsx
// src/components/ConversationView.tsx
"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { ContentBlockData, AIResponse } from "@/lib/types";
import Opening from "./Opening";
import ContentBlock from "./ContentBlock";
import SkeletonBlock from "./SkeletonBlock";
import InputBar from "./InputBar";

export default function ConversationView() {
  const [blocks, setBlocks] = useState<ContentBlockData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const blockCounter = useRef(0);

  const hasStarted = blocks.length > 0 || isLoading;

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [blocks.length, isLoading]);

  const submitQuestion = useCallback(async (question: string) => {
    if (isLoading) return;
    setIsLoading(true);

    const updatedMessages = [
      ...messages,
      { role: "user" as const, content: question },
    ];

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!res.ok) throw new Error("Failed to get response");

      const data: AIResponse = await res.json();
      blockCounter.current += 1;

      const newBlock: ContentBlockData = {
        id: `block-${blockCounter.current}`,
        questionTitle: data.questionTitle,
        text: data.text,
        richType: data.richType,
        richData: data.richData,
        hooks: data.hooks,
      };

      setBlocks((prev) => [...prev, newBlock]);
      setMessages([
        ...updatedMessages,
        { role: "assistant" as const, content: data.text },
      ]);
    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, messages]);

  return (
    <>
      <Opening visible={!hasStarted} onSubmit={submitQuestion} />

      {hasStarted && (
        <div className="space-y-6 pb-24 pt-8">
          {blocks.map((block) => (
            <ContentBlock
              key={block.id}
              block={block}
              onHookClick={submitQuestion}
            />
          ))}
          {isLoading && <SkeletonBlock />}
          <div ref={bottomRef} />
        </div>
      )}

      {hasStarted && (
        <InputBar onSubmit={submitQuestion} disabled={isLoading} />
      )}
    </>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/ConversationView.tsx
git commit -m "feat: add ConversationView orchestrator component"
```

---

## Task 8: Wire Up the Page

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Replace the page with the new composition**

Replace the entire contents of `src/app/page.tsx` with:

```tsx
// src/app/page.tsx
import ConversationView from "@/components/ConversationView";

export default function Home() {
  return (
    <main className="relative z-10 mx-auto max-w-3xl px-6">
      <ConversationView />
    </main>
  );
}
```

- [ ] **Step 2: Run the dev server and verify the opening screen renders**

Run: `npm run dev`
Expected: The page shows Max's photo, name, "Get to know me. Just ask.", starter hooks, and no content blocks. Clicking a hook or typing a question should trigger the AI and render a content block.

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: wire up ConversationView as main page"
```

---

## Task 9: Share Button + Toast

**Files:**
- Create: `src/components/ShareButton.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add toast animation to globals.css**

Append to the end of `src/app/globals.css` (before the `@media print` block):

```css
@keyframes toast-in {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-toast {
  animation: toast-in 0.2s ease-out;
}
```

- [ ] **Step 2: Create the ShareButton**

```tsx
// src/components/ShareButton.tsx
"use client";

import { useState } from "react";
import type { ContentBlockData } from "@/lib/types";

interface ShareButtonProps {
  blocks: ContentBlockData[];
}

export default function ShareButton({ blocks }: ShareButtonProps) {
  const [showToast, setShowToast] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleShare() {
    if (saving || blocks.length === 0) return;
    setSaving(true);

    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocks }),
      });

      if (!res.ok) throw new Error("Failed to save session");

      const { id } = await res.json();
      const url = `${window.location.origin}/s/${id}`;
      await navigator.clipboard.writeText(url);

      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch (err) {
      console.error("Share error:", err);
    } finally {
      setSaving(false);
    }
  }

  if (blocks.length === 0) return null;

  return (
    <>
      <button
        onClick={handleShare}
        disabled={saving}
        className="rounded-lg px-3 py-1.5 text-xs text-ink-light transition-colors hover:text-accent disabled:opacity-50 no-print"
      >
        {saving ? "..." : "Share"}
      </button>
      {showToast && (
        <div className="animate-toast fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-xl bg-ink px-4 py-2 text-sm text-paper shadow-lg">
          Link copied
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 3: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/components/ShareButton.tsx src/app/globals.css
git commit -m "feat: add ShareButton with clipboard copy and toast"
```

---

## Task 10: Session Storage API

**Files:**
- Create: `src/lib/session-store.ts`
- Create: `src/app/api/sessions/route.ts`

- [ ] **Step 1: Install dependencies**

Run: `npm install @supabase/supabase-js nanoid`

- [ ] **Step 2: Create the session store helper**

```ts
// src/lib/session-store.ts
import { createClient } from "@supabase/supabase-js";
import type { ContentBlockData, SessionData } from "@/lib/types";

function getClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars");
  return createClient(url, key);
}

export async function saveSession(id: string, blocks: ContentBlockData[]): Promise<void> {
  const client = getClient();
  const { error } = await client.from("sessions").insert({
    id,
    blocks: JSON.stringify(blocks),
    created_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function loadSession(id: string): Promise<SessionData | null> {
  const client = getClient();
  const { data, error } = await client
    .from("sessions")
    .select("id, blocks, created_at")
    .eq("id", id)
    .single();
  if (error || !data) return null;
  return {
    id: data.id,
    blocks: typeof data.blocks === "string" ? JSON.parse(data.blocks) : data.blocks,
    createdAt: data.created_at,
  };
}
```

- [ ] **Step 3: Create the sessions API route**

```ts
// src/app/api/sessions/route.ts
import { nanoid } from "nanoid";
import { saveSession, loadSession } from "@/lib/session-store";

export async function POST(req: Request) {
  const { blocks } = await req.json();
  if (!Array.isArray(blocks) || blocks.length === 0) {
    return Response.json({ error: "No blocks provided" }, { status: 400 });
  }

  const id = nanoid(8);
  await saveSession(id, blocks);
  return Response.json({ id });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "Missing id" }, { status: 400 });

  const session = await loadSession(id);
  if (!session) return Response.json({ error: "Session not found" }, { status: 404 });

  return Response.json(session);
}
```

- [ ] **Step 4: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add src/lib/session-store.ts src/app/api/sessions/route.ts package.json package-lock.json
git commit -m "feat: add session storage API with Supabase backend"
```

---

## Task 11: Shared Session Page

**Files:**
- Create: `src/app/s/[id]/page.tsx`

- [ ] **Step 1: Create the shared session page**

```tsx
// src/app/s/[id]/page.tsx
import { notFound } from "next/navigation";
import { loadSession } from "@/lib/session-store";
import SharedSessionView from "./SharedSessionView";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SharedSessionPage({ params }: Props) {
  const { id } = await params;
  const session = await loadSession(id);
  if (!session) notFound();

  return (
    <main className="relative z-10 mx-auto max-w-3xl px-6 pb-24 pt-12">
      <SharedSessionView blocks={session.blocks} />
    </main>
  );
}
```

- [ ] **Step 2: Create the SharedSessionView client component**

```tsx
// src/app/s/[id]/SharedSessionView.tsx
"use client";

import Image from "next/image";
import type { ContentBlockData } from "@/lib/types";
import ContentBlock from "@/components/ContentBlock";

interface Props {
  blocks: ContentBlockData[];
}

export default function SharedSessionView({ blocks }: Props) {
  return (
    <>
      <section className="mb-8 text-center">
        <div className="mx-auto mb-4 h-20 w-20 overflow-hidden rounded-full shadow-neu-sm">
          <Image
            src="/photo-coffee.jpg"
            alt="Max Marowsky"
            width={80}
            height={80}
            className="h-full w-full object-cover"
          />
        </div>
        <h1 className="font-serif text-2xl font-bold text-ink">Max Marowsky</h1>
        <p className="mt-1 text-sm text-ink-light">Discovered by a visitor</p>
      </section>

      <div className="space-y-6">
        {blocks.map((block) => (
          <ContentBlock
            key={block.id}
            block={block}
            onHookClick={() => {}}
            isReadOnly
          />
        ))}
      </div>

      <div className="mt-12 text-center">
        <a
          href="/"
          className="inline-block rounded-xl bg-accent px-6 py-3 text-sm font-medium text-white shadow-neu-sm transition-colors hover:bg-accent-hover"
        >
          Start your own conversation with Max →
        </a>
      </div>
    </>
  );
}
```

- [ ] **Step 3: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/app/s/
git commit -m "feat: add shared session page with read-only view"
```

---

## Task 12: Integrate Share Button into ConversationView

**Files:**
- Modify: `src/components/ConversationView.tsx`

- [ ] **Step 1: Add ShareButton to the ConversationView header**

In `src/components/ConversationView.tsx`, add the import at the top:

```tsx
import ShareButton from "./ShareButton";
```

Then, inside the `{hasStarted && (` section, add a header before the blocks. Replace the block:

```tsx
      {hasStarted && (
        <div className="space-y-6 pb-24 pt-8">
```

with:

```tsx
      {hasStarted && (
        <div className="space-y-6 pb-24 pt-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 overflow-hidden rounded-full shadow-neu-sm">
                <img src="/photo-coffee.jpg" alt="Max Marowsky" className="h-full w-full object-cover" />
              </div>
              <div>
                <div className="font-serif text-sm font-semibold text-ink">Max Marowsky</div>
                <div className="text-xs text-ink-light">Product Manager · Ex-Founder · Psychologist</div>
              </div>
            </div>
            <ShareButton blocks={blocks} />
          </div>
```

- [ ] **Step 2: Verify it compiles and renders**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/ConversationView.tsx
git commit -m "feat: integrate ShareButton into conversation header"
```

---

## Task 13: Print CV

**Files:**
- Create: `src/components/PrintCV.tsx`
- Modify: `src/components/ConversationView.tsx`

- [ ] **Step 1: Create the PrintCV component**

```tsx
// src/components/PrintCV.tsx
import { getPrintNodes } from "@/lib/content-graph";

const SECTION_LABELS: Record<string, string> = {
  about: "About",
  education: "Education",
  experience: "Experience",
  projects: "Projects",
  philosophy: "Philosophy",
  publications: "Publications",
  skills: "Skills",
  personal: "Personal",
};

export default function PrintCV() {
  const nodes = getPrintNodes();
  let currentSection = "";

  return (
    <div className="hidden print:block">
      <div className="mb-6 border-b border-gray-300 pb-4">
        <h1 className="text-2xl font-bold">Maximilian Marowsky</h1>
        <p className="text-sm text-gray-600">Product Manager · Ex-Founder · Psychologist</p>
        <p className="text-sm text-gray-600">m.marowsky@googlemail.com · Cologne, Germany</p>
      </div>
      {nodes.map((node) => {
        const section = node.printSection ?? "personal";
        const showHeader = section !== currentSection;
        currentSection = section;
        return (
          <div key={node.id}>
            {showHeader && (
              <h2 className="mb-2 mt-6 text-lg font-bold">{SECTION_LABELS[section] ?? section}</h2>
            )}
            <p className="mb-3 text-sm leading-relaxed">{node.content}</p>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Add PrintCV to ConversationView**

In `src/components/ConversationView.tsx`, add the import:

```tsx
import PrintCV from "./PrintCV";
```

Add `<PrintCV />` right before the closing `</>` of the component return:

```tsx
      <PrintCV />
    </>
  );
}
```

- [ ] **Step 3: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/components/PrintCV.tsx src/components/ConversationView.tsx
git commit -m "feat: add PrintCV component for PDF export"
```

---

## Task 14: Clean Up Old Components

**Files:**
- Delete: `src/components/ExplorationView.tsx`
- Delete: `src/components/ContentNode.tsx`
- Delete: `src/components/HookButton.tsx`
- Delete: `src/components/ChatWidget.tsx`
- Delete: `src/components/Hero.tsx`
- Delete: `src/components/MetaReflection.tsx`
- Delete: `src/components/Quiz.tsx`

- [ ] **Step 1: Remove old component files and unused packages**

```bash
rm src/components/ExplorationView.tsx \
   src/components/ContentNode.tsx \
   src/components/HookButton.tsx \
   src/components/ChatWidget.tsx \
   src/components/Hero.tsx \
   src/components/MetaReflection.tsx \
   src/components/Quiz.tsx
```

```bash
npm uninstall @ai-sdk/anthropic @ai-sdk/react
```

- [ ] **Step 2: Verify no broken imports**

Run: `npx tsc --noEmit`
Expected: No errors. If any file still imports a deleted component, fix the import.

- [ ] **Step 3: Verify the build passes**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add -u src/components/
git commit -m "chore: remove old exploration components replaced by conversation view"
```

---

## Task 15: Supabase Setup + Environment Variables

This task is manual/infrastructure. It creates the database table and sets environment variables.

- [ ] **Step 1: Create the Supabase project and sessions table**

If not already provisioned, create a Supabase project via Vercel Marketplace or Supabase dashboard. Then run this SQL:

```sql
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  blocks JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

- [ ] **Step 2: Set environment variables**

Run `vercel env pull` to get OIDC-based AI Gateway credentials automatically. Then add Supabase vars to `.env.local`:

```
SUPABASE_URL=<your-supabase-url>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

The AI Gateway authenticates via OIDC on Vercel deployments and via `AI_GATEWAY_API_KEY` locally (pulled by `vercel env pull`). No direct provider API keys needed.

- [ ] **Step 3: Verify the full app works end-to-end**

Run: `npm run dev`

Test:
1. Opening screen renders with photo, name, hooks
2. Clicking a starter hook → skeleton → content block with rich elements
3. Typing a question → same flow
4. Follow-up hooks work
5. After 5+ blocks, meta-reflection hook appears
6. Share button copies URL
7. Shared URL loads read-only view
8. Ctrl+P / "Print" shows linear CV

- [ ] **Step 4: Commit .env.example**

Create `.env.example`:
```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
# AI Gateway: run `vercel env pull` for OIDC auth, or set AI_GATEWAY_API_KEY for local dev
```

```bash
git add .env.example
git commit -m "chore: add .env.example for required environment variables"
```

---

## Task 16: Final Build Verification

- [ ] **Step 1: Run lint**

Run: `npm run lint`
Expected: No errors

- [ ] **Step 2: Run production build**

Run: `npm run build`
Expected: Build succeeds with no errors

- [ ] **Step 3: Test production build locally**

Run: `npm run start`
Expected: Site works identically to dev mode
