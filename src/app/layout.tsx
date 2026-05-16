import type { Metadata, Viewport } from "next";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n/I18nProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Prismly — Refract any idea into the perfect prompt",
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
    <html lang="en" dir="ltr">
      <body>
        <I18nProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </I18nProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `if ('serviceWorker' in navigator) { window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(()=>{})); }`
          }}
        />
      </body>
    </html>
  );
}
