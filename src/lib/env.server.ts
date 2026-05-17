// SERVER-ONLY env. Must never be imported from "use client" files or
// from `src/lib/env.ts` (which is client-safe). Importing this module
// in a client component will inline the env var *names* into the
// browser bundle. Even though Next.js scrubs the *values*, the names
// shouldn't be there at all.

import "server-only";

export const serverEnv = {
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL ?? "http://localhost:11434",
  ollamaReasoning: process.env.OLLAMA_MODEL_REASONING ?? "llama3",
  ollamaFast: process.env.OLLAMA_MODEL_FAST ?? "mistral",
  ollamaRewrite: process.env.OLLAMA_MODEL_REWRITE ?? "phi3",
  extensionApiKey: process.env.EXTENSION_API_KEY ?? ""
};
