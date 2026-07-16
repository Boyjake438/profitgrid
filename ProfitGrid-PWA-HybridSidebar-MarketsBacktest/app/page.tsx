"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppShell from "./components/AppShell";
import { createClient } from "@/lib/supabase/client";
import { buildMonthGrid, fmtMoney, monthLabel, ymd } from "@/lib/utils";
import TraderCardModal, { TraderCardData } from "./components/TraderCardModal";
import {
  TrendingUp,
  TrendingDown,
  Plus,
  FlaskConical,
  LineChart,
  NotebookPen,
  BookOpen,
  Share2,
  Calendar,
  Layers,
  Award,
  DollarSign,
  BarChart3,
  ShieldCheck,
  ArrowUpRight,
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, LineChart as RechartsLineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

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
      <div className="min-h-screen grid place-items-center text-[rgb(var(--muted))] font-sans">
        Loading ProfitGrid Command Center…
      </div>
    );
  }

  if (!user) return <MarketingLanding />;

  return <Dashboard user={user} />;
}

function MarketingLanding() {
  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white font-sans selection:bg-purple-500 selection:text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-48 left-1/2 h-[620px] w-[620px] -translate-x-1/2 rounded-full bg-[rgba(120,90,255,0.18)] blur-[130px]" />
        <div className="absolute bottom-[-240px] right-[-240px] h-[640px] w-[640px] rounded-full bg-[rgba(0,220,255,0.12)] blur-[140px]" />
        <div className="absolute top-[25%] left-[-220px] h-[520px] w-[520px] rounded-full bg-[rgba(16,185,129,0.10)] blur-[140px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/10 font-bold text-lg">
              ▦
            </div>
            <div>
              <div className="text-lg font-bold tracking-tight">ProfitGrid</div>
              <div className="text-xs text-[rgb(var(--muted))]">PWA-first trading performance suite</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold hover:bg-white/10 transition"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-sm font-semibold hover:opacity-90 shadow-lg transition"
            >
              Create account
            </Link>
          </div>
        </div>

        <div className="mt-16 grid gap-12 md:grid-cols-2 md:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1 text-xs font-bold text-purple-300">
              ⚡ Complete Trading Ecosystem
            </span>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight md:text-6xl leading-tight">
              Your P&amp;L &amp; Edge, made <span className="text-purple-400 bg-clip-text">Visual</span>.
            </h1>
            <p className="mt-4 max-w-xl text-base text-[rgb(var(--muted))] leading-relaxed">
              Monitor live markets, backtest in Fog of War replay mode, log structured trade markups, analyze expectancy,
              and manage prop accounts — all within one institutional-grade PWA.
            </p>

            <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold">
              <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1.5">🏠 Command Dashboard</span>
              <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1.5">📈 Live Markets</span>
              <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1.5">🧪 Backtest Replay Lab</span>
              <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1.5">📔 Professional Journal</span>
              <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1.5">💳 Trader Cards Share</span>
              <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1.5">📱 Offline PWA Sync</span>
            </div>

            <div className="mt-8 flex gap-3">
              <Link
                href="/register"
                className="rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3.5 text-sm font-bold shadow-xl hover:from-purple-500 hover:to-indigo-500 transition"
              >
                Launch Platform Free →
              </Link>
              <Link
                href="/pricing"
                className="rounded-2xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold hover:bg-white/10 transition"
              >
                View Plans &amp; Crypto Pay
              </Link>
            </div>
          </div>

          <div className="glass rounded-3xl p-6 border border-white/10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between text-xs text-[rgb(var(--muted))]">
              <span>Interactive Command Center Preview</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> Live System
              </span>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-[rgb(var(--muted))] uppercase font-semibold">Monthly Performance</div>
                  <div className="text-2xl font-black text-emerald-400">+$4,280.50 USD</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-[rgb(var(--muted))] uppercase font-semibold">Win Rate / RR</div>
                  <div className="text-sm font-bold text-white">68% • 2.4R Avg</div>
                </div>
              </div>

              <div className="h-28 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[{ d: "W1", v: 800 }, { d: "W2", v: 1900 }, { d: "W3", v: 3100 }, { d: "W4", v: 4280 }]}>
                    <Area type="monotone" dataKey="v" stroke="rgba(120,90,255,1)" fill="rgba(120,90,255,0.25)" strokeWidth={2.5} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-xl bg-white/5 p-2 border border-white/5">
                  <div className="text-[10px] text-[rgb(var(--muted))]">Gross Profit</div>
                  <div className="font-bold text-emerald-400">+$5,120</div>
                </div>
                <div className="rounded-xl bg-white/5 p-2 border border-white/5">
                  <div className="text-[10px] text-[rgb(var(--muted))]">Gross Loss</div>
                  <div className="font-bold text-rose-400">-$840</div>
                </div>
                <div className="rounded-xl bg-white/5 p-2 border border-white/5">
                  <div className="text-[10px] text-[rgb(var(--muted))]">Expectancy</div>
                  <div className="font-bold text-purple-300">+$178/trd</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Dashboard({ user }: { user: SessionUser }) {
  const supabase = useMemo(() => createClient(), []);
  const today = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => ymd(today), [today]);

  const [pnl, setPnl] = useState<number>(0);
  const [status, setStatus] = useState<string | null>(null);
  const [ruleWarning, setRuleWarning] = useState<string | null>(null);
  const [monthTotal, setMonthTotal] = useState<number>(0);
  const [monthMap, setMonthMap] = useState<Record<string, number>>({});
  const [goal, setGoal] = useState<number>(2500);
  const [activeAccountId, setActiveAccountId] = useState<number | null>(null);
  const [currency, setCurrency] = useState<string>("USD");
  const [startingBalance, setStartingBalance] = useState<number>(10000);
  const [showCard, setShowCard] = useState(false);
  const [chartTab, setChartTab] = useState<"equity" | "balance" | "drawdown" | "monthly">("equity");

  const [year, monthIndex] = [today.getFullYear(), today.getMonth()];

  useEffect(() => {
    const run = async () => {
      const cachedAcc = localStorage.getItem("pg_active_account");
      const accId = cachedAcc ? Number(cachedAcc) : NaN;
      setActiveAccountId(Number.isFinite(accId) ? accId : null);

      if (Number.isFinite(accId)) {
        const { data: acc } = await supabase
          .from("accounts")
          .select("currency,starting_balance")
          .eq("id", accId)
          .maybeSingle();
        if (acc?.currency) setCurrency(String(acc.currency));
        if (acc?.starting_balance !== undefined && acc?.starting_balance !== null) {
          const sb = Number(acc.starting_balance);
          if (Number.isFinite(sb) && sb > 0) setStartingBalance(sb);
        }
      }

      const cached = localStorage.getItem("pg_monthly_goal");
      if (cached && !Number.isNaN(Number(cached))) setGoal(Number(cached));

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

      if (!error && data && (data as any[]).length > 0) {
        let total = 0;
        const map: Record<string, number> = {};
        for (const row of data as any[]) {
          const v = Number(row.total_pnl);
          map[String(row.day)] = v;
          if (row.day === todayKey) setPnl(v);
          total += v;
        }
        setMonthMap(map);
        setMonthTotal(total);
      } else {
        const mockMap: Record<string, number> = {
          [`${year}-${String(monthIndex + 1).padStart(2, "0")}-02`]: 320,
          [`${year}-${String(monthIndex + 1).padStart(2, "0")}-05`]: -120,
          [`${year}-${String(monthIndex + 1).padStart(2, "0")}-08`]: 540,
          [`${year}-${String(monthIndex + 1).padStart(2, "0")}-12`]: 810,
          [`${year}-${String(monthIndex + 1).padStart(2, "0")}-15`]: -230,
        };
        setMonthMap(mockMap);
        setMonthTotal(1320);
      }
    };

    run();
  }, [supabase, user.id, year, monthIndex, todayKey]);

  const progress = goal <= 0 ? 0 : Math.max(0, Math.min(1, monthTotal / goal));

  const tradingDays = Object.values(monthMap).filter((v) => Number(v) !== 0 || v === 0).length;
  const bestDay = (() => {
    let bestKey: string | null = null;
    let best = -Infinity;
    for (const [k, v] of Object.entries(monthMap)) {
      const n = Number(v);
      if (n > best) {
        best = n;
        bestKey = k;
      }
    }
    return bestKey ? { day: bestKey, pnl: best } : null;
  })();
  const worstDay = (() => {
    let worstKey: string | null = null;
    let worst = Infinity;
    for (const [k, v] of Object.entries(monthMap)) {
      const n = Number(v);
      if (n < worst) {
        worst = n;
        worstKey = k;
      }
    }
    return worstKey ? { day: worstKey, pnl: worst } : null;
  })();

  const pctReturn = startingBalance > 0 ? (monthTotal / startingBalance) * 100 : 13.2;

  const chartData = useMemo(() => {
    const days = Object.entries(monthMap).sort((a, b) => a[0].localeCompare(b[0]));
    let cum = startingBalance;
    let peak = startingBalance;
    return days.map(([day, val]) => {
      cum += Number(val);
      if (cum > peak) peak = cum;
      const dd = cum - peak;
      return { day: day.slice(8), equity: cum, balance: cum - 50, drawdown: dd, monthly: Number(val) };
    });
  }, [monthMap, startingBalance]);

  const cardData: TraderCardData = useMemo(() => {
    const grid = buildMonthGrid(year, monthIndex).map((c) => ({
      key: ymd(c.date),
      dayNum: c.inMonth ? c.date.getDate() : null,
      inMonth: c.inMonth,
    }));
    return {
      monthLabel: monthLabel(year, monthIndex),
      currency,
      monthTotal,
      pctReturn,
      tradingDays,
      bestDay,
      worstDay,
      dayMap: monthMap,
      grid,
    };
  }, [year, monthIndex, currency, monthTotal, pctReturn, tradingDays, bestDay, worstDay, monthMap]);

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
    setMonthMap((prev) => {
      const next = { ...prev, [todayKey]: pnl };
      setMonthTotal(Object.values(next).reduce((a, b) => a + Number(b), 0));
      return next;
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    location.href = "/";
  };

  return (
    <AppShell title="Command Center" subtitle="Performance overview • trading statistics • equity curves • quick actions" active="dashboard">
      <div className="space-y-6 font-sans">
        <section className="glass rounded-3xl p-5 border border-white/10 shadow-xl">
          <div className="text-xs font-bold tracking-wider uppercase text-[rgb(var(--muted))] mb-3">QUICK ACTIONS</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <Link
              href="/journal?modal=add"
              className="flex items-center gap-2 rounded-2xl bg-purple-500/20 border border-purple-500/30 p-3 text-xs font-bold text-purple-200 hover:bg-purple-500/30 transition shadow-sm"
            >
              <Plus className="h-4 w-4 shrink-0 text-purple-300" /> Log Trade
            </Link>
            <Link
              href="/backtest"
              className="flex items-center gap-2 rounded-2xl bg-white/5 border border-white/10 p-3 text-xs font-semibold text-white hover:bg-white/10 transition"
            >
              <FlaskConical className="h-4 w-4 shrink-0 text-indigo-400" /> Backtest Lab
            </Link>
            <Link
              href="/markets"
              className="flex items-center gap-2 rounded-2xl bg-white/5 border border-white/10 p-3 text-xs font-semibold text-white hover:bg-white/10 transition"
            >
              <LineChart className="h-4 w-4 shrink-0 text-emerald-400" /> Open Markets
            </Link>
            <Link
              href="/journal"
              className="flex items-center gap-2 rounded-2xl bg-white/5 border border-white/10 p-3 text-xs font-semibold text-white hover:bg-white/10 transition"
            >
              <NotebookPen className="h-4 w-4 shrink-0 text-blue-400" /> Journal Hub
            </Link>
            <Link
              href="/handbook"
              className="flex items-center gap-2 rounded-2xl bg-white/5 border border-white/10 p-3 text-xs font-semibold text-white hover:bg-white/10 transition"
            >
              <BookOpen className="h-4 w-4 shrink-0 text-amber-400" /> Handbook
            </Link>
            <button
              onClick={() => setShowCard(true)}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 p-3 text-xs font-bold text-white hover:from-purple-500 hover:to-indigo-500 transition shadow-md"
            >
              <Share2 className="h-4 w-4 shrink-0" /> Trader Card
            </button>
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-extrabold uppercase tracking-wide text-purple-300">Performance Overview</span>
            <span className="text-xs text-[rgb(var(--muted))]">Account Balance: ${startingBalance.toLocaleString()} {currency}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="glass-soft rounded-3xl p-5 border border-white/10 flex flex-col justify-between">
              <div className="text-xs text-[rgb(var(--muted))] uppercase font-semibold">Daily P&amp;L (Today)</div>
              <div className="mt-2 flex items-end justify-between">
                <span className={`text-2xl font-black ${pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {fmtMoney(pnl)}
                </span>
                <span className="text-xs text-[rgb(var(--muted))]">{currency}</span>
              </div>
              <div className="mt-3 pt-2 border-t border-white/5 flex gap-2">
                <input
                  type="number"
                  value={pnl || ""}
                  onChange={(e) => setPnl(Number(e.target.value))}
                  placeholder="0.00"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 text-xs outline-none"
                />
                <button onClick={saveToday} className="rounded-xl bg-purple-500/20 border border-purple-500/30 px-3 py-1 text-xs font-bold text-purple-200">
                  Save
                </button>
              </div>
            </div>

            <div className="glass-soft rounded-3xl p-5 border border-white/10 flex flex-col justify-between">
              <div className="text-xs text-[rgb(var(--muted))] uppercase font-semibold">Monthly P&amp;L ({monthLabel(year, monthIndex)})</div>
              <div className="mt-2 flex items-end justify-between">
                <span className={`text-2xl font-black ${monthTotal >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {fmtMoney(monthTotal)}
                </span>
                <span className="text-xs text-emerald-400 font-bold">+{pctReturn?.toFixed(1)}%</span>
              </div>
              <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-[rgb(var(--muted))]">
                <span>Goal: ${goal}</span>
                <span>{Math.round(progress * 100)}% Hitting</span>
              </div>
            </div>

            <div className="glass-soft rounded-3xl p-5 border border-white/10 flex flex-col justify-between">
              <div className="text-xs text-[rgb(var(--muted))] uppercase font-semibold">Weekly / Yearly Total</div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-center">
                <div className="rounded-xl bg-white/5 p-2">
                  <div className="text-[10px] text-[rgb(var(--muted))]">This Week</div>
                  <div className="text-sm font-bold text-emerald-400">+$640</div>
                </div>
                <div className="rounded-xl bg-white/5 p-2">
                  <div className="text-[10px] text-[rgb(var(--muted))]">2026 YTD</div>
                  <div className="text-sm font-bold text-emerald-400">+$12,480</div>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-white/5 text-[11px] text-[rgb(var(--muted))] text-center">
                Total Growth: +124.8% YTD
              </div>
            </div>

            <div className="glass-soft rounded-3xl p-5 border border-white/10 flex flex-col justify-between">
              <div className="text-xs text-[rgb(var(--muted))] uppercase font-semibold">Net / Gross Breakdown</div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-center">
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-2">
                  <div className="text-[10px] text-emerald-300 font-semibold">Gross Profit</div>
                  <div className="text-sm font-bold text-emerald-400">+$4,620</div>
                </div>
                <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-2">
                  <div className="text-[10px] text-rose-300 font-semibold">Gross Loss</div>
                  <div className="text-sm font-bold text-rose-400">-$1,300</div>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-white/5 text-[11px] text-[rgb(var(--muted))] text-center">
                Net Profit: {fmtMoney(monthTotal)}
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <div className="text-sm font-extrabold uppercase tracking-wide text-purple-300">Trading Statistics</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="glass-soft rounded-2xl p-4 border border-white/10 text-center">
              <div className="text-[10px] text-[rgb(var(--muted))] uppercase font-semibold">Win / Loss Rate</div>
              <div className="mt-1 text-lg font-black text-emerald-400">68% <span className="text-xs text-[rgb(var(--muted))]">/ 32%</span></div>
            </div>
            <div className="glass-soft rounded-2xl p-4 border border-white/10 text-center">
              <div className="text-[10px] text-[rgb(var(--muted))] uppercase font-semibold">Profit Factor</div>
              <div className="mt-1 text-lg font-black text-purple-300">3.55 <span className="text-[10px] text-[rgb(var(--muted))]">Excellent</span></div>
            </div>
            <div className="glass-soft rounded-2xl p-4 border border-white/10 text-center">
              <div className="text-[10px] text-[rgb(var(--muted))] uppercase font-semibold">Average R:R / Expectancy</div>
              <div className="mt-1 text-lg font-black text-indigo-300">2.4R <span className="text-xs text-emerald-400 font-semibold">(+$165)</span></div>
            </div>
            <div className="glass-soft rounded-2xl p-4 border border-white/10 text-center">
              <div className="text-[10px] text-[rgb(var(--muted))] uppercase font-semibold">Avg / Best / Worst Trade</div>
              <div className="mt-1 text-xs font-bold text-white">
                +$165 <span className="text-emerald-400 font-extrabold">+$810</span> / <span className="text-rose-400">-$230</span>
              </div>
            </div>
            <div className="glass-soft rounded-2xl p-4 border border-white/10 text-center">
              <div className="text-[10px] text-[rgb(var(--muted))] uppercase font-semibold">Largest Streaks</div>
              <div className="mt-1 text-xs font-bold text-white">
                Win: <span className="text-emerald-400 font-extrabold">7 Trades</span> • Loss: <span className="text-rose-400">2 Trades</span>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <section className="glass rounded-3xl p-6 lg:col-span-8 border border-white/10 flex flex-col justify-between shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--muted))]">Visual Analytics Engine</span>
                <div className="text-lg font-bold">Trading Curves ({chartTab.toUpperCase()})</div>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {(["equity", "balance", "drawdown", "monthly"] as const).map((ct) => (
                  <button
                    key={ct}
                    onClick={() => setChartTab(ct)}
                    className={cx(
                      "rounded-xl px-3 py-1.5 text-xs font-bold transition",
                      chartTab === ct ? "bg-purple-500/20 border border-purple-500/40 text-purple-200" : "bg-white/5 hover:bg-white/10 text-[rgb(var(--muted))]"
                    )}
                  >
                    {ct.charAt(0).toUpperCase() + ct.slice(1)} Curve
                  </button>
                ))}
              </div>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                {chartTab === "drawdown" ? (
                  <RechartsLineChart data={chartData}>
                    <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: "#121218", borderColor: "rgba(255,255,255,0.15)", borderRadius: "12px", fontSize: "12px" }} />
                    <Line type="monotone" dataKey="drawdown" stroke="rgba(248,113,113,0.95)" strokeWidth={2.5} dot={{ r: 4 }} />
                  </RechartsLineChart>
                ) : (
                  <AreaChart data={chartData}>
                    <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: "#121218", borderColor: "rgba(255,255,255,0.15)", borderRadius: "12px", fontSize: "12px" }} />
                    <Area
                      type="monotone"
                      dataKey={chartTab === "monthly" ? "monthly" : chartTab === "balance" ? "balance" : "equity"}
                      stroke="rgba(120,90,255,1)"
                      fill="rgba(120,90,255,0.22)"
                      strokeWidth={2.5}
                    />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-between text-xs text-[rgb(var(--muted))] pt-2 border-t border-white/5">
              <span>Dynamic Recharts render synced to your active account ({currency})</span>
              <Link href="/analytics" className="text-purple-400 font-bold hover:underline flex items-center gap-1">
                Explore Full Analytics <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </section>

          <section className="glass rounded-3xl p-6 lg:col-span-4 border border-white/10 flex flex-col justify-between shadow-xl space-y-4">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-sm font-bold uppercase tracking-wide text-purple-300">Account Overview</span>
                <Link href="/pricing?focus=pro" className="text-xs font-semibold text-emerald-400 hover:underline">
                  Multi-Account Pro
                </Link>
              </div>

              <div className="mt-4 space-y-3">
                <div className="rounded-2xl bg-white/5 p-3.5 border border-white/5 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" /> Main Live Account
                    </div>
                    <div className="text-[10px] text-[rgb(var(--muted))]">Starting: $10,000 • USD</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-extrabold text-emerald-400">$11,320.00</div>
                    <div className="text-[10px] text-emerald-400 font-semibold">+13.2%</div>
                  </div>
                </div>

                <div className="rounded-2xl bg-white/5 p-3.5 border border-white/5 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-purple-400" /> Prop Challenge (FTMO)
                    </div>
                    <div className="text-[10px] text-[rgb(var(--muted))]">Target: $10,000 Profit</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-extrabold text-white">$104,280.00</div>
                    <div className="text-[10px] text-purple-300 font-semibold">+$4,280 (42.8% to goal)</div>
                  </div>
                </div>

                <div className="rounded-2xl bg-white/5 p-3.5 border border-white/5 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-blue-400" /> Demo Backtest Lab
                    </div>
                    <div className="text-[10px] text-[rgb(var(--muted))]">Strategy R&amp;D Portfolio</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-extrabold text-white">€52,400.00</div>
                    <div className="text-[10px] text-blue-300 font-semibold">+4.8%</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-purple-500/10 border border-purple-500/20 p-3.5 flex items-center justify-between text-xs">
              <span className="text-purple-200 font-semibold">Total Combined Capital:</span>
              <strong className="text-base font-black text-white">$168,000.00+</strong>
            </div>
          </section>
        </div>

        <section className="glass rounded-3xl p-6 border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-sm font-extrabold uppercase tracking-wide text-purple-300">Profit/Loss Heatmap &amp; Journal Calendar</span>
              <div className="text-xs text-[rgb(var(--muted))]">Click any day on the full heatmap or log quick summaries right below.</div>
            </div>
            <Link href="/calendar" className="rounded-xl bg-purple-500/20 border border-purple-500/30 px-4 py-2 text-xs font-bold text-purple-200 hover:bg-purple-500/30 transition">
              Open Full P&amp;L Calendar →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl bg-white/5 p-4 border border-white/5 flex flex-col justify-between">
              <div className="text-xs font-bold uppercase text-[rgb(var(--muted))]">Daily Journal Summary</div>
              <div className="mt-2 text-sm text-white font-medium">“Clean displacement on XAUUSD and EURUSD. Sticking strictly to 1% risk per trade.”</div>
              <Link href="/journal" className="mt-3 text-xs text-purple-400 font-semibold hover:underline">View Today&apos;s Markups →</Link>
            </div>

            <div className="rounded-2xl bg-white/5 p-4 border border-white/5 flex flex-col justify-between">
              <div className="text-xs font-bold uppercase text-[rgb(var(--muted))]">Weekly Review Audit</div>
              <div className="mt-2 text-sm text-white font-medium">Week 2: 8 Wins, 2 Losses. Net P&amp;L: +$1,900. All prop daily loss rules respected.</div>
              <Link href="/review?type=weekly" className="mt-3 text-xs text-blue-400 font-semibold hover:underline">Verify Weekly Checklist →</Link>
            </div>

            <div className="rounded-2xl bg-white/5 p-4 border border-white/5 flex flex-col justify-between">
              <div className="text-xs font-bold uppercase text-[rgb(var(--muted))]">Best / Worst Heatmap Days</div>
              <div className="mt-2 flex items-center justify-between text-xs">
                <div>Best: <strong className="text-emerald-400">+{bestDay ? fmtMoney(bestDay.pnl) : "$810"}</strong> ({bestDay?.day || "Jul 12"})</div>
                <div>Worst: <strong className="text-rose-400">{worstDay ? fmtMoney(worstDay.pnl) : "-$230"}</strong> ({worstDay?.day || "Jul 15"})</div>
              </div>
              <button onClick={() => setShowCard(true)} className="mt-3 text-xs text-amber-400 font-bold hover:underline text-left">Generate Trader Card for Socials →</button>
            </div>
          </div>
        </section>
      </div>

      <TraderCardModal open={showCard} onClose={() => setShowCard(false)} data={cardData} />
    </AppShell>
  );
}
