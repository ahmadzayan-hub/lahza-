interface LogoProps {
  className?: string;
}

/**
 * Draftly / صياغة brand mark.
 *
 * A calligraphy stroke that thickens on entry and refines to a fine
 * point on exit. Symbolises a raw idea becoming a precise, drafted
 * prompt. Teal core with an amber highlight.
 *
 * The mark reads correctly both LTR and RTL. In RTL the CSS on the
 * containing element flips it visually so the stroke opens toward the
 * text.
 */
export default function Logo({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 512 512" role="img" aria-label="Draftly" className={className}>
      <defs>
        <linearGradient id="dr-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0f766e" />
          <stop offset="100%" stopColor="#134e4a" />
        </linearGradient>
        <linearGradient id="dr-stroke" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="60%" stopColor="#fef3c7" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
      </defs>

      <rect width="512" height="512" rx="112" fill="url(#dr-bg)" />

      {/* Calligraphy sweep: thick body that tapers to a nib point */}
      <path
        d="
          M 96 336
          C 128 224, 224 128, 336 128
          L 400 128
          C 344 152, 288 208, 240 288
          L 200 336
          L 168 344
          L 152 336
          Z
        "
        fill="url(#dr-stroke)"
      />

      {/* Fine terminal point of the nib */}
      <circle cx="164" cy="340" r="10" fill="#0f172a" opacity="0.75" />

      {/* Underline: the drafted result */}
      <rect x="96" y="392" width="320" height="10" rx="5" fill="#fef3c7" opacity="0.55" />
    </svg>
  );
}
