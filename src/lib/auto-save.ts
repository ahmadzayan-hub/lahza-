/**
 * Persists the in-progress raw prompt to localStorage so users don't
 * lose their work on accidental refresh or crash.
 */

const KEY = "prismly_draft_v1";

export interface Draft {
  raw: string;
  model: string;
  method: string;
  saved_at: string;
}

export function readDraft(): Draft | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Draft) : null;
  } catch {
    return null;
  }
}

export function writeDraft(d: Omit<Draft, "saved_at">): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...d, saved_at: new Date().toISOString() }));
  } catch {
    /* quota */
  }
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
