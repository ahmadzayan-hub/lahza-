import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useI18n } from "@/i18n/I18nContext";

const ORIGIN = "https://lahza.ae";

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let tag = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

function upsertHreflang(hreflang: string, href: string) {
  const selector = `link[rel="alternate"][hreflang="${hreflang}"]`;
  let link = document.head.querySelector(selector);
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "alternate");
    link.setAttribute("hreflang", hreflang);
    document.head.appendChild(link);
  }
  link.setAttribute("href", href);
}

/**
 * Per-route SEO + AIO: title, description, canonical, Open Graph, and optional
 * JSON-LD structured data (helps Google rich results and AI answer engines).
 */
export function Seo({
  title,
  description,
  jsonLd,
}: {
  title: string;
  description?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}) {
  const { lang } = useI18n();
  const { pathname } = useLocation();

  useEffect(() => {
    const full = `${title} · Lahza`;
    const url = `${ORIGIN}${pathname === "/" ? "" : pathname}`;
    document.title = full;

    if (description) upsertMeta("name", "description", description);
    upsertMeta("property", "og:title", full);
    if (description) upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:url", url);
    upsertMeta("property", "og:locale", lang === "ar" ? "ar_AE" : "en_AE");

    // canonical
    let link = document.head.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", url);

    // hreflang alternates so Google understands the bilingual pair —
    // same URL, both languages, plus x-default.
    upsertHreflang("en-AE", url);
    upsertHreflang("ar-AE", url);
    upsertHreflang("x-default", url);

    // document lang mirrors the active locale for AT (screen readers,
    // browser translate detection, spellcheck).
    document.documentElement.setAttribute("lang", lang === "ar" ? "ar" : "en");

    // per-route structured data
    const existing = document.getElementById("route-jsonld");
    if (existing) existing.remove();
    if (jsonLd) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = "route-jsonld";
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }
  }, [title, description, jsonLd, lang, pathname]);

  return null;
}
