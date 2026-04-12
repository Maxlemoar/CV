"use client";

import SectionCard from "./SectionCard";

export default function Contact() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <SectionCard id="contact" title="Get in Touch">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
          <a
            href="mailto:m.marowsky@googlemail.com"
            className="text-ink-light hover:text-accent transition-colors text-sm"
          >
            m.marowsky@googlemail.com
          </a>
          <a
            href="https://www.linkedin.com/in/maximilian-marowsky-416bb3164/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-ink-light hover:text-accent transition-colors text-sm"
          >
            LinkedIn
          </a>
        </div>
        <button
          onClick={handlePrint}
          className="no-print rounded-xl bg-paper px-6 py-3 text-sm font-medium text-ink shadow-neu transition-all hover:shadow-neu-sm active:shadow-neu-inset"
        >
          Export as PDF
        </button>
      </div>
    </SectionCard>
  );
}
