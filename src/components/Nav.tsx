"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import clsx from "clsx";
import {
  LayoutDashboard, MessageSquarePlus, Inbox as InboxIcon, Users, Package, CreditCard,
  Truck, Boxes, Tag, Factory, Star, BarChart3, Cable, Settings as SettingsIcon,
  Sparkles, ClipboardList, ChevronDown, ChevronUp,
} from "lucide-react";
import { Lockup, Mark } from "./Logo";
import { t } from "@/lib/i18n";
import type { Locale } from "@/lib/config";

export interface NavBadges {
  inbox: number;
  payments: number;
  disputes: number;
  attention: number;
}

type IconType = typeof LayoutDashboard;
interface NavItem {
  href: string;
  key: string;
  group: string;
  Icon: IconType;
  badgeKey?: keyof NavBadges;
}

const NAV: NavItem[] = [
  { href: "/",             key: "nav_dashboard",        group: "nav_group_operate", Icon: LayoutDashboard,    badgeKey: "attention" },
  { href: "/intake",       key: "nav_new_conversation", group: "nav_group_operate", Icon: MessageSquarePlus },
  { href: "/inbox",        key: "nav_inbox",            group: "nav_group_operate", Icon: InboxIcon,          badgeKey: "inbox" },
  { href: "/customers",    key: "nav_customers",        group: "nav_group_records", Icon: Users },
  { href: "/orders",       key: "nav_orders",           group: "nav_group_records", Icon: Package },
  { href: "/payments",     key: "nav_payments",         group: "nav_group_records", Icon: CreditCard,         badgeKey: "payments" },
  { href: "/couriers",     key: "nav_couriers",         group: "nav_group_records", Icon: Truck },
  { href: "/inventory",    key: "nav_inventory",        group: "nav_group_records", Icon: Boxes },
  { href: "/offers",       key: "nav_offers",           group: "nav_group_records", Icon: Tag },
  { href: "/suppliers",    key: "nav_suppliers",        group: "nav_group_records", Icon: Factory },
  { href: "/reviews",      key: "nav_reviews",          group: "nav_group_records", Icon: Star },
  { href: "/reports",      key: "nav_reports",          group: "nav_group_insight", Icon: BarChart3 },
  { href: "/integrations", key: "nav_integrations",     group: "nav_group_admin",   Icon: Cable },
  { href: "/settings",     key: "nav_settings",         group: "nav_group_admin",   Icon: SettingsIcon },
  { href: "/prompts",      key: "nav_prompts",          group: "nav_group_admin",   Icon: Sparkles },
  { href: "/audit",        key: "nav_audit",            group: "nav_group_admin",   Icon: ClipboardList },
];

const DEFAULT_BADGES: NavBadges = { inbox: 0, payments: 0, disputes: 0, attention: 0 };

export default function Nav({
  mobile, badges = DEFAULT_BADGES, locale = "en",
}: { mobile?: boolean; badges?: NavBadges; locale?: Locale }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (mobile) {
    return (
      <div className="rounded-2xl border border-mist bg-chalk/80 p-2 shadow-card backdrop-blur">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold focus-ring"
          aria-expanded={open}
        >
          <span className="flex items-center gap-2">
            <Mark size={22} className="text-rose-500" />
            <span className="font-display text-base tracking-tight">{t("brand_name", locale)}</span>
            {badges.attention > 0 && (
              <span className="badge badge-vip" aria-label={`${badges.attention} items need attention`}>
                {badges.attention}
              </span>
            )}
          </span>
          {open ? <ChevronUp size={16} className="text-smoke" /> : <ChevronDown size={16} className="text-smoke" />}
        </button>
        {open && (
          <div className="mt-2 border-t border-mist/60 pt-2">
            <NavList pathname={pathname} onNav={() => setOpen(false)} badges={badges} locale={locale} />
          </div>
        )}
      </div>
    );
  }

  return (
    <nav className="flex h-full flex-col gap-4 p-5 text-sm">
      <Link href="/" className="focus-ring block rounded-lg px-2 py-1" aria-label={t("brand_name", locale)}>
        <Lockup size={26} />
      </Link>
      <NavList pathname={pathname} badges={badges} locale={locale} />
      <div className="mt-auto rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
        <div className="font-semibold">{t("nav_note_title", locale)}</div>
        <div className="mt-1 text-rose-700/80">{t("nav_note_body", locale)}</div>
      </div>
    </nav>
  );
}

function NavList({
  pathname, onNav, badges, locale,
}: { pathname: string; onNav?: () => void; badges: NavBadges; locale: Locale }) {
  const groups = Array.from(new Set(NAV.map((n) => n.group)));
  return (
    <div className="flex flex-col gap-4">
      {groups.map((g) => (
        <div key={g}>
          <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-smoke/70">
            {t(g, locale)}
          </div>
          <div className="flex flex-col">
            {NAV.filter((n) => n.group === g).map((n) => {
              const active = pathname === n.href;
              const count = n.badgeKey ? badges[n.badgeKey] : 0;
              const Icon = n.Icon;
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={onNav}
                  className={clsx(
                    "relative flex items-center justify-between gap-2 rounded-xl px-3 py-1.5 transition focus-ring",
                    active ? "nav-active-line bg-ink text-white shadow-sm" : "text-ink/80 hover:bg-sand/70"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Icon size={14} strokeWidth={2} className={active ? "text-white/70" : "text-smoke"} />
                    <span>{t(n.key, locale)}</span>
                  </span>
                  {count > 0 && (
                    <span
                      className={clsx(
                        "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                        active ? "bg-white/20 text-white" : "bg-rose-100 text-rose-700"
                      )}
                      aria-label={`${count} items`}
                    >
                      {count}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
