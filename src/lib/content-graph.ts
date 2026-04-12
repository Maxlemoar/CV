export interface QuizData {
  question: string;
  options: { label: string; correct?: boolean; explanation: string }[];
}

export interface Hook {
  label: string;
  targetId: string;
  requiredVisited?: string[];
  minVisited?: number;
}

export interface ContentNode {
  id: string;
  content: string;
  image?: { src: string; alt: string };
  quiz?: QuizData;
  hooks: Hook[];
  printSection?: "about" | "experience" | "education" | "projects" | "philosophy" | "publications" | "skills" | "personal";
  printOrder?: number;
}

export type ContentGraph = Record<string, ContentNode>;

export const ROOT_HOOKS: Hook[] = [
  { label: "What I believe school gets wrong", targetId: "school-gets-wrong" },
  { label: "The startup I built and sold", targetId: "startup-story" },
  { label: "Why I want to work at Anthropic", targetId: "why-anthropic" },
  { label: "What I\u2019m building with Claude right now", targetId: "building-with-claude" },
];

export const CONTENT_GRAPH: ContentGraph = {
  // ── ROOT LAYER ──────────────────────────────────────────────

  "school-gets-wrong": {
    id: "school-gets-wrong",
    content:
      "Schools optimize for the wrong metric. They test whether you can recall facts \u2014 but in a world with Claude, facts are free. What\u2019s scarce is the ability to ask the right question, evaluate an answer critically, and know what to do with it.",
    hooks: [
      { label: "So what should schools teach instead?", targetId: "what-schools-should-teach" },
      { label: "I built a product based on this belief", targetId: "startup-story" },
      { label: "How this connects to Anthropic", targetId: "anthropic-education-vision" },
    ],
    printSection: "philosophy",
    printOrder: 1,
  },

  "startup-story": {
    id: "startup-story",
    content:
      "I co-founded pearprogramming \u2014 a game where students learn to code by running a virtual startup. We won a federal grant, grew to 10 people, and in 2022 eduki acquired us. I was 28 when we started. It was the hardest and best thing I\u2019ve done.",
    hooks: [
      { label: "What made the product special?", targetId: "product-magic" },
      { label: "What happened after the acquisition?", targetId: "after-acquisition" },
      { label: "What founding taught me", targetId: "founder-lessons" },
    ],
    printSection: "experience",
    printOrder: 20,
  },

  "why-anthropic": {
    id: "why-anthropic",
    content:
      "I want to work at the company that takes AI ethics seriously \u2014 not as marketing, but as a constraint on revenue. Turning down military contracts when the money is right there? That\u2019s integrity. And the culture of autonomy, where people build prototypes because they\u2019re curious? That\u2019s how I work best.",
    hooks: [
      { label: "What I\u2019d want to build there", targetId: "what-id-build" },
      { label: "My experience with AI in education", targetId: "ai-in-education" },
      { label: "Who I am outside of work", targetId: "personal" },
    ],
    printSection: "about",
    printOrder: 10,
  },

  "building-with-claude": {
    id: "building-with-claude",
    content:
      "I use Claude Code every day to build full applications. I don\u2019t write code \u2014 I describe what I want, test the result, and iterate. Right now I\u2019m building three learning apps. The best way to understand AI is to ship with it.",
    image: { src: "/photo-coffee.jpg", alt: "Max working at a cafe" },
    hooks: [
      { label: "What apps are you building?", targetId: "side-projects" },
      { label: "How I used AI at my day job", targetId: "ai-in-education" },
      { label: "What this taught me about the future of work", targetId: "future-of-work" },
    ],
    printSection: "skills",
    printOrder: 1,
  },

  // ── EDUCATION PHILOSOPHY ────────────────────────────────────

  "what-schools-should-teach": {
    id: "what-schools-should-teach",
    content:
      "Agency. The confidence to say \u201cI don\u2019t know this yet, but I know how to figure it out.\u201d Anthropic calls it AI fluency \u2014 not just knowing AI exists, but being able to direct it, evaluate it, and adapt as it evolves. That\u2019s the skill of the century.",
    hooks: [
      { label: "How this connects to Anthropic\u2019s mission", targetId: "anthropic-education-vision" },
      { label: "I studied the science behind this", targetId: "psychology-of-learning" },
      { label: "I built a product based on this belief", targetId: "startup-story" },
    ],
    printSection: "philosophy",
    printOrder: 2,
  },

  "anthropic-education-vision": {
    id: "anthropic-education-vision",
    content:
      "Anthropic\u2019s Education Labs isn\u2019t building another EdTech tool. It\u2019s studying how AI transforms human capability \u2014 part research lab, part product studio. Claude\u2019s Learning Mode is Socratic on purpose: it refuses to hand over answers. The outcome metric isn\u2019t engagement. It\u2019s whether learners become more independent.",
    hooks: [
      { label: "This is exactly what I\u2019ve been working toward", targetId: "my-fit" },
      { label: "What I\u2019d want to build there", targetId: "what-id-build" },
    ],
    printSection: "philosophy",
    printOrder: 3,
  },

  "my-fit": {
    id: "my-fit",
    content:
      "Psychology taught me how people learn. Founding a startup taught me how to ship. Game-based learning taught me that the medium IS the message. And building with Claude taught me what AI-native actually means. I\u2019m not a PM who read about education \u2014 I\u2019ve published research, built products, and iterated prompts until 89% of AI assessments matched human judgment.",
    hooks: [
      { label: "The research I published", targetId: "research" },
      { label: "The AI assessor I built", targetId: "ai-in-education" },
      { label: "Why I want to work at Anthropic", targetId: "why-anthropic" },
    ],
    printSection: "about",
    printOrder: 2,
  },

  // ── STARTUP & CAREER ───────────────────────────────────────

  "product-magic": {
    id: "product-magic",
    content:
      "Students didn\u2019t just \u201clearn to code.\u201d They founded a virtual startup, made business decisions, and solved real programming challenges to grow it. We started with Google Blockly for visual programming, then progressed to real code. Completion rates were far above traditional e-learning \u2014 because intrinsic motivation beats curriculum every time.",
    quiz: {
      question: "Why did we start with visual programming instead of real code?",
      options: [
        {
          label: "It\u2019s more fun to look at",
          explanation: "The visual appeal helps, but the real reason is deeper \u2014 it\u2019s about cognitive load.",
        },
        {
          label: "It removes syntax errors so learners focus on logic",
          correct: true,
          explanation: "Exactly. Visual blocks eliminate the frustration of misplaced semicolons, letting beginners focus on what matters: understanding programming concepts like sequences, loops, and conditions.",
        },
        {
          label: "Kids can\u2019t type fast enough",
          explanation: "Typing speed isn\u2019t the bottleneck \u2014 conceptual understanding is. Visual programming addresses the real barrier.",
        },
      ],
    },
    hooks: [
      { label: "We published research on why this works", targetId: "research" },
      { label: "What happened after the acquisition?", targetId: "after-acquisition" },
    ],
    printSection: "experience",
    printOrder: 21,
  },

  "after-acquisition": {
    id: "after-acquisition",
    content:
      "eduki \u2014 Germany\u2019s largest marketplace for teaching materials, ~150 people \u2014 acquired us in 2022. I led the product integration with a team of seven. Then I spent three years finding product-market fit as an intrapreneur, before moving to own the core commerce experience: product page, cart, checkout.",
    hooks: [
      { label: "How I used AI to improve quality", targetId: "ai-in-education" },
      { label: "What founding taught me", targetId: "founder-lessons" },
      { label: "Who I am outside of work", targetId: "personal" },
    ],
    printSection: "experience",
    printOrder: 10,
  },

  "founder-lessons": {
    id: "founder-lessons",
    content:
      "Three things founding taught me: speed beats perfection, your first idea is almost certainly wrong, and hiring is harder than product. I learned to love iteration and to let go of ego. Building something from zero \u2014 and then letting someone else buy it \u2014 teaches you what really matters.",
    hooks: [
      { label: "My product management approach", targetId: "pm-approach" },
      { label: "Who I am outside of work", targetId: "personal" },
    ],
    printSection: "about",
    printOrder: 3,
  },

  "pm-approach": {
    id: "pm-approach",
    content:
      "I\u2019m hypothesis-driven. I don\u2019t ask \u201cwhat should we build?\u201d but \u201cwhat do we believe, and how do we test it?\u201d Deep discoveries before building. A/B tests to validate. And the discipline to kill ideas that don\u2019t work \u2014 including my own.",
    hooks: [
      { label: "A recent example", targetId: "ai-in-education" },
      { label: "Why I want to work at Anthropic", targetId: "why-anthropic" },
    ],
    printSection: "skills",
    printOrder: 3,
  },

  // ── AI IN EDUCATION ────────────────────────────────────────

  "ai-in-education": {
    id: "ai-in-education",
    content:
      "In Q1 2026 I led \u201cMake Quality Visible\u201d at eduki: an AI assessor that evaluates teaching materials across 12 criteria. I wrote the prompt myself, iterated it through 10 versions with Claude, and validated it with human reviewers. Version 10 achieves 89% agreement. The framework was co-developed with Prof. John Hattie.",
    quiz: {
      question: "The framework identified 7 quality dimensions, but 2 were excluded from scoring. Why?",
      options: [
        {
          label: "Teachers didn\u2019t think they were important",
          explanation: "Teachers valued them \u2014 the issue was statistical, not perceptual.",
        },
        {
          label: "All materials scored similarly on them",
          correct: true,
          explanation: "Exactly. \u201cCollaboration\u201d and \u201cTeacher Growth\u201d showed too little variance across materials. When a dimension can\u2019t differentiate, it can\u2019t help rank quality. Good psychometrics means dropping what doesn\u2019t discriminate.",
        },
        {
          label: "The AI couldn\u2019t assess them",
          explanation: "The AI could score them fine \u2014 the scores just didn\u2019t vary enough to be useful.",
        },
      ],
    },
    hooks: [
      { label: "Who is John Hattie?", targetId: "research" },
      { label: "What this taught me about AI products", targetId: "future-of-work" },
      { label: "What I\u2019d want to build at Anthropic", targetId: "what-id-build" },
    ],
    printSection: "experience",
    printOrder: 5,
  },

  // ── BUILDING WITH CLAUDE ───────────────────────────────────

  "side-projects": {
    id: "side-projects",
    content:
      "A learning app for paramedic trainees with spaced repetition. A German language app for refugees with audio-first interactions for low-literacy users. A vocabulary app I built in days, not months. All built with Claude Code. All in education. I can\u2019t stop building things that help people learn.",
    hooks: [
      { label: "What this taught me about AI-native building", targetId: "future-of-work" },
      { label: "Why I want to work at Anthropic", targetId: "why-anthropic" },
      { label: "Who I am outside of work", targetId: "personal" },
    ],
    printSection: "projects",
    printOrder: 1,
  },

  "future-of-work": {
    id: "future-of-work",
    content:
      "Building with Claude changed my understanding of product management. The bottleneck isn\u2019t implementation anymore \u2014 it\u2019s taste, judgment, and knowing what\u2019s worth building. PMs who can\u2019t prototype with AI will be like PMs who can\u2019t read a spreadsheet.",
    hooks: [
      { label: "What I\u2019d want to build at Anthropic", targetId: "what-id-build" },
      { label: "My product management approach", targetId: "pm-approach" },
    ],
    printSection: "skills",
    printOrder: 2,
  },

  // ── VISION ─────────────────────────────────────────────────

  "what-id-build": {
    id: "what-id-build",
    content:
      "I\u2019d want to build learning experiences where AI doesn\u2019t replace the teacher but amplifies the learner. Systems that identify what you don\u2019t understand yet \u2014 not just what you got wrong. Products where the measure of success is: did this person become more capable and more curious?",
    hooks: [
      { label: "The science behind this", targetId: "psychology-of-learning" },
      { label: "Why Anthropic is the right place for this", targetId: "why-anthropic" },
      { label: "Who I am outside of work", targetId: "personal" },
    ],
    printSection: "philosophy",
    printOrder: 5,
  },

  "psychology-of-learning": {
    id: "psychology-of-learning",
    content:
      "My M.Sc. thesis studied motivation in computer science education. The finding that stuck with me: learners need to feel autonomous, competent, and connected (Self-Determination Theory). Every product I\u2019ve built since tries to hit all three.",
    hooks: [
      { label: "The research I published", targetId: "research" },
      { label: "How I applied this at pearprogramming", targetId: "product-magic" },
    ],
    printSection: "education",
    printOrder: 1,
  },

  // ── RESEARCH & PUBLICATIONS ────────────────────────────────

  "research": {
    id: "research",
    content:
      "I co-authored a Springer book chapter on game-based learning with my wife Anna (M.Sc. Neuroscience). I worked with Prof. John Hattie \u2014 whose \u201cVisible Learning\u201d is the largest meta-analysis in education \u2014 on two published studies validating a quality framework for teaching materials with 2,000+ teachers.",
    hooks: [
      { label: "How this became a real product", targetId: "ai-in-education" },
      { label: "What I believe about the future of learning", targetId: "what-id-build" },
      { label: "Who I am outside of work", targetId: "personal" },
    ],
    printSection: "publications",
    printOrder: 1,
  },

  // ── PERSONAL ───────────────────────────────────────────────

  "personal": {
    id: "personal",
    content:
      "I\u2019m a 34-year-old new dad, specialty coffee nerd, road cyclist, and ambitious home cook. I live in Cologne with my wife Anna and our daughter Frieda. I once dreamed of becoming a chef. Now I dream of opening a cafe someday \u2014 and building things that help the next generation learn better.",
    image: { src: "/photo-frieda.jpg", alt: "Max with daughter Frieda" },
    hooks: [
      { label: "My family", targetId: "family" },
      { label: "Coffee", targetId: "coffee" },
      { label: "Cycling", targetId: "cycling" },
    ],
    printSection: "personal",
    printOrder: 1,
  },

  "family": {
    id: "family",
    content:
      "Frieda was born in August 2025. Becoming a father changed how I think about education. It\u2019s not abstract anymore \u2014 what kind of learning do I want for her? Not memorization. Not standardized tests. I want her to stay curious.",
    image: { src: "/photo-wedding.jpg", alt: "Max and Anna at their wedding" },
    hooks: [
      { label: "What I believe school gets wrong", targetId: "school-gets-wrong" },
      { label: "What I\u2019d want to build at Anthropic", targetId: "what-id-build" },
    ],
    printSection: "personal",
    printOrder: 2,
  },

  "coffee": {
    id: "coffee",
    content:
      "Pour-over, hand-brewed, single origin. I was a barista once. I love geeking out about extraction ratios and water temperature. Filter coffee is my love language.",
    hooks: [
      { label: "Cycling", targetId: "cycling" },
    ],
    printSection: "personal",
    printOrder: 3,
  },

  "cycling": {
    id: "cycling",
    content:
      "I recently discovered road cycling and fell in love. Long rides clear my head. I\u2019m outdoors as much as I can be \u2014 hiking, cycling, just moving.",
    image: { src: "/photo-cycling.jpg", alt: "Max with his road bike" },
    hooks: [],
    printSection: "personal",
    printOrder: 4,
  },
};

// Helper: get all nodes sorted for print
export function getPrintNodes(): ContentNode[] {
  const sectionOrder = ["about", "education", "experience", "projects", "philosophy", "publications", "skills", "personal"];
  return Object.values(CONTENT_GRAPH).sort((a, b) => {
    const ai = sectionOrder.indexOf(a.printSection ?? "personal");
    const bi = sectionOrder.indexOf(b.printSection ?? "personal");
    if (ai !== bi) return ai - bi;
    return (a.printOrder ?? 99) - (b.printOrder ?? 99);
  });
}
