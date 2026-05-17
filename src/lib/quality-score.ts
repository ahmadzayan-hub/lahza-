/**
 * Heuristic quality scorer for a prompt. Pure function, runs client-side.
 * Returns an overall 0-100 score plus per-dimension breakdown.
 */

export interface Dimension {
  key: string;
  label_en: string;
  label_ar: string;
  score: number; // 0-100
  weight: number; // relative weight in the overall score
}

export interface QualityScore {
  overall: number;
  dimensions: Dimension[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

const DIMENSIONS: Array<Omit<Dimension, "score"> & { test: (s: string) => number }> = [
  {
    key: "clarity",
    label_en: "Clarity",
    label_ar: "الوضوح",
    weight: 15,
    test: (s) => {
      const trimmed = s.trim();
      if (trimmed.length < 20) return 30;
      const avgWord = trimmed.split(/\s+/).length;
      // ideal 30-300 words
      if (avgWord < 10) return 40;
      if (avgWord > 800) return 60;
      return 90;
    }
  },
  {
    key: "context",
    label_en: "Context",
    label_ar: "السياق",
    weight: 15,
    test: (s) => (/context|background|given|because|since|سياق|خلفية|بما أن|نظرًا/i.test(s) ? 95 : 35)
  },
  {
    key: "role",
    label_en: "Role definition",
    label_ar: "تحديد الدور",
    weight: 10,
    test: (s) => (/\b(as an?|you are|act as|role|expert|كأنّك|تصرّف ك|دور|خبير)\b/i.test(s) ? 95 : 30)
  },
  {
    key: "audience",
    label_en: "Audience",
    label_ar: "الجمهور",
    weight: 10,
    test: (s) => (/audience|reader|customer|user|developer|student|beginner|expert|جمهور|قارئ|عميل|مستخدم|مبتدئ|محترف/i.test(s) ? 90 : 35)
  },
  {
    key: "format",
    label_en: "Output format",
    label_ar: "صيغة المخرجات",
    weight: 12,
    test: (s) => (/json|markdown|table|bullet|list|outline|email|code|paragraph|csv|قائمة|جدول|بريد|كود|فقرة/i.test(s) ? 95 : 40)
  },
  {
    key: "tone",
    label_en: "Tone",
    label_ar: "النبرة",
    weight: 8,
    test: (s) => (/tone|formal|casual|professional|friendly|persuasive|نبرة|رسمي|ودّي|مهني|إقناعي/i.test(s) ? 90 : 45)
  },
  {
    key: "constraints",
    label_en: "Constraints",
    label_ar: "القيود",
    weight: 10,
    test: (s) => (/limit|max|min|word|tokens|under|less than|no more|must|avoid|exclude|حد|أقل|أكثر|كلمة|تجنّب|يجب|ممنوع/i.test(s) ? 90 : 40)
  },
  {
    key: "examples",
    label_en: "Examples",
    label_ar: "أمثلة",
    weight: 8,
    test: (s) => (/example|sample|like this|for instance|مثال|كمثال|مثلًا/i.test(s) ? 90 : 50)
  },
  {
    key: "source",
    label_en: "Source grounding",
    label_ar: "الاستناد لمصدر",
    weight: 6,
    test: (s) => (/source|cite|reference|document|attached|based on|مصدر|استشهد|مرجع|وثيقة|بناءً على|مرفق/i.test(s) ? 90 : 55)
  },
  {
    key: "validation",
    label_en: "Validation",
    label_ar: "التحقّق",
    weight: 6,
    test: (s) => (/success|criteria|measure|metric|verify|check|done when|good if|نجاح|معيار|تحقّق|قِس/i.test(s) ? 90 : 50)
  }
];

export function scorePrompt(s: string): QualityScore {
  const text = (s ?? "").trim();
  const dims: Dimension[] = DIMENSIONS.map((d) => ({
    key: d.key,
    label_en: d.label_en,
    label_ar: d.label_ar,
    weight: d.weight,
    score: text ? d.test(text) : 0
  }));

  const totalWeight = dims.reduce((a, d) => a + d.weight, 0);
  const overall = Math.round(
    dims.reduce((a, d) => a + (d.score * d.weight) / totalWeight, 0)
  );

  const strengths = dims.filter((d) => d.score >= 85).map((d) => d.label_en);
  const weaknesses = dims.filter((d) => d.score < 55).map((d) => d.label_en);
  const recommendations = dims
    .filter((d) => d.score < 55)
    .map((d) => recommendationFor(d.key));

  return { overall, dimensions: dims, strengths, weaknesses, recommendations };
}

function recommendationFor(key: string): string {
  const map: Record<string, string> = {
    clarity: "Tighten the prompt: aim for 30–300 words.",
    context: "Add background — what's the situation? Why now?",
    role: "Cast the AI in a specific expert role (e.g. 'You are a senior product designer').",
    audience: "Name the audience: beginner? executive? specific persona?",
    format: "Specify output shape: JSON, markdown table, 5-bullet list, etc.",
    tone: "State a tone: formal, friendly, persuasive, concise.",
    constraints: "Add boundaries: max words, things to avoid, mandatory inclusions.",
    examples: "Include 1–2 examples so the AI mirrors your style.",
    source: "Cite a source or attach a document the answer must rely on.",
    validation: "Define what 'good' looks like — a measurable success criterion."
  };
  return map[key] ?? "";
}

export function scoreToTone(s: number): "rose" | "amber" | "emerald" {
  if (s < 50) return "rose";
  if (s < 80) return "amber";
  return "emerald";
}
