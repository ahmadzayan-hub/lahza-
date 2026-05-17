import { generateJson } from "@/lib/llm/dispatch";
import { INTENT_DETECTION } from "@/lib/llm/prompts";

export interface IntentResult {
  intent: string;
  confidence: number;
  reason?: string;
}

/**
 * Prompt Orchestration Service.
 * Top-level entry: takes a raw prompt, returns detected intent.
 * Routes via the LLM dispatcher (OpenAI -> Ollama -> throw).
 */
export async function detectIntent(rawPrompt: string): Promise<IntentResult> {
  const { data } = await generateJson<IntentResult>(
    `RAW PROMPT:\n"""\n${rawPrompt}\n"""\n\nClassify it.`,
    { system: INTENT_DETECTION, tier: "fast", temperature: 0.0 }
  );
  if ("intent" in data && typeof data.intent === "string") {
    return {
      intent: data.intent,
      confidence: typeof data.confidence === "number" ? data.confidence : 0.5,
      reason: data.reason
    };
  }
  return { intent: "other", confidence: 0.3 };
}
