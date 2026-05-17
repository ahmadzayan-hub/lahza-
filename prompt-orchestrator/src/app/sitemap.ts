import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.tweenz.ae";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${BASE}/`,               lastModified: now, priority: 1,   changeFrequency: "weekly" },
    { url: `${BASE}/features`,        lastModified: now, priority: 0.9, changeFrequency: "monthly" },
    { url: `${BASE}/pricing`,         lastModified: now, priority: 0.9, changeFrequency: "monthly" },
    { url: `${BASE}/how-it-works`,    lastModified: now, priority: 0.8, changeFrequency: "monthly" },
    { url: `${BASE}/for-students`,    lastModified: now, priority: 0.8, changeFrequency: "monthly" },
    { url: `${BASE}/faq`,             lastModified: now, priority: 0.7, changeFrequency: "monthly" },
    { url: `${BASE}/contact`,         lastModified: now, priority: 0.6, changeFrequency: "yearly" },
    { url: `${BASE}/privacy`,         lastModified: now, priority: 0.4, changeFrequency: "yearly" },
    { url: `${BASE}/terms`,           lastModified: now, priority: 0.4, changeFrequency: "yearly" },
    { url: `${BASE}/login`,           lastModified: now, priority: 0.5, changeFrequency: "yearly" },
    { url: `${BASE}/signup`,          lastModified: now, priority: 0.6, changeFrequency: "yearly" },
  ];
}
