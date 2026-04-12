import SectionCard from "./SectionCard";
import TimelineItem from "./TimelineItem";
import Quiz from "./Quiz";

export default function Experience() {
  return (
    <SectionCard id="experience" title="Experience">
      <div>
        <TimelineItem
          period="Q1 2026"
          title="Product Manager — Make Quality Visible"
          org="eduki"
          description="Led a quarter-long initiative to surface pedagogical quality on the platform. Built the 'Best of eduki' label powered by an AI assessor."
          highlights={[
            "Co-developed quality framework with Prof. John Hattie, validated with 2,000+ teachers",
            "Built AI assessor (Gemini Flash) evaluating 12 criteria across 5 quality dimensions",
            "Personally iterated the prompt (v10) using Claude — 89% agreement with human reviewers",
            "Shipped label on product pages, search results (with filter), and dedicated landing page",
          ]}
        />
        <Quiz
          question="The AI assessor evaluates materials across 7 quality dimensions — but 2 had to be excluded from the final scoring. Why?"
          options={[
            { label: "They were too subjective for AI to assess", explanation: "Not quite — the AI could assess them, but the scores didn't differentiate well between materials." },
            { label: "Too little statistical variance and too few high scores", correct: true, explanation: "Correct! Factor analysis showed that 'Collaboration' and 'Teacher Growth' had too little variance across materials and rarely scored high, making them unreliable differentiators in the quality score." },
            { label: "Teachers didn't consider them important", explanation: "Actually, teachers valued these dimensions — the issue was statistical, not about perceived importance." },
            { label: "The AI model couldn't understand them", explanation: "The AI could evaluate them — the problem was that the scores were too uniform across materials to be useful for ranking." },
          ]}
        />
        <TimelineItem
          period="2025 – present"
          title="Product Manager — Commerce"
          org="eduki"
          description="Owned product page, cart, checkout, and favorites — core commerce surfaces of the marketplace."
          highlights={[
            "Ran extensive discovery cycles across all product spaces",
            "Optimized through incremental improvements, frequently as A/B tests",
          ]}
        />
        <TimelineItem
          period="2022 – 2025"
          title="Product Manager — eduki Interactive"
          org="eduki (formerly pearprogramming)"
          description="Led integration of the acquired pearprogramming app into the eduki marketplace. Ran as an intrapreneurship team searching for product-market fit."
          highlights={[
            "Team: 2 backend, 2 frontend, 1 QA, 1 UX/UI designer",
            "Responsible for product strategy and PMF discovery",
          ]}
        />
        <TimelineItem
          period="2018 – 2022"
          title="Co-Founder & CEO"
          org="pearprogramming GmbH"
          description="Co-founded an EdTech startup teaching students to code through a game-based learning app. Students built a virtual startup while learning programming — from visual blocks (Google Blockly) to text-based languages."
          highlights={[
            "EXIST Gründerstipendium recipient (federal startup grant)",
            "Team of ~10, responsible for product vision, strategy, and business operations",
            "Successfully acquired by eduki in 2022",
          ]}
        />
        <TimelineItem
          period="2016 – 2019"
          title="M.Sc. Psychology"
          org="Universität Witten/Herdecke"
          description="Grade: 1.5 (excellent). Thesis on motivation in learning within computer science education."
        />
        <TimelineItem
          period="2015 – 2017"
          title="Research Assistant"
          org="Deutsches Kinderschmerzzentrum, Datteln"
          description="Research, test diagnostics, data entry and analysis alongside studies."
        />
        <TimelineItem
          period="2013 – 2016"
          title="B.Sc. Psychology"
          org="Universität Witten/Herdecke"
          description="Grade: 1.7. Previously started Cognitive Science at Universität Osnabrück (2012–2013)."
        />
      </div>
    </SectionCard>
  );
}
