import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, RotateCcw, Sparkles, Star } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";
import { Seo } from "@/components/Seo";
import { SectionHeader } from "@/components/Section";
import { Stepper } from "@/components/Stepper";
import { formatAed } from "@/lib/format";
import { EVENT_PACKAGES, BULK_TIERS } from "@/lib/catalog";
import {
  recommend,
  isComplete,
  MOOD_OPTIONS,
  INITIAL_WIZARD_ANSWERS,
  type WizardAnswers,
  type WizardPath,
  type Mood,
} from "@/lib/giftWizard";

/** A selectable card — used for every question in the wizard. */
function OptionCard({ title, desc, onClick }: { title: string; desc?: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex h-full flex-col rounded-2xl border border-coffee-100/70 bg-white p-5 text-start shadow-soft transition hover:-translate-y-1 hover:shadow-card"
    >
      <h3 className="font-serif text-lg font-bold text-coffee-900">{title}</h3>
      {desc && <p className="mt-1.5 flex-1 text-sm text-coffee-600">{desc}</p>}
      <span className="mt-3 flex items-center gap-1 text-sm font-semibold text-gold-600">
        <ArrowRight className="h-4 w-4" />
      </span>
    </button>
  );
}

function tierRange(min: number, max?: number): string {
  return max ? `${min}-${max}` : `${min}+`;
}

export default function GiftFinder() {
  const { t, lang, pick, isRtl } = useI18n();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<WizardAnswers>(INITIAL_WIZARD_ANSWERS);

  const stepLabels = useMemo(
    () => [t("wizard.stepLabels.plan"), t("wizard.stepLabels.detail"), t("wizard.stepLabels.result")],
    [t],
  );

  const result = useMemo(() => recommend(answers), [answers]);

  function choosePath(path: WizardPath) {
    setAnswers({ ...INITIAL_WIZARD_ANSWERS, path });
    setStep(1);
  }
  function chooseMood(mood: Mood) {
    setAnswers((a) => ({ ...a, mood }));
    setStep(2);
  }
  function chooseEvent(eventPackageId: string) {
    setAnswers((a) => ({ ...a, eventPackageId }));
    setStep(2);
  }
  function chooseBulk(bulkTierIndex: number) {
    setAnswers((a) => ({ ...a, bulkTierIndex }));
    setStep(2);
  }
  function back() {
    setStep((s) => Math.max(0, s - 1));
  }
  function startOver() {
    setAnswers(INITIAL_WIZARD_ANSWERS);
    setStep(0);
  }

  return (
    <div className="container-max py-8 sm:py-12">
      <Seo title={t("wizard.heading")} description={t("wizard.sub")} />

      <SectionHeader
        eyebrow={t("wizard.badge")}
        title={t("wizard.heading")}
        subtitle={t("wizard.sub")}
      />

      <div className="mx-auto mt-8 max-w-3xl">
        <div className="rounded-2xl border border-coffee-100/70 bg-white/60 p-4">
          <Stepper steps={stepLabels} current={step} />
        </div>

        <div className="mt-6 rounded-3xl border border-coffee-100/70 bg-white p-6 shadow-soft sm:p-8">
          {/* ---- Step 0: which path ---- */}
          {step === 0 && (
            <>
              <h2 className="font-serif text-xl font-bold text-coffee-900">{t("wizard.step1Question")}</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <OptionCard
                  title={t("wizard.path.personal.title")}
                  desc={t("wizard.path.personal.desc")}
                  onClick={() => choosePath("personal")}
                />
                <OptionCard
                  title={t("wizard.path.event.title")}
                  desc={t("wizard.path.event.desc")}
                  onClick={() => choosePath("event")}
                />
                <OptionCard
                  title={t("wizard.path.bulk.title")}
                  desc={t("wizard.path.bulk.desc")}
                  onClick={() => choosePath("bulk")}
                />
              </div>
            </>
          )}

          {/* ---- Step 1: path-specific detail ---- */}
          {step === 1 && answers.path === "personal" && (
            <>
              <h2 className="font-serif text-xl font-bold text-coffee-900">{t("wizard.step2PersonalQuestion")}</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                {MOOD_OPTIONS.map((mood) => (
                  <OptionCard
                    key={mood}
                    title={t(`wizard.mood.${mood}.title`)}
                    desc={t(`wizard.mood.${mood}.desc`)}
                    onClick={() => chooseMood(mood)}
                  />
                ))}
              </div>
            </>
          )}

          {step === 1 && answers.path === "event" && (
            <>
              <h2 className="font-serif text-xl font-bold text-coffee-900">{t("wizard.step2EventQuestion")}</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                {EVENT_PACKAGES.map((p) => (
                  <OptionCard
                    key={p.id}
                    title={pick(p.name)}
                    desc={`${formatAed(p.price, lang)} · ${p.cups} ${t("corporate.cupsIncluded")}`}
                    onClick={() => chooseEvent(p.id)}
                  />
                ))}
              </div>
            </>
          )}

          {step === 1 && answers.path === "bulk" && (
            <>
              <h2 className="font-serif text-xl font-bold text-coffee-900">{t("wizard.step2BulkQuestion")}</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {BULK_TIERS.map((tier, i) => (
                  <OptionCard
                    key={tier.min}
                    title={tierRange(tier.min, tier.max)}
                    desc={`${formatAed(tier.price, lang)} +VAT`}
                    onClick={() => chooseBulk(i)}
                  />
                ))}
              </div>
            </>
          )}

          {/* ---- Step 2: result ---- */}
          {step === 2 && result && isComplete(answers) && (
            <div className="text-center">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gold-500/15">
                <Sparkles className="h-7 w-7 text-gold-600" />
              </span>
              <h2 className="mt-4 font-serif text-2xl font-bold text-coffee-900">{t("wizard.resultHeading")}</h2>

              {result.kind === "personal" && (
                <>
                  <p className="mx-auto mt-2 max-w-md text-sm text-coffee-600">
                    {t("wizard.resultSubPersonal", { mood: t(`wizard.mood.${answers.mood}.title`) })}
                  </p>
                  <div className="relative mx-auto mt-6 max-w-sm rounded-2xl border border-gold-500 bg-white p-6 text-start shadow-card ring-1 ring-gold-500/30">
                    {result.package.tag && (
                      <span className="absolute -top-3 start-6 inline-flex items-center gap-1 rounded-full bg-gold-500 px-3 py-1 text-xs font-bold text-white">
                        <Star className="h-3 w-3 fill-current" /> {t("customize.package.popular")}
                      </span>
                    )}
                    <h3 className="font-serif text-xl font-bold text-coffee-900">{pick(result.package.name)}</h3>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="font-serif text-3xl font-bold text-gold-500">{formatAed(result.package.price, lang)}</span>
                      <span className="text-xs text-coffee-400">{t("common.vatIncluded")}</span>
                    </div>
                    <ul className="mt-4 space-y-2 text-sm text-coffee-600">
                      {result.package.includes.map((inc, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" />
                          {pick(inc)}
                        </li>
                      ))}
                    </ul>
                    <Link to={result.ctaTo} className="btn btn-primary mt-6 w-full justify-center">
                      {t("wizard.resultCtaPersonal")}
                      <ArrowRight className={`h-4 w-4 ${isRtl ? "rotate-180" : ""}`} />
                    </Link>
                  </div>
                </>
              )}

              {result.kind === "event" && (
                <>
                  <p className="mx-auto mt-2 max-w-md text-sm text-coffee-600">
                    {t("wizard.resultSubEvent", { cups: result.package.cups })}
                  </p>
                  <div className="mx-auto mt-6 max-w-sm rounded-2xl border border-coffee-700 bg-white p-6 text-start shadow-card ring-1 ring-coffee-700/20">
                    <h3 className="font-serif text-xl font-bold text-coffee-900">{pick(result.package.name)}</h3>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="font-serif text-3xl font-bold text-coffee-700">{formatAed(result.package.price, lang)}</span>
                      <span className="text-xs text-coffee-400">{t("corporate.perEvent")} · +VAT</span>
                    </div>
                    <p className="mt-1 text-sm text-gold-600">{result.package.cups} {t("corporate.cupsIncluded")}</p>
                    <ul className="mt-4 space-y-2 text-sm text-coffee-600">
                      {result.package.includes.map((inc, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" />
                          {pick(inc)}
                        </li>
                      ))}
                    </ul>
                    <Link to={result.ctaTo} className="btn btn-primary mt-6 w-full justify-center">
                      {t("wizard.resultCtaEvent")}
                      <ArrowRight className={`h-4 w-4 ${isRtl ? "rotate-180" : ""}`} />
                    </Link>
                  </div>
                </>
              )}

              {result.kind === "bulk" && (
                <>
                  <p className="mx-auto mt-2 max-w-md text-sm text-coffee-600">
                    {t("wizard.resultSubBulk", { qty: tierRange(result.tier.min, result.tier.max) })}
                  </p>
                  <div className="mx-auto mt-6 max-w-sm rounded-2xl border border-coffee-100/70 bg-white p-6 text-start shadow-card">
                    <h3 className="font-serif text-xl font-bold text-coffee-900">
                      {t("wizard.bulkPeople", { qty: tierRange(result.tier.min, result.tier.max) })}
                    </h3>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="font-serif text-3xl font-bold text-coffee-700">{formatAed(result.tier.price, lang)}</span>
                      <span className="text-xs text-coffee-400">+VAT</span>
                    </div>
                    <Link to={result.ctaTo} className="btn btn-primary mt-6 w-full justify-center">
                      {t("wizard.resultCtaBulk")}
                      <ArrowRight className={`h-4 w-4 ${isRtl ? "rotate-180" : ""}`} />
                    </Link>
                  </div>
                </>
              )}

              <button
                type="button"
                onClick={startOver}
                className="btn btn-ghost mt-6"
              >
                <RotateCcw className="h-4 w-4" /> {t("wizard.startOver")}
              </button>
            </div>
          )}

          {step < 2 && (
            <div className="mt-6 flex items-center justify-between">
              <button type="button" className="btn btn-ghost" onClick={back} disabled={step === 0}>
                <ArrowLeft className={`h-4 w-4 ${isRtl ? "rotate-180" : ""}`} /> {t("wizard.back")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
