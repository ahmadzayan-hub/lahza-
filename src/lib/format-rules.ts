// Pure formatting rules. No LLM, no env, no server dependencies.
// Safe to import from client components.

import type { TargetModel } from "@/lib/types";

/** Lightweight, per-model post-formatter for the final string. */
export function postFormatForModel(prompt: string, model: TargetModel): string {
  switch (model) {
    case "claude":
      if (!/<context>|<task>|<format>/i.test(prompt)) {
        return `<task>\n${prompt}\n</task>`;
      }
      return prompt;
    case "copilot":
      return `// Intent:\n// ${prompt.split("\n").join("\n// ")}\n`;
    case "chatgpt":
    case "generic":
    default:
      return prompt;
  }
}
