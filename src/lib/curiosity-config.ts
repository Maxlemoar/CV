export type CuriosityMode = "education" | "product" | "ai" | "person";

export interface ModeConfig {
  label: string;
  description: string;
  order: string[];
  highlight: string[];
  expandDefault: string[];
}

export const MODES: Record<CuriosityMode, ModeConfig> = {
  education: {
    label: "How Max thinks about education",
    description: "Learning philosophy, curriculum design, and game-based pedagogy",
    order: ["philosophy", "experience", "projects", "publications", "about", "skills", "personal"],
    highlight: ["philosophy", "projects"],
    expandDefault: ["philosophy"],
  },
  product: {
    label: "Max's product management track record",
    description: "From startup founder to scale-up PM — shipping, measuring, iterating",
    order: ["experience", "projects", "skills", "about", "philosophy", "publications", "personal"],
    highlight: ["experience", "skills"],
    expandDefault: ["experience"],
  },
  ai: {
    label: "Max's experience with AI",
    description: "Building with Claude, prompt engineering, AI-powered assessment systems",
    order: ["projects", "experience", "skills", "philosophy", "about", "publications", "personal"],
    highlight: ["projects", "experience"],
    expandDefault: ["projects"],
  },
  person: {
    label: "Who Max is as a person",
    description: "Coffee nerd, bread baker, cyclist, father, and lifelong learner",
    order: ["personal", "about", "philosophy", "experience", "projects", "publications", "skills"],
    highlight: ["personal", "about"],
    expandDefault: ["personal", "about"],
  },
};

export const DEFAULT_ORDER = ["about", "experience", "projects", "philosophy", "publications", "skills", "personal"];
