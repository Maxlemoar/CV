import SectionCard from "./SectionCard";

export default function About() {
  return (
    <SectionCard id="about" title="About">
      <div className="space-y-4 text-ink-light leading-relaxed">
        <p>
          I&apos;m a psychologist who became a product manager because I believe technology
          can transform how we learn. My journey started with a Master&apos;s thesis on motivation
          in computer science education — and hasn&apos;t stopped since.
        </p>
        <p>
          I co-founded{" "}
          <span className="font-medium text-ink">pearprogramming</span>, a game-based
          learning app that taught students to code by building their own virtual startup.
          After our acquisition by{" "}
          <span className="font-medium text-ink">eduki</span> — Germany&apos;s largest
          marketplace for teaching materials — I led the product integration and went on to
          optimize core commerce experiences and build an AI-powered quality assessment system
          in collaboration with Prof. John Hattie.
        </p>
        <p>
          Today, I use Claude daily to build learning applications — from a paramedic training
          app to an inclusion tool helping refugees learn German. I&apos;m looking to bring my
          unique blend of psychology, education science, and product craft to Anthropic&apos;s
          Education Labs.
        </p>
      </div>
    </SectionCard>
  );
}
