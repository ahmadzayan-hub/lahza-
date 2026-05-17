import type { Metadata, Viewport } from "next";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n/I18nProvider";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.tweenz.ae";
const TITLE = "Tweenz AI Learning OS — MBA Study Platform | منصة التعلم الذكي";
const DESCRIPTION =
  "Tweenz AI Learning OS — bilingual AI academic operating system for MBA and university students. Manage courses, lectures, study packs, grades, deadlines, and AI tutor chat in one professional platform. From UAE to the world. | نظام تشغيل أكاديمي ذكي ثنائي اللغة لطلاب الماجستير والجامعات.";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: { default: TITLE, template: "%s · Tweenz AI" },
  description: DESCRIPTION,
  applicationName: "Tweenz AI",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Tweenz AI", statusBarStyle: "default" },
  icons: { icon: "/icon.svg", apple: "/apple-icon.png" },
  authors: [{ name: "Tweenz AI", url: APP_URL }],
  keywords: [
    "Tweenz AI", "MBA study app", "AI tutor", "study packs", "Moodle companion",
    "bilingual education", "Arabic learning", "UAE EdTech", "online MBA",
    "academic AI", "study flashcards", "grade tracker", "exam readiness",
    "منصة تعليمية", "تعلم ذكي", "ماجستير", "طلاب الجامعة"
  ],
  openGraph: {
    type: "website",
    title: TITLE,
    description: DESCRIPTION,
    url: APP_URL,
    siteName: "Tweenz AI",
    locale: "en_US",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Tweenz AI Learning OS" }]
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og-image.png"]
  },
  robots: { index: true, follow: true },
  alternates: { canonical: APP_URL },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
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
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap"
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
              name: "Tweenz AI Learning OS",
              alternateName: ["Tweenz AI", "منصة Tweenz التعليمية"],
              description: DESCRIPTION,
              url: APP_URL,
              applicationCategory: "EducationApplication",
              operatingSystem: "Any",
              countryOfOrigin: { "@type": "Country", name: "United Arab Emirates" },
              offers: [
                { "@type": "Offer", name: "Free Plan", price: "0", priceCurrency: "USD" },
                { "@type": "Offer", name: "Student Plan", price: "12", priceCurrency: "USD" },
              ],
              inLanguage: ["en", "ar"],
              audience: { "@type": "Audience", audienceType: "MBA and university students" }
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
