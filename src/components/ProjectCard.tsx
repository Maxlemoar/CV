interface ProjectCardProps {
  title: string;
  description: string;
  tags: string[];
  status: string;
  url?: string;
}

export default function ProjectCard({ title, description, tags, status, url }: ProjectCardProps) {
  return (
    <div className="rounded-xl bg-paper p-6 shadow-neu-sm transition-shadow hover:shadow-neu">
      <div className="mb-2 flex items-start justify-between">
        <h3 className="font-serif text-lg text-ink">{title}</h3>
        <span className="shrink-0 rounded-full bg-accent/10 px-2 py-0.5 text-xs text-accent">
          {status}
        </span>
      </div>
      <p className="text-sm leading-relaxed text-ink-light">{description}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded-md bg-paper-dark px-2 py-0.5 text-xs text-ink-light shadow-neu-inset"
          >
            {tag}
          </span>
        ))}
      </div>
      {url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block text-sm font-medium text-accent hover:text-accent-hover transition-colors"
        >
          View Project &rarr;
        </a>
      )}
    </div>
  );
}
