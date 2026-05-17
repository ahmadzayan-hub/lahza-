"use client";
import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { AppHeader } from "@/components/layout/AppHeader";
import { ToastProvider } from "@/components/ui/Toast";
import type { ReactNode } from "react";

export default function AppLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ToastProvider>
      <div className="app-layout">
        <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="app-main flex flex-col min-h-screen">
          <AppHeader onMenuClick={() => setSidebarOpen(true)} />
          <main id="main" className="flex-1 px-4 sm:px-6 py-6 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
