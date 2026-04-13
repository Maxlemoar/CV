export type RichType = "stats" | "timeline" | "project" | "quote" | "tags" | "citation" | "photo" | null;

export interface StatItem {
  value: string;
  label: string;
}

export interface TimelineItem {
  year: string;
  text: string;
}

export interface ProjectData {
  name: string;
  description: string;
  emoji?: string;
}

export interface TagsData {
  tags: string[];
}

export interface CitationData {
  title: string;
  authors: string;
  publication: string;
  year: string;
  url?: string;
}

export interface PhotoData {
  src: string;
  alt: string;
}

export type RichData = StatItem[] | TimelineItem[] | ProjectData | TagsData | CitationData | PhotoData;

export interface HookSuggestion {
  label: string;
  question: string;
  targetId?: string;
}

export interface AIResponse {
  questionTitle: string;
  text: string;
  richType: RichType;
  richData: RichData | null;
  hooks: HookSuggestion[];
}

export interface ContentBlockData {
  id: string;
  questionTitle: string;
  text: string;
  richType: RichType;
  richData: RichData | null;
  hooks: HookSuggestion[];
}

export interface SessionData {
  id: string;
  blocks: ContentBlockData[];
  createdAt: string;
}

export type VisualStyle = "default" | "focused" | "colorful";
export type InfoDepth = "overview" | "deep-dive";
export type ContentFocus = "product-builder" | "learning-scientist" | "ai-vision" | "max-personal";

export interface UserPreferences {
  visualStyle: VisualStyle;
  darkMode: boolean;
  infoDepth: InfoDepth;
  contentFocus: ContentFocus;
  gamified: boolean;
}

export interface AchievementDefinition {
  id: string;
  emoji: string;
  name: string;
  description: string;
  requiredNodes?: string[];
  minVisited?: number;
  minFreeQuestions?: number;
  requiredEasterEgg?: string;
}
