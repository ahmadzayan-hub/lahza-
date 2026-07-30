import { describe, expect, it } from "vitest";
import { suggestArabicName } from "../arabicNames";

describe("suggestArabicName", () => {
  it("resolves curated names with confidence", () => {
    expect(suggestArabicName("Ahmed")).toEqual({ arabic: "أحمد", confident: true });
    expect(suggestArabicName("fatima")).toEqual({ arabic: "فاطمة", confident: true });
  });

  it("flags unknown names as not confident (never blind-transliterates silently)", () => {
    const s = suggestArabicName("Xzqwerty");
    expect(s).not.toBeNull();
    expect(s!.confident).toBe(false);
  });

  it("multi-word names are confident only when every token is known", () => {
    expect(suggestArabicName("Ahmed Ali")!.confident).toBe(true);
    expect(suggestArabicName("Ahmed Xzq")!.confident).toBe(false);
  });

  it("returns null for empty input", () => {
    expect(suggestArabicName("   ")).toBeNull();
  });
});
