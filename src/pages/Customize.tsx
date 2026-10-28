import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, PartyPopper, MessageCircle } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";
import { Seo } from "@/components/Seo";
import { Stepper } from "@/components/Stepper";
import { moderateImage } from "@/lib/ai";
import { makeRef } from "@/lib/id";
import { waLink } from "@/lib/whatsapp";
import { GIFT_PACKAGES } from "@/lib/catalog";
import { buildOrderMessage } from "./customize/orderMessage";
import { INITIAL_DRAFT, STEP_KEYS, type OrderDraft } from "./customize/types";
import {
  UploadStep, PreviewStep, MessageStep, PackageStep, DeliveryStep, ReviewStep, PaymentStep,
} from "./customize/steps";

type Result = { ref: string; mode: "now" | "link" } | null;

// Ephemeral draft persistence: keeps the in-progress design across an accidental
// refresh so the customer never re-does their work. sessionStorage is per-tab
// and cleared when the tab closes — the photo stays on-device, matching our
// privacy stance (see docs/THREAT_MODEL.md).
const DRAFT_KEY = "lahza.customize.draft";
function loadDraft(): OrderDraft {
  try {
    const raw = typeof sessionStorage !== "undefined" && sessionStorage.getItem(DRAFT_KEY);
    if (raw) return { ...INITIAL_DRAFT, ...(JSON.parse(raw) as Partial<OrderDraft>), imageOriginal: null };
  } catch {
    /* private mode / quota / bad JSON — fall back to a fresh draft */
  }
  return INITIAL_DRAFT;
}

export default function Customize() {
  const { t, isRtl, lang } = useI18n();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<OrderDraft>(() => {
    const d = loadDraft();
    // Coming from the Gift Finder with a recommended package? Pre-select it.
    const fromWizard = searchParams.get("package");
    if (!d.packageId && fromWizard && GIFT_PACKAGES.some((p) => p.id === fromWizard)) {
      return { ...d, packageId: fromWizard };
    }
    return d;
  });
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<Result>(null);

  // Save on every edit; clear once the order is placed.
  useEffect(() => {
    try {
      if (result) {
        sessionStorage.removeItem(DRAFT_KEY);
        return;
      }
      const { imageOriginal: _drop, ...persist } = draft;
      void _drop;
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(persist));
    } catch {
      /* storage unavailable — persistence is best-effort */
    }
  }, [draft, result]);

  const update = (patch: Partial<OrderDraft>) => setDraft((d) => ({ ...d, ...patch }));

  const stepLabels = useMemo(() => STEP_KEYS.map((k) => t(`customize.steps.${k}`)), [t]);

  function validate(current: number): string | null {
    switch (current) {
      case 0:
        if (!draft.imageProcessed) return t("customize.validation.photoRequired");
        if (!draft.consent) return t("customize.validation.consentRequired");
        return null;
      case 3:
        if (!draft.packageId) return t("customize.validation.packageRequired");
        return null;
      case 4:
        if (!draft.deliverName || !draft.deliverPhone || !draft.date) return t("customize.validation.deliveryRequired");
        return null;
      case 5:
        if (!draft.nonReturnable) return t("customize.validation.nonReturnableRequired");
        return null;
      default:
        return null;
    }
  }

  async function next() {
    const err = validate(step);
    if (err) {
      setError(err);
      return;
    }
    setError(null);

    // Image moderation before checkout (step 5 → 6)
    if (step === 5 && draft.imageProcessed) {
      setChecking(true);
      const res = await moderateImage(draft.imageProcessed);
      setChecking(false);
      if (!res.ok) {
        update({ moderationBlocked: true });
        setError(t("customize.upload.moderationBad"));
        return;
      }
    }
    setStep((s) => Math.min(s + 1, STEP_KEYS.length - 1));
  }

  function prev() {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  // Hand the finished order to the business over WhatsApp (the app's ordering
  // model — no backend). Opening on the click gesture avoids popup blocking; the
  // success screen also offers a manual "open WhatsApp" fallback in case it was
  // blocked, so a completed order is never silently lost.
  function pay(mode: "now" | "link") {
    const ref = makeRef("LHZ");
    try {
      window.open(waLink(buildOrderMessage(draft, ref, lang, mode)), "_blank", "noopener,noreferrer");
    } catch {
      /* fallback button on the success screen */
    }
    setResult({ ref, mode });
  }

  function reset() {
    setDraft(INITIAL_DRAFT);
    setStep(0);
    setResult(null);
    setError(null);
  }

  // ---- Success screen ----
  if (result) {
    const isNow = result.mode === "now";
    return (
      <div className="container-max py-16">
        <Seo title={t("customize.title")} />
        <div className="mx-auto max-w-lg rounded-3xl border border-gold-500/30 bg-white p-8 text-center shadow-card sm:p-10">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gold-500/15">
            {isNow ? <PartyPopper className="h-8 w-8 text-gold-600" /> : <MessageCircle className="h-8 w-8 text-gold-600" />}
          </span>
          <h1 className="mt-5 font-serif text-2xl font-bold text-coffee-900">
            {isNow ? t("customize.pay.successTitle") : t("customize.pay.linkSentTitle")}
          </h1>
          <p className="mt-3 text-sm text-coffee-600">
            {isNow ? t("customize.pay.successSub", { ref: result.ref }) : t("customize.pay.linkSentSub", { ref: result.ref })}
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              className="btn btn-primary"
              href={waLink(buildOrderMessage(draft, result.ref, lang, result.mode))}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="h-4 w-4" /> {t("customize.pay.openWhatsApp")}
            </a>
            <button type="button" className="btn btn-outline" onClick={reset}>{t("customize.pay.newOrder")}</button>
            <Link to="/" className="btn btn-ghost">{t("common.backHome")}</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-max py-8 sm:py-12">
      <Seo title={t("customize.title")} description={t("customize.subtitle")} />

      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-coffee-900 sm:text-4xl">{t("customize.title")}</h1>
          <p className="mt-1 text-sm text-coffee-600">{t("customize.subtitle")}</p>
        </div>
        <Link to="/" className="btn btn-ghost btn-sm hidden sm:inline-flex">
          <ArrowLeft className={`h-4 w-4 ${isRtl ? "rotate-180" : ""}`} /> {t("common.backHome")}
        </Link>
      </div>

      <div className="mt-6 rounded-2xl border border-coffee-100/70 bg-white/60 p-4">
        <Stepper steps={stepLabels} current={step} />
      </div>

      <div className="mt-6 rounded-3xl border border-coffee-100/70 bg-white p-6 shadow-soft sm:p-8">
        {step === 0 && <UploadStep draft={draft} update={update} />}
        {step === 1 && <PreviewStep draft={draft} update={update} />}
        {step === 2 && <MessageStep draft={draft} update={update} />}
        {step === 3 && <PackageStep draft={draft} update={update} />}
        {step === 4 && <DeliveryStep draft={draft} update={update} />}
        {step === 5 && <ReviewStep draft={draft} update={update} onEditDesign={() => setStep(1)} />}
        {step === 6 && <PaymentStep draft={draft} onPay={pay} />}

        {error && (
          <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </p>
        )}
      </div>

      {/* Nav controls */}
      {step < 6 && (
        <div className="mt-6 flex items-center justify-between gap-4">
          <button type="button" className="btn btn-ghost" onClick={prev} disabled={step === 0}>
            <ArrowLeft className={`h-4 w-4 ${isRtl ? "rotate-180" : ""}`} /> {t("common.previous")}
          </button>
          <button type="button" className="btn btn-primary" onClick={next} disabled={checking}>
            {step === 5 ? t("common.confirm") : t("common.continue")}
            {!checking && <ArrowRight className={`h-4 w-4 ${isRtl ? "rotate-180" : ""}`} />}
            {checking && <CheckCircle2 className="h-4 w-4 animate-pulse" />}
          </button>
        </div>
      )}
    </div>
  );
}
