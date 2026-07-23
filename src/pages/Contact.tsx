import { useState } from "react";
import { MessageCircle, Mail, Phone, Clock, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";
import { Seo } from "@/components/Seo";
import { Section, SectionHeader } from "@/components/Section";
import { BRAND } from "@/lib/brand";
import { waLink, WA_MESSAGES } from "@/lib/whatsapp";

export default function Contact() {
  const { t, pick } = useI18n();
  const [sent, setSent] = useState(false);

  return (
    <>
      <Seo title={t("contact.title")} description={t("contact.subtitle")} />
      <Section>
        <SectionHeader eyebrow={t("nav.contact")} title={t("contact.title")} subtitle={t("contact.subtitle")} />

        <div className="mx-auto mt-10 grid max-w-4xl gap-6 lg:grid-cols-5">
          {/* Contact channels */}
          <div className="space-y-4 lg:col-span-2">
            <a
              href={waLink(pick(WA_MESSAGES.support))}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-2xl bg-[#25D366] p-4 text-white shadow-soft transition hover:brightness-105"
            >
              <MessageCircle className="h-6 w-6" />
              <span className="font-semibold">{t("contact.whatsappCta")}</span>
            </a>
            <a href={`mailto:${BRAND.email}`} className="flex items-center gap-3 rounded-2xl border border-coffee-100/70 bg-white p-4 shadow-soft">
              <Mail className="h-5 w-5 text-gold-600" />
              <span className="text-sm font-medium text-coffee-800">{BRAND.email}</span>
            </a>
            <a href={`tel:${BRAND.phone.replace(/\s/g, "")}`} className="flex items-center gap-3 rounded-2xl border border-coffee-100/70 bg-white p-4 shadow-soft">
              <Phone className="h-5 w-5 text-gold-600" />
              <span className="text-sm font-medium text-coffee-800">{BRAND.phone}</span>
            </a>
            <div className="rounded-2xl border border-coffee-100/70 bg-cream-50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-coffee-900">
                <Clock className="h-4 w-4 text-gold-600" /> {t("contact.hoursHeading")}
              </div>
              <p className="mt-1 text-sm text-coffee-600">{t("contact.hours")}</p>
            </div>
            <div className="rounded-2xl border border-coffee-100/70 bg-white p-4 text-xs text-coffee-600">
              <div className="mb-1 flex items-center gap-1.5 font-semibold text-coffee-900">
                <ShieldCheck className="h-4 w-4 text-gold-600" /> {t("contact.identityHeading")}
              </div>
              <p className="font-medium text-coffee-800">{BRAND.legalName}</p>
              <p>{BRAND.licenseAuthority}</p>
              <p>{t("footer.licence")}: {BRAND.licenseNumber} · {t("footer.trn")}: {BRAND.trn}</p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            {sent ? (
              <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-gold-500/30 bg-cream-50 p-10 text-center">
                <CheckCircle2 className="h-12 w-12 text-gold-500" />
                <p className="mt-4 text-lg font-semibold text-coffee-900">{t("contact.sent")}</p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const field = (id: string) =>
                    (form.querySelector<HTMLInputElement | HTMLTextAreaElement>(`#${id}`)?.value ?? "").trim();
                  const lines = [
                    `${field("c-subject") || t("contact.formHeading")}`,
                    `${field("c-name")} — ${field("c-email")}${field("c-phone") ? " — " + field("c-phone") : ""}`,
                    field("c-message"),
                  ].filter(Boolean);
                  window.open(waLink(lines.join("\n")), "_blank", "noopener");
                  setSent(true);
                }}
                className="rounded-2xl border border-coffee-100/70 bg-white p-6 shadow-soft"
              >
                <h3 className="font-serif text-xl font-bold text-coffee-900">{t("contact.formHeading")}</h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="field-label" htmlFor="c-name">{t("contact.name")}</label>
                    <input id="c-name" required className="field" />
                  </div>
                  <div>
                    <label className="field-label" htmlFor="c-email">{t("contact.email")}</label>
                    <input id="c-email" type="email" required className="field" />
                  </div>
                  <div>
                    <label className="field-label" htmlFor="c-phone">{t("contact.phone")}</label>
                    <input id="c-phone" className="field" />
                  </div>
                  <div>
                    <label className="field-label" htmlFor="c-subject">{t("contact.subject")}</label>
                    <input id="c-subject" className="field" />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="field-label" htmlFor="c-message">{t("contact.message")}</label>
                  <textarea id="c-message" required rows={4} className="field resize-none" />
                </div>
                <button type="submit" className="btn btn-primary mt-5 w-full justify-center">{t("contact.send")}</button>
              </form>
            )}
          </div>
        </div>
      </Section>
    </>
  );
}
