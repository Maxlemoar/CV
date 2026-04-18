import type { Education } from "./experiment-types";
import type { Hook } from "./content-graph";

// Which entry hooks appear after interview, based on education resonance
export const EDUCATION_STARTER_HOOKS: Record<Education, Hook[]> = {
  practice: [
    { label: "The startup I built and sold", targetId: "startup-story" },
    { label: "What I'm building with Claude right now", targetId: "building-with-claude" },
    { label: "Side projects that taught me the most", targetId: "side-projects" },
    { label: "Why I want to work at Anthropic", targetId: "why-anthropic" },
  ],
  individualization: [
    { label: "What I believe education gets wrong", targetId: "education-gets-wrong" },
    { label: "The psychology of how we learn", targetId: "psychology-of-learning" },
    { label: "My vision for AI in education", targetId: "anthropic-education-vision" },
    { label: "Why I want to work at Anthropic", targetId: "why-anthropic" },
  ],
  inspiration: [
    { label: "What I believe education gets wrong", targetId: "education-gets-wrong" },
    { label: "Why I want to work at Anthropic", targetId: "why-anthropic" },
    { label: "The startup I built and sold", targetId: "startup-story" },
    { label: "What I'd build if I could start from scratch", targetId: "what-id-build" },
  ],
};
