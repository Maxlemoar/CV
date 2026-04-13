import type { AchievementDefinition } from "@/lib/types";

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  {
    id: "founder",
    emoji: "🚀",
    name: "Founder",
    description: "All startup topics discovered",
    requiredNodes: ["startup-story", "product-magic", "after-acquisition", "founder-lessons"],
  },
  {
    id: "learning-scientist",
    emoji: "🔬",
    name: "Learning Scientist",
    description: "All education topics discovered",
    requiredNodes: ["school-gets-wrong", "what-schools-should-teach", "psychology-of-learning", "anthropic-education-vision"],
  },
  {
    id: "ai-native",
    emoji: "🤖",
    name: "AI Native",
    description: "All AI topics discovered",
    requiredNodes: ["building-with-claude", "ai-in-education", "side-projects"],
  },
  {
    id: "deep-diver",
    emoji: "💬",
    name: "Deep Diver",
    description: "5+ free-form questions asked",
    minFreeQuestions: 5,
  },
  {
    id: "explorer",
    emoji: "🗺️",
    name: "Explorer",
    description: "Over half discovered",
    minVisited: 10,
  },
  {
    id: "completionist",
    emoji: "🏆",
    name: "Completionist",
    description: "Everything discovered",
  },
  {
    id: "coffee-hunter",
    emoji: "☕",
    name: "Coffee Hunter",
    description: "Found Max's secret café",
    requiredEasterEgg: "coffee",
  },
];
