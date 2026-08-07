import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { track } from "@/lib/analytics";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandalone() {
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    // iOS Safari
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function isIos() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

/**
 * Progressive-web-app install affordance — this is the "download the app"
 * experience. On Android/Chrome we capture `beforeinstallprompt` and drive the
 * native install dialog; on iOS Safari (which has no such event) we show the
 * Add-to-Home-Screen hint. Renders nothing when already installed.
 */
export function useInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(isStandalone());

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
      track("pwa_installed");
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferred) return;
    track("pwa_install_click");
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
  };

  return {
    installed,
    // Show the CTA if we can prompt (Android) or on iOS where the manual hint applies.
    canInstall: !installed && (!!deferred || isIos()),
    needsIosHint: !installed && !deferred && isIos(),
    install,
  };
}

/** Inline install button, e.g. in the Home "get the app" section. */
export function InstallAppButton() {
  const { t } = useI18n();
  const { canInstall, needsIosHint, install } = useInstallPrompt();
  const [showHint, setShowHint] = useState(false);

  if (!canInstall) return null;

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={() => (needsIosHint ? setShowHint((v) => !v) : install())}
        className="gold-cta inline-flex items-center gap-2"
      >
        <Download size={18} />
        {t("app.install")}
      </button>
      {needsIosHint && showHint && (
        <p className="inline-flex items-center gap-1 text-xs text-cream/70">
          <Share size={14} /> {t("app.iosHint")}
        </p>
      )}
    </div>
  );
}

/** Dismissible bottom banner shown once the browser reports installability. */
export function InstallBanner() {
  const { t } = useI18n();
  const { canInstall, needsIosHint, install } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem("bs_install_dismissed") === "1",
  );

  if (!canInstall || dismissed || needsIosHint) return null;

  const close = () => {
    sessionStorage.setItem("bs_install_dismissed", "1");
    setDismissed(true);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-3 pb-3">
      <div className="mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-gold/25 bg-ink/95 p-3 shadow-glow backdrop-blur">
        <img src="/icon.svg" alt="" width={40} height={40} className="rounded-xl" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-cream">{t("app.bannerTitle")}</p>
          <p className="truncate text-xs text-cream/60">{t("app.bannerSubtitle")}</p>
        </div>
        <button onClick={install} className="gold-cta whitespace-nowrap px-4 py-2 text-sm">
          {t("app.install")}
        </button>
        <button onClick={close} aria-label="Close" className="text-cream/50 hover:text-cream">
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
