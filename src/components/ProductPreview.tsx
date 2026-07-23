import { useId } from "react";
import { useI18n } from "@/i18n/I18nContext";

export type Surface = "cup" | "sleeve" | "box" | "card";

/**
 * Live realistic mockup. Places the uploaded image (or a placeholder) onto the
 * chosen surface using SVG clip-paths — zero external assets, no layout shift,
 * and instant re-render as the user edits. Social-media-ready framing.
 */
export function ProductPreview({
  image,
  surface,
  message,
  messageDir = "ltr",
  placeholderImage = null,
  sample = false,
}: {
  image: string | null;
  surface: Surface;
  message?: string;
  messageDir?: "ltr" | "rtl";
  /** Shown when there's no uploaded image, so the preview is never blank. */
  placeholderImage?: string | null;
  /** Show a small "sample" tag when the placeholder image is a demo photo. */
  sample?: boolean;
}) {
  const uid = useId();
  const { t } = useI18n();
  const shown = image ?? placeholderImage ?? null;
  const isSample = !image && !!placeholderImage;

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-gradient-to-br from-cream-50 to-cream-200 shadow-inner">
      <div className="absolute inset-3 flex items-center justify-center rounded-xl bg-white/60">
        <svg viewBox="0 0 400 400" className="h-full w-full" role="img" aria-label={`${surface} preview`}>
          <defs>
            <clipPath id={`clip-${surface}`}>
              {surface === "cup" && <circle cx="200" cy="205" r="120" />}
              {surface === "sleeve" && <rect x="70" y="150" width="260" height="120" rx="10" />}
              {surface === "box" && <rect x="95" y="120" width="210" height="170" rx="14" />}
              {surface === "card" && <rect x="110" y="120" width="180" height="160" rx="10" />}
            </clipPath>
            <radialGradient id="sheen" cx="35%" cy="30%" r="75%">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.55" />
              <stop offset="55%" stopColor="#fff" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Surface base shapes */}
          {surface === "cup" && (
            <>
              <ellipse cx="200" cy="205" rx="150" ry="150" fill="#efe7dc" />
              <circle cx="200" cy="205" r="132" fill="#fff" />
              <circle cx="200" cy="205" r="122" fill="#e9c9a0" />
            </>
          )}
          {surface === "sleeve" && (
            <>
              <rect x="55" y="130" width="290" height="160" rx="16" fill="#d9c3a5" />
              <rect x="70" y="150" width="260" height="120" rx="10" fill="#f3ead9" />
            </>
          )}
          {surface === "box" && (
            <>
              <rect x="80" y="105" width="240" height="200" rx="18" fill="#3B2A20" />
              <rect x="95" y="120" width="210" height="170" rx="14" fill="#f3ead9" />
              <rect x="80" y="180" width="240" height="20" fill="#B08A45" opacity="0.85" />
            </>
          )}
          {surface === "card" && (
            <>
              <rect x="95" y="105" width="210" height="230" rx="14" fill="#fff" stroke="#e4d6cc" strokeWidth="2" />
              <rect x="110" y="120" width="180" height="160" rx="10" fill="#f3ead9" />
            </>
          )}

          {/* Uploaded image, sample fill, or (last resort) prompt */}
          {shown ? (
            <image
              href={shown}
              x={surface === "cup" ? 80 : surface === "sleeve" ? 70 : surface === "box" ? 95 : 110}
              y={surface === "cup" ? 85 : surface === "sleeve" ? 150 : surface === "box" ? 120 : 120}
              width={surface === "cup" ? 240 : surface === "sleeve" ? 260 : surface === "box" ? 210 : 180}
              height={surface === "cup" ? 240 : surface === "sleeve" ? 120 : surface === "box" ? 170 : 160}
              clipPath={`url(#${uid}-clip-${surface})`}
              preserveAspectRatio="xMidYMid slice"
            />
          ) : (
            <g clipPath={`url(#${uid}-clip-${surface})`}>
              <rect x="0" y="0" width="400" height="400" fill="#e9dcc8" />
              <text x="200" y="200" textAnchor="middle" className="fill-gold-600" fontSize="13" fontWeight="600">
                {t("customize.preview.placeholder")}
              </text>
              <text x="200" y="220" textAnchor="middle" fill="#a68a5f" fontSize="9">
                {t("customize.preview.placeholderSub")}
              </text>
            </g>
          )}

          {/* Cup rim + sheen */}
          {surface === "cup" && <circle cx="200" cy="205" r="122" fill="none" stroke="#fff" strokeWidth="12" opacity="0.65" />}
          <rect x="0" y="0" width="400" height="400" fill={`url(#${uid}-sheen)`} pointerEvents="none" />

          {/* Gift-card message */}
          {surface === "card" && message && (
            <foreignObject x="105" y="288" width="190" height="44">
              <div
                dir={messageDir}
                style={{
                  fontSize: 10,
                  lineHeight: 1.3,
                  textAlign: "center",
                  color: "#4A3225",
                  fontFamily: messageDir === "rtl" ? "'IBM Plex Sans Arabic', sans-serif" : "inherit",
                  overflow: "hidden",
                }}
              >
                {message}
              </div>
            </foreignObject>
          )}
        </svg>
      </div>

      <span className="absolute start-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-coffee-600 shadow-sm">
        <span className="h-2 w-2 rounded-full bg-[#25D366]" />
        {t("customize.preview.socialReady")}
      </span>

      {sample && isSample && (
        <span className="absolute end-4 top-4 rounded-full bg-coffee-700/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-cream-50 shadow-sm">
          {t("customize.preview.sample")}
        </span>
      )}
    </div>
  );
}
