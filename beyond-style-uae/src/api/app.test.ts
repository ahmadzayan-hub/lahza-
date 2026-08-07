import { beforeAll, describe, expect, it } from "vitest";
import { app } from "./app";

// Integration tests that exercise routing + middleware + validation without a
// database. They cover the paths that resolve before any DB call: auth gating,
// Zod validation, and the fail-fast card check.
describe("api integration (no DB)", () => {
  beforeAll(() => {
    process.env.ADMIN_TOKEN = "test-token";
    delete process.env.ADMIN_TOKENS;
    delete process.env.STRIPE_SECRET_KEY; // card path must report unavailable
  });

  const validOrder = (overrides: Record<string, unknown> = {}) => ({
    customerName: "Test User",
    phone: "+971501234567",
    emirate: "Dubai",
    addressLine: "123 Sheikh Zayed Rd",
    paymentMethod: "card",
    items: [{ productId: "p1", qty: 1, priceAed: 149 }],
    ...overrides,
  });

  it("health is public and reports stripe state", async () => {
    const res = await app.request("/api/health");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, stripe: false });
  });

  it("admin routes require a token", async () => {
    expect((await app.request("/api/admin/products")).status).toBe(401);
    expect((await app.request("/api/admin/orders")).status).toBe(401);
  });

  it("admin routes reject an invalid token", async () => {
    const res = await app.request("/api/admin/products", {
      headers: { "x-admin-token": "wrong" },
    });
    expect(res.status).toBe(401);
  });

  it("card checkout fails fast when Stripe is unconfigured", async () => {
    const res = await app.request("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validOrder()),
    });
    expect(res.status).toBe(503);
    expect((await res.json()).error).toBe("card_payments_unavailable");
  });

  it("rejects an order with an invalid phone (Zod, pre-DB)", async () => {
    const res = await app.request("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validOrder({ phone: "0501234567" })),
    });
    expect(res.status).toBe(400);
  });

  it("rejects non-compliant product copy for an authed admin (pre-DB)", async () => {
    const res = await app.request("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-token": "test-token" },
      body: JSON.stringify({
        slug: "test-ring",
        titleEn: "Real Gold Ring",
        titleAr: "خاتم",
        descriptionEn: "A lovely ring.",
        descriptionAr: "خاتم جميل.",
        priceAed: 99,
        material: "Gold-tone plated",
        cloudinaryIds: ["beyond-style/test-ring"],
        stock: 5,
      }),
    });
    expect(res.status).toBe(400);
  });
});
