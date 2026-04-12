import SectionCard from "./SectionCard";

const skillGroups = [
  {
    label: "Product Management",
    skills: ["Discovery & Research", "A/B Testing", "Roadmapping", "Stakeholder Management", "Zero-to-One"],
  },
  {
    label: "AI & Tools",
    skills: ["Claude (daily)", "Claude Code", "Prompt Engineering", "AI Assessment Systems", "Gemini"],
  },
  {
    label: "Education & Research",
    skills: ["Learning Science", "Game-Based Learning", "Curriculum Design", "Quantitative Methods", "Academic Publishing"],
  },
  {
    label: "Leadership",
    skills: ["Startup CEO", "Cross-functional Teams", "Intrapreneurship", "EXIST Grant Recipient"],
  },
];

export default function Skills() {
  return (
    <SectionCard id="skills" title="Skills & Tools">
      <div className="grid gap-6 sm:grid-cols-2">
        {skillGroups.map((group) => (
          <div key={group.label}>
            <h3 className="mb-2 text-sm font-medium text-accent">{group.label}</h3>
            <div className="flex flex-wrap gap-2">
              {group.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-lg bg-paper px-3 py-1 text-sm text-ink-light shadow-neu-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
