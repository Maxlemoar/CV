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
    results: "EXIST federal grant, team of ~10, acquired by eduki in 2022, ~3.5M learner sessions",
    process: "Hypothesis-driven iteration, the 2021 pivot based on market-size reality, product-market fit process",
    character: "University friends asking: can we actually do this?",
    mastery: "Building a real product without an engineering background",
    purpose: "The 2018 vision: an intelligent tutoring system with individual feedback for every learner",
    relatedness: "Co-founding dynamic, early team building — all co-founders came along to eduki",
  },
  "education-gets-wrong": {
    results: "The two concrete failures: optimizing for recall, treating learners as interchangeable",
    process: "Analysis framework: what's the actual bottleneck in education?",
    character: "Personal frustration with a system that didn't see individuals",
    mastery: "Deep understanding of pedagogy, Hattie's meta-analyses",
    purpose: "Every learner deserves an education that adapts to them",
    relatedness: "Conversations with teachers that changed my perspective",
  },
  "why-anthropic": {
    results: "Claude Code and MCP — the Labs team turns research into category-defining products",
    process: "Strategic fit analysis: why this role, why now, why me",
    character: "Personal alignment with Anthropic's mission and values",
    mastery: "Technical depth from daily Claude Code use, prompt engineering in production",
    purpose: "Building 0-to-1 products at the frontier — the 2018 founding vision finally buildable",
    relatedness: "Team culture, fluid roles, building together regardless of title",
  },
  "building-with-claude": {
    results: "~10 side projects built end-to-end: paramedic app in TestFlight, vocabulary knowledge graph, refugee integration app",
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
    purpose: "Making the quality of 800k+ materials visible so teachers can trust what they buy",
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
    results: "~3.5M learner sessions, 29M interactive tasks completed (sessions, not unique users)",
    process: "Layered progression: Blockly visual coding → text-based languages, tied to game narrative",
    character: "Obsessive belief that intrinsic motivation beats extrinsic reward in learning",
    mastery: "Game design, learning design, and software development converging in one product",
    purpose: "Giving learners a reason to care — not just a syllabus to complete",
    relatedness: "Learners building virtual companies together, social learning embedded in gameplay",
  },
  "what-id-build": {
    results: "Success metric: learner becomes more capable and more curious — not just more engaged",
    process: "Start from the learner's confusion, not the curriculum — diagnose before prescribing",
    character: "The vision comes from being a parent: what kind of learning do I want Frieda to experience?",
    mastery: "Synthesis of learning science, AI capabilities, and product intuition",
    purpose: "The most important problem in education: scaling what a great tutor does",
    relatedness: "Learning is social — the best products honor that even when AI is involved",
  },
};
