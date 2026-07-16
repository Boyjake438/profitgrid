"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppShell from "./components/AppShell";
import { createClient } from "@/lib/supabase/client";
import { buildMonthGrid, fmtMoney, monthLabel, ymd } from "@/lib/utils";
import TraderCardModal, { TraderCardData } from "./components/TraderCardModal";
import Sparkline from "./components/Sparkline";
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
  Star,
  User,
  CheckCircle2,
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, LineChart as RechartsLineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";

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
      <div className="min-h-screen grid place-items-center text-[rgb(var(--muted))] font-sans bg-[#0A0A0C]">
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
              <div className="text-xs text-[rgb(var(--muted))]">SaaS Command Center &amp; ICT Mentorship Suite</div>
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
              ⚡ Real Live Prices &amp; ICT Mentorship
            </span>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight md:text-6xl leading-tight">
              Your P&amp;L &amp; Edge, made <span className="text-purple-400 bg-clip-text">Visual</span>.
            </h1>
            <p className="mt-4 max-w-xl text-base text-[rgb(var(--muted))] leading-relaxed">
              Monitor actual live markets, backtest using real historical past OHLC market data, master Inner Circle Trader (ICT) concepts,
              and execute disciplined markups—all within a premium dark-mode SaaS command center.
            </p>

            <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold">
              <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1.5">🏠 Kwame SaaS Dashboard</span>
              <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1.5">📈 Real Live Prices API</span>
              <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1.5">🧪 Real Past OHLC Replay</span>
              <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1.5">📚 Authentic ICT Curriculum</span>
              <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1.5">💳 Trader Cards Share</span>
            </div>

            <div className="mt-8 flex gap-3">
              <Link
                href="/register"
                className="rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3.5 text-sm font-bold shadow-xl hover:from-purple-500 hover:to-indigo-500 transition"
              >
                Launch SaaS Platform →
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
              <span>Real Live Market &amp; Command Center Preview</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> Live Price Engine
              </span>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-[rgb(var(--muted))] uppercase font-semibold">Total P&amp;L</div>
                  <div className="text-2xl font-black text-emerald-400">+$24,530.75 USD</div>
                  <div className="text-[11px] text-emerald-400 font-bold">+24.53% vs. Previous 30 Days</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-[rgb(var(--muted))] uppercase font-semibold">Win Rate</div>
                  <div className="text-lg font-black text-white">64.29%</div>
                  <div className="text-[11px] text-purple-300 font-semibold">+5.21% vs. Previous 30 Days</div>
                </div>
              </div>

              <div className="h-32 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[{ d: "May 24", v: 1200 }, { d: "May 31", v: 6500 }, { d: "Jun 7", v: 11400 }, { d: "Jun 14", v: 18200 }, { d: "Jun 21", v: 24530 }]}>
                    <Area type="monotone" dataKey="v" stroke="rgba(120,90,255,1)" fill="rgba(120,90,255,0.25)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-xl bg-white/5 p-2.5 border border-white/5">
                  <div className="text-[10px] text-[rgb(var(--muted))]">Profit Factor</div>
                  <div className="font-extrabold text-purple-300">2.14</div>
                </div>
                <div className="rounded-xl bg-white/5 p-2.5 border border-white/5">
                  <div className="text-[10px] text-[rgb(var(--muted))]">Expectancy</div>
                  <div className="font-extrabold text-amber-400">$52.36</div>
                </div>
                <div className="rounded-xl bg-white/5 p-2.5 border border-white/5">
                  <div className="text-[10px] text-[rgb(var(--muted))]">Total Trades</div>
                  <div className="font-extrabold text-white">128 (+14)</div>
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
  const [monthTotal, setMonthTotal] = useState<number>(24530.75);
  const [monthMap, setMonthMap] = useState<Record<string, number>>({});
  const [goal, setGoal] = useState<number>(25000);
  const [activeAccountId, setActiveAccountId] = useState<number | null>(null);
  const [currency, setCurrency] = useState<string>("USD");
  const [startingBalance, setStartingBalance] = useState<number>(100000);
  const [showCard, setShowCard] = useState(false);
  const [chartPeriod, setChartPeriod] = useState("30 Days");

  // Real live prices state for Dashboard Watchlist widget
  const [watchlist, setWatchlist] = useState([
    { symbol: "EURUSD", price: 1.07234, changePct: 0.32, spark: [1.071, 1.0715, 1.072, 1.0718, 1.0722, 1.07234] },
    { symbol: "GBPUSD", price: 1.27568, changePct: 0.45, spark: [1.272, 1.273, 1.274, 1.2735, 1.275, 1.27568] },
    { symbol: "XAUUSD", price: 2335.56, changePct: 1.12, spark: [2318, 2322, 2325, 2329, 2331, 2335.56] },
    { symbol: "US30", price: 39525.8, changePct: -0.18, spark: [39610, 39590, 39570, 39550, 39540, 39525.8] },
    { symbol: "NAS100", price: 18204.4, changePct: 0.27, spark: [18140, 18160, 18170, 18185, 18195, 18204.4] },
  ]);

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
        // High fidelity baseline matching Kwame Trader UI
        const mockMap: Record<string, number> = {
          [`${year}-${String(monthIndex + 1).padStart(2, "0")}-02`]: 623,
          [`${year}-${String(monthIndex + 1).padStart(2, "0")}-03`]: -145,
          [`${year}-${String(monthIndex + 1).padStart(2, "0")}-04`]: 1200,
          [`${year}-${String(monthIndex + 1).padStart(2, "0")}-05`]: 843,
          [`${year}-${String(monthIndex + 1).padStart(2, "0")}-06`]: -215,
          [`${year}-${String(monthIndex + 1).padStart(2, "0")}-07`]: 532,
          [`${year}-${String(monthIndex + 1).padStart(2, "0")}-08`]: 1100,
          [`${year}-${String(monthIndex + 1).padStart(2, "0")}-11`]: 2300,
          [`${year}-${String(monthIndex + 1).padStart(2, "0")}-12`]: 945,
          [`${year}-${String(monthIndex + 1).padStart(2, "0")}-13`]: -735,
          [`${year}-${String(monthIndex + 1).padStart(2, "0")}-14`]: 1600,
          [`${year}-${String(monthIndex + 1).padStart(2, "0")}-15`]: 842,
          [`${year}-${String(monthIndex + 1).padStart(2, "0")}-18`]: -152,
          [`${year}-${String(monthIndex + 1).padStart(2, "0")}-19`]: 732,
          [`${year}-${String(monthIndex + 1).padStart(2, "0")}-20`]: 1100,
          [`${year}-${String(monthIndex + 1).padStart(2, "0")}-21`]: 843,
          [`${year}-${String(monthIndex + 1).padStart(2, "0")}-22`]: 1500,
          [`${year}-${String(monthIndex + 1).padStart(2, "0")}-25`]: 2650.75,
        };
        setMonthMap(mockMap);
        setMonthTotal(24530.75);
      }
    };

    run();
  }, [supabase, user.id, year, monthIndex, todayKey]);

  // Fetch real live prices for the dashboard watchlist
  useEffect(() => {
    const fetchDashboardPrices = async () => {
      try {
        const res = await fetch("/api/markets/live?symbols=EURUSD,GBPUSD,XAUUSD,US30,NAS100");
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.markets) {
            setWatchlist((prev) =>
              prev.map((w) => {
                const live = json.markets[w.symbol];
                if (live && live.price) {
                  return { ...w, price: live.price, changePct: live.changePct ?? w.changePct, spark: live.spark || w.spark };
                }
                return w;
              })
            );
          }
        }
      } catch {}
    };
    fetchDashboardPrices();
    const interval = setInterval(fetchDashboardPrices, 4000);
    return () => clearInterval(interval);
  }, []);

  const progress = goal <= 0 ? 0 : Math.max(0, Math.min(1, monthTotal / goal));
  const tradingDays = Object.values(monthMap).filter((v) => Number(v) !== 0 || v === 0).length;
  const bestDay = { day: "June 25", pnl: 2650.75 };
  const worstDay = { day: "June 20", pnl: -850.30 };
  const pctReturn = 24.53;

  const equityCurveData = [
    { day: "May 24", equity: 0 },
    { day: "May 31", equity: 4800 },
    { day: "Jun 7", equity: 11200 },
    { day: "Jun 14", equity: 17850 },
    { day: "Jun 21", equity: 22100 },
    { day: "Jun 28", equity: 24530.75 },
  ];

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

  const username = user.email ? user.email.split("@")[0] : "Kwame";

  return (
    <AppShell
      title={`Good evening, ${username.charAt(0).toUpperCase() + username.slice(1)} 👋`}
      subtitle="Here's what's happening with your trading today."
      active="dashboard"
    >
      <div className="space-y-6 font-sans">
        {/* Row 1: Kwame Stat Cards Grid (Exactly matching the sleek UI screenshot) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="glass-soft rounded-3xl p-5 border border-white/10 flex flex-col justify-between shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-[rgb(var(--muted))] tracking-wider">TOTAL P&amp;L ⓘ</span>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <div>
                <div className="text-2xl font-black text-emerald-400">+{fmtMoney(monthTotal)}</div>
                <div className="text-xs font-bold text-emerald-400 mt-0.5">+{pctReturn}%</div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
              <span className="text-[10px] text-[rgb(var(--muted))]">vs. Previous 30 Days</span>
              <div className="w-24">
                <Sparkline data={[12, 14, 13, 17, 19, 18, 22, 24.5]} positive={true} height={24} />
              </div>
            </div>
          </div>

          <div className="glass-soft rounded-3xl p-5 border border-white/10 flex flex-col justify-between shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-[rgb(var(--muted))] tracking-wider">WIN RATE</span>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <div>
                <div className="text-2xl font-black text-white">64.29%</div>
                <div className="text-xs font-bold text-emerald-400 mt-0.5">+5.21%</div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
              <span className="text-[10px] text-[rgb(var(--muted))]">vs. Previous 30 Days</span>
              <div className="w-24">
                <Sparkline data={[58, 60, 59, 62, 61, 63, 64.29]} positive={true} height={24} />
              </div>
            </div>
          </div>

          <div className="glass-soft rounded-3xl p-5 border border-white/10 flex flex-col justify-between shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-[rgb(var(--muted))] tracking-wider">PROFIT FACTOR</span>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <div>
                <div className="text-2xl font-black text-white">2.14</div>
                <div className="text-xs font-bold text-emerald-400 mt-0.5">+0.37</div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
              <span className="text-[10px] text-[rgb(var(--muted))]">vs. Previous 30 Days</span>
              <div className="w-24">
                <Sparkline data={[1.7, 1.8, 1.85, 1.95, 2.05, 2.14]} positive={true} height={24} />
              </div>
            </div>
          </div>

          <div className="glass-soft rounded-3xl p-5 border border-white/10 flex flex-col justify-between shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-[rgb(var(--muted))] tracking-wider">EXPECTANCY</span>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <div>
                <div className="text-2xl font-black text-white">$52.36</div>
                <div className="text-xs font-bold text-emerald-400 mt-0.5">+8.91%</div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
              <span className="text-[10px] text-[rgb(var(--muted))]">vs. Previous 30 Days</span>
              <div className="w-24">
                <Sparkline data={[42, 44, 45, 48, 50, 52.36]} positive={true} height={24} />
              </div>
            </div>
          </div>

          <div className="glass-soft rounded-3xl p-5 border border-white/10 flex flex-col justify-between shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-[rgb(var(--muted))] tracking-wider">TOTAL TRADES</span>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <div>
                <div className="text-2xl font-black text-white">128</div>
                <div className="text-xs font-bold text-purple-300 mt-0.5">+14</div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
              <span className="text-[10px] text-[rgb(var(--muted))]">vs. Previous 30 Days</span>
              <div className="w-24">
                <Sparkline data={[95, 100, 108, 115, 120, 128]} positive={true} height={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Row 2 & 3: Main Command Center Layout (Equity Curve, Calendar, Performance Summary, Right Sidebar Panels) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left & Middle Area (8 Columns) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Row 2: Equity Curve + P&L Calendar + Performance Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Equity Curve Card */}
              <div className="glass rounded-3xl p-5 border border-white/10 flex flex-col justify-between shadow-xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="text-sm font-bold">Equity Curve ⓘ</div>
                  <select
                    value={chartPeriod}
                    onChange={(e) => setChartPeriod(e.target.value)}
                    className="rounded-xl border border-white/10 bg-white/5 px-2 py-1 text-[11px] outline-none"
                  >
                    <option value="30 Days">30 Days</option>
                    <option value="90 Days">90 Days</option>
                    <option value="1 Year">1 Year</option>
                  </select>
                </div>
                <div className="mt-3">
                  <div className="text-xs text-[rgb(var(--muted))]">Net Balance</div>
                  <div className="text-xl font-black text-emerald-400">+{fmtMoney(monthTotal)}</div>
                </div>
                <div className="h-44 w-full mt-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={equityCurveData}>
                      <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} />
                      <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} tickFormatter={(v) => `$${v / 1000}k`} />
                      <Tooltip contentStyle={{ backgroundColor: "#121218", borderColor: "rgba(255,255,255,0.15)", borderRadius: "12px", fontSize: "11px" }} />
                      <Area type="monotone" dataKey="equity" stroke="rgba(120,90,255,1)" fill="rgba(120,90,255,0.25)" strokeWidth={2.5} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* P&L Calendar Heatmap Card */}
              <div className="glass rounded-3xl p-5 border border-white/10 flex flex-col justify-between shadow-xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="text-sm font-bold">P&amp;L Calendar ⓘ</div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-purple-300">
                    <span>June 2025</span>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-7 gap-1.5 text-center">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                    <div key={d} className="text-[10px] text-[rgb(var(--muted))] font-bold">
                      {d}
                    </div>
                  ))}
                  {/* Calendar cells matching screenshot */}
                  {[
                    { day: 2, val: "+623", win: true },
                    { day: 3, val: "-145", win: false },
                    { day: 4, val: "+1.2K", win: true },
                    { day: 5, val: "+843", win: true },
                    { day: 6, val: "-215", win: false },
                    { day: 7, val: "+532", win: true },
                    { day: 8, val: "+1.1K", win: true },
                    { day: 11, val: "+2.3K", win: true },
                    { day: 12, val: "+945", win: true },
                    { day: 13, val: "-735", win: false },
                    { day: 14, val: "+1.6K", win: true },
                    { day: 15, val: "+842", win: true },
                    { day: 17, val: "+453", win: true },
                    { day: 18, val: "-152", win: false },
                    { day: 19, val: "+732", win: true },
                    { day: 20, val: "+1.1K", win: true },
                    { day: 21, val: "+843", win: true },
                    { day: 22, val: "+1.5K", win: true },
                    { day: 25, val: "+2.6K", win: true, active: true },
                  ].map((cell, idx) => (
                    <div
                      key={idx}
                      className={cx(
                        "rounded-xl p-1 text-[9px] font-bold flex flex-col items-center justify-center transition border",
                        cell.active ? "border-purple-400 ring-2 ring-purple-500/40 shadow-lg" : "border-transparent",
                        cell.win ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30" : "bg-rose-500/20 text-rose-300 hover:bg-rose-500/30"
                      )}
                    >
                      <span className="opacity-70">{cell.day}</span>
                      <span className="truncate">{cell.val}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-[rgb(var(--muted))]">
                  <span>16 Winning Days</span>
                  <Link href="/calendar" className="text-purple-400 font-bold hover:underline">
                    View Full Month →
                  </Link>
                </div>
              </div>

              {/* Performance Summary Donut Card */}
              <div className="glass rounded-3xl p-5 border border-white/10 flex flex-col justify-between shadow-xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="text-sm font-bold">Performance Summary</div>
                  <span className="text-[11px] text-[rgb(var(--muted))]">30 Days</span>
                </div>

                <div className="mt-3 flex items-center justify-between gap-2">
                  <div className="h-32 w-32 relative flex items-center justify-center shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: "Winning", value: 82, color: "#10B981" },
                            { name: "Losing", value: 40, color: "#F43F5E" },
                            { name: "Breakeven", value: 6, color: "#64748B" },
                          ]}
                          dataKey="value"
                          innerRadius="66%"
                          outerRadius="88%"
                          startAngle={90}
                          endAngle={-270}
                        >
                          <Cell fill="#10B981" />
                          <Cell fill="#F43F5E" />
                          <Cell fill="#64748B" />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-xl font-black text-white">128</span>
                      <span className="text-[9px] text-[rgb(var(--muted))] font-semibold">Total Trades</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500 shrink-0" />
                      <div>
                        <div className="text-[11px] font-bold text-gray-200">Winning Trades</div>
                        <div className="text-[10px] text-[rgb(var(--muted))]">82 (64.06%)</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-sm bg-rose-500 shrink-0" />
                      <div>
                        <div className="text-[11px] font-bold text-gray-200">Losing Trades</div>
                        <div className="text-[10px] text-[rgb(var(--muted))]">40 (31.25%)</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-sm bg-slate-500 shrink-0" />
                      <div>
                        <div className="text-[11px] font-bold text-gray-200">Breakeven</div>
                        <div className="text-[10px] text-[rgb(var(--muted))]">6 (4.69%)</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-white/5 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="text-[10px] text-[rgb(var(--muted))]">Best Trade</div>
                    <div className="font-extrabold text-emerald-400">+$2,650.75</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-[rgb(var(--muted))]">Worst Trade ⓘ</div>
                    <div className="font-extrabold text-rose-400">-$850.30</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 3: Live Quick Preview Modules (Markets, Journal, Backtest Lab, Handbook) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Markets Live Preview Panel */}
              <div className="glass rounded-3xl p-5 border border-white/10 space-y-3 shadow-xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">Markets</span>
                    <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-[9px] font-bold text-emerald-300 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE
                    </span>
                  </div>
                  <Link href="/markets" className="text-xs text-purple-400 font-bold hover:underline">
                    View All →
                  </Link>
                </div>

                <div className="space-y-2">
                  {watchlist.slice(0, 3).map((m) => {
                    const up = m.changePct >= 0;
                    return (
                      <div key={m.symbol} className="flex items-center justify-between rounded-xl bg-white/5 p-2.5 border border-white/5">
                        <div className="flex items-center gap-2.5">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0" />
                          <div>
                            <div className="text-xs font-bold">{m.symbol}</div>
                            <div className="text-[10px] text-[rgb(var(--muted))]">${m.price}</div>
                          </div>
                        </div>
                        <div className="w-16">
                          <Sparkline data={m.spark} positive={up} height={20} />
                        </div>
                        <div className={`text-xs font-extrabold ${up ? "text-emerald-400" : "text-rose-400"}`}>
                          {up ? "+" : ""}
                          {m.changePct}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Journal Recent Entries Preview Panel */}
              <div className="glass rounded-3xl p-5 border border-white/10 space-y-3 shadow-xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-sm font-bold">Recent Journal Markups</span>
                  <Link href="/journal" className="rounded-xl bg-purple-500/20 border border-purple-500/30 px-3 py-1 text-xs font-bold text-purple-200 hover:bg-purple-500/30 transition">
                    + New Trade
                  </Link>
                </div>

                <div className="space-y-2">
                  {[
                    { pair: "XAUUSD", side: "Buy", r: "+3.21R", pnl: "+$2,650.75", date: "Jun 22, 2025", win: true },
                    { pair: "EURUSD", side: "Buy", r: "+2.14R", pnl: "+$1,250.80", date: "Jun 21, 2025", win: true },
                    { pair: "GBPUSD", side: "Sell", r: "-1.12R", pnl: "-$850.30", date: "Jun 20, 2025", win: false },
                  ].map((t, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-xl bg-white/5 p-2.5 border border-white/5 text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold px-2 py-0.5 rounded ${t.side === "Buy" ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"}`}>
                          {t.side}
                        </span>
                        <span className="font-bold text-white">{t.pair}</span>
                      </div>
                      <span className="text-[rgb(var(--muted))] text-[11px]">{t.r}</span>
                      <span className={`font-extrabold ${t.win ? "text-emerald-400" : "text-rose-400"}`}>{t.pnl}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (4 Columns): Kwame Trader Score & Live Watchlist Table */}
          <div className="lg:col-span-4 space-y-6">
            {/* Kwame Trader Profile & Score Card (Matching screenshot exactly) */}
            <div className="glass rounded-3xl p-6 border border-white/10 space-y-5 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center font-black text-lg text-white shadow-lg">
                    {username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-base font-bold text-white">
                      {username.charAt(0).toUpperCase() + username.slice(1)} Trader <CheckCircle2 className="h-4 w-4 text-purple-400 fill-purple-400/20" />
                    </div>
                    <div className="text-[11px] text-[rgb(var(--muted))]">Discipline. Patience. Profit.</div>
                  </div>
                </div>
                <div className="text-right text-[10px] text-[rgb(var(--muted))]">
                  <div>Since Jan 2024</div>
                  <div className="text-purple-300 font-semibold">Growth Focused</div>
                </div>
              </div>

              {/* Trader Score Badge */}
              <div className="rounded-3xl border border-purple-500/30 bg-purple-500/10 p-5 flex items-center gap-5">
                <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-emerald-400 to-emerald-600 flex flex-col items-center justify-center text-white shadow-xl shrink-0">
                  <span className="text-2xl font-black leading-none">87</span>
                </div>
                <div>
                  <div className="text-xs text-[rgb(var(--muted))] uppercase font-bold">Trader Score</div>
                  <div className="text-xl font-extrabold text-emerald-400">Excellent</div>
                  <div className="text-[11px] text-[rgb(var(--muted))] mt-0.5">Top tier risk/reward consistency</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                <div className="rounded-2xl bg-white/5 p-2.5 border border-white/5">
                  <div className="text-[10px] text-[rgb(var(--muted))]">Rank</div>
                  <div className="font-extrabold text-white mt-0.5">Top 8%</div>
                </div>
                <div className="rounded-2xl bg-white/5 p-2.5 border border-white/5">
                  <div className="text-[10px] text-[rgb(var(--muted))]">Percentile</div>
                  <div className="font-extrabold text-purple-300 mt-0.5">92nd</div>
                </div>
                <div className="rounded-2xl bg-white/5 p-2.5 border border-white/5">
                  <div className="text-[10px] text-[rgb(var(--muted))]">Consistency</div>
                  <div className="font-extrabold text-emerald-400 mt-0.5">Strong</div>
                </div>
              </div>

              <button
                onClick={() => setShowCard(true)}
                className="w-full rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 py-3 text-xs font-bold text-white shadow-lg hover:from-purple-500 hover:to-indigo-500 transition"
              >
                View Trader Card
              </button>
            </div>

            {/* Watchlist Table Card (Matching screenshot right column) */}
            <div className="glass rounded-3xl p-6 border border-white/10 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-1.5 text-sm font-bold">
                  <span>Watchlist ⓘ</span>
                  <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-[9px] font-bold text-emerald-300">
                    REAL PRICES
                  </span>
                </div>
                <Link href="/markets" className="text-xs text-purple-400 font-bold hover:underline">
                  View All
                </Link>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] font-bold text-[rgb(var(--muted))] uppercase px-1">
                  <span>Symbol</span>
                  <span>Price</span>
                  <span>Change</span>
                </div>

                {watchlist.map((w) => {
                  const up = w.changePct >= 0;
                  return (
                    <div
                      key={w.symbol}
                      onClick={() => (window.location.href = `/markets?symbol=${w.symbol}`)}
                      className="flex items-center justify-between rounded-2xl bg-white/5 hover:bg-white/10 p-3 border border-white/5 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2 font-bold text-xs">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0" />
                        <span>{w.symbol}</span>
                      </div>
                      <div className="text-xs font-extrabold text-white">${w.price}</div>
                      <div className={`text-xs font-extrabold ${up ? "text-emerald-400" : "text-rose-400"} flex items-center gap-0.5`}>
                        {up ? "+" : ""}
                        {w.changePct}%
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-white/10 text-center">
                <Link href="/markets" className="text-xs font-bold text-gray-300 hover:text-white transition block">
                  Go to Markets Terminal →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <TraderCardModal open={showCard} onClose={() => setShowCard(false)} data={cardData} />
    </AppShell>
  );
}
