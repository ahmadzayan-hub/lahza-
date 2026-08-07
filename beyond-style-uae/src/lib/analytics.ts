// GA4 + Meta Pixel initialization and a single typed event funnel.
// Loaded once from main.tsx. No-ops gracefully when IDs are absent.

const GA4_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID;
const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID;

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
    fbq: ((...args: unknown[]) => void) & { queue?: unknown[]; loaded?: boolean };
  }
}

let initialized = false;

export function initAnalytics(): void {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  // --- GA4 ---
  if (GA4_ID) {
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", GA4_ID);
  }

  // --- Meta Pixel ---
  if (PIXEL_ID) {
    /* eslint-disable */
    (function (f: any, b, e, v) {
      if (f.fbq) return;
      const n: any = (f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      });
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = "2.0";
      n.queue = [];
      const t = b.createElement(e) as HTMLScriptElement;
      t.async = true;
      t.src = v;
      const s = b.getElementsByTagName(e)[0];
      s.parentNode!.insertBefore(t, s);
    })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    /* eslint-enable */
    window.fbq("init", PIXEL_ID);
    window.fbq("track", "PageView");
  }
}

type EventName =
  | "view_item"
  | "add_to_cart"
  | "begin_checkout"
  | "purchase"
  | "free_shipping_unlocked"
  | "pwa_install_click"
  | "pwa_installed";

const PIXEL_MAP: Partial<Record<EventName, string>> = {
  view_item: "ViewContent",
  add_to_cart: "AddToCart",
  begin_checkout: "InitiateCheckout",
  purchase: "Purchase",
};

/** Fire a funnel event to both GA4 and Meta Pixel. */
export function track(event: EventName, params: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;
  window.gtag?.("event", event, params);
  const pixelEvent = PIXEL_MAP[event];
  if (pixelEvent) window.fbq?.("track", pixelEvent, params);
}
