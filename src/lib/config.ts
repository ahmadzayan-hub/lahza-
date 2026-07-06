// Wasl — central config. Single source of truth for name, brand meta, URLs.
// Anything user-facing that is not a translated string lives here.

export const SITE = {
  name: "Wasl",
  nameArabic: "وصل",
  tagline: "Bilingual social-commerce operations console for UAE brands.",
  taglineArabic: "لوحة تشغيل تجاري ثنائية اللغة لمتاجر التواصل الاجتماعي في الإمارات.",
  description:
    "Wasl is a human-approved sales operating console. AI drafts, owner approves, the system tracks: leads, payments, delivery, inventory, disputes.",
  descriptionArabic:
    "وصل لوحة تشغيل مبيعات بموافقة المشغّل. الذكاء الاصطناعي يكتب المسودة، أنت توافق، والنظام يتابع: العملاء، الدفعات، التوصيل، المخزون، الشكاوى.",
  legalName: "Wasl Commerce Console",
  region: "United Arab Emirates",
  regionArabic: "الإمارات العربية المتحدة",
  currency: "AED",
  locales: ["en", "ar"] as const,
  defaultLocale: "en" as const,
  themeColorLight: "#fbf1f6",
  themeColorDark: "#20242b",
};

export type Locale = (typeof SITE.locales)[number];
