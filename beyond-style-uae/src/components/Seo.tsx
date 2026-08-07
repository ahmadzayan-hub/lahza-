import { useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { BRAND, DEFAULT_OG_IMAGE, SITE_URL, canonical } from "@/lib/seo";

interface SeoProps {
  title: string;
  description: string;
  /** Route path for the canonical URL, e.g. "/product/evil-eye-bracelet". */
  path: string;
  image?: string;
  /** "product" for PDPs, otherwise "website". */
  type?: "website" | "product";
  /** When false, ask engines not to index (cart, checkout, admin). */
  index?: boolean;
}

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel: string, href: string, hreflang?: string) {
  const selector = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]:not([hreflang])`;
  let el = document.head.querySelector<HTMLLinkElement>(selector);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    if (hreflang) el.setAttribute("hreflang", hreflang);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/**
 * Per-page SEO for the SPA: keeps <title>, description, canonical, hreflang
 * alternates, robots, and Open Graph / Twitter tags in sync as the route and
 * locale change. This is what makes each URL individually shareable and
 * indexable despite client-side rendering.
 */
export function Seo({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  type = "website",
  index = true,
}: SeoProps) {
  const { locale } = useI18n();

  useEffect(() => {
    const url = canonical(path);
    const fullTitle = title.includes(BRAND) ? title : `${title} — ${BRAND}`;

    document.title = fullTitle;
    upsertMeta("name", "description", description);
    upsertMeta("name", "robots", index ? "index, follow" : "noindex, follow");

    upsertLink("canonical", url);
    // ar and en resolve to the same URL (locale is a client toggle); declare
    // both plus x-default so engines understand the page is bilingual.
    upsertLink("alternate", url, "ar");
    upsertLink("alternate", url, "en");
    upsertLink("alternate", url, "x-default");

    upsertMeta("property", "og:site_name", BRAND);
    upsertMeta("property", "og:type", type === "product" ? "product" : "website");
    upsertMeta("property", "og:title", fullTitle);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:url", url);
    upsertMeta("property", "og:image", image);
    upsertMeta("property", "og:locale", locale === "ar" ? "ar_AE" : "en_AE");
    upsertMeta("property", "og:locale:alternate", locale === "ar" ? "en_AE" : "ar_AE");

    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", fullTitle);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:image", image);
  }, [title, description, path, image, type, index, locale]);

  return null;
}

export { SITE_URL };
