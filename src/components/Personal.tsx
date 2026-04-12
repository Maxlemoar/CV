import SectionCard from "./SectionCard";

export default function Personal() {
  return (
    <SectionCard id="personal" title="Beyond Work">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-paper p-5 shadow-neu-sm">
          <p className="mb-1 text-lg">&#128118;</p>
          <h3 className="font-serif text-base text-ink">Dad</h3>
          <p className="mt-1 text-sm text-ink-light">
            Proud father of Frieda, born August 2025. The best reason to build
            a better future for education.
          </p>
        </div>
        <div className="rounded-xl bg-paper p-5 shadow-neu-sm">
          <p className="mb-1 text-lg">&#9749;</p>
          <h3 className="font-serif text-base text-ink">Specialty Coffee</h3>
          <p className="mt-1 text-sm text-ink-light">
            Pour-over enthusiast, former barista, and unashamed coffee nerd.
            Filter coffee is my love language. Dream: opening my own cafe someday.
          </p>
        </div>
        <div className="rounded-xl bg-paper p-5 shadow-neu-sm">
          <p className="mb-1 text-lg">&#127859;</p>
          <h3 className="font-serif text-base text-ink">Cooking &amp; Baking</h3>
          <p className="mt-1 text-sm text-ink-light">
            Passionate cook and bread baker. Once dreamed of becoming a chef —
            the kitchen is still where I think best.
          </p>
        </div>
        <div className="rounded-xl bg-paper p-5 shadow-neu-sm">
          <p className="mb-1 text-lg">&#128692;</p>
          <h3 className="font-serif text-base text-ink">Road Cycling</h3>
          <p className="mt-1 text-sm text-ink-light">
            Recently discovered road cycling. Love being outdoors —
            hiking, running, anything that gets me moving in nature.
          </p>
        </div>
      </div>
    </SectionCard>
  );
}
