import {
  mysqlTable,
  varchar,
  int,
  decimal,
  timestamp,
  text,
  json,
  mysqlEnum,
  boolean,
} from "drizzle-orm/mysql-core";

export const products = mysqlTable("products", {
  id: varchar("id", { length: 36 }).primaryKey(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  titleEn: varchar("title_en", { length: 200 }).notNull(),
  titleAr: varchar("title_ar", { length: 200 }).notNull(),
  descriptionEn: text("description_en").notNull(),
  descriptionAr: text("description_ar").notNull(),
  // Stored in fils-free whole AED for simplicity; display formats via Intl
  priceAed: decimal("price_aed", { precision: 10, scale: 2 }).notNull(),
  compareAtAed: decimal("compare_at_aed", { precision: 10, scale: 2 }),
  // Compliance: material wording is constrained to plated terminology
  material: varchar("material", { length: 120 }).notNull().default("Gold-tone plated"),
  cloudinaryIds: json("cloudinary_ids").$type<string[]>().notNull(),
  stock: int("stock").notNull().default(0),
  ratingAvg: decimal("rating_avg", { precision: 3, scale: 2 }).notNull().default("0"),
  ratingCount: int("rating_count").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orders = mysqlTable("orders", {
  id: varchar("id", { length: 36 }).primaryKey(),
  customerName: varchar("customer_name", { length: 160 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  emirate: varchar("emirate", { length: 60 }).notNull(),
  addressLine: varchar("address_line", { length: 300 }).notNull(),
  paymentMethod: mysqlEnum("payment_method", ["cod", "card"]).notNull(),
  // COD orders are forced to pending_verification by the payment API.
  // Card orders start at pending_payment and flip to confirmed via the
  // Stripe webhook once checkout.session.completed arrives.
  status: mysqlEnum("status", [
    "pending_payment",
    "pending_verification",
    "confirmed",
    "dispatched",
    "delivered",
    "cancelled",
  ])
    .notNull()
    .default("pending_verification"),
  stripeSessionId: varchar("stripe_session_id", { length: 255 }),
  subtotalAed: decimal("subtotal_aed", { precision: 10, scale: 2 }).notNull(),
  shippingAed: decimal("shipping_aed", { precision: 10, scale: 2 }).notNull(),
  totalAed: decimal("total_aed", { precision: 10, scale: 2 }).notNull(),
  items: json("items").$type<{ productId: string; qty: number; priceAed: number }[]>().notNull(),
  verificationSentAt: timestamp("verification_sent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reviews = mysqlTable("reviews", {
  id: varchar("id", { length: 36 }).primaryKey(),
  productId: varchar("product_id", { length: 36 }).notNull(),
  author: varchar("author", { length: 120 }).notNull(),
  rating: int("rating").notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Append-only trail of admin mutations (who did what, when).
export const adminAudit = mysqlTable("admin_audit", {
  id: varchar("id", { length: 36 }).primaryKey(),
  actor: varchar("actor", { length: 120 }).notNull(),
  action: varchar("action", { length: 80 }).notNull(),
  target: varchar("target", { length: 120 }),
  detail: json("detail").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type Review = typeof reviews.$inferSelect;
export type AdminAudit = typeof adminAudit.$inferSelect;
