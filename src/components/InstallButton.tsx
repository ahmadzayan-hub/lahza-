"use client";

import { useEffect, useState } from "react";
import { useT } from "@/lib/i18n/I18nProvider";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * Renders a native install prompt for Android Chrome, Edge, and Chromium
 * desktop browsers that fire the `beforeinstallprompt` event. On iOS and
 * unsupported browsers it stays hidden and the instruction cards on the
 * page take over.
 */
export default function InstallButton() {
  const t = useT();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Already installed?
    if (window.matchMedia?.("(display-mode: standalone)").matches) {
      setInstalled(true);
    }
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) {
    return (
      <p className="text-sm text-brand-700 dark:text-brand-300 font-medium">
        {t("install.installed")}
      </p>
    );
  }
  if (!deferred) return null;

  async function trigger() {
    if (!deferred) return;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setDeferred(null);
  }

  return (
    <button onClick={trigger} className="btn-primary">
      {t("install.btn.install")}
    </button>
  );
}
