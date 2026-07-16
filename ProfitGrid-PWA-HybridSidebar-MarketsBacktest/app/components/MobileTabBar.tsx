"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  LineChart,
  NotebookPen,
  FlaskConical,
  BarChart3,
  CalendarDays,
  Menu,
  X,
  BookOpen,
  User,
  Settings,
  CreditCard,
  CheckSquare,
} from "lucide-react";

const primaryTabs = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/markets", label: "Markets", icon: LineChart },
  { href: "/journal", label: "Journal", icon: NotebookPen },
  { href: "/backtest", label: "Backtest", icon: FlaskConical },
];

const drawerLinks = [
  { href: "/analytics", label: "Advanced Analytics", icon: BarChart3 },
  { href: "/calendar", label: "P&L Heatmap", icon: CalendarDays },
  { href: "/review", label: "Reviews & Playbooks", icon: CheckSquare },
  { href: "/handbook", label: "Handbook & Rules", icon: BookOpen },
  { href: "/profile", label: "Trader Profile", icon: User },
  { href: "/pricing", label: "Plans & Payments", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
];

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export default function MobileTabBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden font-sans">
        <div className="mx-auto max-w-5xl px-3 pb-3">
          <div className="glass rounded-2xl px-2 py-2 border border-white/15 shadow-2xl">
            <div className="grid grid-cols-5 gap-1">
              {primaryTabs.map((t) => {
                const active = pathname === t.href || (t.href !== "/" && pathname?.startsWith(t.href));
                const Icon = t.icon;
                return (
                  <Link
                    key={t.href}
                    href={t.href}
                    className={cx(
                      "flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[10px] font-medium transition",
                      active ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" : "hover:bg-white/5 text-[rgb(var(--muted))]"
                    )}
                  >
                    <Icon className={cx("h-4 w-4", active ? "text-purple-300" : "text-[rgb(var(--muted))]")} />
                    <span>{t.label}</span>
                  </Link>
                );
              })}

              <button
                onClick={() => setOpen(!open)}
                className={cx(
                  "flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[10px] font-medium transition",
                  open ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" : "hover:bg-white/5 text-[rgb(var(--muted))]"
                )}
              >
                {open ? <X className="h-4 w-4 text-purple-300" /> : <Menu className="h-4 w-4 text-[rgb(var(--muted))]" />}
                <span>{open ? "Close" : "More"}</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {open && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden flex flex-col justify-end pb-24 px-4 animate-in fade-in duration-200 font-sans">
          <div className="glass rounded-3xl p-5 border border-white/20 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-bold tracking-wider uppercase text-[rgb(var(--muted))]">ProfitGrid Ecosystem</span>
              <button onClick={() => setOpen(false)} className="text-xs text-[rgb(var(--muted))]">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {drawerLinks.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cx(
                      "flex items-center gap-2.5 rounded-2xl p-3 text-xs transition border",
                      active
                        ? "bg-purple-500/20 border-purple-500/30 text-white font-semibold"
                        : "border-white/5 bg-white/5 hover:bg-white/10 text-[rgb(var(--muted))] hover:text-white"
                    )}
                  >
                    <Icon className={cx("h-4 w-4 shrink-0", active ? "text-purple-300" : "text-purple-400")} />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
