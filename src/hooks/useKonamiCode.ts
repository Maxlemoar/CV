"use client";

import { useEffect, useState, useCallback } from "react";

const KONAMI_SEQUENCE = [
  "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
  "b", "a",
];

export function useKonamiCode(): boolean {
  const [activated, setActivated] = useState(false);
  const [position, setPosition] = useState(0);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (activated) return;
      const expected = KONAMI_SEQUENCE[position];
      if (e.key === expected || e.key.toLowerCase() === expected) {
        const next = position + 1;
        if (next === KONAMI_SEQUENCE.length) {
          setActivated(true);
        } else {
          setPosition(next);
        }
      } else {
        setPosition(0);
      }
    },
    [position, activated]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return activated;
}
