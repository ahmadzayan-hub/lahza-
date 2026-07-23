import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { en } from "./en";
import { ar } from "./ar";
import type { Dict } from "./dict";

export type Lang = "en" | "ar";
export type { Dict };

const DICTS: Record<Lang, Dict> = { en, ar };
const STORAGE_KEY = "lahza.lang";
const LEGACY_STORAGE_KEY = "bcm.lang";

type Vars = Record<string, string | number>;

interface I18nValue {
  lang: Lang;
  dir: "ltr" | "rtl";
  isRtl: boolean;
  setLang: (l: Lang) => void;
  toggleLang: () => void;
  /** Translate a dot-path key, with optional {var} interpolation. */
  t: (path: string, vars?: Vars) => string;
  /** Read a raw (non-string) dictionary node — e.g. arrays of FAQ items. */
  raw: <T = unknown>(path: string) => T;
  /** Pick the correct string from an { en, ar } pair. */
  pick: <T>(pair: { en: T; ar: T }) => T;
}

const I18nContext = createContext<I18nValue | null>(null);

function lookupRaw(dict: Dict, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>((acc, key) => (acc && typeof acc === "object" ? (acc as Record<string, unknown>)[key] : undefined), dict);
}

function lookup(dict: Dict, path: string): string {
  const value = lookupRaw(dict, path);
  return typeof value === "string" ? value : path;
}

function interpolate(template: string, vars?: Vars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, k: string) => (k in vars ? String(vars[k]) : `{${k}}`));
}

function detectInitialLang(): Lang {
  if (typeof window === "undefined") return "en";
  const stored =
    window.localStorage.getItem(STORAGE_KEY) ?? window.localStorage.getItem(LEGACY_STORAGE_KEY);
  if (stored === "en" || stored === "ar") return stored;
  return navigator.language?.toLowerCase().startsWith("ar") ? "ar" : "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectInitialLang);

  const dir = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = dir;
    window.localStorage.setItem(STORAGE_KEY, lang);
  }, [lang, dir]);

  const setLang = useCallback((l: Lang) => setLangState(l), []);
  const toggleLang = useCallback(() => setLangState((l) => (l === "en" ? "ar" : "en")), []);

  const t = useCallback(
    (path: string, vars?: Vars) => interpolate(lookup(DICTS[lang], path), vars),
    [lang],
  );

  const raw = useCallback(
    <T = unknown,>(path: string): T => lookupRaw(DICTS[lang], path) as T,
    [lang],
  );

  const pick = useCallback(
    <T,>(pair: { en: T; ar: T }): T => pair[lang],
    [lang],
  );

  const value = useMemo<I18nValue>(
    () => ({ lang, dir, isRtl: dir === "rtl", setLang, toggleLang, t, raw, pick }),
    [lang, dir, setLang, toggleLang, t, raw, pick],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
