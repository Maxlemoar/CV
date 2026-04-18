import type { Persuasion, Motivation, ContentInterest } from "./experiment-types";

export interface VisitorProfile {
  // From interview (mirrors ExperimentProfile minus experimentNumber)
  persuasion: Persuasion;
  motivation: Motivation;
  contentInterest: ContentInterest;

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
  motivation: Motivation;
  contentInterest: ContentInterest;
}): VisitorProfile {
  const inferredRole: Record<Persuasion, string> = {
    results: "technical evaluator",
    process: "product/strategy evaluator",
    character: "culture/people evaluator",
  };

  const preferredDepth: Record<Motivation, "surface" | "moderate" | "deep"> = {
    mastery: "deep",
    purpose: "moderate",
    relatedness: "moderate",
  };

  const preferredTone: Record<Motivation, "analytical" | "narrative" | "conversational"> = {
    mastery: "analytical",
    relatedness: "conversational",
    purpose: "narrative",
  };

  return {
    ...interview,
    inferredRole: inferredRole[interview.persuasion],
    interests: {},
    preferredDepth: preferredDepth[interview.motivation],
    preferredTone: preferredTone[interview.motivation],
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
