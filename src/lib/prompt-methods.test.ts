import { describe, it, expect } from "vitest";
import { recommendMethod, buildPromptByMethod, METHODS } from "./prompt-methods";

describe("recommendMethod", () => {
  it("returns 'task' for short verb-first prompts", () => {
    expect(recommendMethod("Write a tweet")).toBe("task");
    expect(recommendMethod("summarise this for me")).toBe("task");
  });

  it("returns 'role' when the user assigns a role", () => {
    expect(recommendMethod("Act as a senior copywriter and rewrite this")).toBe("role");
    expect(recommendMethod("you are a financial analyst")).toBe("role");
  });

  it("returns 'few_shot' when examples are mentioned", () => {
    expect(recommendMethod("Write a haiku — example: 'old pond, frog jumps in'")).toBe("few_shot");
  });

  it("returns 'chain' when the prompt is a numbered list", () => {
    expect(
      recommendMethod("Do these:\n1. read\n2. analyse\n3. write a summary\n4. share")
    ).toBe("chain");
  });

  it("returns 'structured' for report-style prompts", () => {
    expect(recommendMethod("Write a board report on Q1 revenue")).toBe("structured");
  });

  it("returns 'critique' for improve/review requests", () => {
    expect(recommendMethod("Improve this prompt I drafted")).toBe("critique");
  });

  it("returns 'craft' as a sensible default", () => {
    expect(recommendMethod("I need help thinking about my career direction next year")).toBe("craft");
  });
});

describe("buildPromptByMethod", () => {
  const baseOpts = {
    raw: "Write a blog post about coffee",
    qa: [],
    targetModel: "chatgpt" as const,
    locale: "en" as const
  };

  it("renders a CRAFT prompt with five sections", () => {
    const out = buildPromptByMethod({ ...baseOpts, method: "craft" });
    expect(out.method).toBe("craft");
    expect(out.prompt).toMatch(/Context|Role|Audience|Format|Tone/);
    expect(out.prompt).toContain("blog post about coffee");
  });

  it("renders a structured prompt with all blocks", () => {
    const out = buildPromptByMethod({ ...baseOpts, method: "structured" });
    expect(out.prompt).toContain("# Goal");
    expect(out.prompt).toContain("# Constraints");
    expect(out.prompt).toContain("# Output format");
    expect(out.prompt).toContain("# Quality criteria");
    expect(out.prompt).toContain("# Validation requirements");
  });

  it("renders a chain prompt with numbered steps", () => {
    const out = buildPromptByMethod({ ...baseOpts, method: "chain" });
    expect(out.prompt).toContain("# Steps");
    expect(out.prompt).toMatch(/\b1\./);
    expect(out.prompt).toMatch(/\b2\./);
  });

  it("falls back to a deterministic method when given 'auto'", () => {
    const out = buildPromptByMethod({ ...baseOpts, method: "auto" });
    expect(out.method).not.toBe("auto");
    expect(METHODS.map((m) => m.id)).toContain(out.method);
  });

  it("renders Arabic when locale=ar", () => {
    const out = buildPromptByMethod({
      ...baseOpts,
      method: "craft",
      raw: "اكتب مقالاً عن القهوة",
      locale: "ar"
    });
    expect(out.prompt).toMatch(/السياق|الدور|الجمهور/);
  });

  it("respects target model in post-formatting (claude wraps in <task>)", () => {
    const out = buildPromptByMethod({ ...baseOpts, targetModel: "claude", method: "task" });
    expect(out.prompt.startsWith("<task>")).toBe(true);
  });
});
