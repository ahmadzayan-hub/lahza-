import type { Metadata, Viewport } from "next";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n/I18nProvider";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://zaian.studio";
const TITLE = "ZAIan Studio — منصة هندسة الموجّهات | Prompt Engineering Platform";
const DESCRIPTION =
  "ZAIan Studio is a bilingual Arabic–English prompt engineering platform. 11 professional methods, meta-AI analysis, 10-dimension quality scoring. Free to use, built in the UAE. | زيان ستوديو — منصة هندسة الموجّهات ثنائية اللغة. أحد عشر أسلوباً احترافياً، تحليل متعدد النماذج، وتقييم دقيق عبر عشرة محاور. مجاني، صُنع في الإمارات.";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: { default: TITLE, template: "%s · ZAIan Studio" },
  description: DESCRIPTION,
  applicationName: "ZAIan Studio",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "ZAIan Studio", statusBarStyle: "black-translucent" },
  icons: { icon: "/icon.svg", apple: "/apple-icon.png" },
  authors: [{ name: "ZAIan Studio", url: APP_URL }],
  keywords: [
    "ZAIan Studio", "prompt engineering", "prompt methods", "AI prompts",
    "Arabic AI", "bilingual AI", "UAE AI", "chain of thought", "role prompting",
    "meta prompting", "prompt quality", "prompt scoring", "Arabic prompts",
    "هندسة الموجّهات", "موجّهات الذكاء الاصطناعي", "زيان ستوديو",
    "ذكاء اصطناعي عربي", "منصة الموجّهات", "تحسين الموجّهات"
  ],
  openGraph: {
    type: "website",
    title: TITLE,
    description: DESCRIPTION,
    url: APP_URL,
    siteName: "ZAIan Studio",
    locale: "en_US",
    alternateLocale: "ar_AE",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "ZAIan Studio — Prompt Engineering Platform" }]
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og-image.svg"]
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  alternates: {
    canonical: APP_URL,
    languages: { "en": `${APP_URL}`, "ar": `${APP_URL}?lang=ar` },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#6366f1" },
    { media: "(prefers-color-scheme: dark)",  color: "#0f0f23" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Sora — geometric Latin; Cairo — humanist Arabic */}
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=Cairo:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        {/* Prevent flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var k='tz_theme',v=localStorage.getItem(k);var d=v==='dark'||((v===null||v==='system')&&window.matchMedia('(prefers-color-scheme:dark)').matches);if(d)document.documentElement.classList.add('dark');}catch(e){}})();`
          }}
        />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:start-2 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:rounded-xl focus:shadow-lg focus:text-brand-700 focus:font-medium"
        >
          Skip to content
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "ZAIan Studio",
              alternateName: ["زيان ستوديو", "Prompt Intelligence Platform", "منصة هندسة الموجّهات"],
              description: DESCRIPTION,
              url: APP_URL,
              applicationCategory: "ProductivityApplication",
              operatingSystem: "Any",
              countryOfOrigin: { "@type": "Country", name: "United Arab Emirates" },
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD", description: "Free to use" },
              inLanguage: ["en", "ar"],
              featureList: [
                "11 Prompt Engineering Methods",
                "Meta-AI Analysis",
                "10-Dimension Quality Scoring",
                "Arabic and English Support",
                "Voice Input",
                "Prompt Library",
                "Android App"
              ],
              audience: { "@type": "Audience", audienceType: "Professionals, developers, content creators, Arabic speakers" },
              downloadUrl: `${APP_URL}/download`,
              screenshot: `${APP_URL}/og-image.svg`
            })
          }}
        />
        <I18nProvider>
          {children}
        </I18nProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker'in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}));}`
          }}
        />
      </body>
    </html>
  );
}
