import { Hono, type MiddlewareHandler } from "hono";
import { cors } from "hono/cors";
import { zValidator } from "@hono/zod-validator";
import { and, desc, eq, inArray, like, or } from "drizzle-orm";
import { db, schema } from "@/db";
import {
  orderInputSchema,
  orderStatusUpdateSchema,
  productInputSchema,
  productUpdateSchema,
} from "@/schemas/product";
import { createOrder, InsufficientStockError, restockOrder } from "@/api/payment";
import { createCheckoutSession, getStripe, stripeConfigured } from "@/api/stripe";
import { audit, resolveActor } from "@/api/admin-auth";
import { sendAbandonedCartNudge } from "@/api/notify";

type Variables = { actor: string };

// Shared Hono app, reused by the local Node server (server.ts) and the
// Vercel serverless handler (api/[[...route]].ts). Routes keep the /api
// prefix so the same app matches in both environments.
export const app = new Hono<{ Variables: Variables }>();

app.use("/api/*", cors());

// Any unhandled exception (e.g. the database being unreachable) returns clean
// JSON instead of leaking a stack trace as a plain-text 500 — safer for a
// public API and keeps the client's JSON error parsing working.
app.onError((err, c) => {
  console.error("[api:error]", c.req.method, c.req.path, err instanceof Error ? err.message : err);
  return c.json({ error: "internal_error" }, 500);
});

// Resolves the admin actor from x-admin-token (multi-token aware) and stores
// it on the context so handlers can attribute audit-log entries.
const adminAuth: MiddlewareHandler<{ Variables: Variables }> = async (c, next) => {
  const actor = resolveActor(c.req.header("x-admin-token"));
  if (!actor) return c.json({ error: "unauthorized" }, 401);
  c.set("actor", actor);
  await next();
};

app.get("/api/health", (c) => c.json({ ok: true, stripe: stripeConfigured() }));

app.get("/api/products", async (c) => {
  const rows = await db.select().from(schema.products).where(eq(schema.products.active, true));
  return c.json(rows);
});

app.get("/api/products/:slug", async (c) => {
  const slug = c.req.param("slug");
  const [product] = await db
    .select()
    .from(schema.products)
    .where(eq(schema.products.slug, slug))
    .limit(1);
  if (!product) return c.json({ error: "not_found" }, 404);
  const productReviews = await db
    .select()
    .from(schema.reviews)
    .where(eq(schema.reviews.productId, product.id));
  return c.json({ product, reviews: productReviews });
});

// Checkout. COD → pending_verification + WhatsApp. Card → pending_payment plus
// a hosted Stripe Checkout Session whose URL the client redirects to.
app.post("/api/orders", zValidator("json", orderInputSchema), async (c) => {
  const input = c.req.valid("json");

  // Fail fast before reserving stock or creating an order we can't charge.
  if (input.paymentMethod === "card" && !stripeConfigured()) {
    return c.json({ error: "card_payments_unavailable" }, 503);
  }

  let order;
  try {
    order = await createOrder(input);
  } catch (err) {
    if (err instanceof InsufficientStockError) {
      return c.json({ error: "out_of_stock", productId: err.productId }, 409);
    }
    throw err;
  }

  if (input.paymentMethod === "card") {
    const ids = input.items.map((i) => i.productId);
    const products = ids.length
      ? await db.select().from(schema.products).where(inArray(schema.products.id, ids))
      : [];
    const nameById = new Map(products.map((p) => [p.id, p.titleEn]));

    const session = await createCheckoutSession({
      orderId: order.id,
      shippingAed: order.shippingAed,
      origin: c.req.header("origin") ?? process.env.PUBLIC_BASE_URL ?? "http://localhost:5173",
      items: input.items.map((i) => ({
        name: nameById.get(i.productId) ?? "Beyond Style item",
        priceAed: i.priceAed,
        qty: i.qty,
      })),
    });

    await db
      .update(schema.orders)
      .set({ stripeSessionId: session.id })
      .where(eq(schema.orders.id, order.id));

    return c.json({ ...order, checkoutUrl: session.url }, 201);
  }

  return c.json(order, 201);
});

// Stripe webhook — confirms the order once payment completes. Needs the raw
// request body for signature verification.
app.post("/api/stripe/webhook", async (c) => {
  const sig = c.req.header("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) return c.json({ error: "webhook_not_configured" }, 400);

  const payload = await c.req.text();
  let event;
  try {
    event = await getStripe().webhooks.constructEventAsync(payload, sig, secret);
  } catch {
    return c.json({ error: "invalid_signature" }, 400);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    await db
      .update(schema.orders)
      .set({ status: "confirmed" })
      .where(eq(schema.orders.stripeSessionId, session.id));
  }

  return c.json({ received: true });
});

// Abandoned-cart recovery beacon (from useAbandonedCart).
app.post("/api/abandoned-cart", async (c) => {
  const payload = await c.req.json().catch(() => ({}));
  await sendAbandonedCartNudge({
    items: Number(payload.items ?? 0),
    subtotal: Number(payload.subtotal ?? 0),
    contact: typeof payload.contact === "string" ? payload.contact : undefined,
  });
  return c.json({ queued: true });
});

// ---- Admin (x-admin-token) ----

app.get("/api/admin/products", adminAuth, async (c) => {
  const rows = await db.select().from(schema.products);
  return c.json(rows);
});

app.post("/api/admin/products", adminAuth, zValidator("json", productInputSchema), async (c) => {
  const input = c.req.valid("json");
  const id = crypto.randomUUID();
  await db.insert(schema.products).values({
    id,
    slug: input.slug,
    titleEn: input.titleEn,
    titleAr: input.titleAr,
    descriptionEn: input.descriptionEn,
    descriptionAr: input.descriptionAr,
    priceAed: input.priceAed.toFixed(2),
    compareAtAed: input.compareAtAed?.toFixed(2),
    material: input.material,
    cloudinaryIds: input.cloudinaryIds,
    stock: input.stock,
  });
  await audit(c.get("actor"), "product.create", id, { slug: input.slug });
  return c.json({ id }, 201);
});

app.patch(
  "/api/admin/products/:id",
  adminAuth,
  zValidator("json", productUpdateSchema),
  async (c) => {
    const id = c.req.param("id");
    const u = c.req.valid("json");
    await db
      .update(schema.products)
      .set({
        ...(u.titleEn !== undefined && { titleEn: u.titleEn }),
        ...(u.titleAr !== undefined && { titleAr: u.titleAr }),
        ...(u.descriptionEn !== undefined && { descriptionEn: u.descriptionEn }),
        ...(u.descriptionAr !== undefined && { descriptionAr: u.descriptionAr }),
        ...(u.priceAed !== undefined && { priceAed: u.priceAed.toFixed(2) }),
        ...(u.compareAtAed !== undefined && {
          compareAtAed: u.compareAtAed === null ? null : u.compareAtAed.toFixed(2),
        }),
        ...(u.material !== undefined && { material: u.material }),
        ...(u.stock !== undefined && { stock: u.stock }),
        ...(u.active !== undefined && { active: u.active }),
      })
      .where(eq(schema.products.id, id));
    await audit(c.get("actor"), "product.update", id, u);
    return c.json({ id });
  },
);

app.delete("/api/admin/products/:id", adminAuth, async (c) => {
  const id = c.req.param("id");
  await db.update(schema.products).set({ active: false }).where(eq(schema.products.id, id));
  await audit(c.get("actor"), "product.deactivate", id);
  return c.json({ id, active: false });
});

// Orders, newest first. Optional ?q= (name/phone/id) and ?status= filters.
app.get("/api/admin/orders", adminAuth, async (c) => {
  const q = c.req.query("q")?.trim();
  const status = c.req.query("status")?.trim();

  const filters = [];
  if (status) filters.push(eq(schema.orders.status, status as schema.Order["status"]));
  if (q) {
    const term = `%${q}%`;
    filters.push(
      or(
        like(schema.orders.customerName, term),
        like(schema.orders.phone, term),
        like(schema.orders.id, term),
      ),
    );
  }

  const rows = await db
    .select()
    .from(schema.orders)
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(desc(schema.orders.createdAt));
  return c.json(rows);
});

// Fulfilment transition. Cancelling restocks the reserved inventory once.
app.patch(
  "/api/admin/orders/:id/status",
  adminAuth,
  zValidator("json", orderStatusUpdateSchema),
  async (c) => {
    const id = c.req.param("id");
    const { status } = c.req.valid("json");

    const [order] = await db
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.id, id))
      .limit(1);
    if (!order) return c.json({ error: "not_found" }, 404);

    if (status === "cancelled" && order.status !== "cancelled") {
      await restockOrder(order.items);
    }

    await db.update(schema.orders).set({ status }).where(eq(schema.orders.id, id));
    await audit(c.get("actor"), "order.status", id, { from: order.status, to: status });
    return c.json({ id, status });
  },
);
