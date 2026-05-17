/**
 * Eight prompt-engineering methods. Each takes the user's raw input +
 * collected Q&A and returns a structured prompt shaped for that method.
 *
 * All builders are pure, client-side, locale-aware, and deterministic.
 */

import type { TargetModel } from "@/lib/types";
import { postFormatForModel } from "@/lib/services/formatter";

export type PromptMethodId =
  | "auto"
  | "craft"
  | "task"
  | "role"
  | "zero_shot"
  | "few_shot"
  | "chain"
  | "structured"
  | "critique";

export interface PromptMethod {
  id: PromptMethodId;
  name_en: string;
  name_ar: string;
  desc_en: string;
  desc_ar: string;
  bestFor_en: string;
  bestFor_ar: string;
}

export const METHODS: PromptMethod[] = [
  {
    id: "auto",
    name_en: "Auto · recommended",
    name_ar: "تلقائي · موصى به",
    desc_en: "We pick the best method based on your prompt.",
    desc_ar: "نختار الطريقة الأنسب تلقائيًا حسب طلبك.",
    bestFor_en: "Most users",
    bestFor_ar: "معظم المستخدمين"
  },
  {
    id: "craft",
    name_en: "CRAFT",
    name_ar: "إطار CRAFT",
    desc_en: "Context · Role · Audience · Format · Tone. Beginner-friendly default.",
    desc_ar: "السياق · الدور · الجمهور · الصيغة · النبرة. إطار مثالي للمبتدئين.",
    bestFor_en: "Business writing, beginners",
    bestFor_ar: "الكتابة المهنية والمبتدئون"
  },
  {
    id: "task",
    name_en: "Task-based",
    name_ar: "حسب المهمّة",
    desc_en: "Start straight from a verb: summarise, analyse, classify, compare…",
    desc_ar: "ابدأ مباشرة بفعل: لخّص، حلّل، صنّف، قارن…",
    bestFor_en: "Quick one-shot tasks",
    bestFor_ar: "المهام السريعة"
  },
  {
    id: "role",
    name_en: "Role-based",
    name_ar: "تعيين دور",
    desc_en: "Cast the AI as a specific expert (consultant, professor, analyst…).",
    desc_ar: "اجعل الذكاء الاصطناعي يلعب دور خبير محدّد (مستشار، أستاذ، محلّل…).",
    bestFor_en: "Domain advice, expert framing",
    bestFor_ar: "النصائح المتخصّصة"
  },
  {
    id: "zero_shot",
    name_en: "Zero-shot",
    name_ar: "بلا أمثلة",
    desc_en: "No examples — just a clear instruction. Fast and concise.",
    desc_ar: "بدون أمثلة — تعليمات واضحة فقط. سريع ومختصر.",
    bestFor_en: "Simple, well-defined tasks",
    bestFor_ar: "المهام البسيطة الواضحة"
  },
  {
    id: "few_shot",
    name_en: "Few-shot",
    name_ar: "بأمثلة قليلة",
    desc_en: "Provide 1–3 examples so the AI mirrors a style or structure.",
    desc_ar: "أضف مثالاً أو ثلاثة ليحاكي الذكاء الاصطناعي أسلوبًا أو بنية معيّنة.",
    bestFor_en: "Stylistic consistency, format mimicry",
    bestFor_ar: "اتّساق الأسلوب وتقليد البنية"
  },
  {
    id: "chain",
    name_en: "Chain-of-thought",
    name_ar: "سلسلة تفكير",
    desc_en: "Break a complex task into ordered steps the AI executes sequentially.",
    desc_ar: "قسّم المهام المعقّدة إلى خطوات مرتّبة ينفّذها النموذج بالتسلسل.",
    bestFor_en: "Multi-step reasoning, complex workflows",
    bestFor_ar: "التفكير متعدّد الخطوات"
  },
  {
    id: "structured",
    name_en: "Structured",
    name_ar: "موجِّه مُهيكَل",
    desc_en: "Full sections: Goal, Context, Input, Constraints, Format, Success.",
    desc_ar: "أقسام كاملة: الهدف، السياق، المدخلات، القيود، الصيغة، معايير النجاح.",
    bestFor_en: "Business reports, executive memos",
    bestFor_ar: "التقارير المهنية والمذكّرات التنفيذية"
  },
  {
    id: "critique",
    name_en: "Critique & improve",
    name_ar: "نقد وتحسين",
    desc_en: "Paste an existing prompt — we score it and return an improved version.",
    desc_ar: "ألصق موجِّهًا موجودًا — نقيّمه ونعيد لك نسخة محسّنة.",
    bestFor_en: "Improving a draft you already have",
    bestFor_ar: "تحسين مسودّة موجودة"
  }
];

export function methodById(id: PromptMethodId): PromptMethod {
  return METHODS.find((m) => m.id === id) ?? METHODS[0];
}

/**
 * Decide which method best suits a raw prompt (used when id = "auto").
 * Pure rule-based, fast, deterministic.
 */
export function recommendMethod(raw: string): Exclude<PromptMethodId, "auto"> {
  const t = raw.toLowerCase();
  if (raw.split(/\n/).filter((l) => /^\s*(?:\d+[.)]|[-*•])\s/.test(l)).length >= 3) return "chain";
  if (/\bexample[s]?\b|like this|in the style of|مثال|على نمط/i.test(raw)) return "few_shot";
  if (/\b(as an?|act as|you are an?|كأنّك|تصرّف ك)\b/i.test(raw)) return "role";
  if (/\b(report|memo|brief|analysis|تقرير|مذكّرة|تحليل)\b/i.test(raw)) return "structured";
  if (/\b(improve|critique|review this|حسّن|انقد|راجع)\b/i.test(raw)) return "critique";
  if (raw.length < 80 && /^(write|draft|list|summari[sz]e|translate|اكتب|لخّص|ترجم)\b/i.test(t)) return "task";
  return "craft";
}

/** Builder router. Returns the assembled prompt string for the chosen method. */
export function buildPromptByMethod(opts: {
  method: PromptMethodId;
  raw: string;
  qa: Array<{ question: string; answer: string }>;
  targetModel: TargetModel;
  locale: "en" | "ar";
}): { prompt: string; method: PromptMethodId; rationale: string } {
  const resolved = opts.method === "auto" ? recommendMethod(opts.raw) : opts.method;
  const builder = BUILDERS[resolved] ?? BUILDERS.craft;
  const prompt = postFormatForModel(builder(opts.raw, opts.qa, opts.locale), opts.targetModel);
  return {
    prompt,
    method: resolved,
    rationale: rationaleFor(resolved, opts.locale)
  };
}

type Builder = (
  raw: string,
  qa: Array<{ question: string; answer: string }>,
  locale: "en" | "ar"
) => string;

const BUILDERS: Record<Exclude<PromptMethodId, "auto">, Builder> = {
  craft: (raw, qa, locale) => {
    const ans = (k: string) => qa.find((q) => q.question.toLowerCase().includes(k))?.answer ?? "";
    const L = labels(locale);
    return [
      `# ${L.craftTitle}`,
      ``,
      `**${L.context}:** ${ans(locale === "ar" ? "سياق" : "context") || raw}`,
      `**${L.role}:** ${ans(locale === "ar" ? "دور" : "role") || L.defaultRole}`,
      `**${L.audience}:** ${ans(locale === "ar" ? "جمهور" : "audience") || L.defaultAudience}`,
      `**${L.format}:** ${ans(locale === "ar" ? "صيغة" : "format") || L.defaultFormat}`,
      `**${L.tone}:** ${ans(locale === "ar" ? "نبرة" : "tone") || L.defaultTone}`,
      ``,
      `## ${L.task}`,
      raw
    ].join("\n");
  },

  task: (raw, _qa, locale) => {
    const L = labels(locale);
    return `# ${L.task}\n${raw}\n\n# ${L.outputFormat}\n${L.directAnswer}`;
  },

  role: (raw, qa, locale) => {
    const L = labels(locale);
    const role = qa.find((q) => /role|expert|دور|خبير/i.test(q.question))?.answer || L.defaultRole;
    return [
      `# ${L.role}`,
      role,
      ``,
      `# ${L.task}`,
      raw,
      ``,
      `# ${L.constraints}`,
      qa.length > 0
        ? qa.map((p) => `- ${p.question}: ${p.answer}`).join("\n")
        : `- ${L.beSpecific}`
    ].join("\n");
  },

  zero_shot: (raw, _qa, locale) => {
    const L = labels(locale);
    return `${raw}\n\n${L.zeroShotTail}`;
  },

  few_shot: (raw, qa, locale) => {
    const L = labels(locale);
    const examples = qa.filter((q) => /example|نمط|مثال/i.test(q.question)).map((q) => q.answer).filter(Boolean);
    return [
      `# ${L.task}`,
      raw,
      ``,
      `# ${L.examples}`,
      examples.length
        ? examples.map((e, i) => `### ${L.example} ${i + 1}\n${e}`).join("\n\n")
        : `### ${L.example} 1\n${L.examplePlaceholder}`,
      ``,
      `# ${L.outputFormat}`,
      L.matchExamples
    ].join("\n");
  },

  chain: (raw, qa, locale) => {
    const L = labels(locale);
    const steps = qa.length
      ? qa.map((q, i) => `${i + 1}. ${q.answer || q.question}`)
      : [
          `1. ${L.chainStep1}`,
          `2. ${L.chainStep2}`,
          `3. ${L.chainStep3}`
        ];
    return [
      `# ${L.task}`,
      raw,
      ``,
      `# ${L.steps}`,
      ...steps,
      ``,
      `# ${L.outputFormat}`,
      L.chainOutput
    ].join("\n");
  },

  structured: (raw, qa, locale) => {
    const L = labels(locale);
    const get = (re: RegExp) => qa.find((q) => re.test(q.question))?.answer ?? "";
    return [
      `# ${L.goal}\n${raw}`,
      `# ${L.context}\n${get(/context|سياق/i) || "—"}`,
      `# ${L.input}\n${get(/input|مدخل/i) || "—"}`,
      `# ${L.constraints}\n${get(/constraint|قيد/i) || "—"}`,
      `# ${L.outputFormat}\n${get(/format|صيغة/i) || L.defaultFormat}`,
      `# ${L.quality}\n${get(/quality|جودة/i) || L.defaultQuality}`,
      `# ${L.audience}\n${get(/audience|جمهور/i) || L.defaultAudience}`,
      `# ${L.tone}\n${get(/tone|نبرة/i) || L.defaultTone}`,
      `# ${L.risks}\n${get(/risk|خطر|تجنّب/i) || "—"}`,
      `# ${L.validation}\n${get(/valid|تحقّق/i) || L.defaultValidation}`
    ].join("\n\n");
  },

  critique: (raw, _qa, locale) => {
    const L = labels(locale);
    return [
      `# ${L.task}`,
      L.critiqueTask,
      ``,
      `# ${L.originalPrompt}`,
      raw,
      ``,
      `# ${L.outputFormat}`,
      L.critiqueOutput
    ].join("\n");
  }
};

function rationaleFor(m: PromptMethodId, locale: "en" | "ar"): string {
  const ar: Record<string, string> = {
    craft: "بنينا الموجِّه على إطار CRAFT لتغطية السياق والدور والجمهور والصيغة والنبرة.",
    task: "أنشأنا موجِّهًا مباشرًا يبدأ بالمهمّة دون تفاصيل زائدة.",
    role: "أسندنا للنموذج دور خبير محدّد ثم وضعنا المهمّة والقيود.",
    zero_shot: "موجِّه قصير بدون أمثلة، يفترض أن النموذج يعرف المجال.",
    few_shot: "أضفنا أمثلة ليتعلّم النموذج النمط المطلوب قبل التنفيذ.",
    chain: "قسّمنا المهمّة إلى خطوات متسلسلة لتفكير أوضح ونتائج أعمق.",
    structured: "استخدمنا قالبًا مهيكلًا كاملاً يناسب التقارير المهنية والمذكّرات التنفيذية.",
    critique: "وجّهنا النموذج لينقد الموجِّه الأصلي ويقترح نسخة محسّنة."
  };
  const en: Record<string, string> = {
    craft: "Built around the CRAFT framework: Context, Role, Audience, Format, Tone.",
    task: "Direct task-first prompt — minimal scaffolding for a quick answer.",
    role: "Casts the AI as a specific expert, then states task and constraints.",
    zero_shot: "Short, no examples — assumes the AI already knows the domain.",
    few_shot: "Provides examples so the AI mirrors a pattern before answering.",
    chain: "Breaks the task into ordered steps for clearer multi-step reasoning.",
    structured: "Full structured template — ideal for business reports and executive memos.",
    critique: "Asks the AI to critique the original prompt and return an improved version."
  };
  return (locale === "ar" ? ar : en)[m] ?? "";
}

function labels(locale: "en" | "ar") {
  if (locale === "ar") {
    return {
      craftTitle: "إطار CRAFT",
      context: "السياق",
      role: "الدور",
      audience: "الجمهور",
      format: "الصيغة",
      tone: "النبرة",
      task: "المهمّة",
      outputFormat: "صيغة المخرجات",
      directAnswer: "أجب مباشرة وبدقّة دون مقدّمات.",
      constraints: "القيود",
      beSpecific: "كن محدّدًا وعمليًا.",
      zeroShotTail: "أجب بدقّة وبشكل قابل للاستخدام مباشرة.",
      examples: "أمثلة",
      example: "مثال",
      examplePlaceholder: "(ضع مثالاً واحدًا على الأقل من الأسلوب المطلوب)",
      matchExamples: "اتّبع نفس النمط البنيوي للأمثلة.",
      steps: "الخطوات",
      chainStep1: "حلّل الطلب وحدّد المتطلّبات الأساسية.",
      chainStep2: "اقترح بنية الإجابة قبل الكتابة.",
      chainStep3: "نفّذ البنية بإجابة كاملة.",
      chainOutput: "اعرض كلّ خطوة قبل الإجابة النهائية.",
      goal: "الهدف",
      input: "البيانات المُدخلة",
      quality: "معايير الجودة",
      risks: "المخاطر/تجنّبات",
      validation: "متطلّبات التحقّق",
      defaultRole: "خبير في مجال الطلب",
      defaultAudience: "قارئ مهني",
      defaultFormat: "نصّ منظّم بعناوين قصيرة",
      defaultTone: "احترافية وواضحة",
      defaultQuality: "محدّد، دقيق، قابل للتنفيذ",
      defaultValidation: "أعد قراءة الإجابة قبل التسليم وتحقّق من اكتمالها.",
      originalPrompt: "الموجِّه الأصلي",
      critiqueTask: "اقرأ الموجِّه التالي، استخرج نقاط ضعفه، ثم اكتب نسخة محسّنة منه.",
      critiqueOutput: "1) نقاط القوّة\n2) نقاط الضعف\n3) توصيات\n4) النسخة المحسّنة"
    };
  }
  return {
    craftTitle: "CRAFT Prompt",
    context: "Context",
    role: "Role",
    audience: "Audience",
    format: "Format",
    tone: "Tone",
    task: "Task",
    outputFormat: "Output format",
    directAnswer: "Answer directly and precisely, no preamble.",
    constraints: "Constraints",
    beSpecific: "Be specific and actionable.",
    zeroShotTail: "Respond precisely and ready to use.",
    examples: "Examples",
    example: "Example",
    examplePlaceholder: "(provide at least one example of the desired style)",
    matchExamples: "Follow the structural pattern of the examples.",
    steps: "Steps",
    chainStep1: "Analyse the request and list the core requirements.",
    chainStep2: "Outline the answer structure before writing.",
    chainStep3: "Execute the structure with a full answer.",
    chainOutput: "Show each step before the final answer.",
    goal: "Goal",
    input: "Input data",
    quality: "Quality criteria",
    risks: "Risks / things to avoid",
    validation: "Validation requirements",
    defaultRole: "Expert in the requested domain",
    defaultAudience: "Professional reader",
    defaultFormat: "Structured text with short headings",
    defaultTone: "Professional and clear",
    defaultQuality: "Specific, accurate, actionable",
    defaultValidation: "Re-read the answer for completeness before delivering.",
    originalPrompt: "Original prompt",
    critiqueTask: "Read the prompt below, identify its weaknesses, then write an improved version.",
    critiqueOutput: "1) Strengths\n2) Weaknesses\n3) Recommendations\n4) Improved version"
  };
}
