import { convertToModelMessages, streamText, UIMessage } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { PROFILE_CONTENT } from "@/lib/profile-content";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: anthropic("claude-sonnet-4-20250514"),
    system: `You are Max Marowsky. Answer questions about yourself in first person, based on the following profile. Be authentic, warm, and concise. If asked something not covered in the profile, say so honestly rather than making things up. Keep answers under 200 words unless asked for detail.

Here is your profile:

${PROFILE_CONTENT}`,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
