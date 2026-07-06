import type { Metadata, Viewport } from "next";
import { Space_Grotesk, IBM_Plex_Sans_Arabic, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n/I18nProvider";
import { ThemeProvider } from "@/lib/theme";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const sans = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans"
});

const arabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-arabic"
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono"
});

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://draftly.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Draftly · Every idea deserves a proper draft",
    template: "%s · Draftly"
  },
  description:
    "Draftly is a free, bilingual (English + Arabic), offline-ready tool that turns rough ideas into structured, model-aware prompts for ChatGPT, Claude, Copilot and Gemini. Type, speak, or attach a file, and Draftly does the rest.",
  keywords: [
    "prompt engineering",
    "AI prompt writing",
    "prompt builder",
    "ChatGPT prompts",
    "Claude prompts",
    "Arabic AI",
    "صياغة",
    "منشئ الأوامر",
    "prompt optimization",
    "free prompt tool",
    "prompt template",
    "prompt library",
    "bilingual AI"
  ],
  applicationName: "Draftly",
  authors: [{ name: "Draftly" }],
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Draftly", statusBarStyle: "default" },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg"
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      en: `${SITE_URL}/`,
      ar: `${SITE_URL}/`,
      "x-default": `${SITE_URL}/`
    }
  },
  openGraph: {
    type: "website",
    siteName: "Draftly",
    title: "Draftly · Every idea deserves a proper draft",
    description:
      "A free, bilingual, offline-ready prompt engineering tool. Turn rough ideas into structured prompts for any AI model.",
    url: SITE_URL,
    locale: "en_US",
    alternateLocale: ["ar_AE", "ar_SA", "ar_EG"],
    images: [{ url: "/icon.svg", width: 512, height: 512, alt: "Draftly" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Draftly · Every idea deserves a proper draft",
    description:
      "Turn rough ideas into structured, model-aware prompts. Free, bilingual, offline-ready.",
    images: ["/icon.svg"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" }
  }
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0f766e" },
    { media: "(prefers-color-scheme: dark)", color: "#134e4a" }
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5
};

// JSON-LD structured data for search + AI systems
const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Draftly",
  alternateName: "صياغة",
  description:
    "A free, bilingual (English + Arabic) prompt engineering tool. Turns rough ideas into structured, model-aware prompts for ChatGPT, Claude, Copilot and Gemini. Offline-ready.",
  url: SITE_URL,
  applicationCategory: "ProductivityApplication",
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript. Best in a modern browser.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  inLanguage: ["en", "ar"],
  featureList: [
    "Eight prompt engineering methods",
    "Prompt quality score",
    "Method comparison",
    "Voice dictation",
    "File attachments",
    "Local history and dashboard",
    "Bilingual English and Arabic",
    "Offline local engine",
    "Installable on Android"
  ]
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      dir="ltr"
      suppressHydrationWarning
      className={`${sans.variable} ${arabic.variable} ${mono.variable}`}
    >
      <body className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors font-sans">
        <ThemeProvider>
          <I18nProvider>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </I18nProvider>
        </ThemeProvider>

        {/* Structured data for classical search AND generative AI answer engines */}
        <Script
          id="draftly-jsonld"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />

        <Script id="sw-register" strategy="afterInteractive">
          {`if ('serviceWorker' in navigator) { window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(()=>{})); }`}
        </Script>
      </body>
    </html>
  );
}
