import { useI18n } from "@/lib/i18n";

/**
 * Distinctive house mark: a faceted brilliant-cut gem (jewelry-native) paired
 * with the "Beyond Style" wordmark. The gem is inline SVG so it inherits the
 * gold gradient and stays crisp at every size. `withWordmark={false}` renders
 * just the mark (e.g. compact mobile header).
 */
export function BrandGem({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="bs-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#A6864B" />
          <stop offset="0.45" stopColor="#C9A96E" />
          <stop offset="1" stopColor="#E4CFA1" />
        </linearGradient>
        <linearGradient id="bs-gold-soft" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E4CFA1" />
          <stop offset="1" stopColor="#B8935A" />
        </linearGradient>
      </defs>
      <g stroke="#0A0A0A" strokeWidth={10} strokeLinejoin="round">
        <polygon points="196,150 316,150 256,214" fill="url(#bs-gold-soft)" />
        <polygon points="196,150 140,230 256,214" fill="url(#bs-gold)" />
        <polygon points="316,150 372,230 256,214" fill="url(#bs-gold)" />
        <polygon points="140,230 256,214 372,230" fill="url(#bs-gold-soft)" />
        <polygon points="140,230 256,214 256,398" fill="url(#bs-gold)" />
        <polygon points="372,230 256,214 256,398" fill="url(#bs-gold-soft)" />
      </g>
    </svg>
  );
}

export function BrandLogo({ size = 28 }: { size?: number }) {
  const { locale } = useI18n();
  return (
    <span className="inline-flex items-center gap-2">
      <BrandGem size={size} />
      <span className="font-display leading-none">
        <span className="gold-text text-xl tracking-wide">Beyond Style</span>
        <span className="ms-1 align-middle text-sm text-cream/70">
          {locale === "ar" ? "الإمارات" : "UAE"}
        </span>
      </span>
    </span>
  );
}
