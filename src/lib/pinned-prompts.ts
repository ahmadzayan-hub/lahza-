/**
 * User's personal library of pinned prompts, stored in localStorage.
 * Independent of the rolling session history.
 */

import type { PromptMethodId } from "@/lib/prompt-methods";
import type { TargetModel } from "@/lib/types";

const KEY = "prismly_pinned_v1";
const MAX = 200;

export interface PinnedPrompt {
  id: string;
  title: string;
  text: string;
  method: PromptMethodId;
  target_model: TargetModel;
  tags: string[];
  created_at: string;
}

export function readPinned(): PinnedPrompt[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function pinPrompt(entry: Omit<PinnedPrompt, "id" | "created_at">): PinnedPrompt {
  const p: PinnedPrompt = {
    ...entry,
    id: `pin_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    created_at: new Date().toISOString()
  };
  const all = [p, ...readPinned()].slice(0, MAX);
  try { localStorage.setItem(KEY, JSON.stringify(all)); } catch { /* quota */ }
  return p;
}

export function unpinPrompt(id: string) {
  const all = readPinned().filter((p) => p.id !== id);
  try { localStorage.setItem(KEY, JSON.stringify(all)); } catch { /* quota */ }
}

export function isPinnedByText(text: string): boolean {
  return readPinned().some((p) => p.text === text);
}
