import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import Link from "next/link";
import CVDocument from "./CVDocument";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-editorial-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-editorial-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CV — Maximilian Marowsky",
  description:
    "Curriculum Vitae of Maximilian Marowsky — Product Manager, EdTech, AI-Native Learning.",
};

export default async function CVPage({
  searchParams,
}: {
  searchParams: Promise<{ print?: string }>;
}) {
  const { print } = await searchParams;
  const isPrint = print === "1";

  return (
    <main
      className={`${fraunces.variable} ${inter.variable} relative z-10 min-h-screen bg-white`}
    >
      {/* Top navigation — hidden in print */}
      {!isPrint && (
        <nav className="no-print mx-auto max-w-[900px] px-6 pt-6">
          <Link
            href="/"
            className="text-[13px] text-neutral-400 hover:text-neutral-900 transition-colors"
          >
            &larr; Back
          </Link>
        </nav>
      )}

      <CVDocument isPrint={isPrint} />
    </main>
  );
}
