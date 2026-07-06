import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://zaian.studio";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${BASE}/`,          lastModified: now, priority: 1,    changeFrequency: "weekly"  },
    { url: `${BASE}/workspace`, lastModified: now, priority: 0.95, changeFrequency: "weekly"  },
    { url: `${BASE}/download`,  lastModified: now, priority: 0.9,  changeFrequency: "monthly" },
    { url: `${BASE}/library`,   lastModified: now, priority: 0.85, changeFrequency: "weekly"  },
    { url: `${BASE}/dashboard`, lastModified: now, priority: 0.8,  changeFrequency: "weekly"  },
    { url: `${BASE}/templates`, lastModified: now, priority: 0.8,  changeFrequency: "monthly" },
    { url: `${BASE}/learn`,     lastModified: now, priority: 0.75, changeFrequency: "monthly" },
    { url: `${BASE}/history`,   lastModified: now, priority: 0.6,  changeFrequency: "weekly"  },
    { url: `${BASE}/share`,     lastModified: now, priority: 0.5,  changeFrequency: "monthly" },
    { url: `${BASE}/login`,     lastModified: now, priority: 0.5,  changeFrequency: "yearly"  },
    { url: `${BASE}/privacy`,   lastModified: now, priority: 0.3,  changeFrequency: "yearly"  },
    { url: `${BASE}/offline`,   lastModified: now, priority: 0.2,  changeFrequency: "yearly"  },
  ];
}
