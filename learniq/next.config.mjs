/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    const security = [
      { key: "X-Content-Type-Options",  value: "nosniff" },
      { key: "X-Frame-Options",         value: "SAMEORIGIN" },
      { key: "Referrer-Policy",         value: "strict-origin-when-cross-origin" },
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
    ];
    return [
      { source: "/api/:path*", headers: [
        { key: "Access-Control-Allow-Origin",  value: "*" },
        { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,DELETE,OPTIONS" },
        { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization, x-org-id" },
        ...security,
      ]},
      { source: "/:path*", headers: security },
    ];
  },
};

export default nextConfig;
