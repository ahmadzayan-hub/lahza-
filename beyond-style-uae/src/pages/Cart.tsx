import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useI18n } from "@/lib/i18n";
import { formatAED } from "@/lib/utils";
import { cld } from "@/lib/cloudinary";

export default function Cart() {
  const { items, subtotal, savings, shipping, total, setQty, remove } = useCart();
  const { t, locale } = useI18n();
  const fmt = (n: number) => formatAED(n, locale === "ar" ? "ar-AE" : "en-AE");

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-20 text-center">
        <p className="text-cream/60">{t("cart.empty")}</p>
        <Link to="/" className="gold-cta mt-6 inline-block">
          {t("nav.shop")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 font-display text-2xl gold-text">{t("nav.cart")}</h1>

      <ul className="space-y-4">
        {items.map((i) => (
          <li
            key={i.productId}
            className="flex items-center gap-4 rounded-xl border border-gold/15 p-3"
          >
            <img
              src={cld(i.cloudinaryId, { width: 120, crop: "fill" })}
              alt={locale === "ar" ? i.titleAr : i.titleEn}
              className="h-20 w-20 rounded-lg object-cover"
            />
            <div className="flex-1">
              <p className="font-display text-cream/90">
                {locale === "ar" ? i.titleAr : i.titleEn}
              </p>
              <p className="gold-text text-sm">{fmt(i.priceAed)}</p>
            </div>
            <input
              type="number"
              min={1}
              value={i.qty}
              onChange={(e) => setQty(i.productId, Math.max(1, Number(e.target.value)))}
              className="w-16 rounded-md border border-gold/20 bg-ink px-2 py-1 text-center text-cream"
            />
            <button
              onClick={() => remove(i.productId)}
              aria-label="Remove"
              className="text-cream/50 hover:text-gold"
            >
              <Trash2 size={18} />
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-8 space-y-2 border-t border-gold/15 pt-4 text-sm">
        <div className="flex justify-between">
          <span className="text-cream/70">{t("cart.subtotal")}</span>
          <span>{fmt(subtotal)}</span>
        </div>
        {savings > 0 && (
          <div className="flex justify-between text-gold">
            <span>{t("cart.pairOffer")}</span>
            <span>− {fmt(savings)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-cream/70">
            {locale === "ar" ? "التوصيل" : "Shipping"}
          </span>
          <span>{shipping.qualifies ? t("ship.unlocked") : fmt(shipping.shippingAed)}</span>
        </div>
        <p className="text-xs text-cream/40">{t("ship.note")}</p>
        <div className="flex justify-between text-lg font-semibold">
          <span>{locale === "ar" ? "الإجمالي" : "Total"}</span>
          <span className="gold-text">{fmt(total)}</span>
        </div>
        <p className="text-xs text-cream/40">{t("pay.note")}</p>
      </div>

      <Link to="/checkout" className="gold-cta mt-6 block text-center">
        {t("cart.checkout")}
      </Link>
    </div>
  );
}
