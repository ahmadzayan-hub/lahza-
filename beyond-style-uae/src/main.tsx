import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "@/App";
import { initAnalytics } from "@/lib/analytics";
import "@/index.css";

// Initialize GA4 + Meta Pixel once at boot.
initAnalytics();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Register the service worker for offline support and installability (PWA).
// Only in production builds served over http(s); skipped during `vite dev`.
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* SW registration is a progressive enhancement — ignore failures. */
    });
  });
}
