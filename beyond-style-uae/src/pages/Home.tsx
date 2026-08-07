import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Gift, MessageCircle, ShieldCheck, Truck } from "lucide-react";
import { api } from "@/lib/api";
import { SAMPLE_PRODUCTS } from "@/lib/sample-data";
import { ProductCard } from "@/components/ProductCard";
import { FadeIn } from "@/components/motion";
import { JsonLd, organizationJsonLd } from "@/components/JsonLd";
import { Seo } from "@/components/Seo";
import { InstallAppButton } from "@/components/InstallPrompt";
import { useI18n } from "@/lib/i18n";
import { whatsappLink } from "@/components/WhatsAppFab";
import type { ProductDTO } from "@/types";

export default function Home() {
  const { t, locale } = useI18n();
  const [products, setProducts] = useState<ProductDTO[]>(SAMPLE_PRODUCTS);

  useEffect(() => {
    api
      .listProducts()
      .then((rows) => rows.length && setProducts(rows))
      .catch(() => {/* keep sample data */});
  }, []);

  const featured = products[0];
  const restProducts = products.slice(1);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Seo
        title={
          locale === "ar"
            ? "بيوند ستايل الإمارات — إكسسوارات أنيقة وهدايا"
            : "Beyond Style UAE — Elegant accessories & gifts"
        }
        description={
          locale === "ar"
            ? "إكسسوارات وأساور أنيقة بلمسة ذهبية وفضية وقطع جاهزة للإهداء. توصيل داخل الإمارات، الدفع عند الاستلام والبطاقة."
            : "Elegant accessories and gift-ready pieces with gold-tone and silver-tone finishes. Delivery across the UAE, Cash on Delivery and card."
        }
        path="/"
      />
      <JsonLd data={organizationJsonLd} />

      {/* 1. Hero */}
      <FadeIn className="mb-14 text-center">
        <h1 className="font-display text-3xl md:text-5xl">
          <span className="gold-text">{t("hero.title")}</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-cream/70">{t("hero.subtitle")}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/cart" className="gold-cta">{t("hero.cta.shop")}</Link>
          <a
            href={whatsappLink(locale === "ar" ? "مرحباً، أريد الاستفسار" : "Hi, I'd like to ask")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-gold/30 px-6 py-3 text-sm text-gold hover:bg-gold/10"
          >
            <MessageCircle size={16} /> {t("hero.cta.whatsapp")}
          </a>
        </div>
      </FadeIn>

      {/* 2. Best sellers */}
      <SectionTitle>{locale === "ar" ? "الأكثر مبيعاً" : "Best sellers"}</SectionTitle>
      <div className="mb-14 grid grid-cols-2 gap-4 md:grid-cols-3">
        {products.slice(0, 6).map((p, i) => (
          <FadeIn key={p.id} delay={i * 0.05}>
            <ProductCard product={p} />
          </FadeIn>
        ))}
      </div>

      {/* 3. Masha'Allah pair-offer feature */}
      {featured && (
        <FadeIn>
          <section className="mb-14 grid items-center gap-6 rounded-2xl border border-gold/20 bg-ink/60 p-6 md:grid-cols-2">
            <div>
              <p className="mb-2 text-xs uppercase tracking-wider text-gold">
                {locale === "ar" ? "عرض مميز" : "Featured offer"}
              </p>
              <h2 className="font-display text-2xl text-cream">
                {locale === "ar" ? featured.titleAr : featured.titleEn}
              </h2>
              <p className="mt-2 text-cream/70">
                {locale === "ar"
                  ? "قطعة واحدة بـ ٧٩ درهماً، أو قطعتان بـ ١٢٩ درهماً."
                  : "One bracelet AED 79, or two bracelets for AED 129."}
              </p>
              <Link to={`/product/${featured.slug}`} className="gold-cta mt-5 inline-block">
                {t("cart.addToCart")}
              </Link>
            </div>
            <img
              src={`https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ?? "demo"}/image/upload/f_auto,q_auto,w_800,c_fill/${featured.cloudinaryIds[0]}`}
              alt={featured.titleEn}
              className="aspect-square w-full rounded-xl object-cover"
            />
          </section>
        </FadeIn>
      )}

      {/* 4. Gift-ready */}
      <SectionTitle>{locale === "ar" ? "جاهز للإهداء" : "Gift ready"}</SectionTitle>
      <div className="mb-14 grid grid-cols-2 gap-4 md:grid-cols-3">
        {restProducts.slice(0, 3).map((p, i) => (
          <FadeIn key={p.id} delay={i * 0.05}>
            <ProductCard product={p} />
          </FadeIn>
        ))}
      </div>

      {/* 5. How to order */}
      <SectionTitle>{locale === "ar" ? "كيف تطلبين" : "How to order"}</SectionTitle>
      <ol className="mb-14 grid gap-4 md:grid-cols-3">
        {[
          locale === "ar" ? "اختاري التصميم من الموقع" : "Pick the design",
          locale === "ar" ? "أدخلي بياناتك ومنطقة التوصيل" : "Enter your details and area",
          locale === "ar" ? "نؤكد الطلب عبر واتساب" : "We confirm by WhatsApp",
        ].map((step, i) => (
          <li key={i} className="rounded-xl border border-gold/15 p-4 text-sm text-cream/80">
            <span className="gold-text font-display text-2xl">{i + 1}</span>
            <p className="mt-2">{step}</p>
          </li>
        ))}
      </ol>

      {/* 5b. Install the app (PWA) — only rendered when installable */}
      <FadeIn>
        <section className="mb-14 flex flex-col items-center gap-3 rounded-2xl border border-gold/20 bg-gradient-to-b from-ink to-ink/40 p-8 text-center">
          <h2 className="font-display text-xl gold-text">{t("app.section.title")}</h2>
          <p className="max-w-md text-sm text-cream/70">{t("app.section.subtitle")}</p>
          <InstallAppButton />
        </section>
      </FadeIn>

      {/* 6. Trust */}
      <FadeIn>
        <section className="grid gap-4 rounded-2xl border border-gold/15 bg-ink/60 p-6 md:grid-cols-3">
          <TrustItem
            icon={Truck}
            label={locale === "ar" ? "توصيل داخل الإمارات" : "Delivery across UAE"}
            note={locale === "ar" ? "مجاني داخل دبي فوق ٢٠٠ درهم" : "Free in Dubai over AED 200"}
          />
          <TrustItem
            icon={ShieldCheck}
            label={locale === "ar" ? "دفع آمن" : "Secure payment"}
            note={locale === "ar" ? "بطاقة عبر Stripe أو الدفع عند الاستلام" : "Card via Stripe or Cash on Delivery"}
          />
          <TrustItem
            icon={Gift}
            label={locale === "ar" ? "تغليف هدايا" : "Gift packaging"}
            note={locale === "ar" ? "متوفر حسب المخزون" : "Available subject to stock"}
          />
        </section>
      </FadeIn>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-4 font-display text-xl gold-text">{children}</h2>;
}

function TrustItem({
  icon: Icon,
  label,
  note,
}: {
  icon: typeof Truck;
  label: string;
  note: string;
}) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <Icon className="mt-0.5 shrink-0 text-gold" size={20} />
      <div>
        <p className="text-cream/90">{label}</p>
        <p className="text-xs text-cream/50">{note}</p>
      </div>
    </div>
  );
}
