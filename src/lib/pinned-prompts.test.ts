import { describe, it, expect, beforeEach, vi } from "vitest";
import { pinPrompt, readPinned, unpinPrompt, isPinnedByText } from "./pinned-prompts";

class MockStorage {
  store = new Map<string, string>();
  getItem(k: string) { return this.store.get(k) ?? null; }
  setItem(k: string, v: string) { this.store.set(k, v); }
  removeItem(k: string) { this.store.delete(k); }
}

describe("pinned-prompts", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", new MockStorage());
  });

  it("starts empty", () => {
    expect(readPinned()).toEqual([]);
  });

  it("pins and reads back a prompt", () => {
    pinPrompt({ title: "T", text: "final prompt body", method: "craft", target_model: "chatgpt", tags: [] });
    const all = readPinned();
    expect(all).toHaveLength(1);
    expect(all[0].title).toBe("T");
    expect(all[0].id).toMatch(/^pin_/);
  });

  it("isPinnedByText detects an existing pin", () => {
    pinPrompt({ title: "T", text: "body-xyz", method: "task", target_model: "generic", tags: [] });
    expect(isPinnedByText("body-xyz")).toBe(true);
    expect(isPinnedByText("body-other")).toBe(false);
  });

  it("unpins by id", () => {
    const p = pinPrompt({ title: "T", text: "x", method: "task", target_model: "generic", tags: [] });
    unpinPrompt(p.id);
    expect(readPinned()).toEqual([]);
  });
});
