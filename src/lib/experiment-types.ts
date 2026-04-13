// src/lib/experiment-types.ts

export type Persuasion = 'results' | 'process' | 'character';
export type Learning = 'exploratory' | 'structured' | 'social';
export type Education = 'practice' | 'individualization' | 'inspiration';
export type Motivation = 'mastery' | 'purpose' | 'relatedness';
export type Sharing = 'surprise' | 'utility' | 'emotion';

export interface ExperimentProfile {
  experimentNumber: number;
  persuasion: Persuasion;
  learning: Learning;
  education: Education;
  motivation: Motivation;
  sharing: Sharing;
}

export interface InterviewQuestion {
  id: string;
  text: string;
  options: {
    label: string;
    value: string;
  }[];
  dimension: keyof Omit<ExperimentProfile, 'experimentNumber'>;
}

export interface FrameRequest {
  type: 'frame';
  nodeId: string;
  profile: ExperimentProfile;
  visitedNodes: string[];
  previousNodeId?: string;
}

export interface FrameResponse {
  introduction: string;
  transition?: string;
  hookLabels?: Record<string, string>;
  learningMechanic?: {
    type: 'testing-effect' | 'spaced-retrieval';
    content: string;
    answer?: string;
  };
}

export interface SharedSession {
  id: string;
  experimentNumber: number;
  profile: ExperimentProfile;
  visitedNodes: string[];
  createdAt: string;
}

// Labels for the Reveal screen
export const DIMENSION_LABELS: Record<string, Record<string, string>> = {
  persuasion: {
    results: 'Results & Impact',
    process: 'Thinking Processes & Frameworks',
    character: 'Personality & Values',
  },
  learning: {
    exploratory: 'Exploratory & self-directed',
    structured: 'Systematic & methodical',
    social: 'Collaborative & dialogue-driven',
  },
  education: {
    practice: 'More practical application',
    individualization: 'More individualization',
    inspiration: 'More inspiration & passion',
  },
  motivation: {
    mastery: 'Mastery & deep expertise',
    purpose: 'Purpose & real-world impact',
    relatedness: 'Connection & collaboration',
  },
  sharing: {
    surprise: 'Unexpected insights',
    utility: 'Useful discoveries',
    emotion: 'Emotionally moving moments',
  },
};

export const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  {
    id: 'persuasion',
    text: "Before you get to know me — may I ask you something? If you had to evaluate a candidate in 30 seconds — what do you look at first?",
    options: [
      { label: "What they've achieved", value: 'results' },
      { label: 'How they think and solve problems', value: 'process' },
      { label: 'Who they are — energy, values, personality', value: 'character' },
    ],
    dimension: 'persuasion',
  },
  {
    id: 'learning',
    text: "Imagine you need to understand a topic you know nothing about. What do you do first?",
    options: [
      { label: 'Just start and learn along the way', value: 'exploratory' },
      { label: 'Research first, then proceed systematically', value: 'structured' },
      { label: 'Ask someone who knows', value: 'social' },
    ],
    dimension: 'learning',
  },
  {
    id: 'education',
    text: "When you think back to school or university — what could have been better?",
    options: [
      { label: 'More practical application — too much theory, too little doing', value: 'practice' },
      { label: 'More individualization — everyone was treated the same', value: 'individualization' },
      { label: 'More inspiration — it lacked passion and curiosity', value: 'inspiration' },
    ],
    dimension: 'education',
  },
  {
    id: 'motivation',
    text: "What makes a really good work day — what needs to have happened?",
    options: [
      { label: 'I solved a hard problem', value: 'mastery' },
      { label: 'I moved something that has real impact', value: 'purpose' },
      { label: 'I had great conversations with smart people', value: 'relatedness' },
    ],
    dimension: 'motivation',
  },
  {
    id: 'sharing',
    text: "Last question. When was the last time you showed someone something and said: 'You have to see this'?",
    options: [
      { label: 'Something surprising — it broke my expectations', value: 'surprise' },
      { label: 'Something useful — it could help you too', value: 'utility' },
      { label: 'Something moving — it touched me emotionally', value: 'emotion' },
    ],
    dimension: 'sharing',
  },
];
