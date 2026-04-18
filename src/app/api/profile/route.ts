// src/app/api/profile/route.ts
import { generateText, Output } from "ai";
import { z } from "zod";
import type { VisitorProfile, ProfileNarrative } from "@/lib/visitor-profile";

export const maxDuration = 15;

const interactionSchema = z.object({
  type: z.enum(["interview_complete", "hook_click", "chat_question", "chat_answer_read"]),
  nodeId: z.string().optional(),
  question: z.string().optional(),
  answer: z.string().optional(),
  interviewAnswers: z
    .object({
      persuasion: z.enum(["results", "process", "character"]),
      motivation: z.enum(["mastery", "purpose", "relatedness"]),
      contentInterest: z.enum(["technical", "vision", "journey"]),
    })
    .optional(),
});

const requestSchema = z.object({
  currentProfile: z.any(),
  currentNarrative: z.any(),
  newInteraction: interactionSchema,
  visitedNodes: z.array(z.string()),
});

const outputSchema = z.object({
  profile: z.object({
    persuasion: z.enum(["results", "process", "character"]),
    motivation: z.enum(["mastery", "purpose", "relatedness"]),
    contentInterest: z.enum(["technical", "vision", "journey"]),
    inferredRole: z.string().nullable(),
    interests: z.record(z.string(), z.number()),
    preferredDepth: z.enum(["surface", "moderate", "deep"]),
    preferredTone: z.enum(["analytical", "narrative", "conversational", "formal"]),
    domainKnowledge: z.record(z.string(), z.enum(["novice", "familiar", "expert"])),
  }),
  narrative: z.object({
    summary: z.string(),
    keyObservations: z.array(z.string()),
    interactionCount: z.number(),
    lastUpdated: z.string(),
  }),
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

  const { currentProfile, currentNarrative, newInteraction, visitedNodes } = parsed.data;

  const systemPrompt = `You are a visitor profiling engine for Max Marowsky's portfolio website. Your job is to analyze visitor interactions and maintain an evolving profile.

CURRENT VISITOR PROFILE:
${JSON.stringify(currentProfile, null, 2)}

CURRENT NARRATIVE:
Summary: ${currentNarrative.summary || "(first interaction)"}
Key Observations: ${currentNarrative.keyObservations?.length ? currentNarrative.keyObservations.join("; ") : "(none yet)"}
Interaction Count: ${currentNarrative.interactionCount || 0}

VISITED NODES SO FAR: ${visitedNodes.join(", ") || "none"}

NEW INTERACTION:
Type: ${newInteraction.type}
${newInteraction.nodeId ? `Node clicked: ${newInteraction.nodeId}` : ""}
${newInteraction.question ? `Question asked: "${newInteraction.question}"` : ""}
${newInteraction.answer ? `Answer received: "${newInteraction.answer}"` : ""}
${newInteraction.interviewAnswers ? `Interview answers: ${JSON.stringify(newInteraction.interviewAnswers)}` : ""}

RULES:
- Update the profile based on what this interaction reveals about the visitor
- inferredRole: Infer what role/background this person likely has. Start with null, sharpen over time. Be specific (e.g. "engineering manager at a growth-stage startup" not just "engineer")
- interests: Add or strengthen interest tags based on what they click/ask about. Weight 0-1. Only add tags with evidence.
- preferredDepth: "surface" if they seem to skim, "deep" if they ask detailed/technical questions, "moderate" as default
- preferredTone: "analytical" for data-focused visitors, "narrative" for story-driven, "conversational" for dialogue-heavy, "formal" for business-focused
- domainKnowledge: Track what domains they seem knowledgeable in (novice/familiar/expert). Only add domains you have evidence for.
- summary: Write 3-5 sentences capturing who this visitor is and what they care about. Update with each interaction.
- keyObservations: Add specific behavioral observations. Keep max 10, remove stale ones.
- interactionCount: Increment by 1
- lastUpdated: Set to current ISO timestamp

The interview dimensions (persuasion, motivation, contentInterest) should NEVER change from their original values — they are set by the visitor's own answers.

BEHAVIORAL ADAPTATION:
When you have enough interaction data (3+ interactions), assess whether the visitor's behavior matches their stated preferences:
- If they stated "technical" interest but mostly click philosophy/vision nodes, note this divergence in keyObservations and adjust preferredTone/preferredDepth accordingly.
- If they stated "mastery" motivation but use chat heavily (conversational behavior), consider shifting preferredTone toward "conversational".
- The interview dimensions stay fixed, but inferredRole, preferredDepth, preferredTone, and interests should evolve based on actual behavior.

Be conservative — only update fields where you have real evidence. Don't hallucinate interests or roles from thin evidence.`;

  try {
    const result = await generateText({
      model: "anthropic/claude-sonnet-4.5",
      output: Output.object({ schema: outputSchema }),
      prompt: systemPrompt,
    });

    return Response.json(result.output);
  } catch {
    return Response.json({
      profile: currentProfile,
      narrative: {
        ...currentNarrative,
        interactionCount: (currentNarrative.interactionCount || 0) + 1,
        lastUpdated: new Date().toISOString(),
      },
    });
  }
}
