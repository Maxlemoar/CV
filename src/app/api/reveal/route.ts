// src/app/api/reveal/route.ts
import { generateText, Output } from "ai";
import { z } from "zod";
import { DIMENSION_LABELS } from "@/lib/experiment-types";
import { CONTENT_GRAPH } from "@/lib/content-graph";
import type { VisitorProfile, ProfileNarrative } from "@/lib/visitor-profile";

export const maxDuration = 30;

const requestSchema = z.object({
  profile: z.object({
    experimentNumber: z.number(),
    persuasion: z.enum(["results", "process", "character"]),
    learning: z.enum(["exploratory", "structured", "social"]),
    education: z.enum(["practice", "individualization", "inspiration"]),
    motivation: z.enum(["mastery", "purpose", "relatedness"]),
    sharing: z.enum(["surprise", "utility", "emotion"]),
  }),
  visitorProfile: z.any(),
  narrative: z.any(),
  visitedNodes: z.array(z.string()),
  visitOrder: z.array(z.string()),
  messages: z.array(z.object({
    role: z.string(),
    content: z.string(),
  })),
  blocks: z.array(z.object({
    id: z.string(),
    questionTitle: z.string(),
  })),
});

const outputSchema = z.object({
  sections: z.array(z.object({
    heading: z.string().describe("Section heading, e.g. 'What I observed'"),
    content: z.string().describe("3-5 sentences of Markdown content for this section"),
  })).min(3).max(5),
  profileInsight: z.string().describe("1 sentence describing this specific visitor, used as page header"),
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

  const { profile, visitorProfile, narrative, visitedNodes, visitOrder, messages, blocks } = parsed.data;
  const vp = visitorProfile as VisitorProfile;
  const narr = narrative as ProfileNarrative;

  const visitedNodeSummaries = visitOrder
    .map((id) => {
      const node = CONTENT_GRAPH[id];
      return node?.tags?.summary ?? id.replace(/-/g, " ");
    })
    .map((s, i) => `${i + 1}. ${s}`)
    .join("\n");

  const chatQuestions = messages
    .filter((m) => m.role === "user")
    .map((m) => `- "${m.content}"`)
    .join("\n");

  const blockTitles = blocks
    .map((b) => b.questionTitle)
    .join(", ");

  const systemPrompt = `You are Max Marowsky, a psychologist turned EdTech product manager. A visitor has just completed their journey through your portfolio. Your job is to write a deeply personal, evidence-based analysis of what you observed about this visitor.

INTERVIEW ANSWERS (what the visitor told you about themselves):
- Evaluates candidates by: ${profile.persuasion} (${DIMENSION_LABELS.persuasion[profile.persuasion]})
- Learns by: ${profile.learning} (${DIMENSION_LABELS.learning[profile.learning]})
- Wishes school had: ${profile.education} (${DIMENSION_LABELS.education[profile.education]})
- Good work day means: ${profile.motivation} (${DIMENSION_LABELS.motivation[profile.motivation]})
- Shares things that are: ${profile.sharing} (${DIMENSION_LABELS.sharing[profile.sharing]})

INFERRED PROFILE (built from their behavior):
- Inferred role: ${vp.inferredRole ?? "couldn't determine"}
- Interests: ${Object.entries(vp.interests).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} (${v.toFixed(1)})`).join(", ") || "not enough data"}
- Preferred depth: ${vp.preferredDepth}
- Preferred tone: ${vp.preferredTone}
- Domain knowledge: ${Object.entries(vp.domainKnowledge).map(([k, v]) => `${k}: ${v}`).join(", ") || "unknown"}

BEHAVIORAL NARRATIVE:
${narr.summary || "Minimal interaction data."}
${narr.keyObservations.length > 0 ? "\nKey observations:\n" + narr.keyObservations.map((o) => `- ${o}`).join("\n") : ""}

VISIT PATH (in order):
${visitedNodeSummaries || "No nodes visited."}

QUESTIONS THE VISITOR ASKED:
${chatQuestions || "No free-form questions asked."}

CONTENT BLOCKS SEEN:
${blockTitles || "None."}

TOTAL INTERACTIONS: ${narr.interactionCount}

YOUR TASK: Write a 4-section analysis. Each section should be 3-5 sentences.

SECTION 1 — "What I observed"
Concrete behavioral observations. What did they click? What did they ask? What was the order? What patterns emerged? Reference SPECIFIC nodes they visited, questions they asked, choices they made. Every statement must be traceable to the data above.

SECTION 2 — "What I conclude from that"
Your hypotheses about this person. What kind of professional might they be? What do they care about? What surprised you? ALWAYS frame these as hypotheses: "My guess is...", "This suggests...", "I'm not certain, but...". If data is thin, say so: "You asked few questions, which makes it harder to read you. What I can say is..."

SECTION 3 — "How I adapted"
Be transparent about what your portfolio did differently. Which details were emphasized? What was de-emphasized? How did the tone shift? Reference specific content they saw and how it was shaped for them. This section demonstrates your product thinking.

SECTION 4 — "Why this matters"
Connect to your mission. Why do you build adaptive experiences? What does this have to do with Anthropic Education Labs? Keep it authentic and specific to what this visitor experienced — not a generic mission statement.

ALSO: Write a 1-sentence "profileInsight" — a concise, specific description of this visitor for the page header. Example: "Someone who values how things work over what they achieve, and who learns by doing." This replaces the generic "Here's what I learned about you."

CRITICAL RULES:
- ONLY reference things that actually happened. The visit path, the questions, the interview answers. Nothing else.
- Frame inferences as hypotheses, NEVER as facts.
- If data is sparse, say so. Uncertainty is a strength, not a weakness.
- Speak as Max in first person: "I noticed", "I adapted", "I want to build".
- Be specific. "You asked about team dynamics twice" is good. "You showed interest in collaboration" is too vague.
- Write in English.
- Each section 3-5 sentences. Not longer.`;

  // suppress unused variable warning — visitedNodes is part of the request contract
  void visitedNodes;

  try {
    const result = await generateText({
      model: "anthropic/claude-sonnet-4.5",
      output: Output.object({ schema: outputSchema }),
      prompt: systemPrompt,
    });

    return Response.json(result.output);
  } catch {
    return Response.json(null, { status: 500 });
  }
}
