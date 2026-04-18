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
  { label: "The startup I built and sold", targetId: "startup-story" },
  { label: "Why I want to work at Anthropic", targetId: "why-anthropic" },
  { label: "What I\u2019m building with Claude right now", targetId: "building-with-claude" },
];

export const CONTENT_GRAPH: ContentGraph = {
  // ── ROOT LAYER ──────────────────────────────────────────────

  "education-gets-wrong": {
    id: "education-gets-wrong",
    content:
      "Two things. First: most education still optimizes for recall \u2014 remember the date, the formula, the definition \u2014 but in a world of instant search and LLMs, recall isn\u2019t the scarce skill. Second, and more important: education treats every learner as if they were interchangeable. Learning is deeply individual. Every person has their own interests, their own gaps, their own pace \u2014 and those need to be seen.",
    contentCompact:
      "Most education still optimizes for recall when recall is a Google search away. More importantly, it treats learners as interchangeable \u2014 but learning is deeply individual. Every person has their own interests, gaps, and pace.",
    hooks: [
      { label: "So what should education focus on instead?", targetId: "what-education-should-teach" },
      { label: "I built a product based on this belief", targetId: "startup-story" },
      { label: "How this connects to Anthropic", targetId: "anthropic-education-vision" },
    ],
    tags: {
      topics: ["education", "vision"],
      persuasion: { character: 0.7, process: 0.7 },
      motivation: { purpose: 1 },
      tone: "reflection",
      summary: "A critique of how education still optimizes for recall in a search-engine world.",
    },
    printSection: "philosophy",
    printOrder: 1,
  },

  "startup-story": {
    id: "startup-story",
    content:
      "I co-founded pearprogramming and built PearUp \u2014 a game where learners learn to code by running a virtual startup. We won the EXIST federal founder grant in 2020, grew the GmbH to around ten people, and in 2022 eduki acquired us. Four years that were equal parts exciting, exhausting, and nerve-wracking.",
    contentCompact:
      "Co-founded pearprogramming and built PearUp \u2014 a game teaching coding through running a virtual startup. Won the EXIST federal grant in 2020, grew to ten people, acquired by eduki in 2022.",
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
      "I fell in love with the product first. The first time I built an app with Claude Code, I started waking up at 5am before my family was up \u2014 not because I had to, but because I couldn\u2019t stop. Suddenly I could build every product I imagined, end to end. Then I listened to Boris Cherny on Lenny\u2019s Podcast and fell in love with the company: fluid roles, engineers doing PM work, PMs doing design, everyone free to contribute to the mission regardless of title. I set up a Greenhouse alert for \u201cProduct Manager\u201d that same afternoon, March 28, 2026. When the Education Labs role appeared, it read like a job description written for me.",
    contentCompact:
      "Fell in love with the product building apps in Claude Code at 5am. Fell in love with the company after Boris Cherny on Lenny\u2019s Podcast described fluid roles and mission-first autonomy. Set a Greenhouse alert on March 28, 2026. Education Labs reads like a job description written for me.",
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
      "I use Claude Code every day. The first time I built an app with it, something clicked: I could finally build every product I imagined, end to end, exactly as I envisioned it. No more depending on others to translate my vision. I started waking up at 5am to build before my family was up \u2014 not because I had to, but because I couldn\u2019t stop. I have around ten projects in flight right now.",
    contentCompact:
      "The first time I built an app with Claude Code, something clicked. No more depending on others to translate my vision. I started waking up at 5am to build before my family was up. Around ten projects in flight.",
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

  "what-education-should-teach": {
    id: "what-education-should-teach",
    content:
      "Three things, in this order. First, curiosity \u2014 keep it alive instead of drilling it out of people; it\u2019s the engine of every real learning moment. Second, self-efficacy \u2014 not AI literacy as a buzzword, but the real skill of directing a tool like Claude and evaluating what it gives you. Third, individualization \u2014 treat every learner as the specific person they are, with their own interests, gaps, and pace. None of this is radical. It\u2019s just been hard to do at scale without AI. Now it isn\u2019t.",
    contentCompact:
      "Three things: keep curiosity alive, build self-efficacy (directing tools, evaluating what they give you), and individualize \u2014 treat every learner as the specific person they are. None of it is radical. It\u2019s just been hard to do at scale without AI. Now it isn\u2019t.",
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
      summary: "Three things education should focus on: curiosity, self-efficacy, individualization. Now possible at scale with AI.",
    },
    printSection: "philosophy",
    printOrder: 2,
  },

  "anthropic-education-vision": {
    id: "anthropic-education-vision",
    content:
      "The interesting question isn\u2019t \u201chow do we put AI into learning.\u201d It\u2019s: what does AI have to be before learners can trust it? For me that\u2019s two things. It has to be factually reliable \u2014 in education, a confident wrong answer isn\u2019t a bug, it teaches the wrong thing. And it can\u2019t be a yes-man. A good AI tutor has to push back, point out contradictions, praise only when the praise is earned. Anything less and we\u2019re building an assistant, not a tutor.",
    contentCompact:
      "The real question isn\u2019t \u2018how to put AI into learning\u2019 \u2014 it\u2019s what AI has to be before learners can trust it. Two things: factually reliable (a confident wrong answer teaches the wrong thing) and not a yes-man (a tutor has to push back, not just praise). Anything less and we\u2019re building an assistant, not a tutor.",
    hooks: [
      { label: "This is exactly what I\u2019ve been working toward", targetId: "my-fit" },
      { label: "What I\u2019d want to build there", targetId: "what-id-build" },
    ],
    tags: {
      topics: ["anthropic", "education", "vision", "ai"],
      persuasion: { process: 1, character: 0.5 },
      motivation: { purpose: 1 },
      tone: "vision",
      summary: "What AI has to be before learners can trust it: factually reliable and not a yes-man. Otherwise it's an assistant, not a tutor.",
    },
    printSection: "philosophy",
    printOrder: 3,
  },

  "my-fit": {
    id: "my-fit",
    content:
      "I\u2019m not a PM who read about education. I studied psychology (M.Sc., thesis on motivation in computer-science learning). I founded an EdTech company, pivoted it, and sold it. I\u2019ve been doing product at Germany\u2019s largest teaching-materials marketplace for three and a half years. I published a book chapter on game-based learning with Springer. And I\u2019ve shipped AI in production \u2014 the quality assessor running today at eduki, plus roughly ten learning apps I build with Claude Code in my off hours.",
    contentCompact:
      "Not a PM who read about education. M.Sc. in psychology, thesis on motivation in CS learning. Founded, pivoted, and sold an EdTech company. Three and a half years of PM at Germany\u2019s largest teaching-materials marketplace. Springer book chapter. Shipping AI in production at eduki and in ten side-project learning apps.",
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
      "The original PearUp was a game where learners founded a virtual startup and learned to code by growing it \u2014 Google Blockly first, then real languages. It worked, but in 2021 we hit a wall: the German market for computer-science education alone was too small to sustain a company. So we pivoted. We opened the software to all subjects and moved the Creator tool to the front: a builder where teachers assemble interactive lesson units from a library of elements. That pivot is what eventually made us strategically interesting to eduki. Cumulatively, PearUp reached around 3.5 million learner sessions and 29 million interactive tasks completed.",
    contentCompact:
      "PearUp started as a coding game where learners founded a virtual startup. In 2021 we hit a wall \u2014 the German CS-education market was too small \u2014 so we pivoted to a Creator tool where teachers assemble interactive lessons across all subjects. That pivot is what made us strategically interesting to eduki. ~3.5M learner sessions, ~29M interactive tasks.",
    hooks: [
      { label: "We published research on why this works", targetId: "research" },
      { label: "What happened after the acquisition?", targetId: "after-acquisition" },
    ],
    tags: {
      topics: ["startup", "product", "education"],
      persuasion: { process: 1, results: 0.7 },
      motivation: { mastery: 0.6, purpose: 0.6 },
      tone: "story",
      summary: "Why pearprogramming worked: learners founded a virtual startup, intrinsic motivation > curriculum.",
    },
    printSection: "experience",
    printOrder: 21,
  },

  "after-acquisition": {
    id: "after-acquisition",
    content:
      "We ran out of money. That\u2019s the honest version. eduki \u2014 Germany\u2019s largest marketplace for teaching materials, around 150 people \u2014 acquired pearprogramming in 2022 as a strategic move: our Creator tool gave them an interactive format they couldn\u2019t have built that fast on their own. All co-founders came along, and all but one are still there today. I led the product integration with a team of seven, spent almost three years finding product-market fit as an intrapreneur, and then moved to own eduki\u2019s core commerce experience: product page, cart, checkout.",
    contentCompact:
      "We ran out of money \u2014 eduki acquired pearprogramming in 2022 as a strategic move for our Creator tool. All co-founders came along. I led integration with a team of seven, spent nearly three years on product-market fit as an intrapreneur, then moved to own core commerce: product page, cart, checkout.",
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
      summary: "Honest acquisition story: ran out of money, eduki bought pearprogramming strategically. All co-founders came along. Integration lead, then intrapreneur, then core commerce PM.",
    },
    printSection: "experience",
    printOrder: 10,
  },

  "founder-lessons": {
    id: "founder-lessons",
    content:
      "Three things I took from founding. First: don\u2019t fall in love with your idea. The moment you do, you spend your energy defending it instead of changing it. Second: ship fast and test, especially when you still don\u2019t know if the product will survive the next pivot. Quality matters \u2014 in education especially \u2014 but early perfectionism is wasted effort. Third: schedule sanity checks with people outside your bubble. Founders lose perspective faster than they think.",
    contentCompact:
      "Three founding lessons. Don\u2019t fall in love with your idea \u2014 the moment you do, you defend it instead of changing it. Ship fast and test; early perfectionism is wasted effort. And schedule sanity checks with outsiders \u2014 founders lose perspective fast.",
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
      "I can take on many different roles and shift as the situation demands \u2014 PM, designer, builder, researcher, prompt engineer. I work closely with engineers, designers, and data folks, and I can build prototypes myself when it unblocks the team, not to step over it. And I bring research rigor from psychology into product: empirical decisions where possible, statistical analysis where it matters, iteration against hard evidence. Ten prompt versions tested against human reviewers at eduki until we hit 89% agreement. Strong alone, stronger in a team.",
    contentCompact:
      "I shift roles as the situation demands \u2014 PM, designer, builder, researcher, prompt engineer. Work closely with engineers, designers, and data. Can build prototypes myself when it unblocks the team, not to step over it. Psychology research rigor in product: ten prompt iterations to 89% human agreement at eduki. Strong alone, stronger in a team.",
    hooks: [
      { label: "A recent example", targetId: "ai-in-education" },
      { label: "Why I want to work at Anthropic", targetId: "why-anthropic" },
    ],
    tags: {
      topics: ["product"],
      persuasion: { process: 1 },
      motivation: { mastery: 1 },
      tone: "data",
      summary: "PM who shifts roles as needed, works closely with cross-functional teams, brings psychology research rigor. Strong alone, stronger in a team.",
    },
    printSection: "skills",
    printOrder: 3,
  },

  // ── AI IN EDUCATION ────────────────────────────────────────

  "ai-in-education": {
    id: "ai-in-education",
    content:
      "In Q1 2026 I led \u201cMake Quality Visible\u201d at eduki: making the pedagogical quality of 800,000+ teaching materials visible so quality becomes a reason to buy. I inherited an underperforming AI assessor (v0) and rebuilt it end-to-end. The model is Gemini 3 Flash, evaluating 12 criteria across 5 dimensions derived from eduki\u2019s existing Hattie-based framework through a factor analysis. Ten prompt iterations (v1 through v10) raised human-AI agreement from 79.7% to 89%. I also designed the scoring model, the 8.83 quality threshold, and safeguards against prompt injection.",
    contentCompact:
      "Led \u2018Make Quality Visible\u2019 at eduki Q1 2026 \u2014 making the quality of 800k+ materials visible. Rebuilt an underperforming AI assessor end-to-end on Gemini 3 Flash. Ten prompt iterations raised human-AI agreement from 79.7% to 89%. Designed the scoring model, the 8.83 quality threshold, and anti-manipulation safeguards.",
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
      summary: "AI assessor for teaching materials: rebuilt end-to-end, ten prompt iterations raised human agreement from 79.7% to 89%, framework derived from eduki's Hattie-based research via factor analysis.",
    },
    printSection: "experience",
    printOrder: 5,
    testingEffectQuestion: {
      question: "What agreement rate did the AI assessor reach with human reviewers?",
      answer: "89% — up from 79.7%, achieved through ten prompt iterations (v1 to v10), evaluated against human reviewers each time.",
    },
    spacedRetrievalRef: "research",
  },

  // ── BUILDING WITH CLAUDE ───────────────────────────────────

  "side-projects": {
    id: "side-projects",
    content:
      "Around ten personal projects in various stages, all built end-to-end with Claude Code. A paramedic trainee app built around highly realistic case scenarios \u2014 the idea came from a paramedic in my circle who told me how poor the existing training apps are; it\u2019s now in TestFlight with real former paramedics. A vocabulary app that shows learning as a knowledge graph: each word a node, nodes connecting into a network the learner watches grow. An integration app for refugees arriving in Germany \u2014 everything in their native language, Claude built in for questions and document analysis. And a personalized children\u2019s books app. I keep coming back to the same question: how do you help someone learn something that actually matters to them?",
    contentCompact:
      "About ten projects built end-to-end with Claude Code. Paramedic trainee app with realistic cases, now in TestFlight with real ex-paramedics. Vocabulary app as a growing knowledge graph. Refugee integration app, all in native language, Claude built in. Personalized children\u2019s books app. Same recurring question: how do you help someone learn what actually matters to them?",
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
      summary: "Side projects: paramedic trainee app with realistic cases (TestFlight), vocabulary knowledge graph, refugee integration app, children\u2019s books — all built with Claude Code.",
    },
    printSection: "projects",
    printOrder: 1,
  },

  "future-of-work": {
    id: "future-of-work",
    content:
      "Building with AI has changed how I think about my role in three ways, and I shift between them as the situation demands. Implementation isn\u2019t the bottleneck anymore \u2014 I can build what I imagine, end to end, without depending on anyone to translate my vision. Role boundaries dissolve \u2014 engineers do PM work, PMs do design, everyone contributes where they\u2019re useful. And what\u2019s left, when building is cheap, is judgment: deciding what\u2019s actually worth building in the first place.",
    contentCompact:
      "AI changed my thinking in three ways, and I shift between them as the situation demands. Implementation isn\u2019t the bottleneck anymore. Role boundaries dissolve \u2014 engineers do PM work, PMs do design. And what\u2019s left, when building is cheap, is judgment: deciding what\u2019s actually worth building.",
    hooks: [
      { label: "What I\u2019d want to build at Anthropic", targetId: "what-id-build" },
      { label: "My product management approach", targetId: "pm-approach" },
    ],
    tags: {
      topics: ["ai", "product", "vision"],
      persuasion: { process: 1, character: 0.6 },
      motivation: { mastery: 0.8 },
      tone: "reflection",
      summary: "Three shifts in PM role with AI: implementation no longer the bottleneck, role boundaries dissolving, judgment is what's left. Max shifts between all three as situations demand.",
    },
    printSection: "skills",
    printOrder: 2,
  },

  // ── VISION ─────────────────────────────────────────────────

  "what-id-build": {
    id: "what-id-build",
    content:
      "Honestly, I don\u2019t know yet \u2014 and I think that\u2019s the right answer. I wouldn\u2019t start by building. I\u2019d start by understanding: the team, the product, the users, the constraints. Alignment before action. What I do know is the direction: learning experiences where AI sees the individual learner \u2014 their gaps, their pace, their interests \u2014 and responds to that. Not replacing human guidance, but doing what no human can do alone at scale.",
    contentCompact:
      "I wouldn\u2019t start by building \u2014 I\u2019d start by understanding the team, the product, the users. What I do know is the direction: AI that sees the individual learner and responds to their gaps, pace, and interests. Not replacing human guidance, but doing what no human can do alone at scale.",
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
      summary: "Wouldn't start by building — alignment before action. Direction: AI that sees the individual learner. Not replacing human guidance, but scaling what no human can do alone.",
    },
    printSection: "philosophy",
    printOrder: 5,
  },

  "psychology-of-learning": {
    id: "psychology-of-learning",
    content:
      "I studied psychology at Universit\u00e4t Witten/Herdecke \u2014 M.Sc., grade 1.5, thesis on motivation in computer science education. The framework that stuck with me is Self-Determination Theory: learners need to feel autonomous, competent, and connected. Take any one away and motivation collapses. That\u2019s not abstract to me \u2014 it\u2019s the lens I use when I design products. PearUp\u2019s virtual startup gave learners autonomy. The AI assessor at eduki measures whether materials actually support competence. Everything I build, I check against those three.",
    contentCompact:
      "M.Sc. Psychology at Witten/Herdecke, grade 1.5, thesis on motivation in CS education. The framework: Self-Determination Theory \u2014 autonomy, competence, relatedness. Take one away and motivation collapses. PearUp gave learners autonomy. The AI assessor measures whether materials support competence. I check everything I build against those three.",
    hooks: [
      { label: "The research I published", targetId: "research" },
      { label: "How I applied this at pearprogramming", targetId: "product-magic" },
    ],
    tags: {
      topics: ["psychology", "education"],
      persuasion: { process: 1, results: 0.5 },
      motivation: { mastery: 1 },
      tone: "data",
      summary: "M.Sc. Psychology (1.5), thesis on motivation in CS education. Self-Determination Theory as product design lens — applied at pearprogramming and eduki.",
    },
    printSection: "education",
    printOrder: 1,
    testingEffectQuestion: {
      question: "What are the three needs from Self-Determination Theory that Max's products aim to satisfy?",
      answer: "Autonomy, competence, and relatedness — the three core psychological needs from Self-Determination Theory (SDT).",
    },
    spacedRetrievalRef: "education-gets-wrong",
  },

  // ── RESEARCH & PUBLICATIONS ────────────────────────────────

  "research": {
    id: "research",
    content:
      "I co-authored a Springer book chapter on game-based learning with my wife Anna \u2014 she\u2019s a neuroscientist, so we come at education from complementary angles. Then at eduki I worked with Prof. John Hattie\u2019s research: two published studies validating a quality framework for teaching materials with over 2,000 teachers. The studies identified 7 dimensions with 18 criteria. When I looked at the distribution across our materials, I found that two dimensions weren\u2019t applicable \u2014 so the production framework uses 5. That\u2019s what the AI assessor runs on today.",
    contentCompact:
      "Springer book chapter on game-based learning, co-authored with my wife Anna (neuroscientist). At eduki, worked with Hattie\u2019s research: two studies with 2,000+ teachers validating 7 quality dimensions. My analysis of our materials showed two weren\u2019t applicable \u2014 the production framework uses 5. That\u2019s what the AI assessor runs on.",
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
      summary: "Springer chapter with Anna (neuroscientist). Hattie studies with 2,000+ teachers — Max's analysis reduced 7 dimensions to 5 for production use in the AI assessor.",
    },
    printSection: "publications",
    printOrder: 1,
    spacedRetrievalRef: "startup-story",
  },

  // ── PERSONAL ───────────────────────────────────────────────

  "personal": {
    id: "personal",
    content:
      "I\u2019m a 34-year-old new dad. My wife Anna is a neuroscientist \u2014 we co-authored a book chapter and now we\u2019re co-parenting Frieda, born August 2025. Right now we\u2019re on shared parental leave, traveling in Sardinia as a family. Becoming a father made education personal in a way nothing else could. I want her to grow up curious. Outside of work: specialty coffee nerd and former barista, recently discovered road cyclist, ambitious home cook who still dreams of opening a cafe someday. We\u2019re both genuinely excited about the idea of living in San Francisco.",
    contentCompact:
      "34-year-old new dad. Wife Anna (neuroscientist, co-author). Daughter Frieda, born August 2025 \u2014 currently on shared parental leave in Sardinia. Fatherhood made education personal: I want her to stay curious. Coffee nerd, former barista, road cyclist, home cook. We\u2019re both genuinely excited about the idea of living in San Francisco.",
    image: { src: "/photo-frieda.jpg", alt: "Max with daughter Frieda" },
    hooks: [
      { label: "What I believe education gets wrong", targetId: "education-gets-wrong" },
      { label: "What I\u2019d want to build at Anthropic", targetId: "what-id-build" },
    ],
    tags: {
      topics: ["personal"],
      persuasion: { character: 1 },
      motivation: { relatedness: 1 },
      tone: "story",
      summary: "New dad, wife Anna (neuroscientist), daughter Frieda. On parental leave in Sardinia. Coffee, cycling, cooking. Both excited about living in SF.",
    },
    printSection: "personal",
    printOrder: 1,
  },

  // ── HIDDEN GEMS (gamification-only) ────────────────────────

  "gem-convergence": {
    id: "gem-convergence",
    content:
      "You found a hidden thread. Self-Determination Theory says learners need autonomy, competence, and connection \u2014 take one away and motivation collapses. I\u2019ve known that since my thesis. What I didn\u2019t have was a way to build for it at scale. At pearprogramming we tried with game mechanics. At eduki I built an AI assessor that measures whether materials actually support competence. And with Claude Code I can finally prototype the kind of adaptive, individual learning experience I\u2019ve been thinking about for years \u2014 ten projects and counting. Psychology gave me the framework. AI gave me the tool. Education Labs is where they converge.",
    contentCompact:
      "SDT says learners need autonomy, competence, and connection. I\u2019ve known that since my thesis \u2014 but didn\u2019t have the tools to build for it at scale. pearprogramming tried with game mechanics. eduki\u2019s AI assessor measures competence. Claude Code lets me prototype adaptive learning. Psychology gave me the framework, AI gave me the tool. Education Labs is the convergence.",
    hooks: [
      { label: "What I'd want to build at Anthropic", targetId: "what-id-build" },
      { label: "Why I want to work at Anthropic", targetId: "why-anthropic" },
    ],
    tags: {
      topics: ["vision", "anthropic", "psychology", "ai", "education"],
      persuasion: { character: 0.8, process: 0.7 },
      motivation: { purpose: 1 },
      tone: "vision",
      summary: "Hidden thread: SDT framework from thesis + AI assessor at eduki + building with Claude Code = the convergence toward Education Labs.",
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
      "You connected the dots between my research and my product work. The Hattie studies gave us 7 quality dimensions with 18 criteria. When I looked at how those dimensions distributed across eduki\u2019s materials, two didn\u2019t apply \u2014 so the production framework uses 5. Then I inherited an underperforming AI assessor and iterated through ten prompt versions, evaluating each against human reviewers, until agreement went from 79.7% to 89%. That\u2019s not just engineering \u2014 that\u2019s the same methodology I learned in psychology: define the construct, operationalize it, test, measure, iterate. I run my product work the way I\u2019d run a study.",
    contentCompact:
      "Hattie studies gave us 7 quality dimensions \u2014 my analysis of eduki\u2019s materials showed two didn\u2019t apply, so the production framework uses 5. Then ten prompt iterations on the AI assessor, each evaluated against human reviewers, from 79.7% to 89% agreement. Same methodology as psychology research: define, operationalize, test, measure, iterate. PM as applied research.",
    hooks: [
      { label: "The AI assessor I built", targetId: "ai-in-education" },
      { label: "My product management approach", targetId: "pm-approach" },
    ],
    tags: {
      topics: ["psychology", "product", "ai"],
      persuasion: { process: 1, results: 0.8 },
      motivation: { mastery: 1 },
      tone: "reflection",
      summary: "Hidden thread: psychology research methodology applied to product — Hattie dimensions reduced for production, AI assessor iterated like a study. PM as applied research.",
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
      "You\u2019ve seen almost everything. Here\u2019s what ties it all together: I\u2019m a psychologist who co-founded an EdTech startup in 2018, pivoted it, sold it, and have been building education products for over seven years. I published a book chapter with my wife Anna \u2014 she\u2019s a neuroscientist \u2014 and worked with Hattie\u2019s research to build a production AI assessor. I wake up at 5am to build learning apps with Claude Code because I can\u2019t stop. I\u2019m a new dad traveling Sardinia with my family, thinking about what my daughter should learn. And Anna and I are both genuinely excited about the idea of living in San Francisco. Everything I\u2019ve done \u2014 research, product, education, AI \u2014 converges in one place.",
    contentCompact:
      "Psychologist, co-founder, seven years building education products. Published with my wife Anna (neuroscientist). Built an AI assessor with Hattie\u2019s research. Up at 5am building learning apps with Claude Code. New dad in Sardinia, thinking about what my daughter should learn. Anna and I are excited about San Francisco. Everything converges in one place.",
    hooks: [
      { label: "Why I want to work at Anthropic", targetId: "why-anthropic" },
      { label: "What I'd want to build there", targetId: "what-id-build" },
    ],
    tags: {
      topics: ["personal", "vision", "anthropic"],
      persuasion: { character: 1, results: 0.6 },
      motivation: { purpose: 1, relatedness: 0.6 },
      tone: "story",
      summary: "Hidden thread: psychologist, co-founder, PM, researcher, new dad in Sardinia with Anna. Everything converges — and the family is excited about SF.",
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
  "education-gets-wrong": { emoji: "🎓", name: "Education" },
  "what-education-should-teach": { emoji: "🎓", name: "Education" },
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
