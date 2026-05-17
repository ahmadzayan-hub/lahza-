"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/I18nProvider";
import {
  GraduationCap, LayoutDashboard, BookOpen, Brain,
  CalendarCheck, TrendingUp, MessageSquare, Settings, X, Sparkles,
} from "lucide-react";
import clsx from "clsx";
import type { ReactNode } from "react";

interface NavItem { href: string; icon: ReactNode; label: string; color: string; }
interface SidebarProps { mobileOpen: boolean; onClose: () => void; }

function NavLink({ href, icon, label, color, onClose }: NavItem & { onClose?: () => void }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      onClick={onClose}
      className={clsx(
        "group flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 relative",
        active
          ? "nav-active shadow-sm"
          : "text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200"
      )}
    >
      {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 bg-white/50 rounded-r-full" />}
      <span className={clsx(
        "flex-shrink-0 w-5 h-5 transition-transform duration-200 group-hover:scale-110",
        active ? "text-white" : color
      )}>
        {icon}
      </span>
      <span className="flex-1 truncate">{label}</span>
    </Link>
  );
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const mainNav: NavItem[] = [
    { href: "/dashboard", icon: <LayoutDashboard size={18} />, label: "Today",    color: "text-brand-500"   },
    { href: "/courses",   icon: <BookOpen size={18} />,        label: "Courses",  color: "text-sky-500"     },
    { href: "/study",     icon: <Brain size={18} />,           label: "Study",    color: "text-violet-500"  },
    { href: "/plan",      icon: <CalendarCheck size={18} />,   label: "Plan",     color: "text-amber-500"   },
    { href: "/progress",  icon: <TrendingUp size={18} />,      label: "Progress", color: "text-emerald-500" },
  ];

  const sidebar = (
    <aside className="sidebar-glass flex flex-col h-full overflow-hidden">

      {/* Logo */}
      <div className="flex items-center justify-between px-5 h-16 flex-shrink-0 border-b border-white/40 dark:border-white/5">
        <Link href="/dashboard" className="flex items-center gap-2.5 group" onClick={onClose}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-md group-hover:shadow-glow transition-all duration-300 group-hover:scale-105">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-sm font-bold gradient-text">Tweenz AI</span>
            <p className="text-[9px] text-slate-400 -mt-0.5 leading-none">MBA Learning OS</p>
          </div>
        </Link>
        <button
          onClick={onClose}
          className="md:hidden w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-white/50 dark:hover:bg-white/10 transition"
          aria-label="Close menu"
        >
          <X size={16} />
        </button>
      </div>

      {/* Student pill */}
      <div className="mx-4 mt-4 mb-2 flex-shrink-0">
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-brand-50/80 to-purple-50/80 dark:from-brand-950/40 dark:to-purple-950/30 border border-brand-100/60 dark:border-brand-800/30">
          <div className="relative flex-shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              SA
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white dark:border-slate-950" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">Sara Al-Mansouri</p>
            <p className="text-[10px] text-slate-400 truncate">MBA Year 2</p>
          </div>
          <Sparkles className="w-3.5 h-3.5 text-brand-400 flex-shrink-0 animate-pulse-soft" />
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto" aria-label="Main navigation">
        {mainNav.map(item => (
          <NavLink key={item.href} {...item} onClose={onClose} />
        ))}
      </nav>

      {/* Footer nav */}
      <div className="px-3 pb-4 flex-shrink-0 space-y-1 border-t border-white/40 dark:border-white/5 pt-3">
        <NavLink href="/messages" icon={<MessageSquare size={18} />} label="Messages" color="text-cyan-500"  onClose={onClose} />
        <NavLink href="/settings" icon={<Settings size={18} />}      label="Settings"  color="text-slate-500" onClose={onClose} />
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-col flex-shrink-0" style={{ width: "var(--sidebar-w)" }}>
        <div className="sticky top-0 h-screen flex flex-col overflow-hidden">
          {sidebar}
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
          <div className="relative w-72 flex flex-col animate-slide-right shadow-2xl">
            {sidebar}
          </div>
        </div>
      )}
    </>
  );
}
