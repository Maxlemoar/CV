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
  { label: "I co-founded a startup that got acquired", targetId: "startup-intro" },
  { label: "I think schools are teaching the wrong things", targetId: "education-philosophy" },
  { label: "I build apps without writing a single line of code", targetId: "ai-building" },
  { label: "I\u2019m a psychologist who became a product manager", targetId: "career-transition" },
];

export const CONTENT_GRAPH: ContentGraph = {
  // ── ROOT LAYER ──────────────────────────────────────────────
  "startup-intro": {
    id: "startup-intro",
    content:
      "I co-founded pearprogramming \u2014 a game-based learning app that taught kids to code by running a virtual startup. We grew to 10 people, won a federal grant, and in 2022 eduki acquired us.",
    hooks: [
      { label: "What was the product?", targetId: "product-details" },
      { label: "What happened after the acquisition?", targetId: "eduki-integration" },
      { label: "What did I learn from founding?", targetId: "founder-learnings" },
    ],
    printSection: "experience",
    printOrder: 30,
  },
  "education-philosophy": {
    id: "education-philosophy",
    content:
      "I believe fact-oriented learning is dead. When an LLM can answer any knowledge question in seconds, schools need to teach agency, critical thinking, and the ability to learn \u2014 not memorize.",
    hooks: [
      { label: "What should schools teach instead?", targetId: "agency-not-facts" },
      { label: "How did you put this into practice?", targetId: "pearprogramming-pedagogy" },
      { label: "Who influenced your thinking?", targetId: "hattie-collaboration" },
    ],
    printSection: "philosophy",
    printOrder: 1,
  },
  "ai-building": {
    id: "ai-building",
    content:
      "I use Claude Code to build full applications \u2014 three are in testing right now. I don\u2019t write code line by line; I describe what I want, iterate on the result, and ship. It changed how I think about product.",
    hooks: [
      { label: "What apps are you building?", targetId: "side-projects" },
      { label: "How does building with AI actually work?", targetId: "claude-workflow" },
      { label: "How did you use AI at work?", targetId: "quality-assessor" },
    ],
    printSection: "skills",
    printOrder: 1,
  },
  "career-transition": {
    id: "career-transition",
    content:
      "I studied psychology because I wanted to understand how people learn. That led me to ed-tech, then to founding a startup, then to product management. The thread was always: how do we help people grow?",
    hooks: [
      { label: "Why psychology \u2192 product?", targetId: "psychology-to-pm" },
      { label: "What\u2019s your product approach?", targetId: "pm-methodology" },
      { label: "What did you study?", targetId: "education-background" },
    ],
    printSection: "about",
    printOrder: 1,
  },

  // ── LAYER 2 ─────────────────────────────────────────────────
  "product-details": {
    id: "product-details",
    content:
      "Students founded a virtual startup inside the app, made business decisions, and solved programming challenges to grow it. We started with Google Blockly for visual programming, then progressed to text-based code.",
    hooks: [
      { label: "How did game-based learning work?", targetId: "game-mechanics" },
      { label: "What tool taught visual programming?", targetId: "blockly-quiz" },
    ],
    printSection: "experience",
    printOrder: 31,
  },
  "eduki-integration": {
    id: "eduki-integration",
    content:
      "After the acquisition, I joined eduki as Product Manager. My first job: integrate the pearprogramming app into Germany\u2019s largest teaching materials marketplace. I led a cross-functional team of seven.",
    hooks: [
      { label: "What is eduki?", targetId: "eduki-overview" },
      { label: "What did you do after integration?", targetId: "commerce-pm" },
      { label: 'What was "Make Quality Visible"?', targetId: "quality-project" },
    ],
    printSection: "experience",
    printOrder: 20,
  },
  "founder-learnings": {
    id: "founder-learnings",
    content:
      "Founding taught me that speed beats perfection, that hiring is the hardest skill, and that your first product idea is almost certainly wrong. I learned to love iteration and to let go of ego.",
    hooks: [
      { label: "Who is Max outside of work?", targetId: "personal-intro" },
      { label: "What\u2019s your product approach?", targetId: "pm-methodology" },
    ],
    printSection: "about",
    printOrder: 3,
  },
  "agency-not-facts": {
    id: "agency-not-facts",
    content:
      "Schools should teach students to identify what they don\u2019t know, formulate the right questions, and evaluate sources critically. The goal isn\u2019t knowledge \u2014 it\u2019s the confidence and skill to learn anything independently.",
    hooks: [
      { label: "How did you put this into practice?", targetId: "pearprogramming-pedagogy" },
      { label: "We published research on this", targetId: "springer-chapter" },
    ],
    printSection: "philosophy",
    printOrder: 2,
  },
  "pearprogramming-pedagogy": {
    id: "pearprogramming-pedagogy",
    content:
      "At pearprogramming, every student learned at their own pace. The game adapted to their level. We designed for mastery, not speed \u2014 and teachers loved it because it freed them to coach individuals.",
    hooks: [
      { label: "How did game-based learning work?", targetId: "game-mechanics" },
      { label: "What was the product?", targetId: "product-details" },
      { label: "We published this research", targetId: "springer-chapter" },
    ],
    printSection: "experience",
    printOrder: 32,
  },
  "hattie-collaboration": {
    id: "hattie-collaboration",
    content:
      'I worked with Prof. John Hattie \u2014 the researcher behind "Visible Learning," the largest meta-analysis of what works in education. Together we developed a quality framework for teaching materials.',
    hooks: [
      { label: 'What was "Make Quality Visible"?', targetId: "quality-project" },
      { label: "The quality studies", targetId: "quality-studies" },
      { label: "Who is John Hattie?", targetId: "hattie-info" },
    ],
    printSection: "publications",
    printOrder: 1,
  },
  "side-projects": {
    id: "side-projects",
    content:
      "I\u2019m building a learning app for paramedic trainees, a vocabulary app, and an inclusion app for refugees learning German. All built with Claude Code, all currently in testing.",
    hooks: [
      { label: "Paramedic learning app", targetId: "paramedic-app" },
      { label: "Inclusion app for refugees", targetId: "inclusion-app" },
      { label: "Vocabulary app", targetId: "vocab-app" },
    ],
    printSection: "projects",
    printOrder: 1,
  },
  "claude-workflow": {
    id: "claude-workflow",
    content:
      "I describe what I want conversationally, Claude generates code, I test and iterate. The key skill isn\u2019t coding \u2014 it\u2019s knowing what to build, how to break problems down, and when the AI\u2019s output is wrong.",
    hooks: [
      { label: "What apps are you building?", targetId: "side-projects" },
      { label: "How did you use AI at work?", targetId: "quality-assessor" },
    ],
    printSection: "skills",
    printOrder: 2,
  },
  "quality-assessor": {
    id: "quality-assessor",
    content:
      'For eduki\u2019s "Make Quality Visible" project, I built an AI assessor using Gemini Flash. It evaluates teaching materials across 12 criteria. My prompt (version 10) achieves 89% agreement with human reviewers.',
    hooks: [
      { label: 'What was "Make Quality Visible"?', targetId: "quality-project" },
      { label: "How does building with AI actually work?", targetId: "claude-workflow" },
    ],
    printSection: "experience",
    printOrder: 11,
  },
  "psychology-to-pm": {
    id: "psychology-to-pm",
    content:
      "Psychology gave me user empathy and research methods. Founding a startup gave me product instinct. The transition wasn\u2019t a pivot \u2014 it was a natural evolution. I still think like a researcher who ships.",
    hooks: [
      { label: "What did you study?", targetId: "education-background" },
      { label: "What\u2019s your product approach?", targetId: "pm-methodology" },
    ],
    printSection: "about",
    printOrder: 2,
  },
  "pm-methodology": {
    id: "pm-methodology",
    content:
      'I run deep discoveries before building. I A/B test relentlessly. I believe the best PMs are hypothesis-driven \u2014 they don\u2019t ask "what should we build?" but "what do we believe, and how do we test it?"',
    hooks: [
      { label: "What did you do after integration?", targetId: "commerce-pm" },
      { label: 'What was "Make Quality Visible"?', targetId: "quality-project" },
    ],
    printSection: "skills",
    printOrder: 3,
  },
  "education-background": {
    id: "education-background",
    content:
      "B.Sc. and M.Sc. in Psychology at Universit\u00e4t Witten/Herdecke (grades 1.7 and 1.5). My thesis explored motivation in computer science education. Before that, a semester of Cognitive Science in Osnabr\u00fcck.",
    hooks: [
      { label: "Why psychology \u2192 product?", targetId: "psychology-to-pm" },
      { label: "Here\u2019s a summary of what I bring", targetId: "skills-summary", minVisited: 5 },
    ],
    printSection: "education",
    printOrder: 1,
  },

  // ── LAYER 3+ ────────────────────────────────────────────────
  "game-mechanics": {
    id: "game-mechanics",
    content:
      "The game narrative created intrinsic motivation \u2014 students weren\u2019t just doing exercises, they were building something. Each programming concept was tied to a business challenge. Completion rates were far above traditional e-learning.",
    hooks: [
      { label: "We published this research", targetId: "springer-chapter" },
      { label: "Who influenced your thinking?", targetId: "hattie-collaboration" },
    ],
    printSection: "experience",
    printOrder: 33,
  },
  "blockly-quiz": {
    id: "blockly-quiz",
    content:
      "Google Blockly lets you snap visual blocks together like puzzle pieces to learn programming logic \u2014 sequences, loops, conditions \u2014 without syntax errors getting in the way.",
    quiz: {
      question: "What makes visual programming effective for beginners?",
      options: [
        {
          label: "No syntax errors to debug",
          correct: true,
          explanation:
            "Visual blocks eliminate syntax mistakes, letting learners focus on logic and concepts rather than misplaced semicolons.",
        },
        {
          label: "It\u2019s faster than text coding",
          explanation:
            "Speed isn\u2019t the point \u2014 it\u2019s about removing barriers so learners can focus on understanding core programming concepts.",
        },
        {
          label: "It looks more fun",
          explanation:
            "While visual, the real benefit is cognitive \u2014 reducing extraneous load so learners focus on structure, not syntax.",
        },
      ],
    },
    hooks: [
      { label: "How did game-based learning work?", targetId: "game-mechanics" },
    ],
    printSection: "experience",
    printOrder: 34,
  },
  "eduki-overview": {
    id: "eduki-overview",
    content:
      "eduki is Germany\u2019s largest marketplace for teaching materials \u2014 think TeachersPayTeachers for the DACH region. About 150 employees, millions of materials, and a mission to support teachers.",
    hooks: [
      { label: "What did you do after integration?", targetId: "commerce-pm" },
      { label: 'What was "Make Quality Visible"?', targetId: "quality-project" },
    ],
    printSection: "experience",
    printOrder: 19,
  },
  "commerce-pm": {
    id: "commerce-pm",
    content:
      "Since 2025 I own the product page, cart, checkout, and favorites. I run extensive discoveries and optimize through incremental A/B tests. It\u2019s classic e-commerce PM work \u2014 conversion funnels, user research, data-driven decisions.",
    hooks: [
      { label: "What\u2019s your product approach?", targetId: "pm-methodology" },
      { label: "Who is Max outside of work?", targetId: "personal-intro" },
    ],
    printSection: "experience",
    printOrder: 15,
  },
  "quality-project": {
    id: "quality-project",
    content:
      'Make Quality Visible: we built the "Best of eduki" label. Materials scoring \u22658.83/10 earn it. The AI assessor evaluates 12 criteria across 5 quality dimensions. Factor analysis identified 7 underlying quality factors.',
    hooks: [
      { label: "How does the AI assessor work?", targetId: "assessor-technical" },
      { label: "Why were 2 dimensions excluded?", targetId: "dimensions-quiz" },
      { label: "Who is John Hattie?", targetId: "hattie-info" },
    ],
    printSection: "experience",
    printOrder: 10,
  },
  "assessor-technical": {
    id: "assessor-technical",
    content:
      "The assessor uses Gemini Flash to evaluate materials against criteria like Goals & Structure, Differentiation, Content Engagement, Context & Culture, and Time Efficiency. I wrote and iterated the prompt myself using Claude.",
    hooks: [
      { label: "The quality studies", targetId: "quality-studies" },
      { label: "How does building with AI actually work?", targetId: "claude-workflow" },
    ],
    printSection: "experience",
    printOrder: 12,
  },
  "dimensions-quiz": {
    id: "dimensions-quiz",
    content:
      "Our factor analysis found 7 dimensions of quality, but Collaboration and Teacher Growth showed too little statistical variance to be useful for scoring \u2014 nearly all materials scored similarly on them.",
    quiz: {
      question: "Why were 2 dimensions excluded from the final quality scoring?",
      options: [
        {
          label: "They weren\u2019t important for quality",
          explanation:
            "They are important \u2014 but they didn\u2019t help differentiate between materials statistically.",
        },
        {
          label: "Low statistical variance \u2014 all materials scored similarly",
          correct: true,
          explanation:
            "When every material scores about the same on a dimension, it can\u2019t help distinguish quality differences. Good psychometrics means dropping what doesn\u2019t discriminate.",
        },
        {
          label: "Teachers didn\u2019t understand them",
          explanation:
            "Comprehension wasn\u2019t the issue \u2014 the data showed these dimensions simply didn\u2019t discriminate between materials.",
        },
      ],
    },
    hooks: [
      { label: "Who is John Hattie?", targetId: "hattie-info" },
    ],
    printSection: "experience",
    printOrder: 13,
  },
  "hattie-info": {
    id: "hattie-info",
    content:
      'John Hattie is one of the most-cited education researchers alive. His "Visible Learning" synthesized 1,800+ meta-analyses on what impacts student achievement. His framework gave us a scientific foundation for evaluating teaching materials.',
    hooks: [
      { label: "The quality studies", targetId: "quality-studies" },
      { label: "What should schools teach instead?", targetId: "agency-not-facts" },
    ],
    printSection: "publications",
    printOrder: 2,
  },
  "springer-chapter": {
    id: "springer-chapter",
    content:
      'In 2021 I co-authored "The Teacher-Centered Perspective on Digital Game-Based Learning" in a Springer volume. It argues that game-based learning succeeds when teachers are empowered, not replaced.',
    hooks: [
      { label: "The quality studies", targetId: "quality-studies" },
      { label: "How did you put this into practice?", targetId: "pearprogramming-pedagogy" },
    ],
    printSection: "publications",
    printOrder: 3,
  },
  "quality-studies": {
    id: "quality-studies",
    content:
      "We published two studies with Prof. Hattie validating the quality framework. The research connects psychometric analysis with practical product features \u2014 turning academic rigor into something teachers actually use.",
    hooks: [
      { label: "Who is John Hattie?", targetId: "hattie-info" },
      { label: 'What was "Make Quality Visible"?', targetId: "quality-project" },
    ],
    printSection: "publications",
    printOrder: 4,
  },
  "paramedic-app": {
    id: "paramedic-app",
    content:
      "A spaced-repetition learning app for Rettungssanit\u00e4ter trainees in Germany. Built entirely with Claude Code. It covers protocols, anatomy, and emergency procedures \u2014 currently in testing with real trainees.",
    hooks: [
      { label: "How does building with AI actually work?", targetId: "claude-workflow" },
    ],
    printSection: "projects",
    printOrder: 2,
  },
  "inclusion-app": {
    id: "inclusion-app",
    content:
      "An app helping refugees learn German through everyday scenarios \u2014 buying groceries, visiting a doctor, talking to neighbors. Designed for low-literacy users with audio-first interactions.",
    hooks: [
      { label: "How does building with AI actually work?", targetId: "claude-workflow" },
    ],
    printSection: "projects",
    printOrder: 3,
  },
  "vocab-app": {
    id: "vocab-app",
    content:
      "A vocabulary learning app using spaced repetition and contextual sentences. Nothing revolutionary in concept \u2014 but I built it in days, not months, because Claude Code handled the implementation.",
    hooks: [
      { label: "How does building with AI actually work?", targetId: "claude-workflow" },
    ],
    printSection: "projects",
    printOrder: 4,
  },

  // ── PERSONAL ────────────────────────────────────────────────
  "personal-intro": {
    id: "personal-intro",
    content:
      "Outside work, I\u2019m a new dad (Frieda, born August 2025), a specialty coffee nerd, a road cyclist, and an ambitious home cook who dreams of opening a cafe someday.",
    image: { src: "/photo-frieda.jpg", alt: "Max with daughter Frieda" },
    hooks: [
      { label: "Coffee", targetId: "coffee-passion" },
      { label: "Family", targetId: "family-frieda" },
      { label: "Cycling", targetId: "cycling-hobby" },
      { label: "Cooking", targetId: "cooking-baking" },
    ],
    printSection: "personal",
    printOrder: 1,
  },
  "coffee-passion": {
    id: "coffee-passion",
    content:
      "I\u2019m obsessed with filter coffee \u2014 pour-over, hand-brewed, single origin. I was a barista once. I love geeking out about extraction, grind size, and water temperature with anyone who\u2019ll listen.",
    hooks: [],
    printSection: "personal",
    printOrder: 2,
  },
  "family-frieda": {
    id: "family-frieda",
    content:
      "My daughter Frieda was born in August 2025. Becoming a father changed my perspective on everything \u2014 especially education. What kind of world and what kind of learning do I want for her?",
    image: { src: "/photo-wedding.jpg", alt: "Max and Anna at their wedding" },
    hooks: [
      { label: "I think schools are teaching the wrong things", targetId: "education-philosophy" },
    ],
    printSection: "personal",
    printOrder: 3,
  },
  "cycling-hobby": {
    id: "cycling-hobby",
    content:
      "I recently discovered road cycling and fell in love. There\u2019s something about long rides that clears my head. I\u2019m outdoors as much as I can be \u2014 hiking, cycling, just moving.",
    image: { src: "/photo-cycling.jpg", alt: "Max with his road bike" },
    hooks: [],
    printSection: "personal",
    printOrder: 4,
  },
  "cooking-baking": {
    id: "cooking-baking",
    content:
      "I\u2019m a passionate cook and bread baker. I once dreamed of becoming a chef. The dream evolved into wanting to open my own cafe someday \u2014 combining coffee, baking, and community.",
    hooks: [
      { label: "Coffee", targetId: "coffee-passion" },
    ],
    printSection: "personal",
    printOrder: 5,
  },

  // ── CONDITIONAL ─────────────────────────────────────────────
  "skills-summary": {
    id: "skills-summary",
    content:
      "Product management, AI/LLM prompt engineering, quantitative research, game-based learning design, startup leadership. I speak German (native), English (C1), and Italian (B1). My tools: Claude, SPSS, and strong opinions loosely held.",
    hooks: [
      { label: "Why Anthropic?", targetId: "why-anthropic" },
    ],
    printSection: "skills",
    printOrder: 10,
  },
  "why-anthropic": {
    id: "why-anthropic",
    content:
      "Anthropic\u2019s culture of autonomy and experimentation matches how I work best. I thrive with maximum freedom and interest-driven work. And I believe the company that builds the most capable AI must also be the most responsible.",
    hooks: [],
    printSection: "about",
    printOrder: 10,
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
