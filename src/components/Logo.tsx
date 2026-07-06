interface LogoProps {
  className?: string;
  withWordmark?: boolean;
  compact?: boolean;
}

/**
 * ZAIan Studio brand mark.
 *
 * Icon: deep-navy rounded square with an indigo-to-pink gradient outer ring,
 * a prompt cursor on the left, a baseline underline, and a 4-point star spark.
 * The distinct ring separates this from generic gradient squares.
 */
export default function Logo({ className, withWordmark = false, compact = false }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-3 ${className ?? ""}`}>
      <LogoMark />
      {withWordmark && <LogoWordmark compact={compact} />}
    </span>
  );
}

export function LogoMark({ size = 48 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      role="img"
      aria-label="ZAIan Studio"
      style={{ display: "block", flexShrink: 0 }}
    >
      <defs>
        <linearGradient id="lm-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#0f0f23" />
          <stop offset="100%" stopColor="#1a1040" />
        </linearGradient>
        <linearGradient id="lm-ring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#6366f1" />
          <stop offset="40%"  stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
        <linearGradient id="lm-spark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#fde68a" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
        <filter id="lm-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
          <feComposite in="blur" in2="SourceGraphic" operator="over" />
        </filter>
      </defs>
      {/* Outer gradient ring */}
      <rect x="1" y="1" width="62" height="62" rx="16" fill="url(#lm-ring)" />
      {/* Inner dark square (2px ring gap) */}
      <rect x="3" y="3" width="58" height="58" rx="14" fill="url(#lm-bg)" />
      {/* Top glow */}
      <ellipse cx="32" cy="10" rx="20" ry="8" fill="#6366f1" opacity="0.18" filter="url(#lm-glow)" />
      {/* Prompt cursor › */}
      <path d="M14 23 L24 32 L14 41" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.95" />
      {/* Baseline */}
      <rect x="26" y="42" width="22" height="2.5" rx="1.25" fill="white" opacity="0.35" />
      {/* 4-point star spark */}
      <path d="M46 12 L48 19 L55 21 L48 23 L46 30 L44 23 L37 21 L44 19 Z" fill="url(#lm-spark)" opacity="0.97" filter="url(#lm-glow)" />
    </svg>
  );
}

export function LogoWordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex flex-col leading-none select-none">
      <span className="font-black tracking-tight text-slate-900 dark:text-white" style={{ fontSize: compact ? "1.125rem" : "1.25rem", lineHeight: 1 }}>
        <span style={{ background: "linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#ec4899 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
          ZAI
        </span>
        <span className="text-slate-900 dark:text-white">an</span>
        <span className="font-light text-slate-400 dark:text-slate-500 ms-1.5 text-sm">Studio</span>
      </span>
      {!compact && (
        <span className="mt-0.5 text-[10px] font-semibold tracking-widest text-slate-400 dark:text-slate-500 uppercase">
          Prompt Intelligence
        </span>
      )}
    </span>
  );
}
