/**
 * Save and read prompt sessions in localStorage so unauthenticated users
 * still have a history. Capped at 50 entries (LRU by created_at).
 */
import type { PromptMethodId } from "@/lib/prompt-methods";
import type { TargetModel } from "@/lib/types";

const KEY = "prismly_local_history_v1";
const MAX = 50;

export interface LocalSession {
  id: string;
  raw_prompt: string;
  final_prompt: string;
  intent: string;
  method: PromptMethodId;
  target_model: TargetModel;
  score: number;
  created_at: string;
}

export function readLocalHistory(): LocalSession[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLocalSession(entry: Omit<LocalSession, "id" | "created_at">): LocalSession {
  const session: LocalSession = {
    ...entry,
    id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    created_at: new Date().toISOString()
  };
  const all = [session, ...readLocalHistory()].slice(0, MAX);
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* quota — silently drop */
  }
  return session;
}

export function clearLocalHistory() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

/** Aggregate stats for the dashboard. */
export interface LocalStats {
  total: number;
  avgScore: number;
  topMethods: Array<{ method: PromptMethodId; count: number }>;
  topModels: Array<{ model: TargetModel; count: number }>;
  topIntents: Array<{ intent: string; count: number }>;
  last7Days: number;
}

export function statsFromHistory(rows: LocalSession[]): LocalStats {
  if (rows.length === 0) {
    return { total: 0, avgScore: 0, topMethods: [], topModels: [], topIntents: [], last7Days: 0 };
  }
  const sumScore = rows.reduce((a, r) => a + (r.score ?? 0), 0);
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const last7 = rows.filter((r) => new Date(r.created_at).getTime() >= cutoff).length;

  return {
    total: rows.length,
    avgScore: Math.round(sumScore / rows.length),
    topMethods: tally(rows.map((r) => r.method)) as Array<{ method: PromptMethodId; count: number }>,
    topModels: tally(rows.map((r) => r.target_model)) as Array<{ model: TargetModel; count: number }>,
    topIntents: tally(rows.map((r) => r.intent)) as Array<{ intent: string; count: number }>,
    last7Days: last7
  };
}

function tally<T extends string>(xs: T[]): Array<{ method?: T; model?: T; intent?: T; count: number }> {
  const counts = new Map<T, number>();
  xs.forEach((x) => counts.set(x, (counts.get(x) ?? 0) + 1));
  return Array.from(counts.entries())
    .map(([k, count]) => ({ method: k, model: k, intent: k, count } as never))
    .sort((a, b) => (b as { count: number }).count - (a as { count: number }).count)
    .slice(0, 4);
}
