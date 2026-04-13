// src/app/api/frame/route.ts
import { generateText, Output } from "ai";
import { z } from "zod";
import { NextResponse } from "next/server";
import { CONTENT_GRAPH } from "@/lib/content-graph";
import { FRAMING_HINTS } from "@/lib/framing-hints";
import { DIMENSION_LABELS } from "@/lib/experiment-types";

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
  previousNodeId: z.string().optional(),
});

const responseSchema = z.object({
  introduction: z.string(),
  transition: z.string().optional(),
  hookLabels: z.record(z.string(), z.string()).optional(),
  learningMechanic: z
    .object({
      type: z.enum(["testing-effect", "spaced-retrieval"]),
      content: z.string(),
      answer: z.string().optional(),
    })
    .optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = requestSchema.parse(body);

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

    // Build learning mechanic instruction
    let learningMechanicInstruction = "No learning mechanic for this node.";
    if (node.testingEffectQuestion) {
      learningMechanicInstruction = `This node has a testing-effect question available: "${node.testingEffectQuestion.question}" (answer: "${node.testingEffectQuestion.answer}"). Include it as a learningMechanic with type "testing-effect".`;
    } else if (node.spacedRetrievalRef && parsed.visitedNodes.includes(node.spacedRetrievalRef)) {
      learningMechanicInstruction = `This node references back to "${node.spacedRetrievalRef}" which the visitor has already seen. Create a spaced-retrieval callback as a learningMechanic with type "spaced-retrieval".`;
    }

    const systemPrompt = `You are Max Marowsky's portfolio framing engine. You generate short, personalized introductions and transitions for content blocks.

VISITOR PROFILE:
- Persuasion: ${parsed.profile.persuasion} (${DIMENSION_LABELS.persuasion[parsed.profile.persuasion]})
- Learning: ${parsed.profile.learning} (${DIMENSION_LABELS.learning[parsed.profile.learning]})
- Motivation: ${parsed.profile.motivation} (${DIMENSION_LABELS.motivation[parsed.profile.motivation]})

CURRENT NODE: "${parsed.nodeId}"
${persuasionHint ? `PERSUASION EMPHASIS: ${persuasionHint}` : ""}
${motivationHint ? `MOTIVATION EMPHASIS: ${motivationHint}` : ""}
${previousNode ? `PREVIOUS NODE: "${parsed.previousNodeId}" (create a transition from there)` : ""}
VISITED SO FAR: ${parsed.visitedNodes.join(", ") || "none"}

RULES:
- Introduction: 1-2 sentences that frame the upcoming content. Subtly match the visitor's persuasion mode and motivation.
- Transition: Only if previousNodeId provided. 1 sentence connecting previous topic to this one naturally.
- Hook labels: Only override if you can make them more relevant to this visitor's profile. Return empty object or omit if defaults are fine.
- Learning mechanic: ${learningMechanicInstruction}

Be warm, concise, natural. Never mention that you're personalizing. Write in English.`;

    const result = await generateText({
      model: "anthropic/claude-sonnet-4.5",
      output: Output.object({ schema: responseSchema }),
      prompt: systemPrompt,
    });

    return NextResponse.json(result.output);
  } catch (error) {
    // Return empty framing on error — the static content still works
    return NextResponse.json({
      introduction: "",
    });
  }
}
