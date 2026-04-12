"use client";

import { useCuriosity } from "./CuriosityProvider";
import Hero from "./Hero";
import About from "./About";
import Experience from "./Experience";
import Projects from "./Projects";
import Philosophy from "./Philosophy";
import Publications from "./Publications";
import Skills from "./Skills";
import Personal from "./Personal";
import Contact from "./Contact";
import ChatWidget from "./ChatWidget";

const SECTION_COMPONENTS: Record<string, React.ComponentType> = {
  about: About,
  experience: Experience,
  projects: Projects,
  philosophy: Philosophy,
  publications: Publications,
  skills: Skills,
  personal: Personal,
};

export default function InteractivePage() {
  const { order, isHighlighted } = useCuriosity();

  return (
    <main className="relative z-10 min-h-screen">
      <Hero />
      <div className="mx-auto max-w-3xl px-6 pb-20">
        {order.map((sectionId) => {
          const Component = SECTION_COMPONENTS[sectionId];
          if (!Component) return null;
          return <Component key={sectionId} />;
        })}
        <Contact />
      </div>
      <ChatWidget />
    </main>
  );
}
