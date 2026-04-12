interface SectionCardProps {
  id: string;
  title: string;
  children: React.ReactNode;
  className?: string;
  highlighted?: boolean;
}

export default function SectionCard({ id, title, children, className = "", highlighted = false }: SectionCardProps) {
  return (
    <section
      id={id}
      className={`mb-12 rounded-2xl bg-paper-dark p-8 shadow-neu transition-all ${
        highlighted ? "border-l-4 border-accent" : ""
      } ${className}`}
    >
      <h2 className="mb-6 font-serif text-2xl text-ink">{title}</h2>
      {children}
    </section>
  );
}
