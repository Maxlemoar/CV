import type { Persuasion, Motivation } from "./experiment-types";

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

// Topics are free-form strings but these are the canonical ones used
// across the content graph and the hook router.
export type NodeTopic =
  | "product"
  | "startup"
  | "education"
  | "psychology"
  | "ai"
  | "personal"
  | "anthropic"
  | "vision";

export type NodeTone = "story" | "data" | "vision" | "reflection";

export interface NodeTags {
  topics?: NodeTopic[];
  persuasion?: Partial<Record<Persuasion, number>>;
  motivation?: Partial<Record<Motivation, number>>;
  tone?: NodeTone;
  /** One-line summary used when we hand the node to Claude as a candidate. */
  summary?: string;
}

export interface ContentNode {
  id: string;
  content: string;
  contentCompact: string;
  image?: { src: string; alt: string };
  quiz?: QuizData;
  hooks: Hook[];
  tags?: NodeTags;
  printSection?: "about" | "experience" | "education" | "projects" | "philosophy" | "publications" | "skills" | "personal";
  printOrder?: number;
  gem?: {
    requiredNodes?: string[];
    minVisited?: number;
  };
  gemIntro?: string;
  gemTitle?: string;
  testingEffectQuestion?: {
    question: string;
    answer: string;
  };
  spacedRetrievalRef?: string; // Node ID this references back to
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
      "Schools still optimize for recall. Can you remember this date, this formula, this definition? But when every answer is a search away, that\u2019s not the scarce skill anymore. What\u2019s hard is knowing which question to ask, whether the answer is any good, and what to do next.",
    contentCompact:
      "Schools optimize for recall, but when every answer is searchable, that\u2019s not the scarce skill. What matters: knowing which question to ask, evaluating answers, and deciding what to do next.",
    hooks: [
      { label: "So what should schools teach instead?", targetId: "what-schools-should-teach" },
      { label: "I built a product based on this belief", targetId: "startup-story" },
      { label: "How this connects to Anthropic", targetId: "anthropic-education-vision" },
    ],
    tags: {
      topics: ["education", "vision"],
      persuasion: { character: 0.7, process: 0.7 },
      motivation: { purpose: 1 },
      tone: "reflection",
      summary: "A critique of how schools still optimize for recall in a search-engine world.",
    },
    printSection: "philosophy",
    printOrder: 1,
  },

  "startup-story": {
    id: "startup-story",
    content:
      "I co-founded pearprogramming \u2014 a game where students learn to code by running a virtual startup. We won a federal grant, grew to 10 people, and in 2022 eduki acquired us. I was 28 when we started. It was the hardest and best thing I\u2019ve done.",
    contentCompact:
      "Co-founded pearprogramming \u2014 a game teaching coding through running a virtual startup. Won a federal grant, grew to 10 people, acquired by eduki in 2022. Started at 28. Hardest and best thing I\u2019ve done.",
    hooks: [
      { label: "What made the product special?", targetId: "product-magic" },
      { label: "What happened after the acquisition?", targetId: "after-acquisition" },
      { label: "What founding taught me", targetId: "founder-lessons" },
    ],
    tags: {
      topics: ["startup", "education", "personal"],
      persuasion: { results: 1, character: 0.7 },
      motivation: { mastery: 0.6, purpose: 0.6 },
      tone: "story",
      summary: "Co-founded pearprogramming, grew to 10, acquired by eduki in 2022.",
    },
    printSection: "experience",
    printOrder: 20,
    testingEffectQuestion: {
      question: "How many people did the pearprogramming team grow to?",
      answer: "10 people — from two co-founders to a team of ten before the acquisition by eduki in 2022.",
    },
  },

  "why-anthropic": {
    id: "why-anthropic",
    content:
      "I\u2019ve been using Claude since September 2024. First casually, then daily, then obsessively \u2014 building my own apps with Claude Code every evening after work. I listened to podcasts with the Head of Claude Code and the design team and thought: that\u2019s how I want to work. When the Education Labs PM role hit my Greenhouse alert on a Saturday morning, I had to read it twice. It felt like a job description written for me. I do my best work with maximum autonomy and interest-driven exploration \u2014 and I believe the next AI systems need to be taught ethics, like a young Roman emperor taught philosophy by his tutors.",
    contentCompact:
      "Daily Claude user since September 2024. Building apps with Claude Code every evening. When the Education Labs PM role appeared, it felt written for me: maximum autonomy, interest-driven exploration, and the belief that AI systems need ethical foundations.",
    hooks: [
      { label: "What I\u2019d want to build there", targetId: "what-id-build" },
      { label: "My experience with AI in education", targetId: "ai-in-education" },
      { label: "Who I am outside of work", targetId: "personal" },
    ],
    tags: {
      topics: ["anthropic", "personal", "vision"],
      persuasion: { character: 1, process: 0.5 },
      motivation: { purpose: 1, mastery: 0.5 },
      tone: "story",
      summary: "Why the Education Labs PM role feels written for me after a year of daily Claude use.",
    },
    printSection: "about",
    printOrder: 10,
  },

  "building-with-claude": {
    id: "building-with-claude",
    content:
      "I use Claude Code every day. Not to avoid understanding what\u2019s being built \u2014 but because the bottleneck for me was never the idea, it was implementation speed. Now I can go from hypothesis to working prototype in a day. I\u2019m currently building three learning apps this way.",
    contentCompact:
      "Using Claude Code daily \u2014 not to skip understanding, but because the bottleneck was never the idea, it was implementation speed. Hypothesis to working prototype in a day. Currently building three learning apps.",
    image: { src: "/photo-coffee.jpg", alt: "Max working at a café" },
    hooks: [
      { label: "What apps are you building?", targetId: "side-projects" },
      { label: "How I used AI at my day job", targetId: "ai-in-education" },
      { label: "What this taught me about the future of work", targetId: "future-of-work" },
    ],
    tags: {
      topics: ["ai", "product", "personal"],
      persuasion: { process: 1, character: 0.6 },
      motivation: { mastery: 1 },
      tone: "data",
      summary: "Daily Claude Code user — idea to working prototype in a day, three learning apps in flight.",
    },
    printSection: "skills",
    printOrder: 1,
  },

  // ── EDUCATION PHILOSOPHY ────────────────────────────────────

  "what-schools-should-teach": {
    id: "what-schools-should-teach",
    content:
      "Agency. The confidence to say \u201cI don\u2019t know this yet, but I know how to figure it out.\u201d Not AI literacy as a buzzword \u2014 but the real skill: being able to direct a tool, evaluate what it gives you, and adapt when things change. That\u2019s what I\u2019d want my daughter to learn.",
    contentCompact:
      "Agency. The confidence to say \u2018I don\u2019t know this yet, but I can figure it out.\u2019 Not AI literacy as buzzword \u2014 the real skill: directing a tool, evaluating its output, adapting when things change.",
    hooks: [
      { label: "How this connects to Anthropic\u2019s mission", targetId: "anthropic-education-vision" },
      { label: "I studied the science behind this", targetId: "psychology-of-learning" },
      { label: "I built a product based on this belief", targetId: "startup-story" },
    ],
    tags: {
      topics: ["education", "vision"],
      persuasion: { character: 0.6, process: 0.6 },
      motivation: { purpose: 1 },
      tone: "vision",
      summary: "Agency is the real skill — directing a tool, evaluating output, adapting.",
    },
    printSection: "philosophy",
    printOrder: 2,
  },

  "anthropic-education-vision": {
    id: "anthropic-education-vision",
    content:
      "The interesting question isn\u2019t \u201chow do we put AI in classrooms.\u201d It\u2019s \u201chow do we use AI to make learners more independent, not more dependent.\u201d A good AI tutor doesn\u2019t hand you the answer \u2014 it helps you realize what you don\u2019t understand yet. That\u2019s a hard product problem, and it\u2019s the one I want to work on.",
    contentCompact:
      "The real question isn\u2019t \u2018how to put AI in classrooms\u2019 but \u2018how to use AI to make learners more independent.\u2019 A good AI tutor helps you realize what you don\u2019t understand. That\u2019s the product problem I want to solve.",
    hooks: [
      { label: "This is exactly what I\u2019ve been working toward", targetId: "my-fit" },
      { label: "What I\u2019d want to build there", targetId: "what-id-build" },
    ],
    tags: {
      topics: ["anthropic", "education", "vision", "ai"],
      persuasion: { process: 1, character: 0.5 },
      motivation: { purpose: 1 },
      tone: "vision",
      summary: "AI for education should make learners more independent, not more dependent.",
    },
    printSection: "philosophy",
    printOrder: 3,
  },

  "my-fit": {
    id: "my-fit",
    content:
      "Psychology taught me how people learn. Founding a startup taught me how to ship. Game-based learning taught me that the medium shapes the message. And building with AI every day taught me what\u2019s actually possible right now \u2014 not in theory, but in production. I built an AI assessor that reaches 89% agreement with human reviewers. I\u2019ve published research on what makes teaching materials effective. I\u2019m not a PM who read about education \u2014 I\u2019ve been in it for years.",
    contentCompact:
      "Psychology taught me how people learn. Founding taught me how to ship. Game-based learning taught me medium shapes message. Building with AI daily showed me what\u2019s possible in production. Published researcher, built an AI assessor hitting 89% human agreement.",
    hooks: [
      { label: "The research I published", targetId: "research" },
      { label: "The AI assessor I built", targetId: "ai-in-education" },
      { label: "Why I want to work at Anthropic", targetId: "why-anthropic" },
    ],
    tags: {
      topics: ["anthropic", "product", "ai", "education", "psychology"],
      persuasion: { results: 1, process: 0.8 },
      motivation: { mastery: 0.8, purpose: 0.8 },
      tone: "data",
      summary: "The synthesis pitch: psychology, founding, game-based learning, AI in production.",
    },
    printSection: "about",
    printOrder: 2,
  },

  // ── STARTUP & CAREER ───────────────────────────────────────

  "product-magic": {
    id: "product-magic",
    content:
      "Students didn\u2019t just \u201clearn to code.\u201d They founded a virtual startup, made business decisions, and solved real programming challenges to grow it. We started with Google Blockly for visual programming, then progressed to text-based languages. Completion rates were far above typical e-learning \u2014 turns out intrinsic motivation matters more than curriculum design.",
    contentCompact:
      "Students founded a virtual startup, made business decisions, solved real programming challenges. Started with Google Blockly, progressed to text-based languages. Completion rates far above typical e-learning \u2014 intrinsic motivation beats curriculum design.",
    hooks: [
      { label: "We published research on why this works", targetId: "research" },
      { label: "What happened after the acquisition?", targetId: "after-acquisition" },
    ],
    tags: {
      topics: ["startup", "product", "education"],
      persuasion: { process: 1, results: 0.7 },
      motivation: { mastery: 0.6, purpose: 0.6 },
      tone: "story",
      summary: "Why pearprogramming worked: students founded a virtual startup, intrinsic motivation > curriculum.",
    },
    printSection: "experience",
    printOrder: 21,
  },

  "after-acquisition": {
    id: "after-acquisition",
    content:
      "eduki \u2014 Germany\u2019s largest marketplace for teaching materials, ~150 people \u2014 acquired us in 2022. I led the product integration with a team of seven. Then I spent three years finding product-market fit as an intrapreneur, before moving to own the core commerce experience: product page, cart, checkout.",
    contentCompact:
      "eduki \u2014 Germany\u2019s largest teaching materials marketplace, ~150 people \u2014 acquired us in 2022. Led product integration with a team of seven. Spent three years finding product-market fit as intrapreneur, then owned core commerce: product page, cart, checkout.",
    hooks: [
      { label: "How I used AI to improve quality", targetId: "ai-in-education" },
      { label: "What founding taught me", targetId: "founder-lessons" },
      { label: "Who I am outside of work", targetId: "personal" },
    ],
    tags: {
      topics: ["product", "startup"],
      persuasion: { results: 1, process: 0.5 },
      motivation: { mastery: 0.6, relatedness: 0.5 },
      tone: "data",
      summary: "eduki acquired pearprogramming; led integration, then ownership of core commerce.",
    },
    printSection: "experience",
    printOrder: 10,
  },

  "founder-lessons": {
    id: "founder-lessons",
    content:
      "Three things I took from founding: your first idea is almost always wrong, so learn to kill it early. Hiring is harder than building the product. And speed matters more than perfection \u2014 especially when you\u2019re ten people with a federal grant and no revenue yet.",
    contentCompact:
      "Three founding lessons: your first idea is almost always wrong, so kill it early. Hiring is harder than building the product. Speed matters more than perfection \u2014 especially with ten people, a federal grant, and no revenue.",
    image: { src: "/photo-cycling.jpg", alt: "Max with his road bike" },
    hooks: [
      { label: "My product management approach", targetId: "pm-approach" },
      { label: "Who I am outside of work", targetId: "personal" },
    ],
    tags: {
      topics: ["startup", "personal"],
      persuasion: { character: 1, process: 0.7 },
      motivation: { mastery: 0.6 },
      tone: "reflection",
      summary: "Three lessons from founding: kill ideas early, hiring is hardest, speed over perfection.",
    },
    printSection: "about",
    printOrder: 3,
  },

  "pm-approach": {
    id: "pm-approach",
    content:
      "I\u2019m hypothesis-driven. I don\u2019t ask \u201cwhat should we build?\u201d but \u201cwhat do we believe, and how do we test it?\u201d Deep discoveries before building. A/B tests to validate. And the discipline to kill ideas that don\u2019t work \u2014 including my own.",
    contentCompact:
      "Hypothesis-driven. Not \u2018what should we build?\u2019 but \u2018what do we believe, and how do we test it?\u2019 Deep discovery before building. A/B tests to validate. Discipline to kill ideas that don\u2019t work \u2014 including my own.",
    hooks: [
      { label: "A recent example", targetId: "ai-in-education" },
      { label: "Why I want to work at Anthropic", targetId: "why-anthropic" },
    ],
    tags: {
      topics: ["product"],
      persuasion: { process: 1 },
      motivation: { mastery: 1 },
      tone: "data",
      summary: "Hypothesis-driven PM: discovery, A/B tests, kill-your-own-ideas discipline.",
    },
    printSection: "skills",
    printOrder: 3,
  },

  // ── AI IN EDUCATION ────────────────────────────────────────

  "ai-in-education": {
    id: "ai-in-education",
    content:
      "In Q1 2026 I led \u201cMake Quality Visible\u201d at eduki: an AI assessor that evaluates teaching materials across 12 criteria in 5 quality dimensions. The production model runs on Gemini Flash \u2014 I developed and iterated the assessment prompt through 10 versions, using Claude to test and refine. Version 10 achieves 89% agreement with human reviewers. The quality framework was co-developed with Prof. John Hattie.",
    contentCompact:
      "Led \u2018Make Quality Visible\u2019 at eduki Q1 2026: AI assessor evaluating teaching materials across 12 criteria in 5 dimensions. Developed assessment prompt through 10 versions using Claude. Version 10: 89% agreement with human reviewers. Framework co-developed with Prof. John Hattie.",
    hooks: [
      { label: "Who is John Hattie?", targetId: "research" },
      { label: "What this taught me about AI products", targetId: "future-of-work" },
      { label: "What I\u2019d want to build at Anthropic", targetId: "what-id-build" },
    ],
    tags: {
      topics: ["ai", "education", "product"],
      persuasion: { results: 1, process: 1 },
      motivation: { mastery: 1, purpose: 0.7 },
      tone: "data",
      summary: "AI assessor for teaching materials: 10 prompt iterations to 89% human agreement, built with Hattie.",
    },
    printSection: "experience",
    printOrder: 5,
    testingEffectQuestion: {
      question: "What agreement rate did the AI assessor reach with human reviewers?",
      answer: "89% agreement — achieved through 10 iterative prompt versions, evaluated against human reviewers each time.",
    },
    spacedRetrievalRef: "research",
  },

  // ── BUILDING WITH CLAUDE ───────────────────────────────────

  "side-projects": {
    id: "side-projects",
    content:
      "A spaced-repetition app for paramedic trainees. A vocabulary trainer. A German language app for refugees. All built with Claude Code, all in weeks instead of months. I keep coming back to the same problem: how do you help people learn something that matters to them?",
    contentCompact:
      "Spaced-repetition app for paramedic trainees. Vocabulary trainer. German language app for refugees. All built with Claude Code, weeks instead of months. Same recurring problem: helping people learn what matters to them.",
    hooks: [
      { label: "What this taught me about AI-native building", targetId: "future-of-work" },
      { label: "Why I want to work at Anthropic", targetId: "why-anthropic" },
      { label: "Who I am outside of work", targetId: "personal" },
    ],
    tags: {
      topics: ["ai", "product", "personal", "education"],
      persuasion: { character: 0.8, process: 0.6 },
      motivation: { mastery: 1, purpose: 0.6 },
      tone: "story",
      summary: "Side projects: spaced-repetition for paramedics, vocabulary trainer, refugee German app — built with Claude Code.",
    },
    printSection: "projects",
    printOrder: 1,
  },

  "future-of-work": {
    id: "future-of-work",
    content:
      "Building with AI changed how I think about product management. When implementation is no longer the bottleneck, what\u2019s left is taste, judgment, and knowing what\u2019s worth building. That shift is already happening \u2014 and PMs who don\u2019t experience it firsthand will struggle to lead teams through it.",
    contentCompact:
      "When implementation is no longer the bottleneck, what\u2019s left is taste, judgment, and knowing what\u2019s worth building. PMs who don\u2019t experience AI-native building firsthand will struggle to lead teams through the shift.",
    hooks: [
      { label: "What I\u2019d want to build at Anthropic", targetId: "what-id-build" },
      { label: "My product management approach", targetId: "pm-approach" },
    ],
    tags: {
      topics: ["ai", "product", "vision"],
      persuasion: { process: 1, character: 0.6 },
      motivation: { mastery: 0.8 },
      tone: "reflection",
      summary: "When implementation isn't the bottleneck, taste and judgment are what's left for PMs.",
    },
    printSection: "skills",
    printOrder: 2,
  },

  // ── VISION ─────────────────────────────────────────────────

  "what-id-build": {
    id: "what-id-build",
    content:
      "I\u2019d want to build learning experiences where AI helps the learner, not replaces the teacher. Systems that figure out what you don\u2019t understand yet \u2014 not just what you got wrong. The measure of success isn\u2019t engagement time. It\u2019s: did this person become more capable and more curious?",
    contentCompact:
      "Learning experiences where AI helps the learner, not replaces the teacher. Systems that identify what you don\u2019t understand \u2014 not just what you got wrong. Success metric: did this person become more capable and more curious?",
    hooks: [
      { label: "The science behind this", targetId: "psychology-of-learning" },
      { label: "Why Anthropic is the right place for this", targetId: "why-anthropic" },
      { label: "Who I am outside of work", targetId: "personal" },
    ],
    tags: {
      topics: ["vision", "anthropic", "education", "ai"],
      persuasion: { character: 0.8, process: 0.6 },
      motivation: { purpose: 1 },
      tone: "vision",
      summary: "Build AI learning experiences that help — not replace — teachers; success = more capable and curious.",
    },
    printSection: "philosophy",
    printOrder: 5,
  },

  "psychology-of-learning": {
    id: "psychology-of-learning",
    content:
      "My M.Sc. thesis studied motivation in computer science education. The finding that stuck with me: learners need to feel autonomous, competent, and connected (Self-Determination Theory). Every product I\u2019ve built since tries to hit all three.",
    contentCompact:
      "M.Sc. thesis on motivation in CS education. Key finding: learners need autonomy, competence, and connection (Self-Determination Theory). Every product I\u2019ve built since tries to hit all three.",
    hooks: [
      { label: "The research I published", targetId: "research" },
      { label: "How I applied this at pearprogramming", targetId: "product-magic" },
    ],
    tags: {
      topics: ["psychology", "education"],
      persuasion: { process: 1, results: 0.5 },
      motivation: { mastery: 1 },
      tone: "data",
      summary: "M.Sc. thesis: Self-Determination Theory — autonomy, competence, relatedness.",
    },
    printSection: "education",
    printOrder: 1,
    testingEffectQuestion: {
      question: "What are the three needs from Self-Determination Theory that Max's products aim to satisfy?",
      answer: "Autonomy, competence, and relatedness — the three core psychological needs from Self-Determination Theory (SDT).",
    },
    spacedRetrievalRef: "school-gets-wrong",
  },

  // ── RESEARCH & PUBLICATIONS ────────────────────────────────

  "research": {
    id: "research",
    content:
      "I co-authored a Springer book chapter on game-based learning with my wife Anna (M.Sc. Neuroscience). I worked with Prof. John Hattie \u2014 whose \u201cVisible Learning\u201d is the largest meta-analysis in education \u2014 on two published studies validating a quality framework for teaching materials with 2,000+ teachers.",
    contentCompact:
      "Co-authored Springer book chapter on game-based learning with wife Anna (M.Sc. Neuroscience, co-author). Worked with Prof. John Hattie on two published studies validating a quality framework for teaching materials with 2,000+ teachers.",
    image: { src: "/photo-wedding.jpg", alt: "Max and Anna" },
    hooks: [
      { label: "How this became a real product", targetId: "ai-in-education" },
      { label: "What I believe about the future of learning", targetId: "what-id-build" },
      { label: "Who I am outside of work", targetId: "personal" },
    ],
    tags: {
      topics: ["psychology", "education"],
      persuasion: { results: 1, process: 0.6 },
      motivation: { mastery: 1, relatedness: 0.6 },
      tone: "data",
      summary: "Springer chapter with wife Anna; two Hattie studies on teaching-material quality with 2,000+ teachers.",
    },
    printSection: "publications",
    printOrder: 1,
    spacedRetrievalRef: "startup-story",
  },

  // ── PERSONAL ───────────────────────────────────────────────

  "personal": {
    id: "personal",
    content:
      "I\u2019m a 34-year-old new dad living in Cologne with my wife Anna (M.Sc. Neuroscience \u2014 we co-authored a book chapter together) and our daughter Frieda, born August 2025. Becoming a father changed how I think about education \u2014 it\u2019s not abstract anymore. I want her to stay curious. Outside of work: specialty coffee nerd (former barista, pour-over obsessive), recently discovered road cyclist, and ambitious home cook who once dreamed of opening a cafe.",
    contentCompact:
      "34-year-old new dad in Cologne. Wife Anna (M.Sc. Neuroscience, co-author). Daughter Frieda, born August 2025. Fatherhood made education personal \u2014 I want her to stay curious. Specialty coffee nerd, road cyclist, ambitious home cook.",
    image: { src: "/photo-frieda.jpg", alt: "Max with daughter Frieda" },
    hooks: [
      { label: "What I believe school gets wrong", targetId: "school-gets-wrong" },
      { label: "What I\u2019d want to build at Anthropic", targetId: "what-id-build" },
    ],
    tags: {
      topics: ["personal"],
      persuasion: { character: 1 },
      motivation: { relatedness: 1 },
      tone: "story",
      summary: "New dad in Cologne. Fatherhood made education personal. Coffee, cycling, cooking.",
    },
    printSection: "personal",
    printOrder: 1,
  },

  // ── HIDDEN GEMS (gamification-only) ────────────────────────

  "gem-convergence": {
    id: "gem-convergence",
    content:
      "You found a hidden thread. Psychology taught me that learning is deeply personal — it depends on autonomy, competence, and connection. AI gives us the first real tool to honor that at scale. Not by replacing teachers, but by building systems that adapt to each learner the way a great tutor does: noticing what you don't understand yet, adjusting the challenge, and knowing when to step back. That's what I'd want to build at Anthropic Education Labs — products where the AI makes the learner more capable, not more dependent. Everything in my career has been building toward this convergence.",
    contentCompact:
      "Psychology taught me learning is personal — autonomy, competence, connection. AI is the first tool to honor that at scale. Not replacing teachers, but adapting like a great tutor: noticing gaps, adjusting challenge, knowing when to step back. That's what I'd build at Anthropic Education Labs.",
    hooks: [
      { label: "What I'd want to build at Anthropic", targetId: "what-id-build" },
      { label: "Why I want to work at Anthropic", targetId: "why-anthropic" },
    ],
    tags: {
      topics: ["vision", "anthropic", "psychology", "ai", "education"],
      persuasion: { character: 0.8, process: 0.7 },
      motivation: { purpose: 1 },
      tone: "vision",
      summary: "Hidden thread: psychology + AI + tutoring = what I want to build at Education Labs.",
    },
    gem: {
      requiredNodes: ["psychology-of-learning", "ai-in-education", "building-with-claude"],
    },
    gemTitle: "The Convergence",
    gemIntro: "You connected the dots...",
  },

  "gem-lab-to-product": {
    id: "gem-lab-to-product",
    content:
      "You connected the dots between my research and my product work. Here's the link: when I studied what makes teaching materials effective with Prof. Hattie, we used structured rubrics, inter-rater reliability, and iterative validation — the same methodology I use in product discovery. My PM approach isn't just 'hypothesis-driven' as a buzzword. I literally run my product work like a research study: define the construct, operationalize it, test with real users, measure agreement, iterate. The AI assessor I built at eduki is the purest example — 10 prompt versions, each evaluated against human reviewers, until we hit 89% agreement. That's not engineering. That's applied research methodology in production.",
    contentCompact:
      "The link between research and product: I run PM like a research study — define constructs, operationalize, test, measure agreement, iterate. The AI assessor is the purest example: 10 prompt versions evaluated against human reviewers until 89% agreement. Applied research methodology in production.",
    hooks: [
      { label: "The AI assessor I built", targetId: "ai-in-education" },
      { label: "My product management approach", targetId: "pm-approach" },
    ],
    tags: {
      topics: ["psychology", "product", "ai"],
      persuasion: { process: 1, results: 0.8 },
      motivation: { mastery: 1 },
      tone: "reflection",
      summary: "Hidden thread: I run PM like a research study — construct, test, measure, iterate.",
    },
    gem: {
      requiredNodes: ["startup-story", "founder-lessons", "research"],
    },
    gemTitle: "From Lab to Product",
    gemIntro: "You linked research to product...",
  },

  "gem-full-picture": {
    id: "gem-full-picture",
    content:
      "You've seen almost everything. Here's what ties it all together: I'm a psychologist who founded an EdTech startup, sold it, and spent the last four years building products at the intersection of education, AI, and quality. I've published research with one of the world's most cited education researchers. I build working apps with Claude Code every evening — not because I have to, but because I can't stop. I'm a new father who thinks about what his daughter should learn. And I believe the next generation of AI learning products needs someone who has lived in all of these worlds — research, product, education, and AI — not just visited them. That's what I bring to Anthropic Education Labs.",
    contentCompact:
      "Psychologist, founder, PM at the intersection of education, AI, and quality. Published with one of the world's most cited education researchers. Building with Claude Code daily. New father thinking about what his daughter should learn. Lived in research, product, education, and AI — not just visited them.",
    hooks: [
      { label: "Why I want to work at Anthropic", targetId: "why-anthropic" },
      { label: "What I'd want to build there", targetId: "what-id-build" },
    ],
    tags: {
      topics: ["personal", "vision", "anthropic"],
      persuasion: { character: 1, results: 0.6 },
      motivation: { purpose: 1, relatedness: 0.6 },
      tone: "story",
      summary: "Hidden thread: psychologist, founder, PM, researcher, new dad — one synthesis.",
    },
    gem: {
      minVisited: 15,
    },
    gemTitle: "The Full Picture",
    gemIntro: "You've seen the full picture...",
  },
};

import type { ContentBlockData } from "@/lib/types";

export function getNodeCounts() {
  const allNodes = Object.values(CONTENT_GRAPH);
  const regularNodes = allNodes.filter((n) => !n.gem);
  const gemNodes = allNodes.filter((n) => n.gem);
  return { total: allNodes.length, regular: regularNodes.length, gems: gemNodes.length };
}

export const NODE_CLUSTERS: Record<string, { emoji: string; name: string }> = {
  "startup-story": { emoji: "🚀", name: "Founder" },
  "product-magic": { emoji: "🚀", name: "Founder" },
  "after-acquisition": { emoji: "🚀", name: "Founder" },
  "founder-lessons": { emoji: "🚀", name: "Founder" },
  "pm-approach": { emoji: "📋", name: "Product" },
  "my-fit": { emoji: "📋", name: "Product" },
  "school-gets-wrong": { emoji: "🎓", name: "Education" },
  "what-schools-should-teach": { emoji: "🎓", name: "Education" },
  "anthropic-education-vision": { emoji: "🎓", name: "Education" },
  "psychology-of-learning": { emoji: "🧠", name: "Psychology" },
  "building-with-claude": { emoji: "🤖", name: "AI" },
  "ai-in-education": { emoji: "🤖", name: "AI" },
  "side-projects": { emoji: "🤖", name: "AI" },
  "future-of-work": { emoji: "🤖", name: "AI" },
  "research": { emoji: "🔬", name: "Research" },
  "what-id-build": { emoji: "💡", name: "Vision" },
  "why-anthropic": { emoji: "💡", name: "Vision" },
  "personal": { emoji: "👤", name: "Personal" },
  "gem-convergence": { emoji: "💎", name: "The Convergence" },
  "gem-lab-to-product": { emoji: "💎", name: "From Lab to Product" },
  "gem-full-picture": { emoji: "💎", name: "The Full Picture" },
};

export const COFFEE_KEYWORDS = [
  "coffee", "café", "cafe", "barista", "pour over", "pour-over",
  "pourover", "espresso", "latte", "cappuccino", "brew",
];

export function matchesCoffeeKeyword(text: string): boolean {
  const lower = text.toLowerCase();
  return COFFEE_KEYWORDS.some((kw) => lower.includes(kw));
}

// Helper: convert a ContentNode to a ContentBlockData for the conversation UI
export function nodeToBlock(node: ContentNode, visitedNodes: Set<string>, depth: "overview" | "deep-dive" = "deep-dive"): ContentBlockData {
  const visibleHooks = node.hooks.filter((h) => {
    if (visitedNodes.has(h.targetId)) return false;
    if (h.requiredVisited && !h.requiredVisited.every((id) => visitedNodes.has(id))) return false;
    if (h.minVisited && visitedNodes.size < h.minVisited) return false;
    return true;
  });

  const text = depth === "overview" ? node.contentCompact : node.content;

  return {
    id: node.id,
    questionTitle: node.id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    text,
    richType: node.image ? "photo" : null,
    richData: node.image ? { src: node.image.src, alt: node.image.alt } : null,
    hooks: visibleHooks.map((h) => ({
      label: h.label,
      question: h.label,
      targetId: h.targetId,
    })),
  };
}

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
