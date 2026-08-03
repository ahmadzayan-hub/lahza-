import { useEffect, useId, useRef, useState } from "react";
import { Download, Share, Plus, X, Smartphone } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";
import { useInstall } from "@/lib/pwa";

/** Compact "Install app" control for the header / mobile menu. Shows a native
 *  prompt on Android/Chromium and an iOS Add-to-Home-Screen sheet otherwise. */
export function InstallButton({ className = "", block = false }: { className?: string; block?: boolean }) {
  const { t } = useI18n();
  const { canInstall, isIOS, installed, promptInstall } = useInstall();
  const [showIos, setShowIos] = useState(false);

  if (installed || (!canInstall && !isIOS)) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => (canInstall ? void promptInstall() : setShowIos(true))}
        className={`btn btn-outline btn-sm ${block ? "w-full justify-center" : ""} ${className}`}
      >
        <Download className="h-4 w-4" />
        {t("pwa.install")}
      </button>
      {showIos && <IosSheet onClose={() => setShowIos(false)} />}
    </>
  );
}

function IosSheet({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const titleId = useId();
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Trap focus + close on ESC. Restore focus to the opener on unmount.
    previousFocus.current = document.activeElement as HTMLElement | null;
    closeBtnRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      previousFocus.current?.focus?.();
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-coffee-900/40 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-sm rounded-3xl bg-cream-50 p-6 shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gold-500/15">
            <Smartphone className="h-5 w-5 text-gold-600" />
          </span>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label={t("common.close") || "Close"}
            className="rounded-full p-1 text-coffee-400 hover:bg-coffee-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <h3
          id={titleId}
          className="mt-3 font-display text-lg font-bold text-coffee-900"
        >
          {t("pwa.iosTitle")}
        </h3>
        <ol className="mt-3 space-y-2 text-sm text-coffee-600">
          <li className="flex items-center gap-2">
            <Share className="h-4 w-4 text-gold-600" /> {t("pwa.iosStep1")}
          </li>
          <li className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-gold-600" /> {t("pwa.iosStep2")}
          </li>
        </ol>
        <button
          type="button"
          onClick={onClose}
          className="btn btn-primary mt-5 w-full justify-center"
        >
          {t("common.confirm")}
        </button>
      </div>
    </div>
  );
}
