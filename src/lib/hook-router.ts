// src/lib/hook-router.ts
//
// Personalized routing for the conversation flow. One module used in three
// places:
//   - starter hooks on the Opening screen (full-profile scored)
//   - deterministic fallback for /api/frame when Claude fails / times out
//   - signal-vector seeding and per-click nudges
//
// The scoring is intentionally simple: sparse dot-products over the signal
// vector plus small topic affinities. Ties are broken by a stable node-id
// sort so tests are deterministic.

import {
  CONTENT_GRAPH,
  ROOT_HOOKS,
  type ContentGraph,
  type ContentNode,
  type Hook,
  type NodeTopic,
} from "./content-graph";
import type {
  Education,
  ExperimentProfile,
  Learning,
  Motivation,
  Persuasion,
  SignalVector,
} from "./experiment-types";

// ─── Signal vector helpers ──────────────────────────────────────────────

const PERSUASION_KEYS: Persuasion[] = ["results", "process", "character"];
const MOTIVATION_KEYS: Motivation[] = ["mastery", "purpose", "relatedness"];
const LEARNING_KEYS: Learning[] = ["exploratory", "structured", "social"];

const SIGNAL_CAP = 2;
const CLICK_NUDGE = 0.25;

export function createEmptySignals(): SignalVector {
  return {
    persuasion: { results: 0, process: 0, character: 0 },
    motivation: { mastery: 0, purpose: 0, relatedness: 0 },
    learning: { exploratory: 0, structured: 0, social: 0 },
    topics: {},
  };
}

/** Topic affinities implied by the visitor's `education` answer. */
const EDUCATION_TOPIC_AFFINITY: Record<Education, Partial<Record<NodeTopic, number>>> = {
  practice: { product: 1, startup: 1, ai: 0.7, anthropic: 0.5 },
  individualization: { psychology: 1, education: 1, vision: 0.7, anthropic: 0.5 },
  inspiration: { vision: 1, personal: 0.8, education: 0.7, anthropic: 0.6 },
};

/** Seed the signal vector from the 5-question interview. Runs once. */
export function seedSignalsFromProfile(profile: ExperimentProfile): SignalVector {
  const s = createEmptySignals();
  s.persuasion[profile.persuasion] = 1;
  s.motivation[profile.motivation] = 1;
  s.learning[profile.learning] = 1;
  const topicAffinity = EDUCATION_TOPIC_AFFINITY[profile.education] ?? {};
  for (const [topic, weight] of Object.entries(topicAffinity)) {
    if (weight !== undefined) s.topics[topic] = weight;
  }
  return s;
}

/**
 * Nudge the signal vector toward the tags of a clicked node.
 * Pure function — returns a new vector. Onboarding stays dominant because
 * click nudges are capped and clamped.
 */
export function applyClickToSignals(
  signals: SignalVector,
  clickedNode: ContentNode | undefined,
): SignalVector {
  if (!clickedNode?.tags) return signals;
  const next: SignalVector = {
    persuasion: { ...signals.persuasion },
    motivation: { ...signals.motivation },
    learning: { ...signals.learning },
    topics: { ...signals.topics },
  };

  const tags = clickedNode.tags;
  if (tags.persuasion) {
    for (const k of PERSUASION_KEYS) {
      const w = tags.persuasion[k];
      if (w) next.persuasion[k] = clamp(next.persuasion[k] + CLICK_NUDGE * w);
    }
  }
  if (tags.motivation) {
    for (const k of MOTIVATION_KEYS) {
      const w = tags.motivation[k];
      if (w) next.motivation[k] = clamp(next.motivation[k] + CLICK_NUDGE * w);
    }
  }
  if (tags.topics) {
    for (const t of tags.topics) {
      next.topics[t] = clamp((next.topics[t] ?? 0) + CLICK_NUDGE);
    }
  }
  return next;
}

function clamp(n: number): number {
  if (n < 0) return 0;
  if (n > SIGNAL_CAP) return SIGNAL_CAP;
  return n;
}

// ─── Scoring ────────────────────────────────────────────────────────────

export interface ScoreContext {
  profile: ExperimentProfile | null;
  signals: SignalVector;
  visited: Set<string>;
  currentNode?: ContentNode;
}

/**
 * Score a node for the current visitor. Higher = better next step.
 * Returns `-Infinity` for gated or already-visited nodes.
 */
export function scoreNodeForVisitor(node: ContentNode, ctx: ScoreContext): number {
  if (ctx.visited.has(node.id)) return -Infinity;
  if (!isNodeUnlocked(node, ctx.visited)) return -Infinity;

  const tags = node.tags;
  if (!tags) return 0;

  let score = 0;

  // Persuasion + motivation affinity via dot-product with signals.
  if (tags.persuasion) {
    for (const k of PERSUASION_KEYS) {
      const w = tags.persuasion[k];
      if (w) score += w * ctx.signals.persuasion[k];
    }
  }
  if (tags.motivation) {
    for (const k of MOTIVATION_KEYS) {
      const w = tags.motivation[k];
      if (w) score += w * ctx.signals.motivation[k];
    }
  }

  // Topic affinity — rewards nodes whose topics match what the visitor has
  // shown interest in so far. Slightly weaker weight so dimensions dominate.
  if (tags.topics) {
    for (const t of tags.topics) {
      const w = ctx.signals.topics[t] ?? 0;
      score += 0.6 * w;
    }
  }

  // Learning style preference: structured visitors like data / reflection,
  // exploratory like vision / story, social like story / reflection.
  if (tags.tone && ctx.profile) {
    score += toneBonus(tags.tone, ctx);
  }

  // Small continuity bonus: if the current node shares a topic with this
  // candidate, prefer staying in that territory.
  if (ctx.currentNode?.tags?.topics && tags.topics) {
    const overlap = tags.topics.filter((t) =>
      ctx.currentNode!.tags!.topics!.includes(t),
    ).length;
    score += 0.2 * overlap;
  }

  return score;
}

function toneBonus(
  tone: NonNullable<ContentNode["tags"]>["tone"],
  ctx: ScoreContext,
): number {
  const tilt = strongest(ctx.signals.learning, LEARNING_KEYS);
  if (!tilt || !tone) return 0;
  const matrix: Record<Learning, Record<string, number>> = {
    exploratory: { story: 0.4, vision: 0.5, reflection: 0.2, data: 0.1 },
    structured: { data: 0.5, reflection: 0.3, vision: 0.1, story: 0.1 },
    social: { story: 0.5, reflection: 0.4, vision: 0.2, data: 0.1 },
  };
  return matrix[tilt]?.[tone] ?? 0;
}

function strongest<K extends string>(
  bucket: Record<K, number>,
  keys: readonly K[],
): K | null {
  let best: K | null = null;
  let bestScore = -Infinity;
  for (const k of keys) {
    if (bucket[k] > bestScore) {
      bestScore = bucket[k];
      best = k;
    }
  }
  return bestScore > 0 ? best : null;
}

// ─── Gate checks ────────────────────────────────────────────────────────

export function isNodeUnlocked(node: ContentNode, visited: Set<string>): boolean {
  if (node.gem) {
    if (node.gem.requiredNodes && !node.gem.requiredNodes.every((id) => visited.has(id))) {
      return false;
    }
    if (node.gem.minVisited && visited.size < node.gem.minVisited) return false;
  }
  return true;
}

export function isHookUnlocked(hook: Hook, visited: Set<string>): boolean {
  if (visited.has(hook.targetId)) return false;
  if (hook.requiredVisited && !hook.requiredVisited.every((id) => visited.has(id))) {
    return false;
  }
  if (hook.minVisited && visited.size < hook.minVisited) return false;
  const target = CONTENT_GRAPH[hook.targetId];
  if (target && !isNodeUnlocked(target, visited)) return false;
  return true;
}

// ─── Candidate list (shared with /api/frame) ────────────────────────────

export function listCandidateIds(
  visited: Set<string>,
  graph: ContentGraph = CONTENT_GRAPH,
): string[] {
  return Object.values(graph)
    .filter((n) => !visited.has(n.id) && isNodeUnlocked(n, visited))
    .map((n) => n.id);
}

// ─── Pickers ────────────────────────────────────────────────────────────

const STARTER_POOL: string[] = [
  "school-gets-wrong",
  "startup-story",
  "why-anthropic",
  "building-with-claude",
  "what-schools-should-teach",
  "anthropic-education-vision",
  "psychology-of-learning",
  "side-projects",
  "what-id-build",
  "personal",
];

/**
 * Starter hooks for the Opening screen. Uses the full profile via the
 * signal vector — all 5 dimensions contribute, not just `education`.
 */
export function pickStarterHooks(
  profile: ExperimentProfile | null,
  signals: SignalVector,
  visited: Set<string>,
  count = 4,
): Hook[] {
  if (!profile) return ROOT_HOOKS;

  const ctx: ScoreContext = { profile, signals, visited };
  const ranked = STARTER_POOL
    .map((id) => CONTENT_GRAPH[id])
    .filter((n): n is ContentNode => !!n)
    .map((n) => ({ node: n, score: scoreNodeForVisitor(n, ctx) }))
    .filter((x) => x.score > -Infinity)
    .sort((a, b) => b.score - a.score || a.node.id.localeCompare(b.node.id));

  const picks = ranked.slice(0, count).map(({ node }) => ({
    label: starterLabelFor(node.id),
    targetId: node.id,
  }));

  // Belt-and-braces: if scoring produced fewer than `count` because the pool
  // was too small, top up with any remaining ROOT_HOOKS.
  if (picks.length < count) {
    for (const h of ROOT_HOOKS) {
      if (picks.length >= count) break;
      if (!picks.some((p) => p.targetId === h.targetId) && !visited.has(h.targetId)) {
        picks.push(h);
      }
    }
  }

  return picks;
}

/** Friendly labels for starter-pool nodes. Separate from in-conversation hook labels. */
function starterLabelFor(id: string): string {
  const map: Record<string, string> = {
    "school-gets-wrong": "What I believe school gets wrong",
    "startup-story": "The startup I built and sold",
    "why-anthropic": "Why I want to work at Anthropic",
    "building-with-claude": "What I'm building with Claude right now",
    "what-schools-should-teach": "What schools should teach instead",
    "anthropic-education-vision": "My vision for AI in education",
    "psychology-of-learning": "The psychology of how we learn",
    "side-projects": "Side projects that taught me the most",
    "what-id-build": "What I'd build if I could start from scratch",
    "personal": "Who I am outside of work",
  };
  return map[id] ?? id.replace(/-/g, " ");
}

/**
 * Deterministic follow-up picker. Used as the fallback inside /api/frame
 * when Claude errors or returns too few valid ids, and to top up partial
 * results. Returns the existing hand-authored hook for `targetId` where
 * possible so labels stay natural.
 */
export function pickFallbackHooks(
  currentNode: ContentNode | null,
  profile: ExperimentProfile | null,
  signals: SignalVector,
  visited: Set<string>,
  count = 3,
  graph: ContentGraph = CONTENT_GRAPH,
): Hook[] {
  const ctx: ScoreContext = {
    profile,
    signals,
    visited,
    currentNode: currentNode ?? undefined,
  };

  // Prefer the current node's own authored hooks when they're still valid.
  const authored: Hook[] = (currentNode?.hooks ?? []).filter((h) =>
    isHookUnlocked(h, visited),
  );

  const rankedAuthored = authored
    .map((h) => {
      const target = graph[h.targetId];
      const s = target ? scoreNodeForVisitor(target, ctx) : 0;
      return { hook: h, score: s };
    })
    .sort((a, b) => b.score - a.score || a.hook.targetId.localeCompare(b.hook.targetId));

  const picks: Hook[] = rankedAuthored.slice(0, count).map((r) => r.hook);
  if (picks.length >= count) return picks;

  // Top up from the whole graph, scored by the visitor.
  const taken = new Set(picks.map((p) => p.targetId));
  const rankedAll = Object.values(graph)
    .filter((n) => !visited.has(n.id) && !taken.has(n.id) && isNodeUnlocked(n, visited))
    .map((n) => ({ node: n, score: scoreNodeForVisitor(n, ctx) }))
    .filter((x) => x.score > -Infinity)
    .sort((a, b) => b.score - a.score || a.node.id.localeCompare(b.node.id));

  for (const { node } of rankedAll) {
    if (picks.length >= count) break;
    picks.push({
      label: fallbackLabelFor(node),
      targetId: node.id,
    });
  }

  return picks;
}

function fallbackLabelFor(node: ContentNode): string {
  // Try to borrow an existing hook label that points to this node from
  // somewhere else in the graph. Keeps labels natural without extra authoring.
  for (const other of Object.values(CONTENT_GRAPH)) {
    const match = other.hooks.find((h) => h.targetId === node.id);
    if (match) return match.label;
  }
  return node.tags?.summary ?? node.id.replace(/-/g, " ");
}

// ─── Prompt context for /api/frame ──────────────────────────────────────

/**
 * Produces a compact one-line-per-candidate summary for the Claude prompt.
 * The topology stays small so the prompt fits comfortably.
 */
export function describeCandidates(
  candidateIds: string[],
  graph: ContentGraph = CONTENT_GRAPH,
): string {
  return candidateIds
    .map((id) => {
      const n = graph[id];
      if (!n) return null;
      const topics = n.tags?.topics?.join(",") ?? "—";
      const tone = n.tags?.tone ?? "—";
      const summary = n.tags?.summary ?? n.contentCompact.slice(0, 120);
      return `- ${id} [topics:${topics}; tone:${tone}] ${summary}`;
    })
    .filter(Boolean)
    .join("\n");
}

/** Compact signal-tilt description for the Claude prompt. */
export function describeSignals(signals: SignalVector): string {
  const fmt = (bucket: Record<string, number>) =>
    Object.entries(bucket)
      .filter(([, v]) => v > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `${k}:${v.toFixed(2)}`)
      .join(", ") || "—";

  return [
    `persuasion tilt: ${fmt(signals.persuasion)}`,
    `motivation tilt: ${fmt(signals.motivation)}`,
    `learning tilt: ${fmt(signals.learning)}`,
    `topic tilt: ${fmt(signals.topics)}`,
  ].join("\n");
}
