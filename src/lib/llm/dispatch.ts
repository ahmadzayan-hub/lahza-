/**
 * Dispatcher that routes LLM calls to the best available backend.
 *
 *   1. OpenAI  if OPENAI_API_KEY is set                       (highest quality)
 *   2. Ollama  otherwise (if reachable on OLLAMA_BASE_URL)    (free, local)
 *   3. throw   so the API route can fall back to local engine (always works)
 *
 * Keep this server-only — both backends use server-only credentials.
 */

import * as openai from "./openai";
import * as ollama from "./ollama";
import { checkBudget, recordCall } from "./budget";

export interface DispatchOptions {
  system?: string;
  temperature?: number;
  /** Hint: "fast" maps to a cheaper model; "reasoning" maps to a smarter one. */
  tier?: "fast" | "reasoning" | "rewrite";
  signal?: AbortSignal;
}

export interface DispatchResult<T = unknown> {
  data: T | { raw: string };
  backend: "openai" | "ollama";
}

export async function generateJson<T = unknown>(
  prompt: string,
  opts: DispatchOptions = {}
): Promise<DispatchResult<T>> {
  // Budget guard applies to BOTH backends (Ollama too — protects local machine).
  const b = checkBudget();
  if (!b.ok) {
    throw new Error(`llm_budget_exceeded: ${b.limit}/day; resets at ${new Date(b.resetAt).toISOString()}`);
  }

  if (openai.isOpenAiConfigured()) {
    const data = await openai.generateJson<T>(prompt, {
      system: opts.system,
      temperature: opts.temperature,
      model: pickOpenAiModel(opts.tier),
      signal: opts.signal
    });
    recordCall();
    return { data, backend: "openai" };
  }

  const data = await ollama.generateJson<T>(prompt, {
    system: opts.system,
    temperature: opts.temperature,
    model: pickOllamaModel(opts.tier),
    signal: opts.signal
  });
  recordCall();
  return { data, backend: "ollama" };
}

function pickOpenAiModel(tier?: DispatchOptions["tier"]): string | undefined {
  // Sensible defaults that map our internal tiers to OpenAI models.
  // Override per-tier with OPENAI_MODEL_FAST / _REASONING / _REWRITE.
  const fast = process.env.OPENAI_MODEL_FAST ?? "gpt-4o-mini";
  const reasoning = process.env.OPENAI_MODEL_REASONING ?? "gpt-4o-mini";
  const rewrite = process.env.OPENAI_MODEL_REWRITE ?? "gpt-4o-mini";
  switch (tier) {
    case "reasoning": return reasoning;
    case "rewrite":   return rewrite;
    case "fast":
    default:          return fast;
  }
}

function pickOllamaModel(tier?: DispatchOptions["tier"]): string | undefined {
  const fast = process.env.OLLAMA_MODEL_FAST ?? "mistral";
  const reasoning = process.env.OLLAMA_MODEL_REASONING ?? "llama3";
  const rewrite = process.env.OLLAMA_MODEL_REWRITE ?? "phi3";
  switch (tier) {
    case "reasoning": return reasoning;
    case "rewrite":   return rewrite;
    case "fast":
    default:          return fast;
  }
}
