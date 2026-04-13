import type { Metadata } from "next";
import { Instrument_Serif, Inter } from "next/font/google";
import Link from "next/link";
import CVDocument from "./CVDocument";

const instrumentSerif = Instrument_Serif({
  weight: "400",
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

export default function CVPage() {
  return (
    <main
      className={`${instrumentSerif.variable} ${inter.variable} relative z-10 min-h-screen bg-white`}
    >
      {/* Top navigation — hidden in print */}
      <nav className="no-print mx-auto max-w-[900px] px-6 pt-6">
        <Link
          href="/"
          className="text-[13px] text-neutral-400 hover:text-neutral-900 transition-colors"
        >
          &larr; Back
        </Link>
      </nav>

      <CVDocument />
    </main>
  );
}
