interface SectionCardProps {
  id: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export default function SectionCard({ id, title, children, className = "" }: SectionCardProps) {
  return (
    <section id={id} className={`mb-12 rounded-2xl bg-paper-dark p-8 shadow-neu ${className}`}>
      <h2 className="mb-6 font-serif text-2xl text-ink">{title}</h2>
      {children}
    </section>
  );
}
