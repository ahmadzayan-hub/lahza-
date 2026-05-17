/**
 * OpenAI client — SERVER-ONLY. The API key MUST NOT reach the browser.
 *
 * Notes:
 * - Reads OPENAI_API_KEY from process.env. The variable is intentionally
 *   NOT prefixed with NEXT_PUBLIC_, so Next.js will keep it out of the
 *   client bundle.
 * - Uses fetch() against the public REST API. No SDK dependency.
 * - Wraps responses in the same shape as the Ollama client so callers
 *   are interchangeable.
 */

export class OpenAiUnreachableError extends Error {
  readonly code = "openai_unreachable";
  constructor(public detail: string) {
    super(`OpenAI request failed: ${detail}`);
  }
}

export class OpenAiNotConfiguredError extends Error {
  readonly code = "openai_not_configured";
  constructor() {
    super("OPENAI_API_KEY is not set");
  }
}

export interface OpenAiOptions {
  model?: string;
  system?: string;
  temperature?: number;
  format?: "json";
  signal?: AbortSignal;
}

const ENDPOINT = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

function getKey(): string {
  const k = process.env.OPENAI_API_KEY;
  if (!k) throw new OpenAiNotConfiguredError();
  return k;
}

export function isOpenAiConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

export async function generate(prompt: string, opts: OpenAiOptions = {}): Promise<string> {
  const key = getKey();
  const messages: Array<{ role: "system" | "user"; content: string }> = [];
  if (opts.system) messages.push({ role: "system", content: opts.system });
  messages.push({ role: "user", content: prompt });

  const body: Record<string, unknown> = {
    model: opts.model ?? DEFAULT_MODEL,
    messages,
    temperature: opts.temperature ?? 0.2
  };
  if (opts.format === "json") {
    body.response_format = { type: "json_object" };
  }

  let res: Response;
  try {
    res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`
      },
      body: JSON.stringify(body),
      signal: opts.signal
    });
  } catch (e) {
    throw new OpenAiUnreachableError(`network: ${(e as Error).message}`);
  }

  if (!res.ok) {
    // Surface the OpenAI error message but never echo the key
    const text = await res.text();
    throw new OpenAiUnreachableError(`HTTP ${res.status}: ${text.slice(0, 240)}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return (data.choices?.[0]?.message?.content ?? "").trim();
}

export async function generateJson<T = unknown>(
  prompt: string,
  opts: OpenAiOptions = {}
): Promise<T | { raw: string }> {
  const raw = await generate(prompt, { ...opts, format: "json" });
  try {
    return JSON.parse(raw) as T;
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]) as T;
      } catch {
        /* fallthrough */
      }
    }
    return { raw };
  }
}
