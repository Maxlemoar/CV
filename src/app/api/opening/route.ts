// src/app/api/opening/route.ts
import { generateText, Output } from "ai";
import { z } from "zod";
import { DIMENSION_LABELS } from "@/lib/experiment-types";
import type { VisitorProfile, ProfileNarrative } from "@/lib/visitor-profile";
import { CONTENT_GRAPH } from "@/lib/content-graph";

export const maxDuration = 15;

const STARTER_POOL = [
  "education-gets-wrong",
  "startup-story",
  "why-anthropic",
  "building-with-claude",
  "what-education-should-teach",
  "anthropic-education-vision",
  "psychology-of-learning",
  "side-projects",
  "what-id-build",
  "personal",
];

const requestSchema = z.object({
  profile: z.object({
    experimentNumber: z.number(),
    persuasion: z.enum(["results", "process", "character"]),
    motivation: z.enum(["mastery", "purpose", "relatedness"]),
    contentInterest: z.enum(["technical", "vision", "journey"]),
  }),
  visitorProfile: z.any(),
  narrative: z.any(),
  signals: z.any().optional(),
});

const outputSchema = z.object({
  transitionText: z.string().describe("1-2 short sentences bridging the interview answers to the content hooks. Warm, personal, punchy. Max 30 words."),
  hooks: z.array(z.object({
    nodeId: z.string(),
    label: z.string().describe("3-8 word personalized hook label"),
  })).min(3).max(4),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid body" }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const { profile, visitorProfile, narrative } = parsed.data;
  const vp = visitorProfile as VisitorProfile;
  const narr = narrative as ProfileNarrative;

  const starterDescriptions = STARTER_POOL
    .filter((id) => CONTENT_GRAPH[id])
    .map((id) => {
      const node = CONTENT_GRAPH[id];
      const topics = node.tags?.topics?.join(", ") ?? "";
      const tone = node.tags?.tone ?? "";
      const summary = node.tags?.summary ?? id.replace(/-/g, " ");
      return `- ${id} [topics: ${topics}; tone: ${tone}] ${summary}`;
    })
    .join("\n");

  const systemPrompt = `You are Max Marowsky. A visitor just completed your 3-question interview. Your job is to write a personalized transition that shows you listened, and to pick 4 starter hooks that match this visitor.

THE VISITOR'S INTERVIEW ANSWERS:
- What they look at first when evaluating a candidate: ${profile.persuasion} (${DIMENSION_LABELS.persuasion[profile.persuasion]})
- What makes a good work day: ${profile.motivation} (${DIMENSION_LABELS.motivation[profile.motivation]})
- What interests them about a candidate: ${profile.contentInterest} (${DIMENSION_LABELS.contentInterest[profile.contentInterest]})

INFERRED VISITOR PROFILE:
- Role: ${vp.inferredRole ?? "unknown yet"}
- Preferred depth: ${vp.preferredDepth}
- Preferred tone: ${vp.preferredTone}

VISITOR NARRATIVE:
${narr.summary || "Just completed interview — no behavior data yet."}

AVAILABLE STARTER NODES (pick exactly 4):
${starterDescriptions}

RULES FOR transitionText:
1. Write 1-2 SHORT sentences (max 30 words total) that reference the visitor's ACTUAL answers — not generic text.
2. Bridge naturally from what they said to what you'll show them.
3. Speak as Max, warmly and personally. Use "you" and "I".
4. Don't analyze or psychologize — just acknowledge what they shared and connect it to your story.
5. Don't mention "interview", "questions", or "answers" — make it feel like a natural conversation.
6. Write in English.

RULES FOR hooks:
1. Pick 4 nodes from AVAILABLE STARTER NODES that best match this visitor's profile.
2. For each, write a 3-8 word label that feels like a natural continuation of the transition text.
3. Labels should be in the visitor's voice — what THEY would want to click.
4. A results-oriented visitor gets outcome-focused labels. A character-oriented visitor gets story-focused labels.
5. The 4 hooks together should offer variety — don't pick 4 nodes about the same topic.`;

  try {
    const result = await generateText({
      model: "anthropic/claude-sonnet-4.5",
      output: Output.object({ schema: outputSchema }),
      prompt: systemPrompt,
    });

    const starterSet = new Set(STARTER_POOL);
    const validHooks = (result.output.hooks ?? []).filter(
      (h) => starterSet.has(h.nodeId) && h.label.trim().length > 0,
    );

    return Response.json({
      transitionText: result.output.transitionText,
      hooks: validHooks.slice(0, 4),
    });
  } catch {
    return Response.json({
      transitionText: "",
      hooks: [],
    });
  }
}
