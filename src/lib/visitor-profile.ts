import type { Persuasion, Learning, Education, Motivation, Sharing } from "./experiment-types";

export interface VisitorProfile {
  // From interview (mirrors ExperimentProfile minus experimentNumber)
  persuasion: Persuasion;
  learning: Learning;
  education: Education;
  motivation: Motivation;
  sharing: Sharing;

  // Inferred by Claude, updated after every interaction
  inferredRole: string | null;
  interests: Record<string, number>;
  preferredDepth: "surface" | "moderate" | "deep";
  preferredTone: "analytical" | "narrative" | "conversational" | "formal";
  domainKnowledge: Record<string, "novice" | "familiar" | "expert">;
}

export interface ProfileNarrative {
  summary: string;
  keyObservations: string[];
  interactionCount: number;
  lastUpdated: string;
}

export interface GeneratedContent {
  title: string;
  content: string;
  hooks: Array<{
    nodeId: string;
    label: string;
    teaser: string;
  }>;
}

export function createEmptyVisitorProfile(interview: {
  persuasion: Persuasion;
  learning: Learning;
  education: Education;
  motivation: Motivation;
  sharing: Sharing;
}): VisitorProfile {
  return {
    ...interview,
    inferredRole: null,
    interests: {},
    preferredDepth: interview.learning === "structured" ? "moderate" : "deep",
    preferredTone: interview.learning === "social" ? "conversational" : "narrative",
    domainKnowledge: {},
  };
}

export function createEmptyNarrative(): ProfileNarrative {
  return {
    summary: "",
    keyObservations: [],
    interactionCount: 0,
    lastUpdated: new Date().toISOString(),
  };
}
