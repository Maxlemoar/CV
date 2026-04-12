import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Experience from "@/components/Experience";
import Projects from "@/components/Projects";
import Philosophy from "@/components/Philosophy";
import Publications from "@/components/Publications";
import Skills from "@/components/Skills";
import Personal from "@/components/Personal";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <>
      <Nav />
      <main className="relative z-10 min-h-screen">
        <Hero />
        <div className="mx-auto max-w-3xl px-6 pb-20">
          <About />
          <Experience />
          <Projects />
          <Philosophy />
          <Publications />
          <Skills />
          <Personal />
          <Contact />
        </div>
      </main>
    </>
  );
}
