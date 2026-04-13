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
          "Designed and shipped an AI-powered quality assessment system for 800k+ teaching materials. Translated research from eduki's collaboration with Prof. John Hattie into a data-driven scoring model combining learning science with e-commerce best practices.",
        ],
      },
      {
        title: "Marketplace",
        period: "Apr 2025 – Dec 2025",
        bullets: [
          "Took ownership of a new product area (Product Page, Cart, Checkout, Favorites) with a new team. Running discoveries and leading data-driven optimizations through A/B testing.",
        ],
      },
      {
        title: "eduki Interactive (Intrapreneurship)",
        period: "Oct 2022 – Apr 2025",
        bullets: [
          "Led an autonomous cross-functional team. Responsible for integrating, growing, and evolving PearUp (the product built at pearprogramming) within the marketplace. Transitioned from startup founder to product manager, navigating the shift from full ownership to operating within a larger organization.",
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
      "My roles: CEO, Product Owner, Scrum Master, UX/UI Designer, Researcher, and grant writer. Leading a team of up to 15 people.",
      "Received EXIST (federal startup grant). Won the delina 2020 (Germany's largest e-learning award). Participated in MindCET, an Israeli EdTech startup incubator.",
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
/*  Scroll-reveal hook                                                 */
/* ------------------------------------------------------------------ */

function useRevealOnScroll() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("cv-visible");
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
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
    <article className="cv-document mx-auto max-w-[860px] rounded-2xl bg-white shadow-neu print:shadow-none print:rounded-none">
      <div className="px-8 py-8 sm:px-10 sm:py-10 print:px-0 print:py-0">
        {/* ---- Header ---- */}
        <header className="mb-6 pb-6 border-b border-paper-dark print:border-gray-300">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full shadow-neu-sm print:shadow-none">
                <Image
                  src="/Max_tafel_klein.jpg"
                  alt="Maximilian Marowsky"
                  width={56}
                  height={56}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h1 className="font-serif text-2xl font-bold text-ink sm:text-3xl">
                  Maximilian Marowsky
                </h1>
                <p className="mt-0.5 text-[13px] text-ink-light tracking-wide">
                  Product Manager &middot; Founder &middot; EdTech
                </p>
              </div>
            </div>
            <button
              onClick={handlePrint}
              className="no-print self-start rounded-lg bg-accent px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-accent-hover"
            >
              Export PDF
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-ink-light">
            <span>m.marowsky@gmail.com</span>
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

        {/* ---- Two-column layout ---- */}
        <div className="flex flex-col md:flex-row md:gap-8 print:flex-row print:gap-8">
          {/* ---- Main column (left, ~68%) ---- */}
          <div className="md:w-[68%] print:w-[68%]">
            {/* ---- Summary ---- */}
            <Section title="Summary">
              <p className="text-[13px] leading-relaxed text-ink">
                Psychologist turned EdTech founder turned Product Manager with 8+
                years of experience building learning products. I co-founded
                pearprogramming, a game-based learning startup that was acquired by
                eduki, where I now build AI-powered systems that make educational
                quality visible and measurable. My background in science shapes
                how I think about learning and working with Claude how I
                think about product. I believe that people learn best with
                experiences that adapt to who they are and what they need.
              </p>
            </Section>

            {/* ---- Experience ---- */}
            <Section title="Experience">
              <div className="space-y-5">
                {experience.map((exp) => (
                  <div
                    key={exp.role + exp.period}
                    className="group rounded-lg px-3 py-2 -mx-3 transition-colors hover:bg-paper/60 print:hover:bg-transparent print:px-0 print:mx-0"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-0.5">
                      <h3 className="text-[13px] font-semibold text-ink">
                        {exp.role}
                        {exp.company && (
                          <span className="font-normal text-ink-light">
                            {" "}— {exp.company}
                          </span>
                        )}
                      </h3>
                      <span className="shrink-0 text-[12px] font-semibold text-accent font-serif whitespace-nowrap">
                        {exp.period}
                      </span>
                    </div>
                    {exp.description && (
                      <p className="mt-0.5 text-[12px] text-ink-light leading-snug">
                        {exp.description}
                      </p>
                    )}
                    {exp.bullets.length > 0 && (
                      <ul className="mt-1.5 space-y-1 text-[12px] leading-relaxed text-ink">
                        {exp.bullets.map((b, i) => (
                          <li key={i} className="pl-3 relative before:content-['·'] before:absolute before:left-0 before:text-accent before:font-bold">
                            {b}
                          </li>
                        ))}
                      </ul>
                    )}
                    {exp.subroles.length > 0 && (
                      <div className="mt-2 space-y-3 border-l-2 border-accent/20 pl-3 print:border-gray-200">
                        {exp.subroles.map((sub) => (
                          <div key={sub.title}>
                            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-0.5">
                              <h4 className="text-[12px] font-semibold text-ink">{sub.title}</h4>
                              <span className="shrink-0 text-[11px] font-medium text-accent/80 font-serif whitespace-nowrap">
                                {sub.period}
                              </span>
                            </div>
                            <ul className="mt-1 space-y-1 text-[12px] leading-relaxed text-ink">
                              {sub.bullets.map((b, i) => (
                                <li key={i} className="pl-3 relative before:content-['·'] before:absolute before:left-0 before:text-accent before:font-bold">
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
              <div className="space-y-2.5">
                {education.map((edu) => (
                  <div key={edu.degree}>
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-0.5">
                      <h3 className="text-[13px] font-semibold text-ink">{edu.degree}</h3>
                      <span className="shrink-0 text-[11px] font-medium text-accent/80 font-serif">
                        {edu.period}
                      </span>
                    </div>
                    <p className="text-[12px] text-ink-light">{edu.school}</p>
                    <p className="mt-0.5 text-[12px] text-ink">{edu.detail}</p>
                  </div>
                ))}
              </div>
            </Section>

            {/* ---- Research ---- */}
            <Section title="Research">
              <div className="space-y-2.5">
                {research.map((pub) => (
                  <div key={pub.title}>
                    <h3 className="text-[12px] font-semibold text-ink">
                      {"url" in pub && pub.url ? (
                        <a href={pub.url} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors underline decoration-accent/30 underline-offset-2">
                          {pub.title}
                        </a>
                      ) : pub.title}
                    </h3>
                    <p className="text-[11px] text-ink-light">{pub.venue}</p>
                    <p className="mt-0.5 text-[12px] text-ink">{pub.note}</p>
                  </div>
                ))}
              </div>
            </Section>
          </div>

          {/* ---- Sidebar (right, ~32%) ---- */}
          <aside className="md:w-[32%] print:w-[32%] mt-6 md:mt-0 print:mt-0 md:border-l md:border-paper-dark md:pl-8 print:border-l print:border-gray-200 print:pl-8">
            {/* ---- Skills ---- */}
            <Section title="Skills">
              <div className="space-y-3">
                {skillGroups.map((group) => (
                  <div key={group.label}>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-accent">
                      {group.label}
                    </span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {group.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded bg-paper px-2 py-0.5 text-[11px] text-ink print:border print:border-gray-200 print:bg-white"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* ---- Side Projects ---- */}
            <Section title="Side Projects">
              <p className="mb-1.5 text-[11px] text-ink-light">
                Built with Claude Code:
              </p>
              <ul className="space-y-1 text-[11px] text-ink">
                {sideProjects.map((p) => (
                  <li key={p} className="pl-3 relative before:content-['·'] before:absolute before:left-0 before:text-accent before:font-bold">
                    {p}
                  </li>
                ))}
              </ul>
            </Section>

            {/* ---- Languages ---- */}
            <Section title="Languages">
              <div className="space-y-1 text-[12px]">
                <div className="flex justify-between">
                  <span className="text-ink">German</span>
                  <span className="text-ink-light">native</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink">English</span>
                  <span className="text-ink-light">C1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink">Italian</span>
                  <span className="text-ink-light">B1</span>
                </div>
              </div>
            </Section>

            {/* ---- Portfolio link ---- */}
            <Section title="Portfolio">
              <a
                href="/"
                className="inline-flex items-center gap-1.5 text-[12px] text-accent hover:text-accent-hover transition-colors font-medium"
              >
                maxmarowsky.com
                <span className="text-[10px]">↗</span>
              </a>
            </Section>
          </aside>
        </div>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/*  Section wrapper with scroll-reveal                                 */
/* ------------------------------------------------------------------ */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const ref = useRevealOnScroll();

  return (
    <section
      ref={ref}
      className="cv-reveal mb-5 print:mb-4 print:opacity-100 print:translate-y-0"
    >
      <h2 className="mb-2 text-[13px] font-bold text-accent uppercase tracking-wider border-b border-paper-dark pb-1 print:border-gray-300 print:text-ink">
        {title}
      </h2>
      {children}
    </section>
  );
}
