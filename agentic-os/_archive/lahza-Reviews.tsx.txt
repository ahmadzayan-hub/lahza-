import { Star } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";
import { REVIEWS } from "@/lib/catalog";
import { Reveal } from "./Reveal";

export function Reviews() {
  const { pick } = useI18n();
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {REVIEWS.map((r, i) => (
        <Reveal key={r.id} delay={i * 80}>
          <figure className="flex h-full flex-col rounded-2xl border border-coffee-100/70 bg-white p-6 shadow-soft">
            <div className="flex gap-0.5 text-gold-500" aria-label={`${r.rating} / 5`}>
              {Array.from({ length: r.rating }).map((_, j) => (
                <Star key={j} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-coffee-700">
              “{pick(r.text)}”
            </blockquote>
            <figcaption className="mt-4 flex items-center gap-3">
              <span
                aria-hidden="true"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-gold-400 to-gold-600 text-sm font-bold text-white shadow-soft"
              >
                {pick(r.name).trim().charAt(0)}
              </span>
              <span className="text-sm">
                <span className="block font-semibold text-coffee-900">{pick(r.name)}</span>
                <span className="text-coffee-400">{pick(r.location)}</span>
              </span>
            </figcaption>
          </figure>
        </Reveal>
      ))}
    </div>
  );
}
