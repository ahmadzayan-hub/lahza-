/**
 * Local prompt-engineering engine that runs entirely in the browser.
 * Used as a fallback when the server, Supabase or Ollama is unavailable.
 *
 * It is rule-based, deterministic and produces a coherent structured
 * prompt for any of: chatgpt | claude | copilot | gemini | generic.
 */

import { ruleBasedGaps } from "@/lib/gap-rules";
import { postFormatForModel } from "@/lib/format-rules";
import type { TargetModel } from "@/lib/types";

export type Intent =
  | "coding"
  | "writing"
  | "research"
  | "analysis"
  | "planning"
  | "creative"
  | "design"
  | "conversation"
  | "other";

interface IntentRule {
  intent: Intent;
  patterns: RegExp[];
}

const INTENT_RULES: IntentRule[] = [
  {
    intent: "coding",
    patterns: [/\b(refactor|debug|bug|function|class|component|api|endpoint|sql|typescript|python|javascript|react|next\.js|node|test|ci|deploy|docker|kubernetes)\b/i]
  },
  {
    intent: "writing",
    patterns: [/\b(tweet|post|article|blog|essay|copy|email|reply|caption|headline|newsletter|story|paragraph)\b/i]
  },
  {
    intent: "research",
    patterns: [/\b(research|summarize|summary|explain|overview|brief|literature|review|state of)\b/i]
  },
  {
    intent: "analysis",
    patterns: [/\b(analy[sz]e|compare|contrast|evaluate|metric|benchmark|kpi|dashboard|insight|root cause)\b/i]
  },
  {
    intent: "planning",
    patterns: [/\b(plan|schedule|roadmap|launch|checklist|milestones?|timeline|sprint|backlog|kanban)\b/i]
  },
  {
    intent: "creative",
    patterns: [/\b(story|fiction|poem|script|character|world ?building|dialogue|lyrics?)\b/i]
  },
  {
    intent: "design",
    patterns: [/\b(logo|design|illustration|mock ?up|wireframe|brand|palette|figma|ui|ux|icon|banner)\b/i]
  },
  {
    intent: "conversation",
    patterns: [/\b(advice|opinion|recommend|should i|help me decide|what would you|chat)\b/i]
  }
];

export interface LocalIntent {
  intent: Intent;
  confidence: number;
}

export function detectIntentLocal(raw: string): LocalIntent {
  const text = raw.toLowerCase();
  let best: LocalIntent = { intent: "other", confidence: 0.3 };
  for (const rule of INTENT_RULES) {
    const hits = rule.patterns.filter((p) => p.test(text)).length;
    if (hits > 0) {
      const conf = Math.min(0.95, 0.7 + hits * 0.1);
      if (conf > best.confidence) best = { intent: rule.intent, confidence: conf };
    }
  }
  // Arabic fallback: detect by keywords too
  if (best.intent === "other") {
    if (/\b(لوجو|تصميم|شعار|أيقون|واجهة)\b/.test(raw)) best = { intent: "design", confidence: 0.7 };
    else if (/\b(كود|برمج|دالة|مكوّن|تطبيق)\b/.test(raw)) best = { intent: "coding", confidence: 0.75 };
    else if (/\b(اكتب|تغريدة|مقال|بريد|رسالة)\b/.test(raw)) best = { intent: "writing", confidence: 0.75 };
    else if (/\b(لخّص|بحث|اشرح|نظرة عامة)\b/.test(raw)) best = { intent: "research", confidence: 0.75 };
    else if (/\b(خطّة|جدول|إطلاق|قائمة)\b/.test(raw)) best = { intent: "planning", confidence: 0.7 };
  }
  return best;
}

const QUESTION_TEMPLATES: Record<Intent, Array<{ slot: string; en: string; ar: string; rationale_en: string; rationale_ar: string }>> = {
  coding: [
    { slot: "language", en: "Which language and framework are you using?", ar: "ما اللغة وإطار العمل الذي تستخدمه؟", rationale_en: "Code style and APIs differ by stack.", rationale_ar: "أسلوب الكود وواجهات البرمجة تختلف حسب المنصّة." },
    { slot: "constraint", en: "Any performance, dependency, or style constraints?", ar: "هل توجد قيود على الأداء أو التبعيات أو الأسلوب؟", rationale_en: "Constraints prevent over-engineering.", rationale_ar: "القيود تمنع المبالغة في الحل." },
    { slot: "success", en: "What does 'done' look like — tests, behaviour, output?", ar: "كيف يبدو الإنجاز — اختبارات، سلوك، مخرجات؟", rationale_en: "A success criterion lets the model self-check.", rationale_ar: "معيار النجاح يتيح للنموذج التحقق من نفسه." }
  ],
  writing: [
    { slot: "audience", en: "Who is the target audience?", ar: "من هو الجمهور المستهدف؟", rationale_en: "Audience drives tone and vocabulary.", rationale_ar: "الجمهور يحدّد النبرة والمفردات." },
    { slot: "format", en: "What format — length, structure, examples?", ar: "ما الصيغة المطلوبة — الطول، البنية، الأمثلة؟", rationale_en: "Format avoids guessing.", rationale_ar: "تحديد الصيغة يمنع التخمين." },
    { slot: "goal", en: "What action should the reader take?", ar: "ما الإجراء الذي يجب أن يتّخذه القارئ؟", rationale_en: "A clear CTA shapes the whole piece.", rationale_ar: "دعوة العمل الواضحة تشكّل كامل النص." }
  ],
  research: [
    { slot: "audience", en: "Who is reading this — expert or beginner?", ar: "من القارئ — خبير أم مبتدئ؟", rationale_en: "Depth and jargon depend on this.", rationale_ar: "العمق والمصطلحات تعتمد على ذلك." },
    { slot: "depth", en: "How deep — TL;DR, summary, or deep dive?", ar: "ما عمق التغطية — موجز، ملخّص، أم تفصيلي؟", rationale_en: "Sets the level of detail.", rationale_ar: "يحدّد مستوى التفاصيل." },
    { slot: "sources", en: "Should it cite specific sources or be general?", ar: "هل يجب أن يستشهد بمصادر محدّدة أم يكون عامًا؟", rationale_en: "Avoids fabricated citations.", rationale_ar: "يمنع اختلاق المصادر." }
  ],
  analysis: [
    { slot: "data", en: "What data or context should I assume?", ar: "ما البيانات أو السياق المفترض؟", rationale_en: "Anchors the analysis in reality.", rationale_ar: "يربط التحليل بالواقع." },
    { slot: "frame", en: "Any framework to use (e.g. SWOT, RICE, 5 Whys)?", ar: "هل هناك إطار للاستخدام (مثل SWOT أو RICE أو 5 لماذا)؟", rationale_en: "Frameworks structure the answer.", rationale_ar: "الأطر تنظّم الإجابة." },
    { slot: "decision", en: "What decision should this analysis support?", ar: "ما القرار الذي يجب أن يدعمه هذا التحليل؟", rationale_en: "Focuses on what matters.", rationale_ar: "يركّز على ما يهم." }
  ],
  planning: [
    { slot: "horizon", en: "What's the time horizon — week, month, quarter?", ar: "ما المدى الزمني — أسبوع، شهر، ربع؟", rationale_en: "Determines task granularity.", rationale_ar: "يحدّد دقّة المهام." },
    { slot: "resources", en: "What resources or constraints exist?", ar: "ما الموارد أو القيود المتاحة؟", rationale_en: "Realistic plans need realistic limits.", rationale_ar: "الخطط الواقعية تحتاج حدودًا واقعية." },
    { slot: "success", en: "What does success look like?", ar: "كيف يبدو النجاح؟", rationale_en: "Defines the finish line.", rationale_ar: "يحدّد خطّ النهاية." }
  ],
  creative: [
    { slot: "tone", en: "What tone or mood?", ar: "ما النبرة أو الجو العام؟", rationale_en: "Anchors the voice.", rationale_ar: "يثبّت الصوت السردي." },
    { slot: "length", en: "How long should it be?", ar: "ما الطول المطلوب؟", rationale_en: "Prevents over- or under-writing.", rationale_ar: "يمنع الزيادة أو النقص." },
    { slot: "constraints", en: "Any must-include elements or things to avoid?", ar: "أي عناصر يجب تضمينها أو تجنّبها؟", rationale_en: "Boundaries spark creativity.", rationale_ar: "الحدود تحفّز الإبداع." }
  ],
  design: [
    { slot: "use", en: "Where will this be used (web, mobile, print)?", ar: "أين سيُستخدم هذا (ويب، جوال، طباعة)؟", rationale_en: "Use case constrains style and tech.", rationale_ar: "حالة الاستخدام تحدّد الأسلوب والتقنية." },
    { slot: "vibe", en: "What feeling should it evoke (modern, playful, formal)?", ar: "ما الإحساس الذي يجب أن يستحضره (حديث، مرح، رسمي)؟", rationale_en: "Drives every visual choice.", rationale_ar: "يقود كلّ خيار بصري." },
    { slot: "constraints", en: "Brand colors, references, or things to avoid?", ar: "ألوان الهوية، مراجع، أو أشياء يجب تجنّبها؟", rationale_en: "Anchors output to your brand.", rationale_ar: "يربط النتيجة بهويّتك." }
  ],
  conversation: [
    { slot: "context", en: "Quick context — what led to this question?", ar: "سياق سريع — ما الذي قاد إلى هذا السؤال؟", rationale_en: "Avoids generic advice.", rationale_ar: "يمنع النصيحة العامة." },
    { slot: "constraints", en: "Anything off-limits or already tried?", ar: "أي شيء مستبعد أو سبق أن جُرّب؟", rationale_en: "Saves a back-and-forth.", rationale_ar: "يوفّر جولات إضافية." }
  ],
  other: [
    { slot: "audience", en: "Who is this for?", ar: "لمن هذا؟", rationale_en: "Frames the response.", rationale_ar: "يحدّد إطار الجواب." },
    { slot: "format", en: "What output format do you want?", ar: "ما صيغة المخرجات التي تريدها؟", rationale_en: "Clarifies structure.", rationale_ar: "يوضّح البنية." },
    { slot: "success", en: "How will you know it's good?", ar: "كيف ستعرف أنه جيّد؟", rationale_en: "Sets the bar.", rationale_ar: "يحدّد المعيار." }
  ]
};

export interface LocalQuestion {
  id: string;
  position: number;
  question: string;
  rationale: string;
  required: boolean;
}

export function generateQuestionsLocal(
  raw: string,
  intent: Intent,
  locale: "en" | "ar"
): LocalQuestion[] {
  const gaps = ruleBasedGaps(raw); // re-use the same heuristics
  const list = QUESTION_TEMPLATES[intent] ?? QUESTION_TEMPLATES.other;
  // Take up to 3 questions, but skip ones whose slot was clearly already covered
  const covered = new Set(gaps.map((g) => g.slot)); // these are *missing*
  const filtered = list.filter((q) => {
    // crude mapping between question slots and rule-slots
    if (q.slot === "audience") return covered.has("audience");
    if (q.slot === "format") return covered.has("format");
    if (q.slot === "constraint" || q.slot === "constraints" || q.slot === "resources")
      return covered.has("constraints");
    if (q.slot === "success" || q.slot === "decision") return covered.has("success_criteria");
    return true;
  });
  const chosen = (filtered.length ? filtered : list).slice(0, 3);
  return chosen.map((q, i) => ({
    id: `q${i}`,
    position: i,
    question: locale === "ar" ? q.ar : q.en,
    rationale: locale === "ar" ? q.rationale_ar : q.rationale_en,
    required: i === 0
  }));
}

const SECTION_LABELS = {
  en: { context: "Context", task: "Task", constraints: "Constraints", format: "Output format", success: "Success criteria", original: "Original request" },
  ar: { context: "السياق", task: "المهمّة", constraints: "القيود", format: "صيغة المخرجات", success: "معايير النجاح", original: "الطلب الأصلي" }
};

const ROLE_BY_INTENT: Record<Intent, { en: string; ar: string }> = {
  coding: { en: "You are a senior software engineer.", ar: "أنت مهندس برمجيات أوّل." },
  writing: { en: "You are an expert copywriter.", ar: "أنت كاتب محتوى محترف." },
  research: { en: "You are a careful research analyst.", ar: "أنت محلّل أبحاث دقيق." },
  analysis: { en: "You are a strategic analyst.", ar: "أنت محلّل استراتيجي." },
  planning: { en: "You are an experienced project planner.", ar: "أنت مخطّط مشاريع خبير." },
  creative: { en: "You are a creative writer with a sharp ear.", ar: "أنت كاتب مبدع بحسّ مرهف." },
  design: { en: "You are a senior product designer.", ar: "أنت مصمّم منتجات أوّل." },
  conversation: { en: "You are a thoughtful advisor.", ar: "أنت مستشار حكيم." },
  other: { en: "You are a helpful assistant.", ar: "أنت مساعد ذكي." }
};

export function reconstructPromptLocal(opts: {
  raw: string;
  intent: Intent;
  qa: Array<{ question: string; answer: string }>;
  targetModel: TargetModel;
  locale: "en" | "ar";
}): { final_prompt: string; rationale: string } {
  const { raw, intent, qa, targetModel, locale } = opts;
  const L = SECTION_LABELS[locale];
  const role = ROLE_BY_INTENT[intent][locale];

  const qaBlock = qa.length
    ? qa.map((p) => `- ${p.question}\n  > ${p.answer}`).join("\n")
    : locale === "ar"
      ? "(لا توجد توضيحات إضافية)"
      : "(no extra clarifications)";

  let body: string;
  switch (targetModel) {
    case "claude":
      body = `<role>${role}</role>

<context>
${L.original}: ${raw}

${L.context}:
${qaBlock}
</context>

<task>
${raw}
</task>

<format>
${locale === "ar" ? "أجب بنبرة واضحة، استخدم عناوين عند الحاجة، وأبق التنسيق متّسقًا." : "Answer with a clear voice, use headings when useful, keep formatting consistent."}
</format>`;
      break;

    case "copilot":
      body = `// ${L.task}: ${raw}
// ${L.context}:
${qa.map((p) => `// - ${p.question} -> ${p.answer}`).join("\n")}
// ${L.format}: idiomatic code, comments only where helpful, include tests when relevant.`;
      break;

    case "chatgpt":
    case "gemini":
    case "generic":
    default: {
      const num = locale === "ar" ? ["١.", "٢.", "٣.", "٤.", "٥."] : ["1.", "2.", "3.", "4.", "5."];
      body = `${role}

# ${L.context}
${L.original}: ${raw}

# ${L.task}
${raw}

# ${L.constraints}
${qaBlock}

# ${L.format}
${num[0]} ${locale === "ar" ? "ابدأ بإجابة مباشرة." : "Start with a direct answer."}
${num[1]} ${locale === "ar" ? "أضف الدعم أو الأمثلة بعد ذلك." : "Provide supporting detail or examples next."}
${num[2]} ${locale === "ar" ? "اختم بخطوة تالية أو خلاصة قابلة للتنفيذ." : "Close with a next step or actionable summary."}

# ${L.success}
- ${locale === "ar" ? "ملائم للجمهور والصيغة المطلوبَين" : "Matches the audience and format above"}
- ${locale === "ar" ? "محدّد لا عام" : "Specific, not generic"}
- ${locale === "ar" ? "قابل للنسخ والاستخدام مباشرة" : "Ready to copy and use as-is"}`;
      break;
    }
  }

  const formatted = postFormatForModel(body, targetModel);
  const rationale =
    locale === "ar"
      ? `أُعيد بناء الموجّه محليًا لنية «${intent}» مع تنسيق ${targetModel}. تم دمج إجاباتك في القيود والسياق.`
      : `Rebuilt locally for intent "${intent}" using ${targetModel} formatting. Your answers are merged into constraints and context.`;

  return { final_prompt: formatted, rationale };
}
