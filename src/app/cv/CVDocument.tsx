"use client";

import { useCallback } from "react";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const experience = [
  {
    role: "Product Manager",
    company: "eduki",
    period: "Oct 2022 – Present",
    description:
      "Largest marketplace for teaching materials in Germany (~150 employees, Berlin).",
    bullets: [],
    subroles: [
      {
        title: "AI Quality Assessment",
        period: "Q1 2026",
        bullets: [
          "Designed and shipped an AI-powered quality assessment system for 800k+ teaching materials. Translated research from eduki's collaboration with Prof. John Hattie into a data-driven scoring model combining learning science with e-commerce best practices.",
        ],
      },
      {
        title: "Marketplace",
        period: "Apr 2025 – Present",
        bullets: [
          "Took ownership of a new product area (Product Page, Cart, Checkout, Favorites) with a new team. Running discoveries and leading data-driven optimizations through A/B testing.",
        ],
      },
      {
        title: "eduki Interactive (Intrapreneurship)",
        period: "Oct 2022 – Apr 2025",
        bullets: [
          "Led an autonomous intrapreneurship team. Responsible for integrating, growing, and evolving PearUp (the product built at pearprogramming) within the marketplace.",
          "Managed a cross-functional team. Transitioned from startup founder to Productmanager, navigating the shift from full ownership to operating within a larger organization.",
        ],
      },
    ],
  },
  {
    role: "Startup Exit",
    company: "",
    period: "Oct 2022",
    description:
      "pearprogramming and its product PearUp were acquired by eduki, the largest marketplace for teaching materials in Germany (~150 employees). Product and team integrated into the marketplace.",
    bullets: [],
    subroles: [],
  },
  {
    role: "Co-Founder & CEO",
    company: "pearprogramming",
    period: "2018 – 2022",
    description:
      "I co-founded pearprogramming. A startup based in Osnabrück that developed a game-based learning app (PearUp) teaching programming to students through an entrepreneurship narrative.",
    bullets: [
      "Wore every hat: CEO, Product Owner, Scrum Master, UX/UI Designer, Researcher, and grant writer. Built and led a team of ~10.",
      "Received EXIST Gründerstipendium (federal startup grant). Won the delina 2020 (Germany's largest e-learning award). Participated in MindCET, an Israeli EdTech startup incubator.",
      "Designed the learning experience: students founded a virtual startup, made business decisions, and progressed from visual programming (Google Blockly) to text-based languages.",
    ],
    subroles: [],
  },
];

const education = [
  {
    degree: "M.Sc. Psychology",
    school: "Universität Witten/Herdecke",
    period: "2016 – 2019",
    detail: "Grade: 1.5 (excellent). Thesis: Motivation in learning within computer science education.",
  },
  {
    degree: "B.Sc. Psychology",
    school: "Universität Witten/Herdecke",
    period: "2013 – 2016",
    detail: "Grade: 1.7.",
  },
  {
    degree: "Cognitive Science",
    school: "Universität Osnabrück",
    period: "2012 – 2013",
    detail: "Transferred to Psychology at Witten/Herdecke.",
  },
];

const research = [
  {
    title: "The Teacher-Centered Perspective on Digital Game-Based Learning",
    venue: 'In: "Game-based Learning Across the Disciplines" (Springer, 2021)',
    note: "Co-authored book chapter on how teachers can integrate game-based learning effectively.",
    url: "https://link.springer.com/chapter/10.1007/978-3-030-75142-5_15",
  },
  {
    title: "Research Assistant — Deutsches Kinderschmerzzentrum",
    venue: "Datteln, Germany · Oct 2015 – Dec 2017",
    note: "Research, test diagnostics, and quantitative data analysis in a pediatric pain research center.",
  },
];

const sideProjects = [
  "Learning app for paramedic trainees — adaptive quiz system",
  "Vocabulary learning app — spaced repetition with contextual sentences",
  "Inclusion app for refugees learning German — multilingual onboarding",
  "And many more",
];

const skillGroups = [
  {
    label: "Product",
    skills: ["Discovery", "User Research", "A/B Testing", "Prioritization", "Stakeholder Communication", "Wearing Multiple Hats", "Rapid Shipping"],
  },
  {
    label: "AI / LLM",
    skills: ["Claude (daily user)", "Claude Code", "Prompt Engineering", "LLM-as-Infrastructure", "Rapid Prototyping"],
  },
  {
    label: "Education",
    skills: ["Instructional Design", "Game-Based Learning", "Curriculum Design", "Evidence-Based Learning"],
  },
  {
    label: "Research",
    skills: ["Quantitative Methods", "Study Design", "Data Analysis", "Research Publication"],
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function CVDocument() {
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return (
    <article className="cv-document mx-auto max-w-[800px] rounded-2xl bg-white shadow-neu print:shadow-none print:rounded-none">
      <div className="px-8 py-10 sm:px-12 sm:py-14 print:px-0 print:py-0">
        {/* ---- Header ---- */}
        <header className="mb-8 border-b border-paper-dark pb-8 print:border-gray-300">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl font-bold text-ink sm:text-4xl">
                Maximilian Marowsky
              </h1>
              <p className="mt-1 text-lg text-ink-light">
                Product Manager &middot; Founder &middot; EdTech
              </p>
            </div>
            <button
              onClick={handlePrint}
              className="no-print self-start rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
            >
              Export PDF
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-light">
            <span>m.marowsky@googlemail.com</span>
            <a
              href="https://www.linkedin.com/in/maximilian-marowsky-416bb3164/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent transition-colors print:text-ink"
            >
              LinkedIn
            </a>
            <span>Cologne, Germany</span>
          </div>
        </header>

        {/* ---- Summary ---- */}
        <Section title="Summary">
          <p className="leading-relaxed text-ink">
            Psychologist turned EdTech founder turned Product Manager with 8+
            years of experience building learning products from zero to one. I
            co-founded pearprogramming, a game-based coding education startup
            (acquired by eduki), and now lead AI-powered quality initiatives at
            Germany&apos;s largest teaching materials marketplace. I combine deep
            learning science expertise — rooted in my psychology background and
            collaboration with researchers like Prof. John Hattie — with daily
            hands-on AI fluency (Claude, prompt engineering, Claude Code). I
            believe education should build agency, not dependency, and I&apos;m
            driven to create AI-native learning experiences that adapt to every
            individual learner.
          </p>
        </Section>

        {/* ---- Experience ---- */}
        <Section title="Experience">
          <div className="space-y-7">
            {experience.map((exp) => (
              <div key={exp.role + exp.period}>
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-0.5">
                  <h3 className="font-semibold text-ink">
                    {exp.role}
                    {exp.company && (
                      <span className="font-normal text-ink-light">
                        {" "}— {exp.company}
                      </span>
                    )}
                  </h3>
                  <span className="shrink-0 text-sm font-semibold text-ink font-serif whitespace-nowrap">
                    {exp.period}
                  </span>
                </div>
                {exp.description && (
                  <p className="mt-0.5 text-sm text-ink-light">
                    {exp.description}
                  </p>
                )}
                {exp.bullets.length > 0 && (
                  <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-ink">
                    {exp.bullets.map((b, i) => (
                      <li key={i} className="pl-4 relative before:content-['–'] before:absolute before:left-0 before:text-ink-light">
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
                {exp.subroles.length > 0 && (
                  <div className="mt-3 space-y-4 border-l-2 border-paper-dark pl-4 print:border-gray-200">
                    {exp.subroles.map((sub) => (
                      <div key={sub.title}>
                        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-0.5">
                          <h4 className="text-sm font-semibold text-ink">{sub.title}</h4>
                          <span className="shrink-0 text-xs font-semibold text-ink font-serif whitespace-nowrap">
                            {sub.period}
                          </span>
                        </div>
                        <ul className="mt-1.5 space-y-1.5 text-sm leading-relaxed text-ink">
                          {sub.bullets.map((b, i) => (
                            <li key={i} className="pl-4 relative before:content-['–'] before:absolute before:left-0 before:text-ink-light">
                              {b}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Section>

        {/* ---- Education ---- */}
        <Section title="Education">
          <div className="space-y-3">
            {education.map((edu) => (
              <div key={edu.degree}>
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-0.5">
                  <h3 className="font-semibold text-ink">{edu.degree}</h3>
                  <span className="shrink-0 text-sm text-ink-light font-serif">
                    {edu.period}
                  </span>
                </div>
                <p className="text-sm text-ink-light">{edu.school}</p>
                <p className="mt-0.5 text-sm text-ink">{edu.detail}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ---- Research ---- */}
        <Section title="Research">
          <div className="space-y-3">
            {research.map((pub) => (
              <div key={pub.title}>
                <h3 className="font-semibold text-ink text-sm">
                  {"url" in pub && pub.url ? (
                    <a href={pub.url} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors underline decoration-ink-light/30">
                      {pub.title}
                    </a>
                  ) : pub.title}
                </h3>
                <p className="text-sm text-ink-light">{pub.venue}</p>
                <p className="mt-0.5 text-sm text-ink">{pub.note}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ---- Side Projects ---- */}
        <Section title="Side Projects">
          <p className="mb-2 text-sm text-ink-light">
            Built with Claude Code:
          </p>
          <ul className="space-y-1 text-sm text-ink">
            {sideProjects.map((p) => (
              <li key={p} className="pl-4 relative before:content-['–'] before:absolute before:left-0 before:text-ink-light">
                {p}
              </li>
            ))}
          </ul>
        </Section>

        {/* ---- Skills ---- */}
        <Section title="Skills">
          <div className="space-y-3">
            {skillGroups.map((group) => (
              <div key={group.label}>
                <span className="text-xs font-semibold uppercase tracking-wide text-ink-light">
                  {group.label}
                </span>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {group.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-md bg-paper px-2.5 py-0.5 text-sm text-ink print:border print:border-gray-300 print:bg-white"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ---- Languages ---- */}
        <Section title="Languages">
          <p className="text-sm text-ink">
            German <span className="text-ink-light">(native)</span> &middot;
            English <span className="text-ink-light">(C1)</span> &middot;
            Italian <span className="text-ink-light">(B1)</span>
          </p>
        </Section>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/*  Section wrapper                                                    */
/* ------------------------------------------------------------------ */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-7 print:mb-5">
      <h2 className="mb-3 font-serif text-lg font-bold text-ink border-b border-paper-dark pb-1 print:border-gray-300">
        {title}
      </h2>
      {children}
    </section>
  );
}
