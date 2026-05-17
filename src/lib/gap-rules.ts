// Pure rule-based gap analysis. No LLM, no env, client-safe.

export interface Gap {
  slot: string;
  why: string;
}

const RULE_BASED_GAPS: Array<{ slot: string; missing: (p: string) => boolean; why: string }> = [
  {
    slot: "audience",
    missing: (p) => !/audience|reader|user|customer|developer|student/i.test(p),
    why: "Knowing the target audience changes tone, depth, and vocabulary."
  },
  {
    slot: "format",
    missing: (p) => !/json|markdown|table|bullet|outline|essay|email|code|list/i.test(p),
    why: "Output format prevents the model from guessing structure."
  },
  {
    slot: "constraints",
    missing: (p) => !/limit|max|min|word|tokens|character|under|less than|no more/i.test(p),
    why: "Length and content constraints prevent over- or under-generation."
  },
  {
    slot: "success_criteria",
    missing: (p) => !/success|criteria|done when|good if|measure|metric/i.test(p),
    why: "Defining 'good' lets the model self-check before answering."
  }
];

export function ruleBasedGaps(rawPrompt: string): Gap[] {
  return RULE_BASED_GAPS.filter((r) => r.missing(rawPrompt)).map((r) => ({
    slot: r.slot,
    why: r.why
  }));
}
