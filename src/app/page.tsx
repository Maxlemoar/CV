import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import About from "@/components/About";

export default function Home() {
  return (
    <>
      <Nav />
      <main className="relative z-10 min-h-screen">
        <Hero />
        <div className="mx-auto max-w-3xl px-6 pb-20">
          {/* Sections will be added here */}
          <About />
        </div>
      </main>
    </>
  );
}
