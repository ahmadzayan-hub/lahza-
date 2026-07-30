import { describe, expect, it } from "vitest";
import { vatBreakdown } from "../format";
import { buildQuotation } from "../quotation";
import { BRAND } from "../brand";
import { EVENT_PACKAGES, GIFT_PACKAGES, DELIVERY_FEES } from "../catalog";

describe("VAT math", () => {
  it("uses the UAE 5% VAT rate", () => {
    expect(BRAND.vatRate).toBe(0.05);
  });

  it("splits a VAT-inclusive total so net + vat = total", () => {
    const { net, vat } = vatBreakdown(105);
    expect(net + vat).toBeCloseTo(105, 2);
    expect(net).toBeCloseTo(100, 2);
    expect(vat).toBeCloseTo(5, 2);
  });
});

describe("buildQuotation (B2B, VAT-exclusive)", () => {
  const pkg = EVENT_PACKAGES[0];

  it("charges only the package when guests fit the cup allowance", () => {
    const q = buildQuotation("Q-1", pkg, pkg.cups);
    expect(q.lines).toHaveLength(1);
    expect(q.subtotal).toBe(pkg.price);
    expect(q.vat).toBeCloseTo(pkg.price * 0.05, 2);
    expect(q.total).toBeCloseTo(pkg.price * 1.05, 2);
  });

  it("adds extra cups at the flat rate beyond the allowance", () => {
    const extra = 25;
    const q = buildQuotation("Q-2", pkg, pkg.cups + extra);
    expect(q.lines).toHaveLength(2);
    expect(q.lines[1].qty).toBe(extra);
    expect(q.subtotal).toBe(pkg.price + extra * q.lines[1].unit);
    expect(q.total).toBeCloseTo(q.subtotal + q.vat, 2);
  });

  it("never produces a negative extra-cup line", () => {
    const q = buildQuotation("Q-3", pkg, 1);
    expect(q.lines).toHaveLength(1);
  });
});

describe("catalog integrity", () => {
  it("has unique ids and positive prices in every package list", () => {
    for (const list of [EVENT_PACKAGES, GIFT_PACKAGES] as const) {
      const ids = list.map((p) => p.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const p of list) expect(p.price).toBeGreaterThan(0);
    }
  });

  it("defines a non-negative delivery fee for every emirate", () => {
    for (const fee of Object.values(DELIVERY_FEES)) {
      expect(fee).toBeGreaterThanOrEqual(0);
    }
  });
});
