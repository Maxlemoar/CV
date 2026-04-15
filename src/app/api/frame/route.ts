// src/app/api/frame/route.ts
import { generateText, Output } from "ai";
import { z } from "zod";
import { NextResponse } from "next/server";
import { CONTENT_GRAPH } from "@/lib/content-graph";
import { FRAMING_HINTS } from "@/lib/framing-hints";
import { DIMENSION_LABELS } from "@/lib/experiment-types";
import type { SignalVector } from "@/lib/experiment-types";
import {
  createEmptySignals,
  describeCandidates,
  describeSignals,
  listCandidateIds,
  pickFallbackHooks,
} from "@/lib/hook-router";

const signalSchema = z.object({
  persuasion: z.object({
    results: z.number(),
    process: z.number(),
    character: z.number(),
  }),
  motivation: z.object({
    mastery: z.number(),
    purpose: z.number(),
    relatedness: z.number(),
  }),
  learning: z.object({
    exploratory: z.number(),
    structured: z.number(),
    social: z.number(),
  }),
  topics: z.record(z.string(), z.number()),
});

const requestSchema = z.object({
  type: z.literal("frame"),
  nodeId: z.string(),
  profile: z.object({
    experimentNumber: z.number(),
    persuasion: z.enum(["results", "process", "character"]),
    learning: z.enum(["exploratory", "structured", "social"]),
    education: z.enum(["practice", "individualization", "inspiration"]),
    motivation: z.enum(["mastery", "purpose", "relatedness"]),
    sharing: z.enum(["surprise", "utility", "emotion"]),
  }),
  visitedNodes: z.array(z.string()),
  visitOrder: z.array(z.string()).optional(),
  signals: signalSchema.optional(),
  previousNodeId: z.string().optional(),
});

const responseSchema = z.object({
  introduction: z.string(),
  transition: z.string().optional(),
  hookLabels: z.record(z.string(), z.string()).optional(),
  nextHooks: z
    .array(
      z.object({
        targetId: z.string(),
        label: z.string(),
      }),
    )
    .min(0)
    .max(4)
    .optional(),
  learningMechanic: z
    .object({
      type: z.enum(["testing-effect", "spaced-retrieval"]),
      content: z.string(),
      answer: z.string().optional(),
    })
    .optional(),
});

export async function POST(req: Request) {
  let rawBody: unknown = null;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json({ introduction: "" });
  }

  try {
    const parsed = requestSchema.parse(rawBody);

    const node = CONTENT_GRAPH[parsed.nodeId];
    if (!node) {
      return NextResponse.json({ error: "Node not found" }, { status: 404 });
    }

    const hints = FRAMING_HINTS[parsed.nodeId];
    const previousNode = parsed.previousNodeId
      ? CONTENT_GRAPH[parsed.previousNodeId]
      : null;

    const persuasionHint = hints?.[parsed.profile.persuasion] ?? "";
    const motivationHint = hints?.[parsed.profile.motivation] ?? "";

    const visited = new Set(parsed.visitedNodes);
    // The node itself is "current" — exclude it from its own next-step list.
    visited.add(parsed.nodeId);

    const signals: SignalVector = parsed.signals ?? createEmptySignals();
    const candidateIds = listCandidateIds(visited);
    const candidateBlock = describeCandidates(candidateIds);
    const signalBlock = describeSignals(signals);

    // Build learning mechanic instruction
    let learningMechanicInstruction = "No learning mechanic for this node.";
    if (node.testingEffectQuestion) {
      learningMechanicInstruction = `This node has a testing-effect question available: "${node.testingEffectQuestion.question}" (answer: "${node.testingEffectQuestion.answer}"). Include it as a learningMechanic with type "testing-effect".`;
    } else if (node.spacedRetrievalRef && parsed.visitedNodes.includes(node.spacedRetrievalRef)) {
      learningMechanicInstruction = `This node references back to "${node.spacedRetrievalRef}" which the visitor has already seen. Create a spaced-retrieval callback as a learningMechanic with type "spaced-retrieval".`;
    }

    const systemPrompt = `You are Max Marowsky's portfolio framing and routing engine. You generate short, personalized introductions, transitions, and the next 3 follow-up chips for content blocks.

VISITOR PROFILE (baseline, from 5-question interview):
- Persuasion: ${parsed.profile.persuasion} (${DIMENSION_LABELS.persuasion[parsed.profile.persuasion]})
- Learning: ${parsed.profile.learning} (${DIMENSION_LABELS.learning[parsed.profile.learning]})
- Education: ${parsed.profile.education} (${DIMENSION_LABELS.education[parsed.profile.education]})
- Motivation: ${parsed.profile.motivation} (${DIMENSION_LABELS.motivation[parsed.profile.motivation]})

LIVE SIGNAL TILT (updated as the visitor clicks — weight newer clicks alongside baseline):
${signalBlock}

CURRENT NODE: "${parsed.nodeId}"
${persuasionHint ? `PERSUASION EMPHASIS: ${persuasionHint}` : ""}
${motivationHint ? `MOTIVATION EMPHASIS: ${motivationHint}` : ""}
${previousNode ? `PREVIOUS NODE: "${parsed.previousNodeId}" (create a transition from there)` : ""}
VISITED SO FAR (oldest → newest): ${(parsed.visitOrder ?? parsed.visitedNodes).join(" → ") || "none"}

AVAILABLE NEXT NODES (id [topics; tone] — summary). You MUST pick exclusively from these ids.
${candidateBlock || "(none — skip nextHooks)"}

RULES:
- Introduction: 1-2 sentences that frame the upcoming content. Subtly match the visitor's persuasion and motivation.
- Transition: Only if previousNodeId provided. 1 sentence connecting previous topic to this one naturally.
- nextHooks: Pick 3 ids from AVAILABLE NEXT NODES that best continue THIS visitor's thread. Criteria:
  1. Lean into their tilt (persuasion / motivation / topic interest shown so far).
  2. Prefer nodes whose topics overlap with the current node so the thread feels coherent.
  3. Give them at least one option that deepens the current thread and one that opens a new angle.
  4. For each pick, invent a 3-6 word chip label in the visitor's voice — phrase it as something they would want to click next. Results-leaning visitors like concrete outcomes in the label; character-leaning visitors like story-style labels; process-leaning visitors like how/why labels.
  5. NEVER pick an id that isn't in AVAILABLE NEXT NODES. NEVER repeat an already-visited node.
- hookLabels: Deprecated — leave empty or omit. Use nextHooks instead.
- Learning mechanic: ${learningMechanicInstruction}

Be warm, concise, natural. Never mention that you're personalizing. Write in English.`;

    const result = await generateText({
      model: "anthropic/claude-sonnet-4.5",
      output: Output.object({ schema: responseSchema }),
      prompt: systemPrompt,
    });

    const candidateSet = new Set(candidateIds);
    const rawNextHooks = result.output.nextHooks ?? [];
    const validNextHooks = rawNextHooks.filter(
      (h) => candidateSet.has(h.targetId) && h.label.trim().length > 0,
    );

    // Deterministic fallback: if Claude returned fewer than 2 valid hooks,
    // or skipped the field, fill from the scorer.
    let nextHooks: { targetId: string; label: string }[] = validNextHooks;
    if (nextHooks.length < 2) {
      const fallback = pickFallbackHooks(node, parsed.profile, signals, visited, 3);
      for (const h of fallback) {
        if (nextHooks.length >= 3) break;
        if (nextHooks.some((n) => n.targetId === h.targetId)) continue;
        nextHooks.push({ targetId: h.targetId, label: h.label });
      }
    } else {
      nextHooks = nextHooks.slice(0, 3);
    }

    return NextResponse.json({
      ...result.output,
      nextHooks,
    });
  } catch {
    // Full fallback on error — the static content still works, and we try
    // the deterministic scorer one more time so the UI always has hooks.
    const parsed = requestSchema.safeParse(rawBody);
    if (parsed.success) {
      const node = CONTENT_GRAPH[parsed.data.nodeId];
      const visited = new Set(parsed.data.visitedNodes);
      visited.add(parsed.data.nodeId);
      const signals: SignalVector = parsed.data.signals ?? createEmptySignals();
      const fallback = pickFallbackHooks(
        node ?? null,
        parsed.data.profile,
        signals,
        visited,
        3,
      );
      return NextResponse.json({
        introduction: "",
        nextHooks: fallback.map((h) => ({ targetId: h.targetId, label: h.label })),
      });
    }
    return NextResponse.json({ introduction: "" });
  }
}
