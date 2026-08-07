import { Droplets, Sparkles, ShieldCheck } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const TIPS = [
  { icon: Droplets, en: "Avoid water and perfume", ar: "تجنبي الماء والعطور" },
  { icon: Sparkles, en: "Wipe with a soft dry cloth", ar: "امسحي بقطعة قماش ناعمة" },
  { icon: ShieldCheck, en: "Store in the pouch provided", ar: "احفظي القطعة في الكيس المرفق" },
];

/** Honest, accessory-appropriate care guidance — no over-claims. */
export function JewelryCareBadge() {
  const { t, locale } = useI18n();
  return (
    <section className="gold-border">
      <div className="p-5">
        <h3 className="mb-3 font-display text-lg gold-text">{t("pdp.care")}</h3>
        <p className="mb-3 text-sm text-cream/80">{t("pdp.care.text")}</p>
        <ul className="space-y-2">
          {TIPS.map((tip) => (
            <li key={tip.en} className="flex items-center gap-3 text-sm text-cream/80">
              <tip.icon size={18} className="text-gold shrink-0" />
              <span>{locale === "ar" ? tip.ar : tip.en}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-cream/50">
          {locale === "ar"
            ? "إكسسوار أزياء — ستانلس ستيل بطلاء ذهبي اللون أو فضي اللون."
            : "Fashion accessory — stainless steel with gold-tone or silver-tone plating."}
        </p>
      </div>
    </section>
  );
}
