"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LineChart, BookOpen, FlaskConical, NotebookPen, Plus, Lock } from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/markets", label: "Markets", icon: LineChart },
  { href: "/journal", label: "Journal", icon: NotebookPen },
  { href: "/backtest", label: "Backtest Lab", icon: FlaskConical },
  { href: "/handbook", label: "Handbook", icon: BookOpen },
];

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-72 md:flex-col md:gap-4 md:px-5 md:py-6">
      <div className="glass rounded-2xl p-4">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-[rgba(var(--accent),0.18)] border border-[rgba(255,255,255,0.10)] flex items-center justify-center">
            <div className="h-4 w-4 rotate-45 border border-[rgba(255,255,255,0.55)]" />
          </div>
          <div className="leading-tight">
            <div className="font-semibold tracking-tight">ProfitGrid</div>
            <div className="text-xs text-[rgb(var(--muted))]">Synced • Online</div>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-1">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cx(
                  "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
                  active
                    ? "bg-[rgba(var(--accent),0.16)] border border-[rgba(255,255,255,0.10)]"
                    : "hover:bg-[rgba(255,255,255,0.05)]"
                )}
              >
                <Icon className={cx("h-4 w-4", active ? "text-[rgb(var(--text))]" : "text-[rgb(var(--muted))] group-hover:text-[rgb(var(--text))]")} />
                <span className={cx(active ? "text-[rgb(var(--text))]" : "text-[rgb(var(--muted))] group-hover:text-[rgb(var(--text))]")}>
                  {item.label}
                </span>
                {active ? <span className="ml-auto h-2 w-2 rounded-full bg-[rgb(var(--accent))]" /> : null}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Accounts */}
      <div className="glass rounded-2xl p-4">
        <div className="text-xs font-semibold tracking-wide text-[rgb(var(--muted))]">ACCOUNTS</div>

        <div className="mt-3 glass-soft rounded-xl p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Main Account</div>
              <div className="text-xs text-[rgb(var(--muted))]">USD • Synced</div>
            </div>
            <div className="h-8 w-8 rounded-xl bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] flex items-center justify-center">
              <Plus className="h-4 w-4 text-[rgb(var(--muted))]" />
            </div>
          </div>
        </div>

        <Link
          href="/pricing?focus=pro"
          className="mt-3 flex items-center justify-between rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-sm text-[rgb(var(--text))] hover:bg-[rgba(255,255,255,0.05)] transition"
        >
          <span className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-[rgb(var(--muted))]" />
            Add Prop/Demo Accounts (Pro)
          </span>
          <span className="text-xs text-[rgb(var(--muted))]">Upgrade</span>
        </Link>
        <div className="mt-2 text-xs text-[rgb(var(--muted))]">
          Split your journals, backtests & P&L calendars per account.
        </div>
      </div>

      {/* Bottom */}
      <div className="glass rounded-2xl p-4">
        <div className="text-xs font-semibold tracking-wide text-[rgb(var(--muted))]">SETTINGS</div>
        <div className="mt-3 flex items-center justify-between rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-3 py-2">
          <div>
            <div className="text-sm font-medium">Currency</div>
            <div className="text-xs text-[rgb(var(--muted))]">USD</div>
          </div>
          <div className="text-xs text-[rgb(var(--muted))]">Launch: USD/EUR/GBP/GHS</div>
        </div>
        <div className="mt-2 text-xs text-[rgb(var(--muted))]">
          Multi-currency formatting is ready; conversion comes later.
        </div>
      </div>
    </aside>
  );
}
