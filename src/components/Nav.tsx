"use client";

import { useState, useEffect } from "react";
import { useCuriosity } from "./CuriosityProvider";

const LINK_DATA: Record<string, string> = {
  about: "About",
  experience: "Experience",
  projects: "Projects",
  philosophy: "Philosophy",
  publications: "Publications",
  skills: "Skills",
  personal: "Beyond Work",
  contact: "Contact",
};

export default function Nav() {
  const [active, setActive] = useState("");
  const { order } = useCuriosity();

  const links = [...order, "contact"].map((id) => ({
    href: `#${id}`,
    label: LINK_DATA[id] ?? id,
  }));

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActive(`#${visible[0].target.id}`);
        }
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );

    links.forEach(({ href }) => {
      const el = document.querySelector(href);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [order]);

  return (
    <nav className="no-print sticky top-0 z-50 overflow-x-auto border-b border-paper-dark bg-paper/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-3xl gap-1 px-4 py-2">
        {links.map(({ href, label }) => (
          <a
            key={href}
            href={href}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-sm transition-all ${
              active === href
                ? "bg-paper-dark shadow-neu-inset text-accent font-medium"
                : "text-ink-light hover:text-ink"
            }`}
          >
            {label}
          </a>
        ))}
      </div>
    </nav>
  );
}
