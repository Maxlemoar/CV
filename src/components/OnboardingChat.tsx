"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { UserPreferences, VisualStyle, InfoDepth, ContentFocus } from "@/lib/types";

interface OnboardingChatProps {
  onComplete: (prefs: UserPreferences) => void;
  onSkip: () => void;
}

interface ChatMessage {
  type: "bot" | "user" | "typing";
  text: string;
}

type OnboardingStep = "visual-style" | "dark-mode" | "info-depth" | "content-focus" | "gamification" | "done";

function StylePreview({ type }: { type: "focused" | "colorful" }) {
  if (type === "focused") {
    return (
      <div className="mt-2 w-full overflow-hidden rounded-lg" style={{ height: 48, background: "#F7F3EE", border: "1px solid #E8E0D4" }}>
        <div style={{ padding: "8px 12px" }}>
          <div style={{ height: 3, width: "60%", background: "#2C2416", borderRadius: 2, marginBottom: 4 }} />
          <div style={{ height: 2, width: "80%", background: "#A89F91", borderRadius: 1, marginBottom: 3 }} />
          <div style={{ height: 2, width: "65%", background: "#A89F91", borderRadius: 1 }} />
        </div>
      </div>
    );
  }
  return (
    <div className="mt-2 w-full overflow-hidden rounded-lg" style={{ height: 48, background: "#FFFBE6", border: "2.5px solid #1a1a1a" }}>
      <div style={{ padding: "6px 10px" }}>
        <div style={{ height: 4, width: "50%", background: "#FF3366", borderRadius: 2, marginBottom: 4 }} />
        <div style={{ display: "flex", gap: 4 }}>
          <div style={{ height: 10, flex: 1, background: "#EBFF00", border: "1.5px solid #1a1a1a", borderRadius: 3 }} />
          <div style={{ height: 10, flex: 1, background: "#7B61FF", border: "1.5px solid #1a1a1a", borderRadius: 3 }} />
        </div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="inline-flex items-center gap-1 rounded-2xl bg-white px-4 py-3 shadow-sm">
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
    </div>
  );
}

const STEP_CONFIG = {
  "visual-style": {
    question: "Before we start — how do you prefer to take in information?",
    options: [
      { label: "Focused & clean", value: "focused" as VisualStyle, description: "Minimal, paper-like, typography-driven", preview: "focused" as const },
      { label: "Bold & colorful", value: "colorful" as VisualStyle, description: "Expressive, energetic, neo-brutalist", preview: "colorful" as const },
    ],
  },
  "dark-mode": {
    question: "Light or darkness?",
    options: [
      { label: "Light", value: "light", description: "Warm paper tones, easy on the eyes" },
      { label: "Darkness", value: "dark", description: "Dark background, softer glow" },
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

const STEPS: OnboardingStep[] = ["visual-style", "dark-mode", "info-depth", "content-focus", "gamification"];

export default function OnboardingChat({ onComplete, onSkip }: OnboardingChatProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([{ type: "typing", text: "" }]);
  const [selections, setSelections] = useState<Partial<UserPreferences>>({});
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMessages([{ type: "bot", text: STEP_CONFIG["visual-style"].question }]);
      setIsTransitioning(false);
      setTimeout(() => setShowOptions(true), 200);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const step = STEPS[currentStep] as Exclude<OnboardingStep, "done"> | undefined;
  const config = step && step in STEP_CONFIG ? STEP_CONFIG[step as keyof typeof STEP_CONFIG] : null;

  function handleSelect(value: string, label: string) {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setShowOptions(false);

    setMessages((prev) => [...prev, { type: "user", text: label }]);

    const key = step === "visual-style" ? "visualStyle"
      : step === "dark-mode" ? "darkMode"
      : step === "info-depth" ? "infoDepth"
      : step === "gamification" ? "gamified"
      : "contentFocus";
    const resolvedValue = step === "gamification" ? value === "yes"
      : step === "dark-mode" ? value === "dark"
      : value;
    const newSelections = { ...selections, [key]: resolvedValue };
    setSelections(newSelections);

    setTimeout(() => {
      const nextStep = currentStep + 1;

      if (nextStep >= STEPS.length) {
        setMessages((prev) => [...prev, { type: "typing", text: "" }]);
        setTimeout(() => {
          setMessages((prev) => [
            ...prev.filter((m) => m.type !== "typing"),
            { type: "bot", text: "Perfect — I'll tailor everything for you." },
          ]);
          setTimeout(() => onComplete(newSelections as UserPreferences), 800);
        }, 600);
      } else {
        setMessages((prev) => [...prev, { type: "typing", text: "" }]);
        setTimeout(() => {
          const nextConfig = STEP_CONFIG[STEPS[nextStep] as keyof typeof STEP_CONFIG];
          setMessages((prev) => [
            ...prev.filter((m) => m.type !== "typing"),
            { type: "bot", text: nextConfig.question },
          ]);
          setCurrentStep(nextStep);
          setIsTransitioning(false);
          setTimeout(() => setShowOptions(true), 200);
        }, 600);
      }
    }, 300);
  }

  const isContentFocusStep = step === "content-focus";

  return (
    <div className="pb-8 pt-20">
      <div className="mx-auto max-w-lg">
        <div className="space-y-3">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={`${i}-${msg.type}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className={msg.type === "user" ? "text-right" : "text-left"}
              >
                {msg.type === "typing" ? (
                  <TypingIndicator />
                ) : (
                  <div
                    className={`inline-block rounded-2xl px-4 py-3 text-sm ${
                      msg.type === "bot"
                        ? "bg-white text-ink shadow-sm"
                        : "bg-accent text-white"
                    }`}
                  >
                    {msg.text}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {showOptions && config && (
            <motion.div
              key={step}
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
              }}
              className={`mt-4 ${isContentFocusStep ? "grid grid-cols-2 gap-2" : "flex gap-2"}`}
            >
              {config.options.map((opt) => (
                <motion.button
                  key={opt.value}
                  variants={{
                    hidden: { opacity: 0, y: 8 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  onClick={() => handleSelect(opt.value, opt.label)}
                  className={`rounded-xl border border-accent/40 bg-paper px-4 py-2.5 text-left text-sm shadow-sm transition-all hover:border-accent hover:shadow-md active:shadow-inset ${
                    isContentFocusStep ? "" : "flex-1"
                  }`}
                >
                  <span className="font-semibold text-accent">{opt.label}</span>
                  <span className="ml-1.5 text-ink-light">— {opt.description}</span>
                  {"preview" in opt && (opt as { preview?: "focused" | "colorful" }).preview && <StylePreview type={(opt as { preview: "focused" | "colorful" }).preview} />}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {currentStep === 0 && !isTransitioning && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            onClick={onSkip}
            className="mt-6 block text-xs text-ink hover:text-accent"
          >
            Skip personalization →
          </motion.button>
        )}
      </div>
    </div>
  );
}
