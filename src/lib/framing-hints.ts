export interface FramingHint {
  results: string;
  process: string;
  character: string;
  mastery: string;
  purpose: string;
  relatedness: string;
}

// Framing hints per content node — tells the AI what to emphasize
export const FRAMING_HINTS: Record<string, Partial<FramingHint>> = {
  "startup-story": {
    results: "150k teachers, 1.5M ARR, team from 2 to 12 in 3 years",
    process: "Hypothesis-driven iteration, pivots based on data, product-market fit process",
    character: "Two psychologists in a 20sqm apartment asking: can we actually do this?",
    mastery: "Technical architecture decisions, building without engineering background",
    purpose: "Teachers spending 40% of time on material search — we changed that",
    relatedness: "Co-founding dynamic, early team building, user community",
  },
  "school-gets-wrong": {
    results: "PISA scores, international benchmarks, measurable gaps",
    process: "Analysis framework: what's the actual bottleneck in education?",
    character: "Personal frustration with a system that didn't see individuals",
    mastery: "Deep understanding of pedagogy, Hattie's meta-analyses",
    purpose: "Every child deserves an education that adapts to them",
    relatedness: "Conversations with teachers that changed my perspective",
  },
  "why-anthropic": {
    results: "Anthropic's scale, Claude's capabilities, market position in EdTech",
    process: "Strategic fit analysis: why this role, why now, why me",
    character: "Personal alignment with Anthropic's mission and values",
    mastery: "AI safety understanding, technical depth in LLM applications",
    purpose: "AI as the lever for personalized education at scale",
    relatedness: "Team culture, collaborative research, building together",
  },
  "building-with-claude": {
    results: "Specific tools built, usage metrics, time saved",
    process: "Prompt engineering approach, iteration methodology",
    character: "Genuine enthusiasm for AI as a daily creative partner",
    mastery: "Technical fluency with Claude API, advanced prompting techniques",
    purpose: "Making AI accessible for education practitioners",
    relatedness: "Sharing discoveries with colleagues, teaching others to use AI",
  },
  "ai-in-education": {
    results: "89% agreement with human reviewers, 10 prompt iterations, 12 quality criteria",
    process: "Research methodology applied in production: define, operationalize, test, iterate",
    character: "Curiosity-driven approach — I ran this like a research study, not a feature sprint",
    mastery: "Prompt engineering depth, evaluation framework design, rubric development with Hattie",
    purpose: "Helping 150k teachers find quality materials they can trust",
    relatedness: "Collaboration with Prof. Hattie, working across product and research teams",
  },
  "psychology-of-learning": {
    results: "Self-Determination Theory: three measurable needs — autonomy, competence, relatedness",
    process: "Thesis methodology: empirical study of motivation in CS education",
    character: "Fascination with why people engage — or don't — despite good content",
    mastery: "Deep grounding in learning science, SDT, and educational psychology",
    purpose: "Understanding motivation is the foundation for every product I build",
    relatedness: "Co-authored with wife Anna (M.Sc. Neuroscience) — lived intersection of science and relationship",
  },
  "product-magic": {
    results: "Completion rates far above typical e-learning benchmarks",
    process: "Layered progression: Blockly visual coding → text-based languages, tied to game narrative",
    character: "Obsessive belief that intrinsic motivation beats extrinsic reward in learning",
    mastery: "Game design, learning design, and software development converging in one product",
    purpose: "Giving students a reason to care — not just a syllabus to complete",
    relatedness: "Students building virtual companies together, social learning embedded in gameplay",
  },
  "what-id-build": {
    results: "Success metric: learner becomes more capable and more curious — not just more engaged",
    process: "Start from the learner's confusion, not the curriculum — diagnose before prescribing",
    character: "The vision comes from being a parent: what do I want Frieda to experience in school?",
    mastery: "Synthesis of learning science, AI capabilities, and product intuition",
    purpose: "The most important problem in education: scaling what a great tutor does",
    relatedness: "Learning is social — the best products honor that even when AI is involved",
  },
};
