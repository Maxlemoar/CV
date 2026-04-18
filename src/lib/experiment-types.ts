// src/lib/experiment-types.ts

export type Persuasion = 'results' | 'process' | 'character';
export type Motivation = 'mastery' | 'purpose' | 'relatedness';
export type ContentInterest = 'technical' | 'vision' | 'journey';

export interface ExperimentProfile {
  experimentNumber: number;
  persuasion: Persuasion;
  motivation: Motivation;
  contentInterest: ContentInterest;
}

// Live signal vector — seeded from interview answers, nudged by every click.
// Used to rank follow-up hooks and to feed /api/frame so Claude picks
// personalized next-nodes.
export interface SignalVector {
  persuasion: Record<Persuasion, number>;
  motivation: Record<Motivation, number>;
  topics: Record<string, number>;
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
  motivation: {
    mastery: 'Mastery & deep expertise',
    purpose: 'Purpose & real-world impact',
    relatedness: 'Connection & collaboration',
  },
  contentInterest: {
    technical: 'Technical depth — projects, tech, outcomes',
    vision: 'Vision & philosophy — beliefs, ideas, direction',
    journey: 'Personal journey — story, milestones, decisions',
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
    id: 'contentInterest',
    text: "What interests you most when getting to know a candidate like me?",
    options: [
      { label: 'What you can do — projects, tech, outcomes', value: 'technical' },
      { label: 'How you think — vision, philosophy, beliefs', value: 'vision' },
      { label: 'Your path — story, milestones, decisions', value: 'journey' },
    ],
    dimension: 'contentInterest',
  },
];
