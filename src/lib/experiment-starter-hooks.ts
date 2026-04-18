import type { ContentInterest } from "./experiment-types";
import type { Hook } from "./content-graph";

// Which entry hooks appear after interview, based on content interest
export const CONTENT_INTEREST_STARTER_HOOKS: Record<ContentInterest, Hook[]> = {
  technical: [
    { label: "The startup I built and sold", targetId: "startup-story" },
    { label: "What I'm building with Claude right now", targetId: "building-with-claude" },
    { label: "Side projects that taught me the most", targetId: "side-projects" },
    { label: "Why I want to work at Anthropic", targetId: "why-anthropic" },
  ],
  vision: [
    { label: "What I believe education gets wrong", targetId: "education-gets-wrong" },
    { label: "My vision for AI in education", targetId: "anthropic-education-vision" },
    { label: "The psychology of how we learn", targetId: "psychology-of-learning" },
    { label: "Why I want to work at Anthropic", targetId: "why-anthropic" },
  ],
  journey: [
    { label: "The startup I built and sold", targetId: "startup-story" },
    { label: "What I believe education gets wrong", targetId: "education-gets-wrong" },
    { label: "Why I want to work at Anthropic", targetId: "why-anthropic" },
    { label: "What I'd build if I could start from scratch", targetId: "what-id-build" },
  ],
};
