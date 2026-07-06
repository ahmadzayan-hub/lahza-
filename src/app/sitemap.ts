import type { MetadataRoute } from "next";

const PAGES = [
  "/", "/intake", "/inbox", "/customers", "/orders", "/payments",
  "/couriers", "/inventory", "/offers", "/suppliers", "/reviews",
  "/reports", "/integrations", "/settings", "/prompts", "/audit", "/login",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://wasl.app").replace(/\/$/, "");
  const now = new Date();
  return PAGES.map((p) => ({
    url: `${base}${p}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: p === "/" ? 1 : 0.6,
  }));
}
