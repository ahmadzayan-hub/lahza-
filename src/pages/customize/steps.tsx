import { useRef, useState } from "react";
import {
  Upload, ImageUp, Wand2, Crop, CheckCircle2, AlertTriangle, XCircle,
  Sparkles, Languages, RefreshCw, MessageCircle,
} from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";
import { ProductPreview, type Surface } from "@/components/ProductPreview";
import { EMIRATES } from "@/lib/brand";
import { GIFT_PACKAGES, SAMPLE_PHOTOS } from "@/lib/catalog";
import { formatAed } from "@/lib/format";
import { loadImage, assessQuality } from "@/lib/imageQuality";
import { aiImageCleanup, aiAutoCrop, arabicNameAssist, generateGiftMessage, type Tone } from "@/lib/ai";
import { BRAND } from "@/lib/brand";
import type { OrderDraft, Slot } from "./types";
import { computeTotals } from "./totals";

type Update = (patch: Partial<OrderDraft>) => void;
interface StepProps {
  draft: OrderDraft;
  update: Update;
}

/* ----------------------------- 1. Upload ----------------------------- */
export function UploadStep({ draft, update }: StepProps) {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [imgEl, setImgEl] = useState<HTMLImageElement | null>(null);

  async function handleFile(file: File) {
    setBusy(true);
    const url = URL.createObjectURL(file);
    try {
      const img = await loadImage(url);
      setImgEl(img);
      const assessment = assessQuality(img);
      const processed = aiAutoCrop(img); // default: auto-crop to the print square
      update({
        imageOriginal: url,
        imageProcessed: processed,
        assessment,
        moderationBlocked: false,
      });
    } finally {
      setBusy(false);
    }
  }

  const verdict = draft.assessment?.verdict;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        <h2 className="font-serif text-2xl font-bold text-coffee-900">{t("customize.upload.heading")}</h2>
        <p className="mt-1 text-sm text-coffee-600">{t("customize.upload.sub")}</p>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-5 flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gold-500/50 bg-cream-50 px-6 py-10 text-center transition hover:border-gold-500 hover:bg-gold-500/5"
        >
          <span className="grid h-14 w-14 place-items-center rounded-full bg-gold-500/10">
            <ImageUp className="h-7 w-7 text-gold-600" />
          </span>
          <span className="font-medium text-coffee-800">{t("customize.upload.drop")}</span>
          <span className="text-xs text-coffee-400">{t("customize.upload.formats")}</span>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png"
          className="sr-only"
          aria-label={t("customize.upload.heading")}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleFile(f);
          }}
        />

        {busy && (
          <p className="mt-3 flex items-center gap-2 text-sm text-coffee-500">
            <RefreshCw className="h-4 w-4 animate-spin" /> {t("customize.upload.qualityChecking")}
          </p>
        )}

        {verdict && (
          <div
            className={`mt-3 flex items-start gap-2 rounded-xl p-3 text-sm ${
              verdict === "good"
                ? "bg-green-50 text-green-800"
                : verdict === "warn"
                  ? "bg-amber-50 text-amber-800"
                  : "bg-red-50 text-red-800"
            }`}
          >
            {verdict === "good" ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : verdict === "warn" ? <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0" />}
            <span>
              {t(`customize.upload.quality${verdict === "good" ? "Good" : verdict === "warn" ? "Warn" : "Bad"}`)}
              {draft.assessment && (
                <span className="ms-1 opacity-70">
                  ({draft.assessment.width}×{draft.assessment.height}px)
                </span>
              )}
            </span>
          </div>
        )}

        {draft.imageProcessed && imgEl && (
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className="btn btn-outline btn-sm" onClick={() => update({ imageProcessed: aiImageCleanup(imgEl) })}>
              <Wand2 className="h-4 w-4" /> {t("customize.upload.aiCleanup")}
            </button>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => update({ imageProcessed: aiAutoCrop(imgEl) })}>
              <Crop className="h-4 w-4" /> {t("customize.upload.autoCrop")}
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => inputRef.current?.click()}>
              <Upload className="h-4 w-4" /> {t("customize.upload.change")}
            </button>
          </div>
        )}

        {/* Consent — PDPL */}
        <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-coffee-100 bg-white p-4">
          <input
            type="checkbox"
            checked={draft.consent}
            onChange={(e) => update({ consent: e.target.checked })}
            className="mt-0.5 h-5 w-5 shrink-0 accent-gold-500"
          />
          <span className="text-xs leading-relaxed text-coffee-600">
            <span className="font-semibold text-coffee-800">{t("customize.upload.consentTitle")}</span>
            <br />
            {t("customize.upload.consent", { days: BRAND.photoRetentionDays })}
          </span>
        </label>
      </div>

      <div>
        <ProductPreview image={draft.imageProcessed} surface="cup" placeholderImage={SAMPLE_PHOTOS[0]} sample />
      </div>
    </div>
  );
}

/* ----------------------------- 2. Preview ----------------------------- */
const SURFACES: Surface[] = ["cup", "sleeve", "box", "card"];
export function PreviewStep({ draft, update }: StepProps) {
  const { t } = useI18n();
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        <h2 className="font-serif text-2xl font-bold text-coffee-900">{t("customize.preview.heading")}</h2>
        <p className="mt-1 text-sm text-coffee-600">{t("customize.preview.sub")}</p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          {SURFACES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => update({ surfaceView: s })}
              className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                draft.surfaceView === s
                  ? "border-coffee-700 bg-coffee-700 text-cream-50"
                  : "border-coffee-100 bg-white text-coffee-600 hover:bg-coffee-50"
              }`}
            >
              {t(`customize.preview.surfaces.${s}`)}
            </button>
          ))}
        </div>
      </div>
      <div>
        <ProductPreview
          image={draft.imageProcessed}
          surface={draft.surfaceView}
          message={draft.message}
          messageDir={draft.messageLang === "ar" ? "rtl" : "ltr"}
          placeholderImage={SAMPLE_PHOTOS[1]}
          sample
        />
      </div>
    </div>
  );
}

/* ----------------------------- 3. Message ----------------------------- */
const TONES: Tone[] = ["warm", "romantic", "funny", "formal"];
export function MessageStep({ draft, update }: StepProps) {
  const { t } = useI18n();
  const [tone, setTone] = useState<Tone>("warm");
  const [seed, setSeed] = useState(0);
  const [nameHint, setNameHint] = useState<{ arabic: string; confident: boolean } | null>(null);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        <h2 className="font-serif text-2xl font-bold text-coffee-900">{t("customize.message.heading")}</h2>
        <p className="mt-1 text-sm text-coffee-600">{t("customize.message.sub")}</p>

        {/* language */}
        <div className="mt-4">
          <span className="field-label">{t("customize.message.langLabel")}</span>
          <div className="inline-flex rounded-full border border-coffee-100 bg-white p-0.5 text-sm font-semibold">
            {(["en", "ar"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => update({ messageLang: l })}
                className={`rounded-full px-4 py-1.5 ${draft.messageLang === l ? "bg-coffee-700 text-cream-50" : "text-coffee-600"} ${l === "ar" ? "font-arabic" : ""}`}
              >
                {l === "en" ? "English" : "العربية"}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <label className="field-label" htmlFor="gift-msg">{t("customize.message.heading")}</label>
          <textarea
            id="gift-msg"
            dir={draft.messageLang === "ar" ? "rtl" : "ltr"}
            rows={3}
            maxLength={120}
            value={draft.message}
            onChange={(e) => update({ message: e.target.value })}
            placeholder={t("customize.message.placeholder")}
            className={`field resize-none ${draft.messageLang === "ar" ? "font-arabic" : ""}`}
          />
          <p className="mt-1 text-end text-xs text-coffee-400">{t("customize.message.counter", { n: draft.message.length })}</p>
        </div>

        {/* Generator */}
        <div className="mt-2 rounded-xl border border-gold-500/30 bg-gold-500/5 p-4">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-coffee-800">
            <Sparkles className="h-4 w-4 text-gold-600" /> {t("customize.message.generatorTitle")}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-coffee-500">{t("customize.message.generatorTone")}:</span>
            {TONES.map((tn) => (
              <button
                key={tn}
                type="button"
                onClick={() => setTone(tn)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${tone === tn ? "bg-coffee-700 text-cream-50" : "bg-white text-coffee-600"}`}
              >
                {t(`customize.message.tones.${tn}`)}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="btn btn-gold btn-sm mt-3"
            onClick={() => {
              const next = seed + 1;
              setSeed(next);
              update({ message: generateGiftMessage(tone, draft.messageLang, next) });
            }}
          >
            <RefreshCw className="h-4 w-4" /> {t("customize.message.generate")}
          </button>
        </div>

        {/* Recipient + Arabic name assist */}
        <div className="mt-4">
          <label className="field-label" htmlFor="recipient">{t("customize.message.recipient")}</label>
          <input
            id="recipient"
            className="field"
            value={draft.recipientName}
            onChange={(e) => update({ recipientName: e.target.value })}
          />
          <div className="mt-2 rounded-xl bg-cream-50 p-3">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-coffee-700">
              <Languages className="h-4 w-4 text-gold-600" /> {t("customize.message.nameAssistTitle")}
            </p>
            <p className="mt-1 text-xs text-coffee-500">{t("customize.message.nameAssistHint")}</p>
            <button
              type="button"
              className="btn btn-outline btn-sm mt-2"
              onClick={() => setNameHint(arabicNameAssist(draft.recipientName))}
            >
              {t("customize.message.nameAssistCta")}
            </button>
            {nameHint && (
              <p className="mt-2 font-arabic text-lg text-coffee-900" dir="rtl">
                {nameHint.arabic}
                {!nameHint.confident && <span className="ms-2 align-middle font-sans text-[10px] text-amber-600">⚠︎ please confirm</span>}
              </p>
            )}
          </div>
        </div>
      </div>

      <div>
        <ProductPreview
          image={draft.imageProcessed}
          surface="card"
          message={draft.message}
          messageDir={draft.messageLang === "ar" ? "rtl" : "ltr"}
          placeholderImage={SAMPLE_PHOTOS[3]}
          sample
        />
      </div>
    </div>
  );
}

/* ----------------------------- 4. Package ----------------------------- */
export function PackageStep({ draft, update }: StepProps) {
  const { t, lang, pick } = useI18n();
  return (
    <div>
      <h2 className="font-serif text-2xl font-bold text-coffee-900">{t("customize.package.heading")}</h2>
      <p className="mt-1 text-sm text-coffee-600">{t("customize.package.sub")}</p>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {GIFT_PACKAGES.map((p) => {
          const selected = draft.packageId === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => update({ packageId: p.id })}
              className={`relative flex flex-col rounded-2xl border-2 p-5 text-start transition ${
                selected ? "border-gold-500 bg-gold-500/5 shadow-gold" : "border-coffee-100 bg-white hover:border-gold-500/50"
              }`}
            >
              {p.tag && (
                <span className="absolute -top-3 start-5 rounded-full bg-gold-500 px-3 py-0.5 text-xs font-bold text-white">
                  {t("customize.package.popular")}
                </span>
              )}
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-lg font-bold text-coffee-900">{pick(p.name)}</h3>
                <span className={`grid h-5 w-5 place-items-center rounded-full border-2 ${selected ? "border-gold-500 bg-gold-500" : "border-coffee-200"}`}>
                  {selected && <CheckCircle2 className="h-4 w-4 text-white" />}
                </span>
              </div>
              <p className="mt-1 font-serif text-2xl font-bold text-gold-500">{formatAed(p.price, lang)}</p>
              <p className="text-xs text-coffee-400">{t("common.vatIncluded")}</p>
              <ul className="mt-3 space-y-1.5 text-sm text-coffee-600">
                {p.includes.map((inc, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-600" />
                    {pick(inc)}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ----------------------------- 5. Delivery ----------------------------- */
const SLOTS: Slot[] = ["morning", "afternoon", "evening"];
export function DeliveryStep({ draft, update }: StepProps) {
  const { t, pick } = useI18n();
  const today = new Date().toISOString().slice(0, 10);
  return (
    <div>
      <h2 className="font-serif text-2xl font-bold text-coffee-900">{t("customize.delivery.heading")}</h2>
      <p className="mt-1 text-sm text-coffee-600">{t("customize.delivery.sub")}</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="emirate">{t("customize.delivery.emirate")}</label>
          <select
            id="emirate"
            className="field"
            value={draft.emirate}
            onChange={(e) => update({ emirate: e.target.value as OrderDraft["emirate"] })}
          >
            {EMIRATES.map((e) => (
              <option key={e.id} value={e.id}>
                {pick({ en: e.en, ar: e.ar })} {e.sameDay ? `· ${t("customize.delivery.feeSameDay")}` : ""}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="area">{t("customize.delivery.area")}</label>
          <input id="area" className="field" placeholder={t("customize.delivery.areaPlaceholder")} value={draft.area} onChange={(e) => update({ area: e.target.value })} />
        </div>
        <div>
          <label className="field-label" htmlFor="date">{t("customize.delivery.date")}</label>
          <input id="date" type="date" min={today} className="field" value={draft.date} onChange={(e) => update({ date: e.target.value })} />
        </div>
        <div>
          <label className="field-label" htmlFor="slot">{t("customize.delivery.slot")}</label>
          <select id="slot" className="field" value={draft.slot} onChange={(e) => update({ slot: e.target.value as Slot })}>
            {SLOTS.map((s) => (
              <option key={s} value={s}>{t(`customize.delivery.slots.${s}`)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="dname">{t("customize.delivery.recipientName")}</label>
          <input id="dname" className="field" value={draft.deliverName} onChange={(e) => update({ deliverName: e.target.value })} />
        </div>
        <div>
          <label className="field-label" htmlFor="dphone">{t("customize.delivery.recipientPhone")}</label>
          <input id="dphone" className="field" inputMode="tel" placeholder="+971 5X XXX XXXX" value={draft.deliverPhone} onChange={(e) => update({ deliverPhone: e.target.value })} />
        </div>
      </div>
      <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm text-coffee-600">
        <input type="checkbox" className="h-4 w-4 accent-gold-500" checked={draft.leaveAtDoor} onChange={(e) => update({ leaveAtDoor: e.target.checked })} />
        {t("customize.delivery.giftNote")}
      </label>
    </div>
  );
}

/* ----------------------------- 6. Review ----------------------------- */
export function ReviewStep({ draft, update, onEditDesign }: StepProps & { onEditDesign: () => void }) {
  const { t, lang, pick } = useI18n();
  const { pkg, subtotal, deliveryFee, vat, total } = computeTotals(draft);
  const emirate = EMIRATES.find((e) => e.id === draft.emirate);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        <h2 className="font-serif text-2xl font-bold text-coffee-900">{t("customize.review.heading")}</h2>
        <p className="mt-1 text-sm text-coffee-600">{t("customize.review.sub")}</p>
        <ProductPreview
          image={draft.imageProcessed}
          surface={draft.surfaceView === "card" ? "cup" : draft.surfaceView}
          message={draft.message}
          messageDir={draft.messageLang === "ar" ? "rtl" : "ltr"}
          placeholderImage={SAMPLE_PHOTOS[0]}
          sample
        />
        <button type="button" className="btn btn-ghost btn-sm mt-3" onClick={onEditDesign}>
          {t("customize.review.editDesign")}
        </button>
      </div>

      <div>
        <div className="rounded-2xl border border-coffee-100 bg-white p-5 shadow-soft">
          <Row label={t("customize.review.item")} value={pkg ? pick(pkg.name) : "-"} />
          {draft.message && <Row label={t("customize.review.giftMessage")} value={draft.message} />}
          <Row
            label={t("customize.review.deliverTo")}
            value={`${draft.deliverName || "-"} · ${emirate ? pick({ en: emirate.en, ar: emirate.ar }) : ""} · ${draft.date || "-"}`}
          />
          <div className="my-3 border-t border-coffee-100" />
          <Row label={t("customize.review.subtotal")} value={formatAed(subtotal, lang)} />
          <Row label={t("customize.review.deliveryFee")} value={formatAed(deliveryFee, lang)} />
          <div className="my-3 border-t border-coffee-100" />
          <Row label={t("customize.review.total")} value={formatAed(total, lang)} strong />
          {/* Prices are VAT-inclusive, so VAT is shown as "of which" below the
              total — never as an additive line (which would not sum to total). */}
          <Row label={t("customize.review.vat")} value={formatAed(vat, lang)} muted />
        </div>

        <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-coffee-100 bg-cream-50 p-4">
          <input
            type="checkbox"
            checked={draft.nonReturnable}
            onChange={(e) => update({ nonReturnable: e.target.checked })}
            className="mt-0.5 h-5 w-5 shrink-0 accent-gold-500"
          />
          <span className="text-xs leading-relaxed text-coffee-600">{t("customize.review.nonReturnable")}</span>
        </label>
      </div>
    </div>
  );
}

function Row({ label, value, strong, muted }: { label: string; value: string; strong?: boolean; muted?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1 text-sm">
      <span className={`${muted ? "text-coffee-400" : "text-coffee-500"}`}>{label}</span>
      <span className={`text-end ${strong ? "font-serif text-lg font-bold text-coffee-900" : "font-medium text-coffee-800"}`}>{value}</span>
    </div>
  );
}

/* ----------------------------- 7. Payment ----------------------------- */
export function PaymentStep({ draft, onPay }: { draft: OrderDraft; onPay: () => void }) {
  const { t, lang } = useI18n();
  const { total } = computeTotals(draft);
  return (
    <div className="mx-auto max-w-md text-center">
      <h2 className="font-serif text-2xl font-bold text-coffee-900">{t("customize.pay.heading")}</h2>
      <p className="mt-1 text-sm text-coffee-600">{t("customize.pay.sub")}</p>

      <div className="mt-6 rounded-2xl border border-coffee-100 bg-white p-6 shadow-soft">
        <p className="font-serif text-4xl font-bold text-coffee-900">{formatAed(total, lang)}</p>
        <p className="text-xs text-coffee-400">{t("common.vatIncluded")}</p>

        <button type="button" className="btn btn-primary mt-6 w-full justify-center" onClick={onPay}>
          <MessageCircle className="h-4 w-4" /> {t("customize.pay.sendWhatsApp")}
        </button>

        <p className="mt-4 text-xs text-coffee-500">{t("customize.pay.note")}</p>
      </div>
    </div>
  );
}
