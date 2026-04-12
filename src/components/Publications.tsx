import SectionCard from "./SectionCard";

export default function Publications() {
  return (
    <SectionCard id="publications" title="Publications">
      <div className="space-y-4">
        <div className="rounded-xl bg-paper p-5 shadow-neu-sm">
          <h3 className="font-serif text-base text-ink">
            The Teacher-Centered Perspective on Digital Game-Based Learning
          </h3>
          <p className="mt-1 text-sm text-ink-light">
            Book chapter in &ldquo;Game-based Learning Across the Disciplines&rdquo;
          </p>
          <p className="mt-1 text-sm text-ink-light">
            Springer, August 2021 &middot; Co-authored with Anna Fehrenbach et al.
          </p>
          <a
            href="https://link.springer.com/book/10.1007/978-3-030-75142-5"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-sm font-medium text-accent hover:text-accent-hover transition-colors"
          >
            View on Springer &rarr;
          </a>
        </div>
        <div className="rounded-xl bg-paper p-5 shadow-neu-sm">
          <h3 className="font-serif text-base text-ink">
            Quality Framework for Teaching Materials
          </h3>
          <p className="mt-1 text-sm text-ink-light">
            Two published studies co-developed with Prof. John Hattie, validating a framework
            for assessing pedagogical quality of teaching materials across 7 factors and 5
            applicable dimensions.
          </p>
        </div>
      </div>
    </SectionCard>
  );
}
