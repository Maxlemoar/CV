// src/app/api/generate/route.ts
import { generateText, Output } from "ai";
import { z } from "zod";
import { NextResponse } from "next/server";
import { CONTENT_GRAPH } from "@/lib/content-graph";
import { FRAMING_HINTS } from "@/lib/framing-hints";
import {
  createEmptySignals,
  describeCandidates,
  describeSignals,
  listCandidateIds,
  pickFallbackHooks,
} from "@/lib/hook-router";
import type { SignalVector } from "@/lib/experiment-types";
import type { VisitorProfile, ProfileNarrative } from "@/lib/visitor-profile";

export const maxDuration = 30;

const requestSchema = z.object({
  nodeId: z.string(),
  profile: z.any(),
  narrative: z.any(),
  signals: z.any().optional(),
  visitedNodes: z.array(z.string()),
  visitOrder: z.array(z.string()).optional(),
  previousNodeId: z.string().optional(),
});

const outputSchema = z.object({
  title: z.string().describe("Personalized title for this content block, 3-8 words"),
  content: z.string().describe("The rewritten content text in Markdown. Preserve all facts. Keep it concise — the reader has limited time. Aim for 30-50% shorter than the reference text."),
  hooks: z.array(z.object({
    nodeId: z.string(),
    label: z.string().describe("3-6 word chip label personalized to this visitor"),
    teaser: z.string().describe("1 sentence explaining why this is relevant for THIS visitor"),
  })).min(0).max(3),
});

function buildGeneratePrompt(
  nodeId: string,
  referenceText: string,
  profile: VisitorProfile,
  narrative: ProfileNarrative,
  visitedNodes: string[],
  visitOrder: string[],
  previousNodeId: string | undefined,
  candidateBlock: string,
  signalBlock: string,
  hints: Record<string, string> | undefined,
): string {
  const prevNode = previousNodeId ? CONTENT_GRAPH[previousNodeId] : null;
  const prevSummary = prevNode?.tags?.summary ?? prevNode?.id ?? "";

  return `You are Max Marowsky's portfolio content engine. You rewrite content nodes to be perfectly tailored to each visitor.

VISITOR PROFILE:
- Role: ${profile.inferredRole ?? "unknown (still learning)"}
- Interests: ${Object.entries(profile.interests).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}:${v.toFixed(1)}`).join(", ") || "not yet established"}
- Preferred depth: ${profile.preferredDepth}
- Preferred tone: ${profile.preferredTone}
- Domain knowledge: ${Object.entries(profile.domainKnowledge).map(([k, v]) => `${k}:${v}`).join(", ") || "unknown"}
- Persuasion: ${profile.persuasion}
- Motivation: ${profile.motivation}
- Content interest: ${profile.contentInterest}

VISITOR NARRATIVE (what we know about this person):
${narrative.summary || "First interaction — no observations yet."}
${narrative.keyObservations.length > 0 ? "\nKey observations:\n" + narrative.keyObservations.map(o => `- ${o}`).join("\n") : ""}

LIVE SIGNAL TILT:
${signalBlock}

REFERENCE TEXT (ground truth — all facts must be preserved):
---
${referenceText}
---

${hints ? `EMPHASIS HINTS:\n${Object.entries(hints).map(([k, v]) => `- ${k}: ${v}`).join("\n")}` : ""}

${prevNode ? `PREVIOUS NODE: "${previousNodeId}" — ${prevSummary}` : ""}
VISITED SO FAR: ${(visitOrder.length > 0 ? visitOrder : visitedNodes).join(" → ") || "none"}

AVAILABLE NEXT NODES (pick 3 for hooks):
${candidateBlock || "(none available)"}

RULES:
1. REWRITE the reference text — don't just copy it. Adapt emphasis, tone, detail level, and narrative framing to this visitor.
2. For a visitor interested in "${Object.keys(profile.interests)[0] ?? "general"}", emphasize those aspects. For a "${profile.preferredTone}" tone preference, match that style.
3. If the visitor has domain expertise (${Object.entries(profile.domainKnowledge).filter(([,v]) => v === "expert").map(([k]) => k).join(", ") || "none detected"}), skip basic explanations in those areas.
4. Build narrative bridges to previously visited nodes when natural — "As you saw with [topic]..." or "This connects to [previous]..."
5. NEVER invent new facts. Every number, name, date must come from the reference text.
6. Keep it SHORT. The reader is busy. Cut filler, compress, prioritize the most impactful facts. Aim for 30-50% shorter than the reference text.
7. Title should be personalized — not just the generic topic name.
8. For hooks: pick from AVAILABLE NEXT NODES. Write labels in the visitor's voice. Add a teaser explaining relevance for THIS visitor.
9. Write in English. Be warm, concise, authentic. Never mention that you're personalizing.`;
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { nodeId, profile, narrative, visitedNodes, visitOrder, previousNodeId } = parsed.data;
  const node = CONTENT_GRAPH[nodeId];
  if (!node) {
    return NextResponse.json({ error: "Node not found" }, { status: 404 });
  }

  const signals: SignalVector = parsed.data.signals ?? createEmptySignals();
  const visited = new Set(visitedNodes);
  visited.add(nodeId);

  const candidateIds = listCandidateIds(visited);
  const candidateBlock = describeCandidates(candidateIds);
  const signalBlock = describeSignals(signals);
  const hints = FRAMING_HINTS[nodeId];

  const prompt = buildGeneratePrompt(
    nodeId,
    node.content,
    profile as VisitorProfile,
    narrative as ProfileNarrative,
    visitedNodes,
    visitOrder ?? visitedNodes,
    previousNodeId,
    candidateBlock,
    signalBlock,
    hints as Record<string, string> | undefined,
  );

  // NOTE: A streaming mode (stream: true) can be added later for real-time
  // text display on cache misses. For now, all requests use structured output
  // which returns complete JSON. The client shows a SkeletonBlock during loading.

  // Structured output mode (used for both live generation and pre-generation)
  try {
    const result = await generateText({
      model: "anthropic/claude-sonnet-4.5",
      output: Output.object({ schema: outputSchema }),
      prompt,
    });

    // Validate hooks — only allow candidate IDs
    const candidateSet = new Set(candidateIds);
    const validHooks = (result.output.hooks ?? []).filter(
      (h) => candidateSet.has(h.nodeId) && h.label.trim().length > 0,
    );

    // Fallback if Claude returns too few hooks
    let hooks = validHooks;
    if (hooks.length < 2 && profile) {
      const fallback = pickFallbackHooks(node, profile, signals, visited, 3);
      for (const h of fallback) {
        if (hooks.length >= 3) break;
        if (hooks.some((existing) => existing.nodeId === h.targetId)) continue;
        hooks.push({ nodeId: h.targetId, label: h.label, teaser: "" });
      }
    } else {
      hooks = hooks.slice(0, 3);
    }

    return NextResponse.json({
      ...result.output,
      hooks,
    });
  } catch {
    // Fallback: return reference text as-is
    const fallbackHooks = profile
      ? pickFallbackHooks(node, profile, signals, visited, 3).map((h) => ({
          nodeId: h.targetId,
          label: h.label,
          teaser: "",
        }))
      : node.hooks.slice(0, 3).map((h) => ({
          nodeId: h.targetId,
          label: h.label,
          teaser: "",
        }));

    return NextResponse.json({
      title: nodeId.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      content: node.content,
      hooks: fallbackHooks,
    });
  }
}
