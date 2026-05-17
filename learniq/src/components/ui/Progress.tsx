import clsx from "clsx";

interface ProgressProps {
  value: number; // 0–100
  className?: string;
  color?: "blue" | "green" | "yellow" | "red";
  showLabel?: boolean;
  size?: "sm" | "md";
}

const colorMap = {
  blue:   "bg-brand-500",
  green:  "bg-emerald-500",
  yellow: "bg-amber-500",
  red:    "bg-red-500",
};

export function Progress({ value, className, color = "blue", showLabel, size = "md" }: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className={clsx("flex items-center gap-3", className)}>
      <div className={clsx("flex-1 progress-bar", size === "sm" && "h-1.5")}>
        <div
          className={clsx("progress-fill", colorMap[color])}
          style={{ width: `${clamped}%` }}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-slate-500 min-w-[36px] text-end">
          {clamped}%
        </span>
      )}
    </div>
  );
}
