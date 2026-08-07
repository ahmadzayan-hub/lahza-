import type { ProductDTO, ReviewDTO } from "@/types";

// Real product mix derived from the supplier catalogues:
// stainless-steel bracelets with gold-tone or silver-tone finish, plus
// Arabic-calligraphy plates (Masha'Allah), hamsa and evil-eye charms.
//
// Pricing follows the agreed retail rule: supplier USD × 10 = AED retail.
// Compliance: no "real gold", "anti-tarnish", "handmade", etc. — we use
// "gold-tone" / "silver-tone" wording on every piece.
export const SAMPLE_PRODUCTS: ProductDTO[] = [
  {
    id: "p1",
    slug: "mashallah-bracelet-black",
    titleEn: "Masha'Allah Bracelet — Black",
    titleAr: "سوار ما شاء الله — أسود",
    descriptionEn:
      "Elegant bracelet with Arabic Masha'Allah lettering on a black mesh band. Gift-ready fashion accessory.",
    descriptionAr:
      "سوار أنيق بكتابة (ما شاء الله) العربية على شريط أسود ناعم. إكسسوار مناسب للإطلالة اليومية وكهدية.",
    priceAed: "79.00",
    compareAtAed: null,
    material: "Stainless steel, gold-tone plating",
    cloudinaryIds: ["beyond-style/mashallah-bracelet-black"],
    stock: 60,
    ratingAvg: "0",
    ratingCount: 0,
  },
  {
    id: "p2",
    slug: "mashallah-bracelet-silver",
    titleEn: "Masha'Allah Bracelet — Silver-tone",
    titleAr: "سوار ما شاء الله — فضي اللون",
    descriptionEn:
      "Stainless steel Masha'Allah lettering bracelet in silver-tone with a hamsa and evil-eye charm.",
    descriptionAr:
      "سوار ستانلس ستيل بكتابة (ما شاء الله) باللون الفضي مع تعليقة الكف والعين.",
    priceAed: "89.00",
    compareAtAed: null,
    material: "Stainless steel, silver-tone",
    cloudinaryIds: ["beyond-style/mashallah-bracelet-silver"],
    stock: 40,
    ratingAvg: "0",
    ratingCount: 0,
  },
  {
    id: "p3",
    slug: "hamsa-charm-bracelet",
    titleEn: "Hamsa Charm Bracelet",
    titleAr: "سوار تعليقة الكف",
    descriptionEn:
      "Delicate gold-tone bracelet with a hamsa palm charm. Pairs well with the Masha'Allah piece.",
    descriptionAr: "سوار ذهبي اللون بتعليقة الكف، يتناسب مع سوار ما شاء الله.",
    priceAed: "69.00",
    compareAtAed: null,
    material: "Stainless steel, gold-tone plating",
    cloudinaryIds: ["beyond-style/hamsa-charm-bracelet"],
    stock: 50,
    ratingAvg: "0",
    ratingCount: 0,
  },
  {
    id: "p4",
    slug: "evil-eye-bracelet",
    titleEn: "Evil Eye Bracelet",
    titleAr: "سوار العين الزرقاء",
    descriptionEn:
      "Stainless steel bracelet with a blue evil-eye charm. Gold-tone finish, gift-ready.",
    descriptionAr: "سوار ستانلس ستيل بتعليقة العين الزرقاء وبلون ذهبي.",
    priceAed: "59.00",
    compareAtAed: null,
    material: "Stainless steel, gold-tone plating",
    cloudinaryIds: ["beyond-style/evil-eye-bracelet"],
    stock: 70,
    ratingAvg: "0",
    ratingCount: 0,
  },
  {
    id: "p5",
    slug: "cuban-link-bracelet",
    titleEn: "Cuban Link Bracelet",
    titleAr: "سوار سلسلة كوبان",
    descriptionEn:
      "Bold Cuban-link bracelet in gold-tone stainless steel. Statement piece for stacking.",
    descriptionAr: "سوار بتصميم سلسلة كوبان ستانلس ستيل بلون ذهبي للتنسيق مع باقي القطع.",
    priceAed: "99.00",
    compareAtAed: null,
    material: "Stainless steel, gold-tone plating",
    cloudinaryIds: ["beyond-style/cuban-link-bracelet"],
    stock: 35,
    ratingAvg: "0",
    ratingCount: 0,
  },
  {
    id: "p6",
    slug: "crystal-mesh-bracelet",
    titleEn: "Crystal Mesh Bracelet",
    titleAr: "سوار الكريستال الناعم",
    descriptionEn:
      "Slim mesh bracelet with a row of inlaid crystals. Gold-tone finish, elegant for daily wear.",
    descriptionAr: "سوار ناعم بصف من الكريستال، بلون ذهبي ومناسب للاستخدام اليومي.",
    priceAed: "109.00",
    compareAtAed: null,
    material: "Stainless steel, gold-tone plating",
    cloudinaryIds: ["beyond-style/crystal-mesh-bracelet"],
    stock: 30,
    ratingAvg: "0",
    ratingCount: 0,
  },
];

/**
 * Pair offer eligibility — buying two of the same qualifying piece drops the
 * subtotal for that line to the pair price. Aligned with the active campaign:
 * one bracelet AED 79, two bracelets AED 129.
 */
export const PAIR_OFFERS: Record<string, { qty: number; priceAed: number }> = {
  p1: { qty: 2, priceAed: 129 },
};

// No fake reviews. The site shows real reviews only — when none exist, the UI
// reads "Be the first to review". Keep this seed empty intentionally.
export const SAMPLE_REVIEWS: ReviewDTO[] = [];
