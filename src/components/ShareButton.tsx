"use client";

import { useState } from "react";
import type { ContentBlockData } from "@/lib/types";

interface ShareButtonProps {
  blocks: ContentBlockData[];
}

export default function ShareButton({ blocks }: ShareButtonProps) {
  const [showToast, setShowToast] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleShare() {
    if (saving || blocks.length === 0) return;
    setSaving(true);

    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocks }),
      });

      if (!res.ok) throw new Error("Failed to save session");

      const { id } = await res.json();
      const url = `${window.location.origin}/s/${id}`;
      await navigator.clipboard.writeText(url);

      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch (err) {
      console.error("Share error:", err);
    } finally {
      setSaving(false);
    }
  }

  if (blocks.length === 0) return null;

  return (
    <>
      <button
        onClick={handleShare}
        disabled={saving}
        className="rounded-lg px-3 py-1.5 text-xs text-ink-light transition-colors hover:text-accent disabled:opacity-50 no-print"
      >
        {saving ? "..." : "Share"}
      </button>
      {showToast && (
        <div className="animate-toast fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-xl bg-ink px-4 py-2 text-sm text-paper shadow-lg">
          Link copied
        </div>
      )}
    </>
  );
}
