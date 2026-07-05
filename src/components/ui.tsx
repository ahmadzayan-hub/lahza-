import clsx from "clsx";

export function PageHeader({
  title, subtitle, action, eyebrow,
}: { title: string; subtitle?: string; action?: React.ReactNode; eyebrow?: string }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && <div className="mb-1 h2">{eyebrow}</div>}
        <h1 className="h1 truncate">{title}</h1>
        {subtitle && <p className="muted mt-1 max-w-2xl">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function DemoBanner({ demoMode }: { demoMode: boolean }) {
  if (!demoMode) return null;
  return (
    <div className="mb-4 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm">
      <span className="badge badge-vip mt-0.5">DEMO</span>
      <div className="flex-1 text-rose-800">
        <strong>Demo mode</strong> — sample customers, orders, payments &amp; reviews so you can
        explore every feature instantly. Connect Supabase (see <code>README</code>) to switch to
        live data.
      </div>
    </div>
  );
}

export function Kpi({
  label, value, hint, trend, tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  trend?: { up?: boolean; text: string };
  tone?: "default" | "accent";
}) {
  return (
    <div className={clsx("card card-hover", tone === "accent" && "border-rose-200 bg-rose-50")}>
      <div className="flex items-baseline justify-between gap-2">
        <div className={clsx("font-display text-2xl font-semibold tracking-tight", tone === "accent" && "text-rose-700")}>
          {value}
        </div>
        {trend && (
          <span className={clsx("text-xs font-medium", trend.up ? "text-emerald-700" : "text-red-700")}>
            {trend.up ? "▲" : "▼"} {trend.text}
          </span>
        )}
      </div>
      <div className="mt-0.5 text-xs text-smoke">{label}</div>
      {hint && <div className="mt-1 text-[11px] text-smoke/70">{hint}</div>}
    </div>
  );
}

// --- Status pill maps (single source of truth) ---

const STAGE_LABEL: Record<string, string> = {
  cold_lead: "Cold", information_lead: "Info", price_lead: "Price",
  warm_lead: "Warm", hot_lead: "Hot", payment_stage: "Payment",
  delivery_stage: "Delivery", after_sale_stage: "After-sale",
  complaint_stage: "Complaint", supplier_stage: "Supplier", lost_lead: "Lost",
};

const ORDER_STATUS_BADGE: Record<string, string> = {
  draft: "badge-neutral", awaiting_payment: "badge-warn", paid: "badge-info",
  qc: "badge-warn", dispatched: "badge-info", delivered: "badge-pass",
  cancelled: "badge-neutral", complaint: "badge-fail",
};

const PAYMENT_STATUS_BADGE: Record<string, string> = {
  none: "badge-neutral", link_sent: "badge-warn", needs_verification: "badge-warn",
  confirmed: "badge-pass", refunded: "badge-fail",
};

const COURIER_STATUS_BADGE: Record<string, string> = {
  none: "badge-neutral", awaiting_confirmation: "badge-warn", confirmed: "badge-info",
  picked_up: "badge-info", in_transit: "badge-info", delivered: "badge-pass", failed: "badge-fail",
};

export function StagePill({ stage }: { stage: string }) {
  return <span className="badge badge-neutral">{STAGE_LABEL[stage] ?? stage}</span>;
}

export function TempPill({ temp }: { temp: string }) {
  const cls = temp === "hot" ? "badge-hot" : temp === "warm" ? "badge-warm" : "badge-cold";
  return <span className={clsx("badge badge-dot", cls)}>{temp}</span>;
}

export function OrderStatusPill({ status }: { status: string }) {
  return <span className={clsx("badge", ORDER_STATUS_BADGE[status] ?? "badge-neutral")}>{status.replace(/_/g, " ")}</span>;
}
export function PaymentStatusPill({ status }: { status: string }) {
  return <span className={clsx("badge", PAYMENT_STATUS_BADGE[status] ?? "badge-neutral")}>{status.replace(/_/g, " ")}</span>;
}
export function CourierStatusPill({ status }: { status: string }) {
  return <span className={clsx("badge", COURIER_STATUS_BADGE[status] ?? "badge-neutral")}>{status.replace(/_/g, " ")}</span>;
}

export function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-2 flex items-center justify-between gap-2">
      <h2 className="h2">{children}</h2>
      {action}
    </div>
  );
}

export function EmptyState({ title, hint, icon }: { title: string; hint?: string; icon?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-mist bg-chalk/50 p-6 text-center text-sm text-smoke">
      {icon && <div className="mb-2 text-2xl">{icon}</div>}
      <div className="font-medium text-ink">{title}</div>
      {hint && <div className="mt-1">{hint}</div>}
    </div>
  );
}

/**
 * Owner greeting for the dashboard hero. Time-of-day aware (UAE / GST).
 */
export function OwnerGreeting({ name = "Owner" }: { name?: string }) {
  const hour = new Date().getUTCHours() + 4; // UTC+4 = UAE
  const local = ((hour % 24) + 24) % 24;
  const salute =
    local < 5  ? "Working late" :
    local < 12 ? "Good morning" :
    local < 17 ? "Good afternoon" :
                 "Good evening";
  return (
    <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-smoke">
      {salute}, {name}
    </div>
  );
}
