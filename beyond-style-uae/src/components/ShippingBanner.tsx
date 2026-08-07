import { useCart } from "@/context/CartContext";
import { useI18n } from "@/lib/i18n";
import { formatAED } from "@/lib/utils";

/** Dubai free-shipping progress banner — explicit about the area. */
export function ShippingBanner() {
  const { shipping, subtotal } = useCart();
  const { t, locale } = useI18n();

  const pct = Math.min(100, (subtotal / (subtotal + shipping.remaining || 1)) * 100);

  return (
    <div className="border-b border-gold/20 bg-ink text-center text-sm">
      <div className="mx-auto max-w-5xl px-4 py-2">
        <p className="gold-text font-medium">
          {shipping.qualifies
            ? t("ship.unlocked")
            : t("ship.unlock", {
                amount: formatAED(shipping.remaining, locale === "ar" ? "ar-AE" : "en-AE"),
              })}
        </p>
        <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-gold-gradient transition-[width] duration-500"
            style={{ width: `${shipping.qualifies ? 100 : pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
