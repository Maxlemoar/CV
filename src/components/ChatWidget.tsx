"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { motion, AnimatePresence } from "framer-motion";

const transport = new DefaultChatTransport({ api: "/api/chat" });

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat({ transport });

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="no-print fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-4 flex h-[28rem] w-80 flex-col rounded-2xl bg-paper shadow-neu sm:w-96"
          >
            {/* Header */}
            <div className="flex items-center justify-between rounded-t-2xl bg-paper-dark px-4 py-3">
              <div>
                <h3 className="font-serif text-sm font-medium text-ink">
                  Ask Max
                </h3>
                <p className="text-xs text-ink-light">Powered by Claude</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-ink-light hover:text-ink transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.length === 0 && (
                <div className="text-center text-sm text-ink-light mt-8">
                  <p className="font-medium text-ink">
                    Hi! I&apos;m Max.
                  </p>
                  <p className="mt-1">
                    Ask me anything about my experience, projects, or what
                    drives me.
                  </p>
                </div>
              )}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "ml-8 rounded-xl bg-accent/10 px-3 py-2 text-ink"
                      : "mr-8 rounded-xl bg-paper-dark px-3 py-2 text-ink-light"
                  }`}
                >
                  {msg.parts.map((part, index) =>
                    part.type === "text" ? (
                      <span key={index}>{part.text}</span>
                    ) : null
                  )}
                </div>
              ))}
              {isLoading &&
                messages.length > 0 &&
                messages[messages.length - 1].role === "user" && (
                  <div className="mr-8 rounded-xl bg-paper-dark px-3 py-2 text-sm text-ink-light">
                    <span className="animate-pulse">Thinking...</span>
                  </div>
                )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (input.trim()) {
                  sendMessage({ text: input });
                  setInput("");
                }
              }}
              className="border-t border-paper-dark p-3"
            >
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="flex-1 rounded-lg bg-paper-dark px-3 py-2 text-sm text-ink placeholder:text-ink-light/50 focus:outline-none focus:ring-1 focus:ring-accent"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-40"
                >
                  Send
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-neu transition-colors hover:bg-accent-hover"
      >
        {isOpen ? "✕" : "💬"}
      </motion.button>
    </div>
  );
}
