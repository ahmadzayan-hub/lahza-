import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { WHATSAPP_DISPLAY, whatsappLink } from "@/components/WhatsAppFab";
import { BrandGem } from "@/components/BrandLogo";

/** Trust footer — UAE compliance: company, trade license, contact, policies. */
export function Footer() {
  const { t, locale } = useI18n();

  const links: { to: string; key: Parameters<typeof t>[0] }[] = [
    { to: "/about", key: "page.about.title" },
    { to: "/shipping", key: "page.shipping.title" },
    { to: "/returns", key: "page.returns.title" },
    { to: "/payment-methods", key: "page.payment.title" },
    { to: "/contact", key: "page.contact.title" },
    { to: "/privacy", key: "page.privacy.title" },
    { to: "/terms", key: "page.terms.title" },
  ];

  return (
    <footer className="mt-16 border-t border-gold/15 bg-ink/95 text-cream/70">
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 md:grid-cols-3">
        <div>
          <p className="flex items-center gap-2 font-display text-lg">
            <BrandGem size={22} />
            <span className="gold-text">Beyond Style UAE</span>
          </p>
          <p className="mt-2 text-sm">{t("brand.tagline")}</p>
          <p className="mt-4 text-xs leading-relaxed">
            {t("footer.company")}
            <br />
            {t("footer.license")}
          </p>
        </div>

        <div>
          <p className="mb-2 text-xs uppercase tracking-wider text-cream/50">
            {locale === "ar" ? "روابط" : "Information"}
          </p>
          <ul className="space-y-1 text-sm">
            {links.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="hover:text-gold transition-colors">
                  {t(l.key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-2 text-xs uppercase tracking-wider text-cream/50">
            {locale === "ar" ? "تواصل" : "Contact"}
          </p>
          <a
            href={whatsappLink(locale === "ar" ? "مرحباً" : "Hello")}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm hover:text-gold"
          >
            WhatsApp · {WHATSAPP_DISPLAY}
          </a>
          <p className="mt-2 text-xs text-cream/50">
            {locale === "ar" ? "دبي، الإمارات العربية المتحدة" : "Dubai, United Arab Emirates"}
          </p>
        </div>
      </div>
      <p className="border-t border-white/5 py-4 text-center text-xs text-cream/40">
        © {new Date().getFullYear()} Beyond Style UAE
      </p>
    </footer>
  );
}
