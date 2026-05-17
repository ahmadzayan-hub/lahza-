import { describe, it, expect, beforeEach, vi } from "vitest";
import { saveLocalSession, readLocalHistory, clearLocalHistory, statsFromHistory } from "./local-history";

class MockStorage {
  store = new Map<string, string>();
  getItem(k: string) { return this.store.get(k) ?? null; }
  setItem(k: string, v: string) { this.store.set(k, v); }
  removeItem(k: string) { this.store.delete(k); }
}

describe("local-history", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", new MockStorage());
  });

  it("starts empty", () => {
    expect(readLocalHistory()).toEqual([]);
  });

  it("saves and reads back a session", () => {
    saveLocalSession({
      raw_prompt: "x",
      final_prompt: "y",
      intent: "writing",
      method: "craft",
      target_model: "chatgpt",
      score: 80
    });
    const all = readLocalHistory();
    expect(all).toHaveLength(1);
    expect(all[0].score).toBe(80);
    expect(all[0].id).toMatch(/^local_/);
    expect(all[0].created_at).toBeTruthy();
  });

  it("keeps newest first and caps at 50", () => {
    for (let i = 0; i < 60; i++) {
      saveLocalSession({
        raw_prompt: `r${i}`,
        final_prompt: "y",
        intent: "writing",
        method: "task",
        target_model: "generic",
        score: 50
      });
    }
    const all = readLocalHistory();
    expect(all).toHaveLength(50);
    expect(all[0].raw_prompt).toBe("r59");
  });

  it("clears history", () => {
    saveLocalSession({
      raw_prompt: "x",
      final_prompt: "y",
      intent: "writing",
      method: "task",
      target_model: "generic",
      score: 10
    });
    clearLocalHistory();
    expect(readLocalHistory()).toEqual([]);
  });

  it("aggregates dashboard stats", () => {
    saveLocalSession({ raw_prompt: "a", final_prompt: "f", intent: "writing", method: "craft", target_model: "chatgpt", score: 80 });
    saveLocalSession({ raw_prompt: "b", final_prompt: "f", intent: "coding", method: "craft", target_model: "chatgpt", score: 60 });
    const s = statsFromHistory(readLocalHistory());
    expect(s.total).toBe(2);
    expect(s.avgScore).toBe(70);
    expect(s.topMethods[0].count).toBe(2);
  });
});
