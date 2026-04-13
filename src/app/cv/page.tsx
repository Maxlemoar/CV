import type { Metadata } from "next";
import Link from "next/link";
import CVDocument from "./CVDocument";

export const metadata: Metadata = {
  title: "CV — Maximilian Marowsky",
  description:
    "Curriculum Vitae of Maximilian Marowsky — Product Manager, EdTech, AI-Native Learning.",
};

export default function CVPage() {
  return (
    <main className="relative z-10 min-h-screen py-8 px-4 sm:px-6">
      {/* Top navigation — hidden in print */}
      <nav className="no-print mx-auto mb-6 max-w-[800px]">
        <Link
          href="/"
          className="text-sm text-ink-light hover:text-accent transition-colors"
        >
          &larr; Back to Portfolio
        </Link>
      </nav>

      <CVDocument />
    </main>
  );
}
