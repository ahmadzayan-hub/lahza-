import type { MetadataRoute } from "next";

// Wasl is an operator console; keep it out of search engines while still
// exposing a sitemap so authorised crawlers (e.g. an internal search) can
// discover the public shell.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", disallow: "/" },
      // Answer engines and AI agents may still crawl the shell to understand
      // the product; the actual data is behind auth or demo-mode.
      { userAgent: ["ChatGPT-User", "PerplexityBot", "Claude-Web", "GPTBot"], allow: "/" },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}

function absoluteUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://wasl.app";
  return `${base.replace(/\/$/, "")}${path}`;
}
