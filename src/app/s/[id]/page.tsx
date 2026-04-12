import { notFound } from "next/navigation";
import { loadSession } from "@/lib/session-store";
import SharedSessionView from "./SharedSessionView";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SharedSessionPage({ params }: Props) {
  const { id } = await params;
  const session = await loadSession(id);
  if (!session) notFound();

  return (
    <main className="relative z-10 mx-auto max-w-3xl px-6 pb-24 pt-12">
      <SharedSessionView blocks={session.blocks} />
    </main>
  );
}
