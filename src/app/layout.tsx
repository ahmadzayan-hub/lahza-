import type { Metadata, Viewport } from "next";
import { Space_Grotesk, IBM_Plex_Sans_Arabic, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n/I18nProvider";
import { ThemeProvider } from "@/lib/theme";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Distinctive Latin display font, geometric and a touch unconventional
const sans = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans"
});

// Quality Arabic typeface, full diacritic support
const arabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-arabic"
});

// Mono for prompt output (developer-friendly readability)
const mono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono"
});

export const metadata: Metadata = {
  title: "Prismly · Refract any idea into the perfect prompt",
  description: "Turn rough ideas into structured, model-aware prompts. Voice, file, multilingual (EN/AR), offline-ready.",
  applicationName: "Prismly",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Prismly", statusBarStyle: "default" },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg"
  }
};

export const viewport: Viewport = {
  themeColor: "#6366f1",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5
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
        <script
          dangerouslySetInnerHTML={{
            __html: `if ('serviceWorker' in navigator) { window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(()=>{})); }`
          }}
        />
      </body>
    </html>
  );
}
