import { generateJson } from "@/lib/llm/dispatch";
import { PROMPT_RECONSTRUCTION, MODEL_FORMAT_HINTS } from "@/lib/llm/prompts";
import type { TargetModel } from "@/lib/types";
import { renderSkeleton, type RenderInput } from "./template";

// Re-export the pure rule from its new home so existing callers keep working.
export { postFormatForModel } from "@/lib/format-rules";

export interface FormatResult {
  final_prompt: string;
  rationale: string;
}

export async function reconstructPrompt(
  input: RenderInput,
  targetModel: TargetModel = "generic"
): Promise<FormatResult> {
  const skeleton = renderSkeleton(input);
  const hint = MODEL_FORMAT_HINTS[targetModel] ?? MODEL_FORMAT_HINTS.generic;

  const { data: result } = await generateJson<FormatResult>(
    `${hint}\n\nSKELETON:\n${skeleton}`,
    { system: PROMPT_RECONSTRUCTION, tier: "rewrite", temperature: 0.3 }
  );

  if ("final_prompt" in result && typeof result.final_prompt === "string") {
    return {
      final_prompt: result.final_prompt,
      rationale: result.rationale ?? ""
    };
  }
  return {
    final_prompt: skeleton,
    rationale: "LLM reconstruction failed; returning the structured skeleton."
  };
}
