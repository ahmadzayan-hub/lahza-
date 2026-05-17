import { generateJson } from "@/lib/llm/dispatch";
import { GAP_ANALYSIS, QUESTION_GENERATION } from "@/lib/llm/prompts";
import { ruleBasedGaps, type Gap } from "@/lib/gap-rules";

// Re-export so existing call sites and tests keep working.
export { ruleBasedGaps, type Gap } from "@/lib/gap-rules";

export interface ClarificationQuestion {
  slot: string;
  question: string;
  rationale: string;
  required: boolean;
}

/** Combine rule-based heuristics with an LLM gap analysis. */
export async function findGaps(rawPrompt: string, intent: string): Promise<Gap[]> {
  const heuristic: Gap[] = ruleBasedGaps(rawPrompt);

  const { data: llm } = await generateJson<{ gaps: Gap[] }>(
    `INTENT: ${intent}\nRAW PROMPT:\n"""\n${rawPrompt}\n"""`,
    { system: GAP_ANALYSIS, tier: "reasoning", temperature: 0.2 }
  );

  const llmGaps = "gaps" in llm && Array.isArray(llm.gaps) ? llm.gaps : [];

  const seen = new Set<string>();
  const merged: Gap[] = [];
  for (const g of [...heuristic, ...llmGaps]) {
    const key = g.slot.toLowerCase().trim();
    if (!seen.has(key) && g.slot && g.why) {
      seen.add(key);
      merged.push({ slot: g.slot, why: g.why });
    }
  }
  return merged.slice(0, 6);
}

/** Turn gaps into user-facing clarification questions. */
export async function generateQuestions(
  rawPrompt: string,
  intent: string,
  gaps: Gap[]
): Promise<ClarificationQuestion[]> {
  if (gaps.length === 0) return [];
  const { data: result } = await generateJson<{ questions: ClarificationQuestion[] }>(
    `INTENT: ${intent}\nRAW PROMPT:\n"""\n${rawPrompt}\n"""\nGAPS:\n${JSON.stringify(gaps)}`,
    { system: QUESTION_GENERATION, tier: "fast", temperature: 0.3 }
  );
  if ("questions" in result && Array.isArray(result.questions)) {
    return result.questions
      .filter((q) => q && typeof q.question === "string")
      .map((q, i) => ({
        slot: q.slot ?? gaps[i]?.slot ?? `slot_${i}`,
        question: q.question,
        rationale: q.rationale ?? "",
        required: q.required ?? true
      }));
  }
  return gaps.map((g) => ({
    slot: g.slot,
    question: `Could you tell me about ${g.slot.replace(/_/g, " ")}?`,
    rationale: g.why,
    required: true
  }));
}
