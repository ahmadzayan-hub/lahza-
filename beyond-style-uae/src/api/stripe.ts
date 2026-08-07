import Stripe from "stripe";

let client: Stripe | null = null;

/** Lazily construct the Stripe client so the app boots without the key set. */
export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
  if (!client) client = new Stripe(key);
  return client;
}

export function stripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export interface CheckoutLine {
  name: string;
  priceAed: number;
  qty: number;
}

/**
 * Create a hosted Stripe Checkout Session for a card order. Card data never
 * touches our servers. Amounts are converted to fils (AED minor unit).
 */
export async function createCheckoutSession(params: {
  orderId: string;
  items: CheckoutLine[];
  shippingAed: number;
  origin: string;
}): Promise<{ id: string; url: string }> {
  const stripe = getStripe();

  const lines = [...params.items];
  if (params.shippingAed > 0) {
    lines.push({ name: "Delivery", priceAed: params.shippingAed, qty: 1 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: lines.map((i) => ({
      quantity: i.qty,
      price_data: {
        currency: "aed",
        unit_amount: Math.round(i.priceAed * 100),
        product_data: { name: i.name },
      },
    })),
    // Reconciled back to the order by the webhook.
    client_reference_id: params.orderId,
    metadata: { orderId: params.orderId },
    success_url: `${params.origin}/thank-you?order=${params.orderId}`,
    cancel_url: `${params.origin}/checkout`,
  });

  if (!session.url) throw new Error("Stripe did not return a checkout URL");
  return { id: session.id, url: session.url };
}
