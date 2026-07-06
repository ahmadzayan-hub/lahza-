import type { Metadata } from "next";
import DownloadClient from "./DownloadClient";

export const metadata: Metadata = {
  title: "Download ZAIan Studio · تنزيل زيان ستوديو",
  description:
    "Download ZAIan Studio for Android — the full prompt engineering workspace in your pocket. Free APK, works offline, Arabic and English. | نزّل تطبيق زيان ستوديو للأندرويد — مساحة هندسة الموجّهات الكاملة في جيبك. مجاني، يعمل بلا إنترنت، بالعربية والإنجليزية.",
  openGraph: {
    title: "Download ZAIan Studio for Android · تنزيل زيان ستوديو",
    description: "Free Android app — 11 prompt methods, offline support, Arabic + English.",
    images: [{ url: "/og-download.png", width: 1200, height: 630 }],
  },
};

export default function DownloadPage() {
  return <DownloadClient />;
}
