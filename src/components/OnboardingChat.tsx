"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { UserPreferences, VisualStyle, InfoDepth, ContentFocus } from "@/lib/types";

interface OnboardingChatProps {
  onComplete: (prefs: UserPreferences) => void;
  onSkip: () => void;
}

interface ChatMessage {
  type: "bot" | "user";
  text: string;
}

type OnboardingStep = "visual-style" | "info-depth" | "content-focus" | "gamification" | "done";

const STEP_CONFIG = {
  "visual-style": {
    question: "Before we start — how do you prefer to take in information?",
    options: [
      { label: "Focused & clean", value: "focused" as VisualStyle, description: "Minimal, paper-like, typography-driven" },
      { label: "Bold & colorful", value: "colorful" as VisualStyle, description: "Expressive, energetic, neo-brutalist" },
    ],
  },
  "info-depth": {
    question: "Do you prefer a quick overview or a deeper dive?",
    options: [
      { label: "Quick overview", value: "overview" as InfoDepth, description: "Concise, scannable, information-dense" },
      { label: "Deep dive", value: "deep-dive" as InfoDepth, description: "Storytelling, context, full picture" },
    ],
  },
  "content-focus": {
    question: "What are you most curious about?",
    options: [
      { label: "Product Builder", value: "product-builder" as ContentFocus, description: "Startup, shipping, PM craft" },
      { label: "Learning Scientist", value: "learning-scientist" as ContentFocus, description: "Education theory, research" },
      { label: "AI & Vision", value: "ai-vision" as ContentFocus, description: "Claude, AI in education, future" },
      { label: "Max as a person", value: "max-personal" as ContentFocus, description: "Motivation, values, personality" },
    ],
  },
  "gamification": {
    question: "Would you like to gamify your experience?",
    options: [
      { label: "Yes, track my progress", value: "yes", description: "Discovery tracking, milestones & hidden content" },
      { label: "No thanks", value: "no", description: "Classic experience without gamification" },
    ],
  },
};

const STEPS: OnboardingStep[] = ["visual-style", "info-depth", "content-focus", "gamification"];

export default function OnboardingChat({ onComplete, onSkip }: OnboardingChatProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { type: "bot", text: "Hi! I'm here to help you get to know Max. Let me tailor this experience to you." },
    { type: "bot", text: STEP_CONFIG["visual-style"].question },
  ]);
  const [selections, setSelections] = useState<Partial<UserPreferences>>({});
  const [isTransitioning, setIsTransitioning] = useState(false);

  const step = STEPS[currentStep] as Exclude<OnboardingStep, "done"> | undefined;
  const config = step && step in STEP_CONFIG ? STEP_CONFIG[step as keyof typeof STEP_CONFIG] : null;

  const showQuestion = !isTransitioning && config;

  function handleSelect(value: string, label: string) {
    if (isTransitioning) return;
    setIsTransitioning(true);

    setMessages((prev) => [...prev, { type: "user", text: label }]);

    const key = step === "visual-style" ? "visualStyle"
      : step === "info-depth" ? "infoDepth"
      : step === "gamification" ? "gamified"
      : "contentFocus";
    const resolvedValue = step === "gamification" ? value === "yes" : value;
    const newSelections = { ...selections, [key]: resolvedValue };
    setSelections(newSelections);

    setTimeout(() => {
      const nextStep = currentStep + 1;

      if (nextStep >= STEPS.length) {
        setMessages((prev) => [
          ...prev,
          { type: "bot", text: "Perfect — I'll tailor everything for you." },
        ]);
        setTimeout(() => {
          onComplete(newSelections as UserPreferences);
        }, 800);
      } else {
        const nextConfig = STEP_CONFIG[STEPS[nextStep] as keyof typeof STEP_CONFIG];
        setMessages((prev) => [
          ...prev,
          { type: "bot", text: nextConfig.question },
        ]);
        setCurrentStep(nextStep);
        setIsTransitioning(false);
      }
    }, 400);
  }

  return (
    <div className="pb-8 pt-20">
      <div className="mx-auto max-w-lg">
        <div className="space-y-3">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={msg.type === "bot" ? "text-left" : "text-right"}
              >
                <div
                  className={`inline-block rounded-2xl px-4 py-3 text-sm ${
                    msg.type === "bot"
                      ? "bg-white text-ink shadow-neu-sm"
                      : "bg-accent text-white"
                  }`}
                >
                  {msg.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {showQuestion && (
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="mt-4 flex flex-wrap gap-2"
          >
            {config.options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleSelect(opt.value, opt.label)}
                className="rounded-xl border border-accent/20 bg-paper px-4 py-2.5 text-left text-sm transition-shadow hover:shadow-neu-sm"
              >
                <span className="font-medium text-accent">{opt.label}</span>
                <span className="ml-1.5 text-ink-light">— {opt.description}</span>
              </button>
            ))}
          </motion.div>
        )}

        {currentStep === 0 && !isTransitioning && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            onClick={onSkip}
            className="mt-6 block text-xs text-ink-light/50 hover:text-ink-light"
          >
            Skip personalization →
          </motion.button>
        )}
      </div>
    </div>
  );
}
