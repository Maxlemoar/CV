import SectionCard from "./SectionCard";
import ProjectCard from "./ProjectCard";

export default function Projects() {
  return (
    <SectionCard id="projects" title="Projects">
      <p className="mb-6 text-sm text-ink-light">
        Side projects I&apos;m building with Claude Code — because the best way to understand AI is to build with it.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <ProjectCard
          title="Paramedic Trainer"
          description="A learning app for paramedic trainees (Rettungssanitäter) — adaptive quizzes and scenario-based learning for emergency medical training."
          tags={["Education", "Claude Code", "Next.js"]}
          status="In Development"
        />
        <ProjectCard
          title="Vocabulary App"
          description="A vocabulary learning application with spaced repetition and contextual learning."
          tags={["Education", "Claude Code", "Spaced Repetition"]}
          status="In Development"
        />
        <ProjectCard
          title="Inclusion App"
          description="Helping refugees arriving in Germany learn German — making language learning accessible and culturally sensitive."
          tags={["Education", "Inclusion", "Claude Code"]}
          status="In Development"
        />
        <ProjectCard
          title="pearprogramming"
          description="Game-based coding education — students build a virtual startup while learning to program. From visual blocks to real code."
          tags={["EdTech", "Game-Based Learning", "Startup"]}
          status="Acquired by eduki"
        />
      </div>
    </SectionCard>
  );
}
