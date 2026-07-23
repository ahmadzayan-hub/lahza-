import { Link } from "react-router-dom";
import { ShieldCheck, Mail, Phone, Instagram } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";
import { BRAND } from "@/lib/brand";
import { BrandMark } from "./BrandMark";

export function Footer() {
  const { t } = useI18n();

  const explore = [
    { to: "/customize", key: "nav.customize" },
    { to: "/gallery", key: "nav.gallery" },
    { to: "/corporate", key: "nav.corporate" },
    { to: "/pricing", key: "nav.pricing" },
    { to: "/how-it-works", key: "nav.howItWorks" },
  ];
  const support = [
    { to: "/delivery", key: "nav.delivery" },
    { to: "/faq", key: "nav.faq" },
    { to: "/contact", key: "nav.contact" },
  ];
  const legal = [
    { to: "/privacy", key: "legal.privacy.title" },
    { to: "/terms", key: "legal.terms.title" },
    { to: "/refund", key: "legal.refund.title" },
  ];

  return (
    <footer className="no-print mt-16 border-t border-coffee-100 bg-coffee-700 text-cream-100">
      <div className="container-max py-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand + seller identity */}
          <div className="lg:col-span-2">
            <div className="[&_*]:!text-cream-50 [&_.text-gold-600]:!text-gold-400">
              <BrandMark />
            </div>
            <p className="mt-4 max-w-sm text-sm text-cream-100/80">{t("footer.tagline")}</p>

            <div className="mt-5 rounded-xl border border-cream-100/15 bg-white/5 p-4 text-xs text-cream-100/80">
              <div className="mb-1 flex items-center gap-1.5 font-semibold text-cream-50">
                <ShieldCheck className="h-4 w-4 text-gold-400" />
                {t("footer.sellerIdentity")}
              </div>
              <p className="font-medium text-cream-50">{BRAND.legalName}</p>
              <p>{BRAND.licenseAuthority}</p>
              <p>
                {t("footer.licence")}: {BRAND.licenseNumber} · {t("footer.trn")}: {BRAND.trn}
              </p>
              <p>{BRAND.address}</p>
            </div>
          </div>

          <FooterCol title={t("footer.explore")} items={explore} t={t} />
          <FooterCol title={t("footer.support")} items={support} t={t} />
          <FooterCol title={t("footer.legalHeading")} items={legal} t={t} />
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-cream-100/15 pt-6 text-xs text-cream-100/70 sm:flex-row sm:items-center sm:justify-between">
          <p>{t("footer.secureNote")}</p>
          <div className="flex items-center gap-4">
            <a href={`mailto:${BRAND.email}`} className="flex items-center gap-1.5 hover:text-cream-50">
              <Mail className="h-4 w-4" /> {BRAND.email}
            </a>
            <a href={`tel:${BRAND.phone.replace(/\s/g, "")}`} className="flex items-center gap-1.5 hover:text-cream-50">
              <Phone className="h-4 w-4" /> {BRAND.phone}
            </a>
            <a
              href={`https://instagram.com/${BRAND.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="hover:text-cream-50"
            >
              <Instagram className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-1 text-xs text-cream-100/60 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} {BRAND.legalName}. {t("footer.rights")}</p>
          <p>{t("footer.madeIn")}</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  items,
  t,
}: {
  title: string;
  items: { to: string; key: string }[];
  t: (k: string) => string;
}) {
  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-wider text-gold-400">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm">
        {items.map((i) => (
          <li key={i.to}>
            <Link to={i.to} className="text-cream-100/80 transition hover:text-cream-50">
              {t(i.key)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
