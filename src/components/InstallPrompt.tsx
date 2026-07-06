"use client";
import { useEffect, useState } from "react";
import { Download } from "lucide-react";

// Registers the service worker and surfaces the Android/Chrome
// "Add to home screen" install prompt as a first-class button.
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
  prompt(): Promise<void>;
}

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    const installedHandler = () => setVisible(false);
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", installedHandler);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  async function onInstall() {
    if (!deferred) return;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === "accepted") setVisible(false);
    setDeferred(null);
  }

  if (!visible) return null;
  return (
    <button
      onClick={onInstall}
      className="btn btn-accent btn-sm fixed bottom-4 right-4 z-40 shadow-cardHover"
      aria-label="Install Wasl on this device"
    >
      <Download size={16} strokeWidth={2.4} />
      <span>Install Wasl</span>
    </button>
  );
}
