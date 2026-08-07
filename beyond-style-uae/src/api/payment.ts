import { randomUUID } from "node:crypto";
import { and, eq, gte, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import { computeShipping } from "@/lib/shipping";
import { sendWhatsApp } from "@/api/notify";
import type { OrderInput } from "@/schemas/product";

export interface CreatedOrder {
  id: string;
  status: schema.Order["status"];
  subtotalAed: number;
  shippingAed: number;
  totalAed: number;
}

/** Thrown when an item can't be reserved because stock is too low. */
export class InsufficientStockError extends Error {
  constructor(public productId: string) {
    super(`Insufficient stock for product ${productId}`);
    this.name = "InsufficientStockError";
  }
}

async function sendCodVerification(order: CreatedOrder, input: OrderInput): Promise<void> {
  const to = process.env.OPS_WHATSAPP_TO || input.phone;
  const message = `COD order ${order.id} for ${input.customerName} (${input.phone}) — ${order.totalAed} AED. Confirm before dispatch.`;
  await sendWhatsApp(to, message, "cod");
}

/**
 * Create an order. Server recomputes totals from item prices (never trusts the
 * client), reserves stock atomically (rejecting oversells), and forces COD into
 * pending_verification. Card orders start at pending_payment.
 */
export async function createOrder(input: OrderInput): Promise<CreatedOrder> {
  const subtotal = input.items.reduce((sum, i) => sum + i.priceAed * i.qty, 0);
  const { shippingAed } = computeShipping(subtotal);
  const total = subtotal + shippingAed;

  const id = randomUUID();
  const status: schema.Order["status"] =
    input.paymentMethod === "cod" ? "pending_verification" : "pending_payment";

  const created: CreatedOrder = {
    id,
    status,
    subtotalAed: subtotal,
    shippingAed,
    totalAed: total,
  };

  await db.transaction(async (tx) => {
    // Conditional decrement guarantees we never oversell under concurrency:
    // the WHERE stock >= qty fails to match (affectedRows = 0) when too low.
    for (const item of input.items) {
      const res = await tx
        .update(schema.products)
        .set({ stock: sql`${schema.products.stock} - ${item.qty}` })
        .where(and(eq(schema.products.id, item.productId), gte(schema.products.stock, item.qty)));
      if (res[0].affectedRows === 0) throw new InsufficientStockError(item.productId);
    }

    await tx.insert(schema.orders).values({
      id,
      customerName: input.customerName,
      phone: input.phone,
      emirate: input.emirate,
      addressLine: input.addressLine,
      paymentMethod: input.paymentMethod,
      status,
      subtotalAed: subtotal.toFixed(2),
      shippingAed: shippingAed.toFixed(2),
      totalAed: total.toFixed(2),
      items: input.items,
      verificationSentAt: input.paymentMethod === "cod" ? new Date() : null,
    });
  });

  // Side effects after the transaction commits.
  if (input.paymentMethod === "cod") await sendCodVerification(created, input);

  return created;
}

/** Return reserved stock to inventory (used when an order is cancelled). */
export async function restockOrder(items: schema.Order["items"]): Promise<void> {
  for (const item of items) {
    await db
      .update(schema.products)
      .set({ stock: sql`${schema.products.stock} + ${item.qty}` })
      .where(eq(schema.products.id, item.productId));
  }
}
