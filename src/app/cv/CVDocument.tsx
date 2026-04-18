"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const experience = [
  {
    role: "Product Manager",
    company: "eduki, Berlin",
    period: "OCT 2022 – PRESENT",
    description:
      "Largest marketplace for teaching materials in Germany.",
    bullets: [],
    subroles: [
      {
        title: "AI Quality Assessment",
        period: "JAN 2026 – APR 2026",
        bullets: [
          "Designed and shipped an AI-powered quality assessment system for 800k+ teaching materials. Built on a research collaboration with Prof. John Hattie — ran statistical analysis to reduce 7 dimensions to 5 actionable criteria, then iterated through 10 prompt versions to raise human-AI agreement from 80% to 89%. Built safeguards against prompt injection and score manipulation to ensure assessment integrity. Designed the A/B test to validate impact on conversion and revenue.",
        ],
      },
      {
        title: "Marketplace",
        period: "APR 2025 – DEC 2025",
        bullets: [
          "Took ownership of a new product area (Product Page, Cart, Checkout, Favorites) and built up a new team around it. Ran discovery cycles and shipped data-driven optimizations through continuous A/B testing.",
        ],
      },
      {
        title: "eduki Interactive (Intrapreneurship)",
        period: "OCT 2022 – APR 2025",
        bullets: [
          "Led a small autonomous cross-functional team to integrate and grow our app within the marketplace after acquisition. Navigated the transition from founder-led product to operating within a 150-person organization — adapting processes, aligning stakeholders, and finding the right balance between speed and coordination.",
        ],
      },
    ],
  },
  {
    role: "Co-Founder & CEO",
    company: "pearprogramming",
    period: "2018 – 2022",
    description:
      "Co-founded an EdTech startup with a vision of building an intelligent tutoring system capable of automated Socratic dialogues and individualized feedback. Built a game-based learning app, from idea to acquisition by eduki in 2022.",
    bullets: [
      "Pivoted from a programming-only app to an all-subjects interactive lesson platform when the market proved too narrow, which made pearprogramming valuable enough for acquisition.",
      "Scaled to 3.5 million learner sessions and 29 million interactive tasks completed. Built and led a team of ~10 people across product, engineering, and design.",
    ],
    subroles: [],
  },
];

const education = [
  {
    degree: "M.Sc. Psychology",
    school: "University of Witten/Herdecke",
    period: "2016 – 2019",
    detail: "Grade: 1.5 (excellent). Thesis: Motivation in learning within computer science education.",
  },
  {
    degree: "B.Sc. Psychology",
    school: "University of Witten/Herdecke",
    period: "2013 – 2016",
    detail: "Grade: 1.7.",
  },
  {
    degree: "Cognitive Science",
    school: "University of Osnabrück",
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
    title: "Research Assistant — German Paediatric Pain Centre",
    venue: "Datteln, Germany · OCT 2015 – DEC 2017",
    note: "Research, test diagnostics, and quantitative data analysis in a pediatric pain research center.",
  },
];

const sideProjects = [
  { text: "This CV and my website", link: "https://maxmarowsky.com", linkText: "maxmarowsky.com" },
  "Case-based training app for paramedic trainees — built around realistic scenarios, actively tested with domain experts via TestFlight",
  "Vocabulary trainer that visualizes learning progress as a growing knowledge graph — making invisible progress visible and motivating",
  "Integration app for refugees in Germany — everything in the user's native language, with Claude as an in-app assistant for bureaucratic questions and document analysis",
  "Personalized children's books app",
];

const skillGroups = [
  {
    label: "Product",
    skills: ["Zero-to-One Products", "Discovery", "User Research", "A/B Testing", "Rapid Prototyping", "Cross-functional Collaboration", "Stakeholder Management"],
  },
  {
    label: "AI / LLM",
    skills: ["Claude", "Claude Code", "Prompt Engineering", "AI-powered Product Systems"],
  },
  {
    label: "Education",
    skills: ["Learning Science", "Game-Based Learning", "Instructional Design", "Quality Frameworks"],
  },
  {
    label: "Research",
    skills: ["Quantitative Methods", "Data Analysis", "Academic Publishing"],
  },
  {
    label: "Languages",
    skills: ["German (native)", "English (C1)", "Italian (B1)"],
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

export default function CVDocument({ isPrint = false }: { isPrint?: boolean }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = useCallback(async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const res = await fetch("/api/cv-pdf");
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Maximilian-Marowsky-CV.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      // Graceful fallback: let the user at least get a browser print dialog
      window.print();
    } finally {
      setIsExporting(false);
    }
  }, [isExporting]);

  return (
    <article className="ed-cv mx-auto max-w-[900px] px-6 py-12 sm:py-16 print:max-w-none print:px-0 print:py-0">
      {/* ---- Header ---- */}
      <header className="mb-16 print:mb-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-5">
            <div className="hidden sm:block h-[72px] w-[72px] shrink-0 overflow-hidden rounded-full grayscale print:grayscale-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
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
                Product Manager &middot; EdTech Founder
              </p>
            </div>
          </div>
          {!isPrint && (
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="no-print mt-2 ed-sans text-[12px] text-neutral-400 hover:text-neutral-900 transition-colors border border-neutral-200 rounded px-3 py-1.5 hover:border-neutral-400 disabled:opacity-50 disabled:cursor-wait"
            >
              {isExporting ? "Exporting…" : "Export PDF"}
            </button>
          )}
        </div>

        <div className="mt-4 flex gap-6 ed-sans text-[13px] text-neutral-500 items-center">
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
          <Link href="/" className="hover:text-neutral-900 transition-colors">
            maxmarowsky.com
          </Link>
          <span>Cologne, Germany</span>
          <span className="ml-auto">APRIL 18, 2026</span>
        </div>

        {/* Thin rule */}
        <div className="mt-8 h-px bg-neutral-200 print:bg-neutral-300" />
      </header>

      {/* ---- Summary ---- */}
      <EdSection title="Summary" delay={0}>
        <p className="ed-sans text-[16px] leading-[1.7] text-neutral-700">
          I co-founded an EdTech startup that built a game-based learning app
          from scratch, grew it to acquisition, and now design AI-powered
          systems that make educational quality measurable at scale.
          My psychology background shapes how I understand learning;
          7 years of working in EdTech shape how I build educational products.
          I care about safe learning experiences that give people real self-efficacy
          and adapt to who learners are and where they&apos;re headed. Building
          that at Anthropic&apos;s Education Labs is the opportunity I&apos;ve been
          working toward.
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
            {sideProjects.map((p) => {
              if (typeof p === "string") {
                return (
                  <li key={p} className="ed-sans text-[13px] text-neutral-600 leading-[1.5]">
                    {p}
                  </li>
                );
              }
              return (
                <li key={p.text} className="ed-sans text-[13px] text-neutral-600 leading-[1.5]">
                  {p.text}{" "}
                  <a href={p.link} target="_blank" rel="noopener noreferrer" className="underline decoration-neutral-300 underline-offset-3 hover:decoration-neutral-900 transition-colors">
                    {p.linkText}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </EdSection>

      {/* ---- Skills & Languages (side by side) ---- */}
      <EdSection title="Skills" delay={5}>
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
