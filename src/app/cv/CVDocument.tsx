"use client";

import { useCallback, useEffect, useRef } from "react";
import Image from "next/image";

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
        period: "Jan 2026 – Apr 2026",
        bullets: [
          "Designed and shipped an AI-powered quality assessment system that scored 800k+ teaching materials with 89% accuracy. Built the scoring model by translating research from eduki's collaboration with Prof. John Hattie into production — bridging learning science and e-commerce to make educational quality measurable at scale.",
        ],
      },
      {
        title: "Marketplace",
        period: "Apr 2025 – Dec 2025",
        bullets: [
          "Took ownership of a new product area (Product Page, Cart, Checkout, Favorites) and built up a new team around it. Ran discovery cycles and shipped data-driven optimizations through continuous A/B testing.",
        ],
      },
      {
        title: "eduki Interactive (Intrapreneurship)",
        period: "Oct 2022 – Apr 2025",
        bullets: [
          "Led an autonomous cross-functional team to integrate and grow PearUp within the marketplace after acquisition. Navigated the transition from founder-led product to operating within a 150-person organization — adapting processes, aligning stakeholders, and finding the right balance between speed and coordination.",
        ],
      },
    ],
  },
  {
    role: "Co-Founder & CEO",
    company: "pearprogramming",
    period: "2018 – 2022",
    description:
      "Built a game-based learning app (PearUp) from idea to acquisition — teaching programming to students through an entrepreneurship narrative. Acquired by eduki in 2022; product and team integrated into the marketplace.",
    bullets: [
      "My roles: CEO, product owner, designer, researcher, recruiter, fundraiser. Built and led a team of 10 people.",
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
  "Adaptive quiz app for paramedic trainees — spaced repetition, exam simulation",
  "Vocabulary trainer — contextual sentence generation with Claude",
  "Inclusion app for refugees learning German — multilingual onboarding",
  "All prototyped end-to-end with Claude Code",
];

const skillGroups = [
  {
    label: "Product",
    skills: ["Discovery", "User Research", "A/B Testing", "Prioritization", "Stakeholder Alignment", "Metrics Definition", "Rapid Shipping"],
  },
  {
    label: "AI / LLM",
    skills: ["Claude (daily driver)", "Claude Code", "Prompt Engineering", "LLM-as-Infrastructure", "AI Prototyping"],
  },
  {
    label: "Education",
    skills: ["Learning Science", "Instructional Design", "Game-Based Learning", "Curriculum Design", "Adaptive Learning"],
  },
  {
    label: "Research",
    skills: ["Quantitative Methods", "Study Design", "Data Analysis", "Research Publication"],
  },
];

/* ------------------------------------------------------------------ */
/*  Staggered scroll-reveal                                            */
/* ------------------------------------------------------------------ */

function useStaggerReveal() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("ed-visible");
          observer.unobserve(el);
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function CVDocument() {
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return (
    <article className="ed-cv mx-auto max-w-[900px] px-6 py-12 sm:py-16 print:max-w-none print:px-0 print:py-0">
      {/* ---- Header ---- */}
      <header className="mb-16 print:mb-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-5">
            <div className="h-[72px] w-[72px] shrink-0 overflow-hidden rounded-full grayscale print:grayscale-0">
              <Image
                src="/Max_tafel_klein.jpg"
                alt="Maximilian Marowsky"
                width={72}
                height={72}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <h1 className="ed-serif text-[40px] leading-[1.1] text-neutral-900 sm:text-[48px]">
                Maximilian Marowsky
              </h1>
              <p className="mt-1 ed-sans text-[14px] tracking-[0.08em] uppercase text-neutral-400">
                Product Manager &middot; Founder &middot; EdTech
              </p>
            </div>
          </div>
          <button
            onClick={handlePrint}
            className="no-print mt-2 ed-sans text-[12px] text-neutral-400 hover:text-neutral-900 transition-colors border border-neutral-200 rounded px-3 py-1.5 hover:border-neutral-400"
          >
            Export PDF
          </button>
        </div>

        <div className="mt-4 flex gap-6 ed-sans text-[13px] text-neutral-500">
          <a href="mailto:m.marowsky@gmail.com" className="hover:text-neutral-900 transition-colors">
            m.marowsky@gmail.com
          </a>
          <a
            href="https://www.linkedin.com/in/maximilian-marowsky-416bb3164/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-neutral-900 transition-colors"
          >
            LinkedIn
          </a>
          <span>Cologne, Germany</span>
          <a href="/" className="hover:text-neutral-900 transition-colors no-print">
            maxmarowsky.com
          </a>
        </div>

        {/* Thin rule */}
        <div className="mt-8 h-px bg-neutral-200 print:bg-neutral-300" />
      </header>

      {/* ---- Summary ---- */}
      <EdSection title="Summary" delay={0}>
        <p className="ed-sans text-[16px] leading-[1.7] text-neutral-700 max-w-[620px]">
          Psychologist turned EdTech founder turned Product Manager. I
          built a game-based learning app from scratch, grew it to
          acquisition, and now design AI-powered systems at eduki that
          make educational quality measurable at scale. My psychology
          background shapes how I think about learning; building with
          Claude every day shapes how I think about product. I care
          about learning experiences that give people real agency — not
          just content delivery, but tools that adapt to who learners
          are and where they&apos;re headed.
        </p>
      </EdSection>

      {/* ---- Experience ---- */}
      <EdSection title="Experience" delay={1}>
        <div className="space-y-10">
          {experience.map((exp) => (
            <div key={exp.role + exp.period}>
              {/* Role header */}
              <div className="ed-grid-row">
                <div className="ed-grid-margin">
                  <span className="ed-sans text-[12px] text-neutral-400 tabular-nums">
                    {exp.period}
                  </span>
                </div>
                <div className="ed-grid-main">
                  <h3 className="ed-sans text-[15px] font-semibold text-neutral-900">
                    {exp.role}
                    {exp.company && (
                      <span className="font-normal text-neutral-500">
                        {" "}— {exp.company}
                      </span>
                    )}
                  </h3>
                  {exp.description && (
                    <p className="mt-1 ed-sans text-[14px] leading-[1.6] text-neutral-600">
                      {exp.description}
                    </p>
                  )}
                  {exp.bullets.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {exp.bullets.map((b, i) => (
                        <li key={i} className="ed-sans text-[14px] leading-[1.6] text-neutral-700">
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Subroles */}
              {exp.subroles.length > 0 && (
                <div className="mt-4 space-y-4">
                  {exp.subroles.map((sub) => (
                    <div key={sub.title} className="ed-grid-row">
                      <div className="ed-grid-margin">
                        <span className="ed-sans text-[11px] text-neutral-400 tabular-nums">
                          {sub.period}
                        </span>
                      </div>
                      <div className="ed-grid-main border-l border-neutral-200 pl-4">
                        <h4 className="ed-sans text-[13px] font-medium text-neutral-800">
                          {sub.title}
                        </h4>
                        <ul className="mt-1 space-y-1">
                          {sub.bullets.map((b, i) => (
                            <li key={i} className="ed-sans text-[13px] leading-[1.65] text-neutral-600">
                              {b}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </EdSection>

      {/* ---- Education ---- */}
      <EdSection title="Education" delay={2}>
        <div className="space-y-3">
          {education.map((edu) => (
            <div key={edu.degree} className="ed-grid-row">
              <div className="ed-grid-margin">
                <span className="ed-sans text-[12px] text-neutral-400 tabular-nums">
                  {edu.period}
                </span>
              </div>
              <div className="ed-grid-main">
                <h3 className="ed-sans text-[14px] font-medium text-neutral-900">
                  {edu.degree}
                </h3>
                <p className="ed-sans text-[13px] text-neutral-500">{edu.school}</p>
                <p className="ed-sans text-[13px] text-neutral-600">{edu.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </EdSection>

      {/* ---- Research ---- */}
      <EdSection title="Research" delay={3}>
        <div className="space-y-4">
          {research.map((pub) => (
            <div key={pub.title} className="max-w-[620px]">
              <h3 className="ed-sans text-[14px] font-medium text-neutral-900">
                {"url" in pub && pub.url ? (
                  <a
                    href={pub.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-neutral-300 underline-offset-3 hover:decoration-neutral-900 transition-colors"
                  >
                    {pub.title}
                  </a>
                ) : pub.title}
              </h3>
              <p className="ed-sans text-[12px] text-neutral-400 mt-0.5">{pub.venue}</p>
              <p className="ed-sans text-[13px] text-neutral-600 mt-1">{pub.note}</p>
            </div>
          ))}
        </div>
      </EdSection>

      {/* ---- Side Projects ---- */}
      <EdSection title="Side Projects" delay={4}>
        <div className="max-w-[620px]">
          <p className="ed-sans text-[12px] text-neutral-400 mb-3 uppercase tracking-[0.06em]">
            Built with Claude Code
          </p>
          <ul className="space-y-1.5">
            {sideProjects.map((p) => (
              <li key={p} className="ed-sans text-[13px] text-neutral-600 leading-[1.5]">
                {p}
              </li>
            ))}
          </ul>
        </div>
      </EdSection>

      {/* ---- Skills & Languages (side by side) ---- */}
      <EdSection title="Skills" delay={5}>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-8 print:grid-cols-[1fr_200px]">
          <div className="space-y-4">
            {skillGroups.map((group) => (
              <div key={group.label}>
                <span className="ed-sans text-[11px] font-medium uppercase tracking-[0.08em] text-neutral-400">
                  {group.label}
                </span>
                <div className="mt-1.5 flex flex-wrap gap-x-1 gap-y-0.5">
                  {group.skills.map((skill, i) => (
                    <span key={skill} className="ed-sans text-[13px] text-neutral-700">
                      {skill}{i < group.skills.length - 1 && <span className="text-neutral-300 mx-1">/</span>}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div>
            <span className="ed-sans text-[11px] font-medium uppercase tracking-[0.08em] text-neutral-400">
              Languages
            </span>
            <div className="mt-2 space-y-1.5 ed-sans text-[13px]">
              <div className="flex justify-between">
                <span className="text-neutral-700">German</span>
                <span className="text-neutral-400">native</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-700">English</span>
                <span className="text-neutral-400">C1</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-700">Italian</span>
                <span className="text-neutral-400">B1</span>
              </div>
            </div>
          </div>
        </div>
      </EdSection>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/*  Editorial section with scroll-reveal + margin title                */
/* ------------------------------------------------------------------ */

function EdSection({
  title,
  delay = 0,
  children,
}: {
  title: string;
  delay?: number;
  children: React.ReactNode;
}) {
  const ref = useStaggerReveal();

  return (
    <section
      ref={ref}
      className="ed-reveal mb-14 print:mb-8 print:opacity-100 print:translate-y-0"
      style={{ transitionDelay: `${delay * 60}ms` }}
    >
      <h2 className="ed-serif text-[28px] text-neutral-900 mb-5 print:text-[18px] print:mb-3">
        {title}
      </h2>
      {children}
    </section>
  );
}
