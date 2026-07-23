import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Truck, ShieldCheck, Coffee } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";
import { Seo } from "@/components/Seo";
import { Section, SectionHeader } from "@/components/Section";
import { CustomerPaths } from "@/components/CustomerPaths";
import { TrustBar } from "@/components/TrustBar";
import { Reveal } from "@/components/Reveal";
import { ProductPreview } from "@/components/ProductPreview";
import { GALLERY, SAMPLE_PHOTOS } from "@/lib/catalog";
import { GalleryTile } from "@/components/GalleryTile";

export default function Home() {
  const { t, isRtl } = useI18n();

  return (
    <>
      <Seo title={t("nav.home")} description={t("hero.subtitle")} />

      {/* ---------------- Hero + 3 paths above the fold ---------------- */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-grain opacity-70">
          <div className="absolute -top-24 end-[-10%] h-96 w-96 rounded-full bg-gold-400/20 blur-3xl" />
          <div className="absolute top-40 start-[-10%] h-80 w-80 rounded-full bg-coffee-400/10 blur-3xl" />
        </div>

        <div className="container-max grid items-center gap-10 py-12 lg:grid-cols-2 lg:py-16">
          <div className="animate-fade-up">
            <span className="chip">
              <Sparkles className="h-3.5 w-3.5" /> {t("hero.badge")}
            </span>
            <h1 className="mt-4 font-serif text-4xl font-extrabold leading-tight text-coffee-900 sm:text-5xl lg:text-[3.4rem]">
              {t("hero.titleA")}{" "}
              <span className="relative whitespace-nowrap text-gold-500">
                {t("hero.titleHighlight")}
                <svg className="absolute -bottom-2 start-0 h-3 w-full" viewBox="0 0 200 12" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M2 7c40-6 80-6 120 0s60 3 76-1" fill="none" stroke="#D3A85A" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-coffee-600">{t("hero.subtitle")}</p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/customize" className="btn btn-primary">
                {t("hero.ctaPrimary")}
                <ArrowRight className={`h-4 w-4 ${isRtl ? "rotate-180" : ""}`} />
              </Link>
              <Link to="/gallery" className="btn btn-outline">
                {t("hero.ctaSecondary")}
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-coffee-500">
              <span className="flex items-center gap-1.5"><Truck className="h-4 w-4 text-gold-600" /> {t("hero.trustDelivery")}</span>
              <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-gold-600" /> {t("hero.trustSecure")}</span>
              <span className="flex items-center gap-1.5"><Coffee className="h-4 w-4 text-gold-600" /> {t("hero.trustMade")}</span>
            </div>
          </div>

          {/* Hero visual */}
          <div className="animate-fade-up [animation-delay:120ms]">
            <div className="relative mx-auto max-w-md">
              <div className="rounded-[2rem] border border-coffee-100 bg-cream-50 p-4 shadow-card">
                <ProductPreview image={null} surface="cup" placeholderImage={SAMPLE_PHOTOS[0]} sample />
              </div>
              <div className="absolute -start-3 top-8 rounded-2xl border border-coffee-100 bg-cream-50 px-3 py-2 shadow-soft">
                <div className="text-sm leading-none text-gold-500">★★★★★</div>
                <p className="mt-1 text-[11px] font-medium text-coffee-500">{t("trust.reviews")}</p>
              </div>
              <div className="absolute -end-3 bottom-10 rounded-2xl bg-coffee-700 px-3.5 py-2 text-cream-50 shadow-card">
                <p className="text-xs font-semibold">{t("hero.trustDelivery")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Three customer paths — above the fold */}
        <div className="container-max pb-4">
          <CustomerPaths />
        </div>
      </section>

      {/* ---------------- Trust ---------------- */}
      <Section muted className="!py-12">
        <TrustBar />
      </Section>

      {/* ---------------- Gallery preview ---------------- */}
      <Section>
        <SectionHeader eyebrow={t("nav.gallery")} title={t("home.galleryHeading")} subtitle={t("home.gallerySub")} />
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {GALLERY.slice(0, 4).map((g, i) => (
            <Reveal key={g.id} delay={i * 70}>
              <GalleryTile item={g} />
            </Reveal>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link to="/gallery" className="btn btn-outline">{t("common.viewAll")}</Link>
        </div>
      </Section>

      {/* ---------------- Corporate teaser ---------------- */}
      <Section muted>
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <Reveal>
            <div className="rounded-3xl bg-coffee-700 p-8 text-cream-50 shadow-card sm:p-10">
              <p className="eyebrow !text-gold-400">{t("nav.corporate")}</p>
              <h2 className="mt-2 font-serif text-3xl font-bold text-cream-50">{t("home.corpHeading")}</h2>
              <p className="mt-3 text-cream-100/85">{t("home.corpSub")}</p>
              <Link to="/corporate" className="btn btn-gold mt-6">
                {t("home.corpCta")} <ArrowRight className={`h-4 w-4 ${isRtl ? "rotate-180" : ""}`} />
              </Link>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="grid grid-cols-2 gap-4">
              <ProductPreview image={null} surface="box" placeholderImage={SAMPLE_PHOTOS[1]} sample />
              <ProductPreview image={null} surface="sleeve" placeholderImage={SAMPLE_PHOTOS[2]} sample />
            </div>
          </Reveal>
        </div>
      </Section>

      {/* ---------------- Final CTA ---------------- */}
      <Section muted>
        <div className="mx-auto max-w-2xl rounded-3xl border border-gold-500/25 bg-gradient-to-br from-white to-cream-50 p-8 text-center shadow-soft sm:p-12">
          <h2 className="font-serif text-3xl font-bold text-coffee-900">{t("home.finalCtaHeading")}</h2>
          <p className="mt-3 text-coffee-600">{t("home.finalCtaSub")}</p>
          <Link to="/customize" className="btn btn-primary mt-6">
            {t("hero.ctaPrimary")} <ArrowRight className={`h-4 w-4 ${isRtl ? "rotate-180" : ""}`} />
          </Link>
        </div>
      </Section>
    </>
  );
}
