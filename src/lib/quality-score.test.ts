import { describe, it, expect } from "vitest";
import { scorePrompt, scoreToTone } from "./quality-score";

describe("scorePrompt", () => {
  it("returns overall 0 for empty input", () => {
    const r = scorePrompt("");
    expect(r.overall).toBe(0);
    expect(r.dimensions.every((d) => d.score === 0)).toBe(true);
  });

  it("scores a vague prompt low", () => {
    const r = scorePrompt("write me something");
    expect(r.overall).toBeLessThan(60);
    expect(r.weaknesses.length).toBeGreaterThan(2);
  });

  it("scores a well-engineered prompt high", () => {
    const r = scorePrompt(
      "You are a senior product designer. Audience: a non-technical CEO. Context: we are building a new SaaS. Write a 200-word executive summary in markdown with three bullet points. Tone: professional, persuasive. Constraints: under 250 words, no jargon. Cite sources where possible. Success criteria: the CEO understands the value in under 60 seconds."
    );
    expect(r.overall).toBeGreaterThan(80);
    expect(r.strengths.length).toBeGreaterThan(5);
  });

  it("returns one recommendation per weak dimension", () => {
    const r = scorePrompt("hi");
    expect(r.recommendations.length).toBeGreaterThan(0);
    expect(r.recommendations.length).toBe(r.weaknesses.length);
  });

  it("works for Arabic input as well", () => {
    const r = scorePrompt(
      "أنت خبير مالي. الجمهور: مدير تنفيذي غير متخصّص. السياق: مراجعة الميزانية. اكتب ملخّصًا في 200 كلمة في صيغة قائمة. النبرة: مهنية. القيود: تجنّب المصطلحات. معيار النجاح: قرار واضح خلال دقيقة."
    );
    expect(r.overall).toBeGreaterThan(75);
  });
});

describe("scoreToTone", () => {
  it("maps low scores to rose, mid to amber, high to emerald", () => {
    expect(scoreToTone(20)).toBe("rose");
    expect(scoreToTone(60)).toBe("amber");
    expect(scoreToTone(90)).toBe("emerald");
  });
});
