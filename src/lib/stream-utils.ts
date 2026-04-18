// NDJSON stream consumer for streaming AI responses
// Protocol:
//   {"type":"title","title":"..."}
//   {"type":"delta","text":"incremental chunk"}
//   {"type":"done", ...fullResponse }

export interface StreamCallbacks {
  onTitle?: (title: string) => void;
  onDelta?: (fullText: string) => void;
}

/**
 * Consumes an NDJSON stream from /api/generate or /api/chat.
 * Returns the final `done` payload (complete response).
 * Calls onTitle/onDelta for progressive UI updates.
 */
export async function consumeNDJSONStream<T extends Record<string, unknown>>(
  response: Response,
  callbacks?: StreamCallbacks,
): Promise<T> {
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let result: T | null = null;
  let fullText = "";

  // Throttle onDelta calls to ~60fps using rAF
  let pendingText: string | null = null;
  let rafId: number | null = null;

  function flushDelta() {
    if (pendingText !== null && callbacks?.onDelta) {
      callbacks.onDelta(pendingText);
      pendingText = null;
    }
    rafId = null;
  }

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const msg = JSON.parse(line);
          if (msg.type === "title") {
            callbacks?.onTitle?.(msg.title);
          } else if (msg.type === "delta") {
            fullText += msg.text;
            pendingText = fullText;
            if (!rafId) {
              rafId = requestAnimationFrame(flushDelta);
            }
          } else if (msg.type === "done") {
            result = msg as T;
          }
        } catch {
          // Skip malformed lines
        }
      }
    }
  } finally {
    // Flush any pending delta
    if (rafId) cancelAnimationFrame(rafId);
    if (pendingText !== null) {
      callbacks?.onDelta?.(pendingText);
    }
  }

  if (!result) {
    throw new Error("Stream ended without done message");
  }

  return result;
}
