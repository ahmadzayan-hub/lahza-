import { createCheckoutSession } from "@/api/stripe";

// Exercises the real createCheckoutSession code path against Stripe test mode.
// Run: STRIPE_SECRET_KEY=sk_test_... npm run stripe:smoke
async function main() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    console.error("✗ STRIPE_SECRET_KEY is not set. Use a test key (sk_test_...).");
    process.exit(1);
  }
  if (!key.startsWith("sk_test_")) {
    console.error("✗ Refusing to run: STRIPE_SECRET_KEY is not a test key (must start with sk_test_).");
    process.exit(1);
  }

  const session = await createCheckoutSession({
    orderId: `smoke-${Date.now()}`,
    shippingAed: 20,
    origin: process.env.PUBLIC_BASE_URL ?? "http://localhost:5173",
    items: [
      { name: "Celestial Pendant Necklace", priceAed: 149, qty: 1 },
      { name: "Infinity Hoop Earrings", priceAed: 89, qty: 2 },
    ],
  });

  console.log("✓ Stripe test Checkout Session created");
  console.log("  id:  ", session.id);
  console.log("  url: ", session.url);
  console.log("\nOpen the URL and pay with test card 4242 4242 4242 4242 (any future expiry/CVC).");
  process.exit(0);
}

main().catch((err) => {
  console.error("✗ Stripe smoke test failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
