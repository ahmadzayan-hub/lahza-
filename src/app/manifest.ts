import type { MetadataRoute } from "next";
import { SITE } from "@/lib/config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE.name} — Order Control Console`,
    short_name: SITE.name,
    description: SITE.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: SITE.themeColorLight,
    theme_color: SITE.themeColorLight,
    lang: "en",
    dir: "ltr",
    categories: ["business", "productivity", "utilities"],
    icons: [
      { src: "/icon-192.svg", sizes: "192x192", type: "image/svg+xml", purpose: "any" },
      { src: "/icon-512.svg", sizes: "512x512", type: "image/svg+xml", purpose: "any" },
      { src: "/icon-512.svg", sizes: "512x512", type: "image/svg+xml", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "New conversation", url: "/intake", short_name: "Intake" },
      { name: "Inbox",             url: "/inbox",  short_name: "Inbox" },
      { name: "Payments",          url: "/payments", short_name: "Pay" },
    ],
  };
}
