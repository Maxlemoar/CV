import Image from "next/image";
import SectionCard from "./SectionCard";

export default function Personal() {
  return (
    <SectionCard id="personal" title="Beyond Work">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-paper shadow-neu-sm overflow-hidden">
          <div className="relative h-48 w-full">
            <Image
              src="/with-frieda.jpeg"
              alt="Max with daughter Frieda"
              fill
              className="object-cover"
            />
          </div>
          <div className="p-5">
            <h3 className="font-serif text-base text-ink">Dad</h3>
            <p className="mt-1 text-sm text-ink-light">
              Proud father of Frieda, born August 2025. The best reason to build
              a better future for education.
            </p>
          </div>
        </div>
        <div className="rounded-xl bg-paper shadow-neu-sm overflow-hidden">
          <div className="relative h-48 w-full">
            <Image
              src="/with road bike.jpeg"
              alt="Max with his road bike"
              fill
              className="object-cover"
            />
          </div>
          <div className="p-5">
            <h3 className="font-serif text-base text-ink">Road Cycling</h3>
            <p className="mt-1 text-sm text-ink-light">
              Recently discovered road cycling. Love being outdoors —
              hiking, running, anything that gets me moving in nature.
            </p>
          </div>
        </div>
        <div className="rounded-xl bg-paper shadow-neu-sm overflow-hidden">
          <div className="relative h-48 w-full">
            <Image
              src="/with wife at wedding.jpeg"
              alt="Max and Anna at their wedding"
              fill
              className="object-cover object-top"
            />
          </div>
          <div className="p-5">
            <h3 className="font-serif text-base text-ink">Family</h3>
            <p className="mt-1 text-sm text-ink-light">
              Married to Anna Fehrenbach (M.Sc. Neuroscience) — co-author,
              partner in life, and fellow science nerd.
            </p>
          </div>
        </div>
        <div className="rounded-xl bg-paper p-5 shadow-neu-sm">
          <p className="mb-1 text-lg">&#9749;</p>
          <h3 className="font-serif text-base text-ink">Specialty Coffee</h3>
          <p className="mt-1 text-sm text-ink-light">
            Pour-over enthusiast, former barista, and unashamed coffee nerd.
            Filter coffee is my love language. Dream: opening my own cafe someday.
          </p>
        </div>
      </div>
    </SectionCard>
  );
}
