import clsx from "clsx";

/**
 * Wasl mark — two curves that echo the Arabic "و" (waw).
 * Pairs with a display-font wordmark for the full lockup.
 */
export function Mark({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      role="img"
      aria-label="Wasl"
      className={className}
    >
      <circle cx="14" cy="15" r="7" stroke="currentColor" strokeWidth="2.6" />
      <path
        d="M22 15 Q 34 15, 33 26 T 20 34"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <circle cx="14" cy="15" r="2" fill="currentColor" />
    </svg>
  );
}

export function Lockup({ size = 26, className }: { size?: number; className?: string }) {
  return (
    <div className={clsx("flex items-center gap-2", className)}>
      <Mark size={size} className="text-rose-500" />
      <div className="leading-tight">
        <div className="font-display text-lg font-semibold tracking-tight text-ink">Wasl</div>
        <div className="text-[10px] uppercase tracking-[0.16em] text-smoke">Order Control</div>
      </div>
    </div>
  );
}
