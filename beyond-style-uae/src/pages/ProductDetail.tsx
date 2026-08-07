import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { api } from "@/lib/api";
import { SAMPLE_PRODUCTS, SAMPLE_REVIEWS, PAIR_OFFERS } from "@/lib/sample-data";
import { cld, cldSrcSet } from "@/lib/cloudinary";
import { formatAED } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/context/CartContext";
import { track } from "@/lib/analytics";
import { JewelryCareBadge } from "@/components/JewelryCareBadge";
import { Reviews } from "@/components/Reviews";
import { StickyAddToCart } from "@/components/StickyAddToCart";
import { JsonLd, productJsonLd } from "@/components/JsonLd";
import { Seo } from "@/components/Seo";
import { FadeIn } from "@/components/motion";
import { whatsappLink } from "@/components/WhatsAppFab";
import type { ProductDTO, ReviewDTO } from "@/types";

export default function ProductDetail() {
  const { slug = "" } = useParams();
  const { locale, t } = useI18n();
  const { add } = useCart();

  const [product, setProduct] = useState<ProductDTO | null>(
    () => SAMPLE_PRODUCTS.find((p) => p.slug === slug) ?? null,
  );
  const [reviews, setReviews] = useState<ReviewDTO[]>(SAMPLE_REVIEWS);

  useEffect(() => {
    api
      .getProduct(slug)
      .then(({ product, reviews }) => {
        setProduct(product);
        setReviews(reviews);
      })
      .catch(() => {/* keep sample */});
  }, [slug]);

  useEffect(() => {
    if (product) track("view_item", { item_id: product.id, value: Number(product.priceAed) });
  }, [product]);

  if (!product) {
    return <div className="mx-auto max-w-5xl px-4 py-20 text-center text-cream/60">Not found.</div>;
  }

  const title = locale === "ar" ? product.titleAr : product.titleEn;
  const description = locale === "ar" ? product.descriptionAr : product.descriptionEn;
  const price = Number(product.priceAed);
  const ratingCount = product.ratingCount ?? 0;
  const ratingAvg = Number(product.ratingAvg ?? 0);
  const offer = PAIR_OFFERS[product.id];

  const cartItem = {
    productId: product.id,
    slug: product.slug,
    titleEn: product.titleEn,
    titleAr: product.titleAr,
    priceAed: price,
    cloudinaryId: product.cloudinaryIds[0],
  };

  const askMessage =
    locale === "ar"
      ? `مرحباً، أود الاستفسار عن: ${product.titleAr}`
      : `Hi, I'd like to ask about: ${product.titleEn}`;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 pb-28 md:pb-10">
      <Seo
        title={title}
        description={description.slice(0, 160)}
        path={`/product/${product.slug}`}
        type="product"
        image={cld(product.cloudinaryIds[0], { width: 1200 })}
      />
      <JsonLd
        data={productJsonLd({
          name: product.titleEn,
          description: product.descriptionEn,
          image: cld(product.cloudinaryIds[0], { width: 1200 }),
          price,
          sku: product.id,
          ratingValue: ratingCount > 0 ? ratingAvg : undefined,
          reviewCount: ratingCount > 0 ? ratingCount : undefined,
        })}
      />

      <div className="grid gap-8 md:grid-cols-2">
        <FadeIn>
          <div className="overflow-hidden rounded-2xl border border-gold/15 bg-white/5">
            <img
              src={cld(product.cloudinaryIds[0], { width: 800, crop: "fill" })}
              srcSet={cldSrcSet(product.cloudinaryIds[0], [480, 800, 1200])}
              sizes="(max-width: 768px) 100vw, 480px"
              alt={title}
              className="aspect-square w-full object-cover"
            />
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <h1 className="font-display text-3xl text-cream">{title}</h1>

          <div className="mt-3 flex flex-wrap gap-1.5">
            <Badge>{t("badge.new")}</Badge>
            <Badge>{t("badge.gift")}</Badge>
            <Badge>{t("badge.uae")}</Badge>
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="gold-text text-2xl font-semibold">
              {formatAED(price, locale === "ar" ? "ar-AE" : "en-AE")}
            </span>
            {product.compareAtAed && (
              <span className="text-cream/40 line-through">
                {formatAED(Number(product.compareAtAed), locale === "ar" ? "ar-AE" : "en-AE")}
              </span>
            )}
          </div>

          {offer && (
            <p className="mt-2 inline-block rounded-full bg-gold/15 px-3 py-1 text-xs text-gold">
              {t("cart.pairOffer")}
            </p>
          )}

          <p className="mt-4 text-cream/75">{description}</p>
          <p className="mt-2 text-sm text-gold/80">{product.material}</p>
          <p className="mt-1 text-xs text-cream/50">{t("pay.note")}</p>

          <div className="mt-6 hidden gap-3 md:flex">
            <button className="gold-cta flex-1" onClick={() => add(cartItem)}>
              {t("cart.addToCart")}
            </button>
            <a
              href={whatsappLink(askMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-gold/30 px-5 py-3 text-sm text-gold hover:bg-gold/10"
            >
              <MessageCircle size={16} /> {t("cart.askWhatsApp")}
            </a>
          </div>

          <div className="mt-6">
            <JewelryCareBadge />
          </div>
        </FadeIn>
      </div>

      <Reviews reviews={reviews} ratingAvg={ratingAvg} ratingCount={ratingCount} />

      <StickyAddToCart item={cartItem} price={price} />
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-gold/30 px-2 py-0.5 text-[10px] text-gold/90">
      {children}
    </span>
  );
}
