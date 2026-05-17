"use client";

import { useI18n } from "@/lib/i18n/I18nProvider";
import { METHODS, type PromptMethodId } from "@/lib/prompt-methods";

interface Props {
  value: PromptMethodId;
  onChange: (id: PromptMethodId) => void;
  className?: string;
}

export default function MethodSelector({ value, onChange, className }: Props) {
  const { locale } = useI18n();
  const current = METHODS.find((m) => m.id === value) ?? METHODS[0];

  return (
    <div className={className}>
      <label className="block text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
        {locale === "ar" ? "طريقة الموجِّه" : "Prompt method"}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as PromptMethodId)}
        className="w-full"
      >
        {METHODS.map((m) => (
          <option key={m.id} value={m.id}>
            {locale === "ar" ? m.name_ar : m.name_en}
          </option>
        ))}
      </select>
      <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
        {locale === "ar" ? current.desc_ar : current.desc_en}
        <span className="ms-1 text-slate-400 dark:text-slate-500">
          · {locale === "ar" ? "الأنسب لـ" : "best for"}:{" "}
          {locale === "ar" ? current.bestFor_ar : current.bestFor_en}
        </span>
      </p>
    </div>
  );
}
