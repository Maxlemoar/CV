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
