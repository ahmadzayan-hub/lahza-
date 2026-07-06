import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import InstallPrompt from "@/components/InstallPrompt";
import LangSwitcher from "@/components/LangSwitcher";
import { fetchRows, fetchKpis } from "@/lib/data";
import { getLocale } from "@/lib/i18n-server";
import { isRtl, t } from "@/lib/i18n";
import { SITE } from "@/lib/config";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const display = Playfair_Display({ subsets: ["latin"], variable: "--font-display", display: "swap" });

async function getNavBadges() {
  try {
    const [{ kpis }, payments] = await Promise.all([
      fetchKpis(),
      fetchRows("payments", { where: { status: "needs_verification" } }),
    ]);
    return {
      inbox: kpis.hotLeads,
      payments: payments.rows.length,
      disputes: kpis.openDisputes,
      attention: kpis.hotLeads + payments.rows.length + kpis.openDisputes,
    };
  } catch {
    return { inbox: 0, payments: 0, disputes: 0, attention: 0 };
  }
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://wasl.app"),
  title: {
    default: `${SITE.name}. Order Control Console`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: ["Wasl", "UAE", "social commerce", "AI sales", "order control", "operations console", "AED"],
  openGraph: {
    title: `${SITE.name}. Order Control Console`,
    description: SITE.description,
    type: "website",
    locale: "en_AE",
    alternateLocale: ["ar_AE"],
    siteName: SITE.name,
  },
  twitter: { card: "summary_large_image", title: SITE.name, description: SITE.tagline },
  robots: { index: false, follow: false },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-touch-icon.svg" }],
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: SITE.themeColorLight },
    { media: "(prefers-color-scheme: dark)",  color: SITE.themeColorDark },
  ],
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: SITE.name,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: SITE.currency },
  description: SITE.description,
  inLanguage: ["en", "ar"],
  audience: { "@type": "Audience", geographicArea: { "@type": "Country", name: SITE.region } },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const badges = await getNavBadges();
  const locale = getLocale();
  const rtl = isRtl(locale);

  return (
    <html lang={locale} dir={rtl ? "rtl" : "ltr"} className={`${sans.variable} ${display.variable}`}>
      <body className="font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <a href="#main" className="skip-link">Skip to content</a>
        <div className="flex min-h-screen">
          <aside className={`hidden w-64 shrink-0 border-mist bg-chalk/60 backdrop-blur md:block ${rtl ? "border-l" : "border-r"}`}>
            <Nav badges={badges} locale={locale} />
          </aside>
          <main id="main" className="flex-1 p-4 md:p-8">
            <div className="mb-3 flex items-center justify-between gap-2 md:hidden">
              <div className="flex-1"><Nav mobile badges={badges} locale={locale} /></div>
            </div>
            <div className="mb-3 flex items-center justify-end gap-2">
              <LangSwitcher current={locale} />
            </div>
            <div className="enter">{children}</div>
          </main>
        </div>
        <InstallPrompt />
        <p className="sr-only">{t("brand_role", locale)}</p>
      </body>
    </html>
  );
}
