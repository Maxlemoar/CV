import { loadSession } from "@/lib/session-store";
import { notFound } from "next/navigation";
import ShareableCard from "@/components/ShareableCard";
import Link from "next/link";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: "Max Marowsky's Experiment — My Result",
    description: "Every journey is unique. Start your own experiment.",
    openGraph: {
      images: [`/api/og/${id}`],
    },
  };
}

export default async function SharedSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await loadSession(id);
  if (!session) notFound();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <ShareableCard profile={session.profile} />
      <div className="mt-8 text-center">
        <Link
          href="/"
          className="px-7 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors inline-block"
        >
          Start your own experiment
        </Link>
      </div>
    </div>
  );
}
