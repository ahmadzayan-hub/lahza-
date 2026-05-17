/**
 * Lightweight token estimator. Approximates OpenAI's tokeniser with a
 * 4-chars-per-token heuristic for Latin text and ~2 chars-per-token for
 * Arabic (which uses more bytes per character). Good enough for a UI
 * counter; not byte-accurate.
 */

export function estimateTokens(text: string): number {
  if (!text) return 0;
  const arabic = (text.match(/[؀-ۿ]/g) ?? []).length;
  const other = text.length - arabic;
  return Math.ceil(arabic / 2 + other / 4);
}

/** Approx cost in USD for a given token count using gpt-4o-mini pricing. */
export function estimateCostUsd(promptTokens: number, model = "gpt-4o-mini"): number {
  // gpt-4o-mini: $0.15 / 1M input, $0.60 / 1M output (as of late 2025).
  // Assume completion ~= prompt length for a rough estimate.
  const inputRate = model === "gpt-4o-mini" ? 0.15 / 1_000_000 : 5 / 1_000_000;
  const outputRate = model === "gpt-4o-mini" ? 0.60 / 1_000_000 : 15 / 1_000_000;
  return promptTokens * inputRate + promptTokens * outputRate;
}
