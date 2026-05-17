import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { generateJson, isOpenAiConfigured, OpenAiUnreachableError, OpenAiNotConfiguredError } from "./openai";

const realFetch = global.fetch;

function chatJsonResponse(content: string) {
  return Promise.resolve(
    new Response(JSON.stringify({ choices: [{ message: { content } }] }), { status: 200 })
  );
}

describe("isOpenAiConfigured", () => {
  beforeEach(() => vi.unstubAllEnvs());
  afterEach(() => vi.unstubAllEnvs());

  it("returns false when no key", () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    expect(isOpenAiConfigured()).toBe(false);
  });

  it("returns true when key set", () => {
    vi.stubEnv("OPENAI_API_KEY", "sk-test");
    expect(isOpenAiConfigured()).toBe(true);
  });
});

describe("generateJson via OpenAI", () => {
  beforeEach(() => {
    vi.stubEnv("OPENAI_API_KEY", "sk-test");
  });
  afterEach(() => {
    global.fetch = realFetch;
    vi.unstubAllEnvs();
  });

  it("throws OpenAiNotConfigured when key missing", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    await expect(generateJson("hello")).rejects.toBeInstanceOf(OpenAiNotConfiguredError);
  });

  it("parses clean JSON output", async () => {
    global.fetch = vi.fn(() => chatJsonResponse('{"intent":"writing","confidence":0.9}')) as never;
    const out = await generateJson<{ intent: string; confidence: number }>("x");
    expect(out).toMatchObject({ intent: "writing", confidence: 0.9 });
  });

  it("recovers JSON from noisy output", async () => {
    global.fetch = vi.fn(() => chatJsonResponse('here is the json: {"ok":true} and trailing text')) as never;
    const out = await generateJson<{ ok: boolean }>("x");
    expect(out).toEqual({ ok: true });
  });

  it("returns {raw} when output isn't JSON at all", async () => {
    global.fetch = vi.fn(() => chatJsonResponse("not json")) as never;
    const out = await generateJson("x");
    expect(out).toEqual({ raw: "not json" });
  });

  it("throws OpenAiUnreachable on HTTP error", async () => {
    global.fetch = vi.fn(() => Promise.resolve(new Response("rate limited", { status: 429 }))) as never;
    await expect(generateJson("x")).rejects.toBeInstanceOf(OpenAiUnreachableError);
  });

  it("never includes the API key in error messages", async () => {
    vi.stubEnv("OPENAI_API_KEY", "sk-super-secret-test");
    global.fetch = vi.fn(() => Promise.resolve(new Response("oops", { status: 500 }))) as never;
    try {
      await generateJson("x");
    } catch (e) {
      expect(String(e)).not.toContain("sk-super-secret-test");
    }
  });
});
