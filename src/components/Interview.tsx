"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { INTERVIEW_QUESTIONS, type ExperimentProfile } from "@/lib/experiment-types";

interface InterviewProps {
  experimentNumber: number;
  onComplete: (profile: ExperimentProfile) => void;
}

interface ChatMessage {
  type: "question" | "answer" | "typing";
  text: string;
}

export default function Interview({ experimentNumber, onComplete }: InterviewProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showOptions, setShowOptions] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Show first question on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setMessages([{ type: "question", text: INTERVIEW_QUESTIONS[0].text }]);
      setTimeout(() => setShowOptions(true), 400);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // Auto-scroll to bottom on new messages and when options appear
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      // Small delay to let the DOM update with new content
      const timer = setTimeout(() => {
        el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [messages, showOptions]);

  const handleSelect = (value: string, label: string) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setShowOptions(false);

    const question = INTERVIEW_QUESTIONS[currentStep];
    const newAnswers = { ...answers, [question.dimension]: value };
    setAnswers(newAnswers);

    // Add user's answer to chat
    setMessages((prev) => [...prev, { type: "answer", text: label }]);

    const nextStep = currentStep + 1;

    if (nextStep >= INTERVIEW_QUESTIONS.length) {
      // All questions answered — build profile
      setTimeout(() => {
        const profile: ExperimentProfile = {
          experimentNumber,
          persuasion: newAnswers.persuasion as ExperimentProfile["persuasion"],
          motivation: newAnswers.motivation as ExperimentProfile["motivation"],
          contentInterest: newAnswers.contentInterest as ExperimentProfile["contentInterest"],
        };
        onComplete(profile);
      }, 800);
    } else {
      // Show next question
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { type: "question", text: INTERVIEW_QUESTIONS[nextStep].text },
        ]);
        setCurrentStep(nextStep);
        setTimeout(() => {
          setShowOptions(true);
          setIsTransitioning(false);
        }, 400);
      }, 600);
    }
  };

  const currentQuestion = INTERVIEW_QUESTIONS[currentStep];

  return (
    <div className="h-dvh flex flex-col">
      {/* Header */}
      <div className="text-center pt-8 pb-4">
        <p className="text-xs tracking-[3px] text-neutral-400 uppercase">
          Experiment #{experimentNumber}
        </p>
      </div>

      {/* Chat area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-8 max-w-2xl mx-auto w-full">
        <AnimatePresence mode="popLayout">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`mb-4 ${msg.type === "answer" ? "text-right" : ""}`}
            >
              {msg.type === "question" && (
                <div className="bg-neutral-100 dark:bg-neutral-800 rounded-2xl rounded-tl-sm px-5 py-4 inline-block max-w-[85%] text-left">
                  <p className="text-sm text-neutral-500 mb-1">Max</p>
                  <p className="text-base text-neutral-800 dark:text-neutral-200 leading-relaxed">
                    {msg.text}
                  </p>
                </div>
              )}
              {msg.type === "answer" && (
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-2xl rounded-tr-sm px-5 py-3 inline-block max-w-[85%]">
                  <p className="text-base text-neutral-800 dark:text-neutral-200">
                    {msg.text}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Options */}
        <AnimatePresence>
          {showOptions && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-2.5 mt-2 mb-8"
            >
              {currentQuestion.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value, option.label)}
                  className="text-left px-5 py-3.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl hover:border-orange-400 hover:bg-orange-50/50 dark:hover:bg-orange-900/10 transition-all text-base text-neutral-700 dark:text-neutral-300"
                >
                  {option.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
