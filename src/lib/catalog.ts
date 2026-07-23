import type { EmirateId } from "./brand";

type L = { en: string; ar: string };

export interface GiftPackage {
  id: string;
  name: L;
  price: number; // AED, VAT-inclusive
  tag?: "popular";
  includes: L[];
}

// Consumer prices sit in the benchmarked AED 75-250 band, VAT-inclusive.
export const GIFT_PACKAGES: GiftPackage[] = [
  {
    id: "moment",
    name: { en: "The Moment", ar: "اللحظة" },
    price: 89,
    includes: [
      { en: "1 personalised photo cup", ar: "كوب واحد مخصّص بالصورة" },
      { en: "Custom printed sleeve", ar: "غلاف مطبوع مخصّص" },
      { en: "Gift card with your message", ar: "بطاقة إهداء برسالتك" },
    ],
  },
  {
    id: "keepsake",
    name: { en: "The Keepsake", ar: "التذكار" },
    price: 149,
    tag: "popular",
    includes: [
      { en: "2 personalised photo cups", ar: "كوبان مخصّصان بالصورة" },
      { en: "Premium keepsake gift box", ar: "علبة هدية تذكارية فاخرة" },
      { en: "Printed sleeve & gift card", ar: "غلاف مطبوع وبطاقة إهداء" },
      { en: "Artisan coffee sachets", ar: "أكياس قهوة مختصّة" },
    ],
  },
  {
    id: "signature",
    name: { en: "The Signature", ar: "التوقيع" },
    price: 229,
    includes: [
      { en: "Luxury photo gift box", ar: "علبة هدية فاخرة بالصورة" },
      { en: "Personalised cups & sleeves", ar: "أكواب وأغلفة مخصّصة" },
      { en: "Speciality coffee + dates selection", ar: "قهوة مختصّة وتشكيلة تمور" },
      { en: "Hand-tied ribbon & wax seal", ar: "شريطة مربوطة يدوياً وختم شمعي" },
      { en: "Arabic calligraphy option", ar: "خيار الخط العربي" },
    ],
  },
];

export interface EventPackage {
  id: string;
  name: L;
  price: number; // AED, excl. VAT (B2B)
  cups: number;
  tag?: "popular";
  includes: L[];
}

// A market gap: transparent, published day-rate event station packages.
export const EVENT_PACKAGES: EventPackage[] = [
  {
    id: "halfday",
    name: { en: "Half-Day Station", ar: "ركن نصف يوم" },
    price: 2500,
    cups: 150,
    includes: [
      { en: "4 hours · 1 barista", ar: "٤ ساعات · باريستا واحد" },
      { en: "Live selfie-coffee printing", ar: "طباعة قهوة سيلفي مباشرة" },
      { en: "Branded cups & sleeves", ar: "أكواب وأغلفة بهويتكم" },
    ],
  },
  {
    id: "fullday",
    name: { en: "Full-Day Station", ar: "ركن يوم كامل" },
    price: 4200,
    cups: 300,
    tag: "popular",
    includes: [
      { en: "8 hours · 2 baristas", ar: "٨ ساعات · باريستا اثنان" },
      { en: "Live selfie-coffee + latte art", ar: "قهوة سيلفي مباشرة وفن لاتيه" },
      { en: "Branded cups, sleeves & backdrop", ar: "أكواب وأغلفة وخلفية بهويتكم" },
      { en: "Custom digital gallery", ar: "معرض رقمي مخصّص" },
    ],
  },
  {
    id: "premium",
    name: { en: "Premium Activation", ar: "تفعيل بريميوم" },
    price: 7500,
    cups: 600,
    includes: [
      { en: "Full-day · 3 baristas", ar: "يوم كامل · ٣ باريستا" },
      { en: "Dual stations, high throughput", ar: "ركنان بسعة عالية" },
      { en: "Bespoke booth & branding", ar: "منصّة وهوية مصمّمة خصيصاً" },
      { en: "On-site brand manager", ar: "مدير علامة في الموقع" },
    ],
  },
];

export interface BulkTier {
  min: number;
  max?: number;
  price: number; // AED per unit, excl. VAT
}

export const BULK_TIERS: BulkTier[] = [
  { min: 25, max: 99, price: 72 },
  { min: 100, max: 249, price: 63 },
  { min: 250, max: 499, price: 55 },
  { min: 500, price: 48 },
];

// Delivery fees per Emirate (AED, VAT-inclusive).
export const DELIVERY_FEES: Record<EmirateId, number> = {
  dubai: 20,
  sharjah: 30,
  ajman: 35,
  abudhabi: 40,
  uaq: 40,
  rak: 45,
  fujairah: 45,
};

export interface GalleryItem {
  id: string;
  title: L;
  category: "personal" | "corporate" | "events";
  img: string; // bundled product mockup (webp) — never a blank tile
}

export const GALLERY: GalleryItem[] = [
  { id: "g1", title: { en: "Anniversary photo box", ar: "علبة صور ذكرى زواج" }, category: "personal", img: "/gallery/g1.webp" },
  { id: "g2", title: { en: "Newborn keepsake set", ar: "طقم تذكار مولود" }, category: "personal", img: "/gallery/g2.webp" },
  { id: "g3", title: { en: "Product launch station", ar: "ركن إطلاق منتج" }, category: "events", img: "/gallery/g3.webp" },
  { id: "g4", title: { en: "Bank staff appreciation", ar: "تقدير موظفي بنك" }, category: "corporate", img: "/gallery/g4.webp" },
  { id: "g5", title: { en: "Wedding majlis coffee", ar: "قهوة مجلس عرس" }, category: "events", img: "/gallery/g5.webp" },
  { id: "g6", title: { en: "Graduation gift", ar: "هدية تخرّج" }, category: "personal", img: "/gallery/g6.webp" },
  { id: "g7", title: { en: "Conference activation", ar: "تفعيل مؤتمر" }, category: "corporate", img: "/gallery/g7.webp" },
  { id: "g8", title: { en: "Eid gifting campaign", ar: "حملة هدايا العيد" }, category: "corporate", img: "/gallery/g8.webp" },
];

/** Sample "customer photos" used to fill previews so they're never blank. */
export const SAMPLE_PHOTOS = ["/samples/s1.webp", "/samples/s2.webp", "/samples/s3.webp", "/samples/s4.webp"];

