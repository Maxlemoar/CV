"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface PourOverGameProps {
  onClose: () => void;
}

const MAX_RECIPE = { grind: 2, temp: 92, time: 210 };

function calculateRating(grind: number, temp: number, timeSeconds: number): { stars: number; comment: string } {
  const grindDist = Math.abs(grind - MAX_RECIPE.grind);
  const tempDist = Math.abs(temp - MAX_RECIPE.temp);
  const timeDist = Math.abs(timeSeconds - MAX_RECIPE.time);

  const grindScore = grindDist === 0 ? 2 : grindDist === 1 ? 1 : 0;
  const tempScore = tempDist <= 1 ? 2 : tempDist <= 3 ? 1 : 0;
  const timeScore = timeDist <= 15 ? 2 : timeDist <= 45 ? 1 : 0;

  const total = grindScore + tempScore + timeScore; // 0-6

  if (total >= 6) return { stars: 5, comment: "That's my exact recipe. You'd survive a shift." };
  if (total >= 4) return { stars: 4, comment: "Close — I'd drink this. Almost barista-level." };
  if (total >= 3) return { stars: 3, comment: "Drinkable. But Max would tweak the grind." };
  if (total >= 1) return { stars: 2, comment: "Brave choice. Max politely pours it out." };
  return { stars: 1, comment: "This is a war crime. Max is calling the coffee police." };
}

const GRIND_LABELS = ["", "Fine", "Medium-Fine", "Medium", "Medium-Coarse", "Coarse"];

function formatTime(seconds: number): string {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

export default function PourOverGame({ onClose }: PourOverGameProps) {
  const [grind, setGrind] = useState(3);
  const [temp, setTemp] = useState(90);
  const [time, setTime] = useState(180);
  const [result, setResult] = useState<{ stars: number; comment: string } | null>(null);

  function handleBrew() {
    setResult(calculateRating(grind, temp, time));
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl bg-white p-6 shadow-neu sm:p-8"
    >
      <div className="mb-1 text-xs font-medium uppercase tracking-wide text-ink-light">
        Max's Pour-Over Lab
      </div>
      <p className="mb-6 text-sm italic text-ink-light">You found my secret café.</p>

      <div className="space-y-5">
        {/* Grind Size */}
        <div>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="text-ink-light">Grind Size</span>
            <span className="font-medium text-ink">{GRIND_LABELS[grind]}</span>
          </div>
          <input
            type="range"
            min={1} max={5} step={1} value={grind}
            onChange={(e) => setGrind(Number(e.target.value))}
            className="slider w-full"
            aria-label="Grind Size"
            aria-valuemin={1} aria-valuemax={5} aria-valuenow={grind}
            disabled={result !== null}
          />
          <div className="flex justify-between text-[10px] text-ink-light/50">
            <span>Fine</span><span>Coarse</span>
          </div>
        </div>

        {/* Temperature */}
        <div>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="text-ink-light">Temperature</span>
            <span className="font-medium text-ink">{temp}°C</span>
          </div>
          <input
            type="range"
            min={85} max={96} step={1} value={temp}
            onChange={(e) => setTemp(Number(e.target.value))}
            className="slider w-full"
            aria-label="Temperature"
            aria-valuemin={85} aria-valuemax={96} aria-valuenow={temp}
            disabled={result !== null}
          />
          <div className="flex justify-between text-[10px] text-ink-light/50">
            <span>85°C</span><span>96°C</span>
          </div>
        </div>

        {/* Brew Time */}
        <div>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="text-ink-light">Brew Time</span>
            <span className="font-medium text-ink">{formatTime(time)}</span>
          </div>
          <input
            type="range"
            min={120} max={300} step={15} value={time}
            onChange={(e) => setTime(Number(e.target.value))}
            className="slider w-full"
            aria-label="Brew Time"
            aria-valuemin={120} aria-valuemax={300} aria-valuenow={time}
            disabled={result !== null}
          />
          <div className="flex justify-between text-[10px] text-ink-light/50">
            <span>2:00</span><span>5:00</span>
          </div>
        </div>
      </div>

      {/* Brew / Result */}
      {!result ? (
        <button
          onClick={handleBrew}
          className="mt-6 w-full rounded-xl bg-accent px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
        >
          Brew
        </button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 rounded-xl border border-[var(--color-paper-dark,#E5DDD3)] bg-paper p-4 text-center"
        >
          <div className="text-2xl" aria-label={`${result.stars} out of 5 stars`}>
            <span className="text-yellow-400">{"★".repeat(result.stars)}</span>
            <span className="text-yellow-400/30">{"☆".repeat(5 - result.stars)}</span>
          </div>
          <p className="mt-2 text-sm italic text-ink">{result.comment}</p>
        </motion.div>
      )}

      {/* Back button */}
      {result && (
        <button
          onClick={onClose}
          className="mt-4 w-full rounded-xl border border-accent/20 bg-paper px-5 py-3 text-sm font-medium text-accent transition-shadow hover:shadow-neu-sm"
        >
          Back to the conversation →
        </button>
      )}
    </motion.div>
  );
}
