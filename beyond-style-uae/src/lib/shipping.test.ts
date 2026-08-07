import { describe, expect, it } from "vitest";
import { computeShipping, FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING_AED } from "./shipping";

describe("computeShipping", () => {
  it("charges standard shipping below the threshold", () => {
    const s = computeShipping(FREE_SHIPPING_THRESHOLD - 1);
    expect(s.qualifies).toBe(false);
    expect(s.shippingAed).toBe(STANDARD_SHIPPING_AED);
    expect(s.remaining).toBe(1);
  });

  it("unlocks free shipping at the threshold", () => {
    const s = computeShipping(FREE_SHIPPING_THRESHOLD);
    expect(s.qualifies).toBe(true);
    expect(s.shippingAed).toBe(0);
    expect(s.remaining).toBe(0);
  });

  it("never reports negative remaining", () => {
    expect(computeShipping(1000).remaining).toBe(0);
  });
});
