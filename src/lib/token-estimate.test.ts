import { describe, it, expect } from "vitest";
import { estimateTokens, estimateCostUsd } from "./token-estimate";

describe("estimateTokens", () => {
  it("returns 0 for empty input", () => {
    expect(estimateTokens("")).toBe(0);
  });

  it("estimates ~1 token per 4 chars for Latin", () => {
    const t = "hello world this is a test prompt";
    const n = estimateTokens(t);
    expect(n).toBeGreaterThan(5);
    expect(n).toBeLessThan(15);
  });

  it("counts Arabic at a denser rate", () => {
    const arabic = "هذا نص تجريبي يحوي عشر كلمات تقريبًا للاختبار";
    const english = "this is a sample text containing about ten words for testing";
    expect(estimateTokens(arabic)).toBeGreaterThan(estimateTokens(english) * 0.8);
  });
});

describe("estimateCostUsd", () => {
  it("returns 0 for 0 tokens", () => {
    expect(estimateCostUsd(0)).toBe(0);
  });

  it("scales linearly with input tokens", () => {
    const a = estimateCostUsd(1_000);
    const b = estimateCostUsd(2_000);
    expect(b).toBeCloseTo(2 * a, 6);
  });

  it("gpt-4o is more expensive than gpt-4o-mini", () => {
    expect(estimateCostUsd(10_000, "gpt-4o")).toBeGreaterThan(estimateCostUsd(10_000, "gpt-4o-mini"));
  });
});
