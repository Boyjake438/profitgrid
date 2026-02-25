"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LineChart, NotebookPen, FlaskConical, BookOpen } from "lucide-react";

const tabs = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/markets", label: "Markets", icon: LineChart },
  { href: "/journal", label: "Journal", icon: NotebookPen },
  { href: "/backtest", label: "Backtest", icon: FlaskConical },
  { href: "/handbook", label: "Handbook", icon: BookOpen },
];

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export default function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="mx-auto max-w-5xl px-4 pb-4">
        <div className="glass rounded-2xl px-2 py-2">
          <div className="grid grid-cols-5 gap-1">
            {tabs.map((t) => {
              const active = pathname === t.href || (t.href !== "/" && pathname?.startsWith(t.href));
              const Icon = t.icon;
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  className={cx(
                    "flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[11px] transition",
                    active ? "bg-[rgba(var(--accent),0.16)]" : "hover:bg-[rgba(255,255,255,0.05)]"
                  )}
                >
                  <Icon className={cx("h-4 w-4", active ? "text-[rgb(var(--text))]" : "text-[rgb(var(--muted))]")} />
                  <span className={cx(active ? "text-[rgb(var(--text))]" : "text-[rgb(var(--muted))]")}>{t.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
