import { Link } from "react-router-dom";
import { ShoppingBag, Globe } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useI18n } from "@/lib/i18n";
import { ShippingBanner } from "@/components/ShippingBanner";
import { BrandLogo } from "@/components/BrandLogo";

export function Header() {
  const { count } = useCart();
  const { t, locale, setLocale } = useI18n();

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md">
      <ShippingBanner />
      <div className="border-b border-gold/15 bg-ink/90">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" aria-label="Beyond Style UAE — home">
            <BrandLogo size={30} />
          </Link>

          <nav className="flex items-center gap-4 text-sm">
            <Link to="/" className="text-cream/80 hover:text-gold transition-colors">
              {t("nav.shop")}
            </Link>
            <Link to="/about" className="hidden text-cream/80 hover:text-gold transition-colors sm:inline">
              {t("nav.about")}
            </Link>
            <Link to="/contact" className="hidden text-cream/80 hover:text-gold transition-colors sm:inline">
              {t("nav.contact")}
            </Link>
            <button
              onClick={() => setLocale(locale === "en" ? "ar" : "en")}
              className="flex items-center gap-1 text-cream/80 hover:text-gold transition-colors"
              aria-label="Toggle language"
            >
              <Globe size={16} />
              {locale === "en" ? "العربية" : "EN"}
            </button>
            <Link to="/cart" className="relative text-cream/90 hover:text-gold transition-colors" aria-label={t("nav.cart")}>
              <ShoppingBag size={20} />
              {count > 0 && (
                <span className="absolute -end-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-gold-gradient px-1 text-[10px] font-bold text-ink">
                  {count}
                </span>
              )}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
