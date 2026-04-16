// src/lib/content-cache.ts
import type { GeneratedContent } from "./visitor-profile";

/**
 * Simple in-memory cache for pre-generated content.
 * Key: nodeId, Value: generated content.
 * Cache is per-session (lives in React state), not persisted.
 */
export interface ContentCache {
  get(nodeId: string): GeneratedContent | undefined;
  set(nodeId: string, content: GeneratedContent): void;
  has(nodeId: string): boolean;
  clear(): void;
  entries(): Array<[string, GeneratedContent]>;
}

export function createContentCache(): ContentCache {
  const store = new Map<string, GeneratedContent>();

  return {
    get: (nodeId) => store.get(nodeId),
    set: (nodeId, content) => store.set(nodeId, content),
    has: (nodeId) => store.has(nodeId),
    clear: () => store.clear(),
    entries: () => Array.from(store.entries()),
  };
}
