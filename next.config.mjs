/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [375, 640, 768, 1024, 1280, 1536],
    minimumCacheTTL: 86400,
  },

  // Compiler: remove console.log in production
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },

  async headers() {
    const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://zaian.studio";

    const security = [
      { key: "X-Content-Type-Options",  value: "nosniff" },
      { key: "X-Frame-Options",          value: "SAMEORIGIN" },
      { key: "Referrer-Policy",          value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy",       value: "camera=(), geolocation=(), microphone=(self)" },
      { key: "Strict-Transport-Security",value: "max-age=63072000; includeSubDomains; preload" },
    ];

    return [
      // Public API — restricted CORS (only own origin + extension)
      {
        source: "/api/v1/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin",  value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
          ...security,
        ],
      },
      // Private API — same-origin only
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin",  value: APP_URL },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,PATCH,DELETE,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization, x-org-id" },
          { key: "Vary",                          value: "Origin" },
          ...security,
        ],
      },
      // Static assets — long cache
      {
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      // Fonts + SVG icons
      {
        source: "/fonts/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      // SW + manifest — short cache so updates propagate
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        source: "/manifest.webmanifest",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400" },
          { key: "Content-Type",  value: "application/manifest+json" },
        ],
      },
      // All other routes
      {
        source: "/:path*",
        headers: security,
      },
    ];
  },
};

export default nextConfig;
