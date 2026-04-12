import SectionCard from "./SectionCard";

export default function Philosophy() {
  return (
    <SectionCard id="philosophy" title="Education Philosophy">
      <div className="space-y-4 text-ink-light leading-relaxed">
        <p>
          Learning is deeply individual. Every student brings unique interests, inclinations,
          and challenges. The task of education is to identify these and specifically nurture them —
          not to apply a one-size-fits-all curriculum.
        </p>
        <p>
          I don&apos;t believe fact-oriented learning is a future model. In a world where all
          information is available within seconds and increasingly capable AI systems are emerging,
          we must dare to question our fundamental paradigms in education.
        </p>
        <p>
          The goal isn&apos;t to fill minds with answers — it&apos;s to build{" "}
          <span className="font-medium text-ink">agency</span>,{" "}
          <span className="font-medium text-ink">curiosity</span>, and the ability to{" "}
          <span className="font-medium text-ink">think critically</span> in a world where
          knowledge itself is becoming a commodity.
        </p>
      </div>
    </SectionCard>
  );
}
