"use client";

import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import InstallButton from "./InstallButton";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type AccountRow = { id: number; name: string; currency: string };

function PlanBadge({ plan }: { plan: string }) {
  const label = plan.toUpperCase();
  const cls =
    plan === "pro"
      ? "bg-[rgba(120,90,255,0.22)] ring-[rgba(120,90,255,0.25)]"
      : plan === "premium"
      ? "bg-[rgba(255,185,0,0.18)] ring-[rgba(255,185,0,0.22)]"
      : "bg-white/10 ring-white/10";
  return (
    <span className={cn("rounded-full px-3 py-1 text-[11px] font-semibold ring-1", cls)}>
      {label}
    </span>
  );
}

export default function AppShell({
  title,
  subtitle,
  active,
  children,
}: {
  title: string;
  subtitle?: string;
  active?: "dashboard" | "calendar" | "trades" | "analytics" | "review" | "pricing";
  children: React.ReactNode;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [plan, setPlan] = useState<string>("free");
  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [activeAccountId, setActiveAccountId] = useState<number | null>(null);

  useEffect(() => {
    // best-effort; pages still work if tables not migrated yet
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return;

      // plan
      const { data: prof } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", auth.user.id)
        .maybeSingle();
      if (prof?.plan) setPlan(String(prof.plan));

      // accounts
      const { data: accs } = await supabase
        .from("accounts")
        .select("id,name,currency")
        .order("id", { ascending: true });
      if (Array.isArray(accs)) {
        setAccounts(accs as any);
        const cached = localStorage.getItem("pg_active_account");
        const cachedId = cached ? Number(cached) : NaN;
        const first = (accs as any[])[0]?.id as number | undefined;
        const chosen = Number.isFinite(cachedId)
          ? (accs as any[]).find((a) => a.id === cachedId)?.id ?? first
          : first;
        if (typeof chosen === "number") {
          setActiveAccountId(chosen);
          localStorage.setItem("pg_active_account", String(chosen));
        }
      }
    })();
  }, [supabase]);

  // expose active account to pages via localStorage only (simple)
  const onPickAccount = (id: number) => {
    setActiveAccountId(id);
    localStorage.setItem("pg_active_account", String(id));
    // refresh current page data by reloading
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))] text-[rgb(var(--fg))]">
      {/* Premium background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-48 left-1/2 h-[620px] w-[620px] -translate-x-1/2 rounded-full bg-[rgba(120,90,255,0.20)] blur-[130px]" />
        <div className="absolute bottom-[-240px] right-[-240px] h-[640px] w-[640px] rounded-full bg-[rgba(0,220,255,0.16)] blur-[140px]" />
        <div className="absolute top-[25%] left-[-220px] h-[520px] w-[520px] rounded-full bg-[rgba(16,185,129,0.12)] blur-[140px]" />
      </div>

      <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-6 md:px-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[rgba(255,255,255,0.06)] ring-1 ring-white/10">
              <span className="text-lg">▦</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
              {subtitle ? (
                <p className="text-xs text-[rgb(var(--muted))]">{subtitle}</p>
              ) : null}
            </div>
          </div>
        </div>

        <nav className="hidden items-center gap-2 md:flex">
          <NavLink href="/" active={active === "dashboard"}>Dashboard</NavLink>
          <NavLink href="/calendar" active={active === "calendar"}>Calendar</NavLink>
          <NavLink href="/trades" active={active === "trades"}>Trades</NavLink>
          <NavLink href="/analytics" active={active === "analytics"}>Analytics</NavLink>
          <NavLink href="/review" active={active === "review"}>Review</NavLink>
          <NavLink href="/pricing" active={active === "pricing"}>Pricing</NavLink>
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 md:flex">
            <PlanBadge plan={plan} />
            {accounts.length ? (
              <select
                value={activeAccountId ?? ""}
                onChange={(e) => onPickAccount(Number(e.target.value))}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs outline-none"
                title="Active account"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} · {a.currency}
                  </option>
                ))}
              </select>
            ) : null}
            <Link
              href="/pricing"
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs hover:bg-white/10"
            >
              Upgrade
            </Link>
          </div>
          <InstallButton />
          <ThemeToggle />
        </div>
      </header>

      <main className="relative mx-auto w-full max-w-6xl px-4 pb-12 md:px-8">
        <div className="glass rounded-3xl p-4 md:p-6">{children}</div>

        <div className="mt-6 flex items-center justify-between text-xs text-[rgb(var(--muted))]">
          <span>© {new Date().getFullYear()} ProfitGrid</span>
          <span className="hidden sm:inline">PWA-first · Cloud sync · Built for traders</span>
        </div>
      </main>

      {/* Mobile nav */}
      <div className="fixed bottom-4 left-1/2 z-20 w-[min(560px,calc(100%-16px))] -translate-x-1/2 md:hidden">
        <div className="glass flex items-center justify-between rounded-2xl px-3 py-2">
          <MobileLink href="/" label="Daily" active={active === "dashboard"} />
          <MobileLink href="/calendar" label="Calendar" active={active === "calendar"} />
          <MobileLink href="/trades" label="Trades" active={active === "trades"} />
          <MobileLink href="/analytics" label="Stats" active={active === "analytics"} />
          <MobileLink href="/review" label="Review" active={active === "review"} />
          <MobileLink href="/pricing" label="Pricing" active={active === "pricing"} />
        </div>
      </div>
    </div>
  );
}

function NavLink({ href, active, children }: { href: string; active?: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-xl px-3 py-2 text-sm transition",
        active
          ? "bg-[rgba(255,255,255,0.10)] ring-1 ring-white/10"
          : "text-[rgb(var(--muted))] hover:bg-[rgba(255,255,255,0.06)] hover:text-[rgb(var(--fg))]"
      )}
    >
      {children}
    </Link>
  );
}

function MobileLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "w-full rounded-xl px-3 py-2 text-center text-xs transition",
        active ? "bg-[rgba(255,255,255,0.10)]" : "text-[rgb(var(--muted))]"
      )}
    >
      {label}
    </Link>
  );
}
