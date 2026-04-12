interface TimelineItemProps {
  period: string;
  title: string;
  org: string;
  description: string;
  highlights?: string[];
}

export default function TimelineItem({ period, title, org, description, highlights }: TimelineItemProps) {
  return (
    <div className="relative border-l-2 border-accent/30 pb-8 pl-6 last:pb-0">
      <div className="absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-accent shadow-neu-sm" />
      <p className="text-sm font-medium text-accent">{period}</p>
      <h3 className="mt-1 font-serif text-lg text-ink">{title}</h3>
      <p className="text-sm font-medium text-ink-light">{org}</p>
      <p className="mt-2 text-sm leading-relaxed text-ink-light">{description}</p>
      {highlights && (
        <ul className="mt-2 space-y-1">
          {highlights.map((h) => (
            <li key={h} className="text-sm text-ink-light">
              <span className="mr-2 text-accent">&#8226;</span>
              {h}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
