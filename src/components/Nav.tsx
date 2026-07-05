"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import clsx from "clsx";

export interface NavBadges {
  inbox: number;
  payments: number;
  disputes: number;
  attention: number;
}

const NAV: { href: string; label: string; group: string; icon: string; badgeKey?: keyof NavBadges }[] = [
  { href: "/",             label: "Dashboard",         group: "Operate", icon: "■", badgeKey: "attention" },
  { href: "/intake",       label: "New Conversation",  group: "Operate", icon: "✎" },
  { href: "/inbox",        label: "Customer Inbox",    group: "Operate", icon: "✉", badgeKey: "inbox" },
  { href: "/customers",    label: "Customers",         group: "Records", icon: "♛" },
  { href: "/orders",       label: "Orders",            group: "Records", icon: "▤" },
  { href: "/payments",     label: "Payments",          group: "Records", icon: "₿", badgeKey: "payments" },
  { href: "/couriers",     label: "Couriers & Delivery", group: "Records", icon: "↗" },
  { href: "/inventory",    label: "Inventory",         group: "Records", icon: "◫" },
  { href: "/offers",       label: "Offers",            group: "Records", icon: "✦" },
  { href: "/suppliers",    label: "Suppliers",         group: "Records", icon: "⊕" },
  { href: "/reviews",      label: "Reviews",           group: "Records", icon: "★" },
  { href: "/reports",      label: "Reports & Reviews", group: "Insight", icon: "▥" },
  { href: "/integrations", label: "Integrations",      group: "Admin",   icon: "⇄" },
  { href: "/settings",     label: "Settings",          group: "Admin",   icon: "⚙" },
  { href: "/prompts",      label: "Prompt Management", group: "Admin",   icon: "≡" },
  { href: "/audit",        label: "Audit Log",         group: "Admin",   icon: "⌖" },
];

const DEFAULT_BADGES: NavBadges = { inbox: 0, payments: 0, disputes: 0, attention: 0 };

export default function Nav({ mobile, badges = DEFAULT_BADGES }: { mobile?: boolean; badges?: NavBadges }) {
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
            <span className="font-display text-base tracking-tight">Beyond Style UAE</span>
            {badges.attention > 0 && (
              <span className="badge badge-vip" aria-label={`${badges.attention} items need attention`}>{badges.attention}</span>
            )}
          </span>
          <span className="text-smoke">{open ? "▲" : "▼"}</span>
        </button>
        {open && (
          <div className="mt-2 border-t border-mist/60 pt-2">
            <NavList pathname={pathname} onNav={() => setOpen(false)} badges={badges} />
          </div>
        )}
      </div>
    );
  }

  return (
    <nav className="flex h-full flex-col gap-4 p-5 text-sm">
      <Link href="/" className="block px-2 focus-ring rounded-lg">
        <div className="font-display text-lg font-semibold tracking-tight text-ink">Beyond Style UAE</div>
        <div className="text-[11px] uppercase tracking-[0.14em] text-smoke">Order Control Console</div>
      </Link>
      <NavList pathname={pathname} badges={badges} />
      <div className="mt-auto rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
        <div className="font-semibold">AI drafts. You approve.</div>
        <div className="mt-1 text-rose-700/80">
          Every reply is guardrail-checked. Owner approval gates everything that touches money,
          dispatch, or claims.
        </div>
      </div>
    </nav>
  );
}

function NavList({ pathname, onNav, badges }: { pathname: string; onNav?: () => void; badges: NavBadges }) {
  const groups = Array.from(new Set(NAV.map((n) => n.group)));
  return (
    <div className="flex flex-col gap-4">
      {groups.map((g) => (
        <div key={g}>
          <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-smoke/70">{g}</div>
          <div className="flex flex-col">
            {NAV.filter((n) => n.group === g).map((n) => {
              const active = pathname === n.href;
              const count = n.badgeKey ? badges[n.badgeKey] : 0;
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={onNav}
                  className={clsx(
                    "relative flex items-center justify-between gap-2 rounded-xl px-3 py-1.5 transition focus-ring",
                    active
                      ? "nav-active-line bg-ink text-white shadow-sm"
                      : "text-ink/80 hover:bg-sand/70"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className={clsx("w-4 text-center text-xs", active ? "text-white/60" : "text-smoke")}>{n.icon}</span>
                    <span>{n.label}</span>
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
