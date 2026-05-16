interface LogoProps {
  className?: string;
}

/**
 * Prismly brand mark — a prism refracting a single white ray into a
 * structured spectrum, mirroring the product: one raw idea in, a
 * polished, multi-faceted prompt out.
 */
export default function Logo({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 512 512" role="img" aria-label="Prismly" className={className}>
      <defs>
        <linearGradient id="po-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
        <linearGradient id="po-ray-in" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id="po-r" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0" />
          <stop offset="100%" stopColor="#ef4444" />
        </linearGradient>
        <linearGradient id="po-y" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <linearGradient id="po-g" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
        <linearGradient id="po-b" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
        <linearGradient id="po-v" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id="po-tri" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a5b4fc" />
          <stop offset="100%" stopColor="#c4b5fd" />
        </linearGradient>
      </defs>

      <rect width="512" height="512" rx="112" fill="url(#po-bg)" />

      {/* Incoming white ray */}
      <rect x="40" y="248" width="180" height="16" rx="8" fill="url(#po-ray-in)" />

      {/* The prism */}
      <polygon
        points="220,140 360,256 220,372"
        fill="url(#po-tri)"
        stroke="#ffffff"
        strokeOpacity="0.6"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      {/* Refracted spectrum */}
      <rect x="360" y="200" width="120" height="6" rx="3" fill="url(#po-r)" />
      <rect x="360" y="222" width="120" height="6" rx="3" fill="url(#po-y)" />
      <rect x="360" y="244" width="120" height="6" rx="3" fill="url(#po-g)" />
      <rect x="360" y="266" width="120" height="6" rx="3" fill="url(#po-b)" />
      <rect x="360" y="288" width="120" height="6" rx="3" fill="url(#po-v)" />
    </svg>
  );
}
