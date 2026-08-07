import { motion } from "framer-motion";
import { useCart, type CartItem } from "@/context/CartContext";
import { useI18n } from "@/lib/i18n";
import { formatAED } from "@/lib/utils";

/**
 * Mobile-only sticky Add-to-Cart bar for PDPs. Hidden on md+ where the inline
 * CTA is always visible. Animates up from the bottom.
 */
export function StickyAddToCart({
  item,
  price,
}: {
  item: Omit<CartItem, "qty">;
  price: number;
}) {
  const { add } = useCart();
  const { t, locale } = useI18n();

  return (
    <motion.div
      className="fixed inset-x-0 bottom-0 z-50 border-t border-gold/20 bg-ink/95 p-3 backdrop-blur-md md:hidden"
      initial={{ y: 80 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
    >
      <div className="mx-auto flex max-w-5xl items-center gap-3">
        <span className="font-display text-lg gold-text">
          {formatAED(price, locale === "ar" ? "ar-AE" : "en-AE")}
        </span>
        <button className="gold-cta flex-1" onClick={() => add(item)}>
          {t("cart.addToCart")}
        </button>
      </div>
    </motion.div>
  );
}
