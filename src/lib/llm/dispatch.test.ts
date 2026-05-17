import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { generateJson } from "./dispatch";

const realFetch = global.fetch;

function chatJsonResponse(content: string) {
  // Looks like an OpenAI chat completion response
  return Promise.resolve(
    new Response(JSON.stringify({ choices: [{ message: { content } }] }), { status: 200 })
  );
}

function ollamaResponse(content: string) {
  return Promise.resolve(new Response(JSON.stringify({ response: content, done: true }), { status: 200 }));
}

describe("dispatcher routing", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });
  afterEach(() => {
    global.fetch = realFetch;
    vi.unstubAllEnvs();
  });

  it("routes to OpenAI when OPENAI_API_KEY is set", async () => {
    vi.stubEnv("OPENAI_API_KEY", "sk-test");
    const fetchSpy = vi.fn((url: string) => {
      expect(url).toContain("api.openai.com");
      return chatJsonResponse('{"ok":true}');
    });
    global.fetch = fetchSpy as never;

    const out = await generateJson("hi");
    expect(out.backend).toBe("openai");
    expect(out.data).toEqual({ ok: true });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("routes to Ollama when no OpenAI key", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    const fetchSpy = vi.fn((url: string) => {
      expect(url).toContain("11434");
      return ollamaResponse('{"ok":"ollama"}');
    });
    global.fetch = fetchSpy as never;

    const out = await generateJson("hi");
    expect(out.backend).toBe("ollama");
    expect(out.data).toEqual({ ok: "ollama" });
  });
});
