"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppShell from "./components/AppShell";
import { createClient } from "@/lib/supabase/client";
import { buildMonthGrid, fmtMoney, monthLabel, ymd } from "@/lib/utils";

type SessionUser = { id: string; email?: string };

export default function HomePage() {
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        setUser(data.user ? { id: data.user.id, email: data.user.email ?? undefined } : null);
      } finally {
        setLoading(false);
      }
    })();
  }, [supabase]);

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center text-[rgb(var(--muted))]">
        Loading ProfitGrid…
      </div>
    );
  }

  if (!user) return <MarketingLanding />;

  return <Dashboard user={user} />;
}

function MarketingLanding() {
  return (
    <div className="min-h-screen bg-[rgb(var(--bg))] text-[rgb(var(--fg))]">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-48 left-1/2 h-[620px] w-[620px] -translate-x-1/2 rounded-full bg-[rgba(120,90,255,0.18)] blur-[130px]" />
        <div className="absolute bottom-[-240px] right-[-240px] h-[640px] w-[640px] rounded-full bg-[rgba(0,220,255,0.12)] blur-[140px]" />
        <div className="absolute top-[25%] left-[-220px] h-[520px] w-[520px] rounded-full bg-[rgba(16,185,129,0.10)] blur-[140px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/10">
              ▦
            </div>
            <div>
              <div className="text-lg font-semibold">ProfitGrid</div>
              <div className="text-xs text-[rgb(var(--muted))]">PWA-first trading performance suite</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-4 py-2 text-sm hover:opacity-90"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-xl bg-[rgba(16,185,129,0.22)] px-4 py-2 text-sm font-medium hover:opacity-90"
            >
              Create account
            </Link>
          </div>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
              Your P&L, made
              <span className="text-[rgba(16,185,129,0.95)]"> visual</span>.
            </h1>
            <p className="mt-4 max-w-xl text-[rgb(var(--muted))]">
              Track daily totals, calendar heatmaps, and a full trade journal across Forex, Crypto,
              Indices, Stocks, Metals, and Futures — synced to the cloud.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <Badge>Daily P&L</Badge>
              <Badge>Calendar heatmap</Badge>
              <Badge>Trade journal</Badge>
              <Badge>Analytics</Badge>
              <Badge>Rules & alerts</Badge>
              <Badge>PWA install</Badge>
            </div>

            <div className="mt-8 flex gap-3">
              <Link
                href="/register"
                className="rounded-2xl bg-[rgba(16,185,129,0.22)] px-5 py-3 text-sm font-semibold hover:opacity-90"
              >
                Start free
              </Link>
              <Link
                href="/pricing"
                className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-5 py-3 text-sm hover:opacity-90"
              >
                View pricing
              </Link>
            </div>

            <p className="mt-4 text-xs text-[rgb(var(--muted))]">
              Built for prop firm traders and serious retail traders.
            </p>
          </div>

          <div className="glass rounded-3xl p-6">
            <div className="text-sm text-[rgb(var(--muted))]">Live preview</div>
            <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-[rgb(var(--muted))]">Monthly total</div>
                  <div className="mt-1 text-2xl font-semibold text-[rgba(16,185,129,0.95)]">+ $1,358.15</div>
                </div>
                <div className="text-xs text-[rgb(var(--muted))]">Goal 2,000</div>
              </div>
              <div className="mt-4 h-2 w-full rounded-full bg-white/10">
                <div className="h-2 w-[68%] rounded-full bg-[rgba(16,185,129,0.65)]" />
              </div>

              <div className="mt-5 grid grid-cols-7 gap-2 text-xs">
                {Array.from({ length: 14 }).map((_, i) => (
                  <div key={i} className="h-10 rounded-xl border border-white/10 bg-white/5" />
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <MiniStat label="Win rate" value="62%" />
              <MiniStat label="Best day" value="+$382" />
              <MiniStat label="Drawdown" value="-$209" />
            </div>
          </div>
        </div>

        <div className="mt-12 text-center text-xs text-[rgb(var(--muted))]">
          ProfitGrid is in active build mode — you&apos;re early.
        </div>
      </div>
    </div>
  );
}

function Dashboard({ user }: { user: SessionUser }) {
  const supabase = useMemo(() => createClient(), []);

  const today = new Date();
  const todayKey = ymd(today);

  const [pnl, setPnl] = useState<number>(0);
  const [status, setStatus] = useState<string | null>(null);
  const [ruleWarning, setRuleWarning] = useState<string | null>(null);
  const [monthTotal, setMonthTotal] = useState<number>(0);
  const [goal, setGoal] = useState<number>(2000);
  const [activeAccountId, setActiveAccountId] = useState<number | null>(null);

  const [year, monthIndex] = [today.getFullYear(), today.getMonth()];

  // Load today's pnl + month total + goal
  useEffect(() => {
    const run = async () => {
      const cachedAcc = localStorage.getItem("pg_active_account");
      const accId = cachedAcc ? Number(cachedAcc) : NaN;
      setActiveAccountId(Number.isFinite(accId) ? accId : null);

      // local goal first
      const cached = localStorage.getItem("pg_monthly_goal");
      if (cached && !Number.isNaN(Number(cached))) setGoal(Number(cached));

      // load month daily pnl
      const start = new Date(year, monthIndex, 1);
      const end = new Date(year, monthIndex + 1, 1);

      let q = supabase
        .from("daily_pnl")
        .select("day,total_pnl")
        .eq("user_id", user.id)
        .gte("day", ymd(start))
        .lt("day", ymd(end));

      if (Number.isFinite(accId)) {
        // @ts-ignore
        q = q.eq("account_id", accId);
      }

      const { data, error } = await q;

      if (!error && data) {
        let total = 0;
        for (const row of data as any[]) {
          const v = Number(row.total_pnl);
          if (row.day === todayKey) setPnl(v);
          total += v;
        }
        setMonthTotal(total);
      }
    };

    run();
  }, [supabase, user.id, year, monthIndex, todayKey]);

  const progress = goal <= 0 ? 0 : Math.max(0, Math.min(1, monthTotal / goal));

  const saveToday = async () => {
    setStatus(null);
    const cachedAcc = localStorage.getItem("pg_active_account");
    const accId = cachedAcc ? Number(cachedAcc) : NaN;

    const payload: any = { user_id: user.id, day: todayKey, total_pnl: pnl };
    if (Number.isFinite(accId)) payload.account_id = accId;

    const { error } = await supabase.from("daily_pnl").upsert(payload, {
      onConflict: Number.isFinite(accId) ? "user_id,account_id,day" : "user_id,day",
    });

    if (error) {
      setStatus(`Save failed: ${error.message}`);
      return;
    }

    setStatus("Saved ✅");

    // Rule engine (Pro): warn if daily loss exceeds limit
    try {
      if (Number.isFinite(accId)) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("plan")
          .eq("id", user.id)
          .maybeSingle();
        if (prof?.plan === "pro") {
          const { data: rr } = await supabase
            .from("risk_rules")
            .select("max_daily_loss")
            .eq("user_id", user.id)
            .eq("account_id", accId)
            .maybeSingle();
          const lim = rr?.max_daily_loss;
          if (lim !== null && lim !== undefined) {
            const limit = Number(lim);
            if (Number.isFinite(limit) && pnl < limit) {
              setRuleWarning(`Rule breached: daily P&L (${pnl}) is below max daily loss (${limit}).`);
            } else {
              setRuleWarning(null);
            }
          }
        }
      }
    } catch {
      // ignore
    }

    // recompute month total quickly
    const start = new Date(year, monthIndex, 1);
    const end = new Date(year, monthIndex + 1, 1);
    let q = supabase
      .from("daily_pnl")
      .select("total_pnl")
      .eq("user_id", user.id)
      .gte("day", ymd(start))
      .lt("day", ymd(end));

    if (Number.isFinite(accId)) {
      // @ts-ignore
      q = q.eq("account_id", accId);
    }

    const { data } = await q;

    if (data) {
      setMonthTotal((data as any[]).reduce((acc, r) => acc + Number(r.total_pnl), 0));
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    location.href = "/";
  };

  return (
    <AppShell
      title="ProfitGrid"
      subtitle={user.email ? `Logged in as ${user.email}` : "Logged in"}
      active="dashboard"
    >
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-[rgb(var(--muted))]">Daily Total (Today)</p>
          <div className="mt-2 flex items-end gap-2">
            <span className="text-4xl font-semibold">{pnl.toFixed(2)}</span>
            <span className="text-sm text-[rgb(var(--muted))]">USD</span>
          </div>

          <div className="mt-4">
            <input
              value={Number.isFinite(pnl) ? pnl : 0}
              onChange={(e) => setPnl(Number(e.target.value || 0))}
              type="number"
              className="w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-white/20"
              placeholder="Enter today’s P/L"
            />
          </div>

          {ruleWarning ? (
            <div className="mt-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">
              {ruleWarning}
            </div>
          ) : null}

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              onClick={saveToday}
              className="rounded-2xl bg-[rgba(16,185,129,0.22)] px-4 py-3 text-sm font-semibold hover:opacity-90"
            >
              Save
            </button>
            <Link
              href="/calendar"
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm hover:opacity-90"
            >
              Calendar
            </Link>
          </div>

          <button
            onClick={signOut}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm text-[rgb(var(--muted))] hover:opacity-90"
          >
            Sign out
          </button>

          {status ? <div className="mt-3 text-xs text-[rgb(var(--muted))]">{status}</div> : null}
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 md:col-span-2">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm text-[rgb(var(--muted))]">{monthLabel(year, monthIndex)}</p>
              <div className="mt-1 text-3xl font-semibold text-[rgba(16,185,129,0.95)]">
                {fmtMoney(monthTotal)}
              </div>
            </div>

            <div className="min-w-[220px]">
              <div className="flex items-center justify-between text-xs text-[rgb(var(--muted))]">
                <span>Monthly goal</span>
                <span>{fmtMoney(goal)}</span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-white/10">
                <div
                  className="h-2 rounded-full bg-[rgba(16,185,129,0.65)]"
                  style={{ width: `${Math.round(progress * 100)}%` }}
                />
              </div>
              <div className="mt-2 flex gap-2">
                <input
                  value={goal}
                  onChange={(e) => {
                    const v = Number(e.target.value || 0);
                    setGoal(v);
                    localStorage.setItem("pg_monthly_goal", String(v));
                  }}
                  type="number"
                  className="w-full rounded-2xl border border-white/10 bg-transparent px-3 py-2 text-sm outline-none"
                  placeholder="Goal"
                />
                <Link
                  href="/pricing"
                  className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:opacity-90"
                >
                  Upgrade
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <MiniCalendarPreview year={year} monthIndex={monthIndex} monthTotal={monthTotal} goal={goal} />
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <MiniStat label="Streak" value="—" hint="(Pro)" />
            <MiniStat label="Expectancy" value="—" hint="(Pro)" />
            <MiniStat label="Win rate" value="—" hint="(Premium)" />
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[rgb(var(--muted))]">
      {children}
    </span>
  );
}

function MiniStat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs text-[rgb(var(--muted))]">{label}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
      {hint ? <div className="mt-1 text-xs text-[rgb(var(--muted))]">{hint}</div> : null}
    </div>
  );
}

function MiniCalendarPreview({
  year,
  monthIndex,
  monthTotal,
  goal,
}: {
  year: number;
  monthIndex: number;
  monthTotal: number;
  goal: number;
}) {
  const cells = buildMonthGrid(year, monthIndex).slice(0, 21);
  const progress = goal <= 0 ? 0 : Math.max(0, Math.min(1, monthTotal / goal));

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between">
        <div className="text-xs text-[rgb(var(--muted))]">Heatmap preview</div>
        <div className="text-xs text-[rgb(var(--muted))]">{Math.round(progress * 100)}%</div>
      </div>
      <div className="mt-3 grid grid-cols-7 gap-2">
        {cells.map((c) => (
          <div
            key={ymd(c.date)}
            className={
              "h-10 rounded-xl border border-white/10 " +
              (c.inMonth ? "bg-white/5" : "bg-white/0 opacity-40")
            }
          />
        ))}
      </div>
      <div className="mt-3 text-xs text-[rgb(var(--muted))]">
        Full month heatmap in <Link className="underline" href="/calendar">Calendar</Link>
      </div>
    </div>
  );
}
