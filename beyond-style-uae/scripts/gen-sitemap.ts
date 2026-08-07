/**
 * Build-time sitemap generator. Emits public/sitemap.xml from the known static
 * routes plus every product slug, with bilingual <xhtml:link hreflang> alternates
 * (ar/en) so search engines index both locales of a single-page SPA cleanly.
 *
 * Wired as `prebuild` so the sitemap always ships in sync with the catalogue.
 * Override the canonical origin with SITE_URL at build time.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { SAMPLE_PRODUCTS } from "../src/lib/sample-data";

const SITE = (process.env.SITE_URL ?? "https://beyondstyle.ae").replace(/\/$/, "");
const today = new Date().toISOString().slice(0, 10);

const staticRoutes: { path: string; priority: number; changefreq: string }[] = [
  { path: "/", priority: 1.0, changefreq: "daily" },
  { path: "/about", priority: 0.5, changefreq: "monthly" },
  { path: "/shipping", priority: 0.5, changefreq: "monthly" },
  { path: "/returns", priority: 0.5, changefreq: "monthly" },
  { path: "/payment-methods", priority: 0.5, changefreq: "monthly" },
  { path: "/contact", priority: 0.5, changefreq: "monthly" },
  { path: "/privacy", priority: 0.3, changefreq: "yearly" },
  { path: "/terms", priority: 0.3, changefreq: "yearly" },
];

const productRoutes = SAMPLE_PRODUCTS.map((p) => ({
  path: `/product/${p.slug}`,
  priority: 0.8,
  changefreq: "weekly",
}));

function urlEntry(path: string, priority: number, changefreq: string) {
  const loc = `${SITE}${path}`;
  const alt = (hreflang: string) =>
    `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${loc}"/>`;
  return [
    "  <url>",
    `    <loc>${loc}</loc>`,
    `    <lastmod>${today}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority.toFixed(1)}</priority>`,
    alt("ar"),
    alt("en"),
    alt("x-default"),
    "  </url>",
  ].join("\n");
}

const body = [...staticRoutes, ...productRoutes]
  .map((r) => urlEntry(r.path, r.priority, r.changefreq))
  .join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${body}
</urlset>
`;

const outDir = resolve(dirname(fileURLToPath(import.meta.url)), "../public");
mkdirSync(outDir, { recursive: true });
writeFileSync(resolve(outDir, "sitemap.xml"), xml);
console.log(`✓ sitemap.xml written (${staticRoutes.length + productRoutes.length} urls) → ${SITE}`);
