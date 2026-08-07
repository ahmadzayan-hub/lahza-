import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Locale = "en" | "ar";

type Dict = Record<string, { en: string; ar: string }>;

// Bilingual dictionary. Arabic renders in Alexandria via the RTL rule and is
// written in clean Arabic (no inline English words inside Arabic sentences).
const DICT: Dict = {
  "brand.tagline": {
    en: "Elegant fashion accessories and gift-ready pieces in UAE",
    ar: "إكسسوارات وهدايا أنيقة في الإمارات",
  },
  "hero.title": {
    en: "Elegant accessories, made for everyday and gifting",
    ar: "إكسسوارات أنيقة للإطلالة اليومية والهدايا",
  },
  "hero.subtitle": {
    en: "Soft Arabic-inspired designs, quick WhatsApp ordering, delivery across the UAE.",
    ar: "تصاميم عربية ناعمة، طلب سريع عبر واتساب وتوصيل داخل الإمارات.",
  },
  "hero.cta.shop": { en: "Shop now", ar: "تسوّقي الآن" },
  "hero.cta.whatsapp": { en: "Order on WhatsApp", ar: "اطلبي عبر واتساب" },

  "nav.shop": { en: "Shop", ar: "تسوّقي" },
  "nav.cart": { en: "Cart", ar: "السلة" },
  "nav.about": { en: "About", ar: "من نحن" },
  "nav.contact": { en: "Contact", ar: "تواصل" },

  "app.install": { en: "Install the app", ar: "ثبّتي التطبيق" },
  "app.iosHint": {
    en: "Tap Share, then Add to Home Screen.",
    ar: "اضغطي زر المشاركة ثم «إضافة إلى الشاشة الرئيسية».",
  },
  "app.bannerTitle": { en: "Beyond Style app", ar: "تطبيق بيوند ستايل" },
  "app.bannerSubtitle": {
    en: "Faster shopping, works offline.",
    ar: "تسوّق أسرع، ويعمل دون اتصال بالإنترنت.",
  },
  "app.section.title": { en: "Shop from your home screen", ar: "تسوّقي من شاشتك الرئيسية" },
  "app.section.subtitle": {
    en: "Install Beyond Style as an app for one-tap access, faster loading, and offline browsing.",
    ar: "ثبّتي بيوند ستايل كتطبيق للوصول بلمسة واحدة، وتحميل أسرع، وتصفّح دون اتصال.",
  },

  "cart.empty": { en: "Your cart is empty", ar: "سلتك فارغة" },
  "cart.subtotal": { en: "Subtotal", ar: "المجموع" },
  "cart.checkout": { en: "Checkout", ar: "إتمام الطلب" },
  "cart.addToCart": { en: "Add to cart", ar: "أضيفي للسلة" },
  "cart.askWhatsApp": { en: "Ask on WhatsApp", ar: "اسألي عبر واتساب" },
  "cart.pairOffer": {
    en: "2 bracelets for AED 129",
    ar: "قطعتان بـ ١٢٩ درهماً",
  },

  "ship.unlock": {
    en: "Add {amount} to unlock free delivery in Dubai",
    ar: "أضيفي {amount} للحصول على توصيل مجاني داخل دبي",
  },
  "ship.unlocked": {
    en: "Free delivery in Dubai unlocked",
    ar: "تم تفعيل التوصيل المجاني داخل دبي",
  },
  "ship.note": {
    en: "Free delivery in Dubai for orders above AED 200. Outside Dubai: shipping calculated by area.",
    ar: "توصيل مجاني داخل دبي للطلبات فوق ٢٠٠ درهم. خارج دبي: يُحتسب التوصيل حسب المنطقة.",
  },

  "badge.new": { en: "New arrival", ar: "وصل حديثاً" },
  "badge.gift": { en: "Gift ready", ar: "جاهز للإهداء" },
  "badge.uae": { en: "Available in UAE", ar: "متوفر في الإمارات" },

  "pdp.care": { en: "Care instructions", ar: "العناية بالقطعة" },
  "pdp.care.text": {
    en: "To keep the piece beautiful, avoid direct contact with water and perfume, and store away from humidity.",
    ar: "للحفاظ على القطعة، تجنبي الماء والعطور المباشرة واحفظيها بعيداً عن الرطوبة.",
  },
  "pdp.reviews": { en: "Customer reviews", ar: "آراء العملاء" },
  "pdp.reviewsEmpty": {
    en: "No reviews yet — be the first to review.",
    ar: "لا توجد تقييمات بعد — كوني أول من تقيّم.",
  },

  "pay.cod": { en: "Cash on Delivery", ar: "الدفع عند الاستلام" },
  "pay.card": { en: "Card", ar: "بطاقة" },
  "pay.note": {
    en: "Prices include VAT where applicable.",
    ar: "الأسعار تشمل ضريبة القيمة المضافة عند الاقتضاء.",
  },

  "footer.company": {
    en: "Beyond Style UAE is operated by BEYOND CONNECT GENERAL TRADING L.L.C",
    ar: "Beyond Style UAE علامة تابعة لشركة بيوند كونكت للتجارة العامة ذ.م.م",
  },
  "footer.license": { en: "Trade License No. 1498624 — Dubai, UAE", ar: "رخصة تجارية رقم 1498624 — دبي، الإمارات" },

  "page.about.title": { en: "About us", ar: "من نحن" },
  "page.shipping.title": { en: "Shipping policy", ar: "سياسة التوصيل" },
  "page.returns.title": { en: "Returns & exchange", ar: "الاستبدال والاسترجاع" },
  "page.payment.title": { en: "Payment methods", ar: "طرق الدفع" },
  "page.privacy.title": { en: "Privacy policy", ar: "سياسة الخصوصية" },
  "page.terms.title": { en: "Terms & conditions", ar: "شروط الاستخدام" },
  "page.contact.title": { en: "Contact us", ar: "تواصل معنا" },
};

interface I18nValue {
  locale: Locale;
  dir: "ltr" | "rtl";
  setLocale: (l: Locale) => void;
  t: (key: keyof typeof DICT, vars?: Record<string, string>) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(
    () => (localStorage.getItem("locale") as Locale) || "ar",
  );

  const dir = locale === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
    localStorage.setItem("locale", locale);
  }, [locale, dir]);

  const value = useMemo<I18nValue>(
    () => ({
      locale,
      dir,
      setLocale,
      t: (key, vars) => {
        let s = DICT[key]?.[locale] ?? String(key);
        if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, v);
        return s;
      },
    }),
    [locale, dir],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
