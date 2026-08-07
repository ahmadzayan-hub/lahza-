import { z } from "zod";

/**
 * UAE advertising compliance for a fashion-accessory store. We never imply
 * precious-metal content or unverifiable durability/origin claims. Marketing
 * copy uses neutral wording — "gold-tone", "silver-tone", "stainless steel",
 * "fashion accessory" — and material must say "stainless steel" or "plated".
 */
const FORBIDDEN_PATTERNS: { label: string; re: RegExp }[] = [
  { label: "Real Gold", re: /\breal\s+gold\b/i },
  { label: "Solid Gold", re: /\bsolid\s+gold\b/i },
  { label: "karat (e.g. 18k/24k)", re: /\b\d{1,2}\s?k(arat)?\b/i },
  { label: "Pure Gold", re: /\bpure\s+gold\b/i },
  { label: "Genuine Gold", re: /\bgenuine\s+gold\b/i },
  { label: "Real Silver", re: /\breal\s+silver\b/i },
  { label: "Sterling Silver", re: /\bsterling\s+silver\b/i },
  { label: "Hallmarked", re: /\bhallmark(ed)?\b/i },
  { label: "Anti-tarnish / Tarnish-free", re: /\b(anti[-\s]?tarnish|tarnish[-\s]?(free|proof))\b/i },
  { label: "Waterproof", re: /\bwaterproof\b/i },
  { label: "Handmade", re: /\bhand[-\s]?made\b/i },
  { label: "Premium gold plating", re: /\bpremium\s+gold\s+plating\b/i },
  { label: "Lifetime colour / guarantee", re: /\b(lifetime|guaranteed)\s+(colou?r|finish|plating|gold|warranty)\b/i },
  { label: "Luxury jewellery / jewelry", re: /\bluxury\s+(jewell?ery|gold)\b/i },
];

function findForbidden(text: string): string | null {
  for (const { label, re } of FORBIDDEN_PATTERNS) {
    if (re.test(text)) return label;
  }
  return null;
}

const compliantText = (field: string) =>
  z.string().min(1).superRefine((val, ctx) => {
    const hit = findForbidden(val);
    if (hit) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${field} contains the misleading term "${hit}". Use "Gold-tone plated" terminology instead.`,
      });
    }
  });

export const REQUIRED_MATERIAL = "Stainless steel, gold-tone plating";

// The material field must mention either stainless steel or "plated" so it
// stays factual (a fashion accessory, not implied precious metal).
const MATERIAL_OK = (m: string) => /stainless\s+steel|plated/i.test(m);

export const productInputSchema = z
  .object({
    slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "slug must be kebab-case"),
    titleEn: compliantText("titleEn"),
    titleAr: compliantText("titleAr"),
    descriptionEn: compliantText("descriptionEn"),
    descriptionAr: compliantText("descriptionAr"),
    priceAed: z.number().positive(),
    compareAtAed: z.number().positive().optional(),
    material: z.string().default(REQUIRED_MATERIAL),
    cloudinaryIds: z.array(z.string().min(1)).min(1),
    stock: z.number().int().min(0).default(0),
  })
  .refine((p) => MATERIAL_OK(p.material), {
    path: ["material"],
    message: `material must say "stainless steel" or "plated", e.g. "${REQUIRED_MATERIAL}".`,
  })
  .refine((p) => !p.compareAtAed || p.compareAtAed > p.priceAed, {
    path: ["compareAtAed"],
    message: "compareAtAed must be greater than priceAed.",
  });

export type ProductInput = z.infer<typeof productInputSchema>;

// Partial schema for admin edits. Text fields stay compliance-checked; if a
// new material is provided it must still use plated terminology.
export const productUpdateSchema = z
  .object({
    titleEn: compliantText("titleEn"),
    titleAr: compliantText("titleAr"),
    descriptionEn: compliantText("descriptionEn"),
    descriptionAr: compliantText("descriptionAr"),
    priceAed: z.number().positive(),
    compareAtAed: z.number().positive().nullable(),
    material: z.string().refine(MATERIAL_OK, {
      message: `material must say "stainless steel" or "plated", e.g. "${REQUIRED_MATERIAL}".`,
    }),
    stock: z.number().int().min(0),
    active: z.boolean(),
  })
  .partial();

export type ProductUpdate = z.infer<typeof productUpdateSchema>;

export const orderInputSchema = z.object({
  customerName: z.string().min(2),
  phone: z.string().regex(/^\+9715\d{8}$/, "phone must be a UAE mobile in E.164 (+9715XXXXXXXX)"),
  emirate: z.enum([
    "Abu Dhabi",
    "Dubai",
    "Sharjah",
    "Ajman",
    "Umm Al Quwain",
    "Ras Al Khaimah",
    "Fujairah",
  ]),
  addressLine: z.string().min(5),
  paymentMethod: z.enum(["cod", "card"]),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        qty: z.number().int().positive(),
        priceAed: z.number().positive(),
      }),
    )
    .min(1),
});

export type OrderInput = z.infer<typeof orderInputSchema>;

// Admin order fulfilment transitions. Excludes the pending_* states, which are
// only set by the system (COD intake / Stripe webhook), never set manually.
export const orderStatusUpdateSchema = z.object({
  status: z.enum(["confirmed", "dispatched", "delivered", "cancelled"]),
});

export type OrderStatusUpdate = z.infer<typeof orderStatusUpdateSchema>;
