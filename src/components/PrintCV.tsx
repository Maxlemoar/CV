import { getPrintNodes } from "@/lib/content-graph";

const SECTION_LABELS: Record<string, string> = {
  about: "About",
  education: "Education",
  experience: "Experience",
  projects: "Projects",
  philosophy: "Philosophy",
  publications: "Publications",
  skills: "Skills",
  personal: "Personal",
};

export default function PrintCV() {
  const nodes = getPrintNodes();
  let currentSection = "";

  return (
    <div className="hidden print:block">
      <div className="mb-6 border-b border-gray-300 pb-4">
        <h1 className="text-2xl font-bold">Maximilian Marowsky</h1>
        <p className="text-sm text-gray-600">Product Manager · Ex-Founder · Psychologist</p>
        <p className="text-sm text-gray-600">m.marowsky@googlemail.com · Cologne, Germany</p>
      </div>
      {nodes.map((node) => {
        const section = node.printSection ?? "personal";
        const showHeader = section !== currentSection;
        currentSection = section;
        return (
          <div key={node.id}>
            {showHeader && (
              <h2 className="mb-2 mt-6 text-lg font-bold">{SECTION_LABELS[section] ?? section}</h2>
            )}
            <p className="mb-3 text-sm leading-relaxed">{node.content}</p>
          </div>
        );
      })}
    </div>
  );
}
