import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://draftly.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages = ["", "workspace", "templates", "history", "install", "login"];
  return pages.map((p) => ({
    url: `${SITE_URL}/${p}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1.0 : 0.7,
    alternates: {
      languages: {
        en: `${SITE_URL}/${p}`,
        ar: `${SITE_URL}/${p}`
      }
    }
  }));
}
