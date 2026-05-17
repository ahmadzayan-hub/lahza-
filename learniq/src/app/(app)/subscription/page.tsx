"use client";
import { Suspense } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { CreditCard, Check, Zap, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { useSearchParams } from "next/navigation";

interface Subscription {
  plan: string; status: string; trial_ends_at: string | null;
  current_period_end: string | null; ai_queries_used: number; ai_queries_limit: number;
  cancel_at_period_end: boolean;
}

function SubscriptionContent() {
  const { t } = useI18n();
  const toast = useToast();
  const params = useSearchParams();
  const [sub, setSub] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (params.get("success")) toast("success", "Subscription activated successfully!");
    if (params.get("canceled")) toast("info", "Checkout canceled.");
    fetch("/api/subscription")
      .then(r => { if (r.ok) return r.json(); return null; })
      .then(d => { if (d) setSub(d); setLoading(false); });
  }, []);

  async function openPortal() {
    setActionLoading(true);
    const res = await fetch("/api/subscription/portal", { method: "POST" });
    if (res.ok) { const { url } = await res.json(); window.location.href = url; }
    else toast("error", t("error.generic"));
    setActionLoading(false);
  }

  async function startCheckout(plan: string, interval: "monthly" | "annual") {
    setActionLoading(true);
    const res = await fetch("/api/subscription/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan, interval }),
    });
    if (res.ok) { const { url } = await res.json(); window.location.href = url; }
    else toast("error", t("error.generic"));
    setActionLoading(false);
  }

  const usagePct = sub ? Math.round((sub.ai_queries_used / sub.ai_queries_limit) * 100) : 0;

  return (
    <div className="space-y-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t("subscription.title")}</h1>

      {loading ? (
        <div className="skeleton h-40 rounded-2xl" />
      ) : sub && (
        <div className="card">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">{t("subscription.plan")}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 capitalize">{sub.plan}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge color={sub.status === "active" || sub.status === "trialing" ? "green" : "red"}>
                  {sub.status === "trialing" ? "Free Trial" : sub.status}
                </Badge>
                {sub.cancel_at_period_end && <Badge color="yellow">Cancels at period end</Badge>}
              </div>
            </div>
            <CreditCard size={32} className="text-brand-400" />
          </div>

          {sub.trial_ends_at && sub.status === "trialing" && (
            <p className="text-sm text-amber-600 dark:text-amber-400 mb-4">
              {t("subscription.trial_ends", { date: format(new Date(sub.trial_ends_at), "MMM d, yyyy") })}
            </p>
          )}

          {sub.current_period_end && sub.status === "active" && (
            <p className="text-sm text-slate-500 mb-4">
              {t("subscription.renews", { date: format(new Date(sub.current_period_end), "MMM d, yyyy") })}
            </p>
          )}

          <div className="mb-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Zap size={15} className="text-amber-500" />
                {t("subscription.usage")}
              </span>
              <span className="font-medium text-slate-700 dark:text-slate-200">
                {t("subscription.limit", { used: String(sub.ai_queries_used), limit: String(sub.ai_queries_limit) })}
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full">
              <div className={`h-full rounded-full transition-all ${usagePct > 80 ? "bg-red-500" : "bg-brand-500"}`} style={{ width: `${Math.min(100, usagePct)}%` }} />
            </div>
          </div>

          <Button variant="secondary" onClick={openPortal} loading={actionLoading}>
            <ExternalLink size={15} />
            {t("subscription.manage")}
          </Button>
        </div>
      )}

      {sub?.plan === "free" && (
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">{t("subscription.upgrade")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              { key: "student", label: "Student", price: "$12/month", features: ["10 courses", "500 AI queries/month", "Full study packs", "Tutor chat", "Grade planner", "Weekly brief"] },
              { key: "pro", label: "Pro Learner", price: "$22/month", features: ["Unlimited courses", "2000 AI queries/month", "Priority AI", "Advanced quizzes", "Group workspace", "Priority support"] },
            ].map(plan => (
              <div key={plan.key} className="card border-2 border-slate-200 dark:border-slate-700">
                <p className="font-bold text-slate-900 dark:text-slate-100 text-lg mb-1">{plan.label}</p>
                <p className="text-brand-600 dark:text-brand-400 font-semibold mb-4">{plan.price}</p>
                <ul className="space-y-1.5 mb-6">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <Check size={14} className="text-emerald-500" />{f}
                    </li>
                  ))}
                </ul>
                <Button fullWidth onClick={() => startCheckout(plan.key as "student" | "pro", "monthly")} loading={actionLoading}>
                  {t("pricing.cta.paid")}
                </Button>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-slate-400 text-center">{t("pricing.trial_note")}</p>
        </div>
      )}
    </div>
  );
}

export default function SubscriptionPage() {
  return (
    <Suspense fallback={<div className="skeleton h-40 rounded-2xl" />}>
      <SubscriptionContent />
    </Suspense>
  );
}
