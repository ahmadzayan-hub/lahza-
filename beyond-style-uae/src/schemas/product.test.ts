import { describe, expect, it } from "vitest";
import { productInputSchema } from "./product";

const base = {
  slug: "test-ring",
  titleEn: "Elegant Ring",
  titleAr: "خاتم أنيق",
  descriptionEn: "A gold-tone plated ring.",
  descriptionAr: "خاتم مطلي بطبقة ذهبية اللون.",
  priceAed: 99,
  material: "Gold-tone plated",
  cloudinaryIds: ["beyond-style/test-ring"],
  stock: 5,
};

describe("productInputSchema compliance", () => {
  it("accepts compliant copy", () => {
    expect(productInputSchema.safeParse(base).success).toBe(true);
  });

  it("rejects 'Real Gold'", () => {
    const r = productInputSchema.safeParse({ ...base, titleEn: "Real Gold Ring" });
    expect(r.success).toBe(false);
  });

  it("rejects karat terms like '18k'", () => {
    const r = productInputSchema.safeParse({ ...base, descriptionEn: "18k finish" });
    expect(r.success).toBe(false);
  });

  it("rejects material without plated terminology", () => {
    const r = productInputSchema.safeParse({ ...base, material: "Brass" });
    expect(r.success).toBe(false);
  });
});
