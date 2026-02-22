"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "../components/AppShell";
import { createClient } from "@/lib/supabase/client";
import { fmtMoney, monthLabel, ymd } from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

type Plan = "free" | "premium" | "pro";

type SessionUser = { id: string; email?: string };
type StrategyRow = { id: number; name: string; description: string | null };

function asNum(x: any) {
  const n = Number(x);
  return Number.isFinite(n) ? n : 0;
}

export default function AnalyticsPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [plan, setPlan] = useState<Plan>("free");
  const [activeAccountId, setActiveAccountId] = useState<number | null>(null);

  const [strategies, setStrategies] = useState<StrategyRow[]>([]);
  const [newStrat, setNewStrat] = useState({ name: "", description: "" });
  const [rules, setRules] = useState({ max_daily_loss: "", max_drawdown: "", profit_target: "" });
  const [rulesMsg, setRulesMsg] = useState<string | null>(null);

  const now = new Date();
  const year = now.getFullYear();
  const monthIndex = now.getMonth();

  const [equity, setEquity] = useState<{ day: string; value: number }[]>([]);
  const [drawdown, setDrawdown] = useState<{ day: string; value: number }[]>([]);
  const [maxDrawdown, setMaxDrawdown] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    best: 0,
    worst: 0,
    days: 0,
    avg: 0,
  });

  const [byMarket, setByMarket] = useState<{ market: string; pnl: number }[]>([]);
  const [rrSummary, setRrSummary] = useState<{ expectancy: number; winRate: number; avgWin: number; avgLoss: number; trades: number }>({ expectancy: 0, winRate: 0, avgWin: 0, avgLoss: 0, trades: 0 });
  const [rrHist, setRrHist] = useState<{ bucket: string; count: number }[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        router.push("/login");
        return;
      }
      setUser({ id: data.user.id, email: data.user.email ?? undefined });

      const cachedAcc = typeof window !== "undefined" ? localStorage.getItem("pg_active_account") : null;
      const accId = cachedAcc ? Number(cachedAcc) : NaN;
      setActiveAccountId(Number.isFinite(accId) ? accId : null);

      // Try read plan
      const { data: prof } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", data.user.id)
        .maybeSingle();
      if (prof?.plan) setPlan((prof.plan as Plan) ?? "free");
    })();
  }, [router, supabase]);

  useEffect(() => {
    const load = async () => {
      if (!user) return;

      const start = new Date(year, monthIndex, 1);
      const end = new Date(year, monthIndex + 1, 1);

      let q = supabase
        .from("daily_pnl")
        .select("day,total_pnl")
        .eq("user_id", user.id)
        .gte("day", ymd(start))
        .lt("day", ymd(end))
        .order("day", { ascending: true });

      if (activeAccountId) {
        // @ts-ignore
        q = q.eq("account_id", activeAccountId);
      }

      const { data, error } = await q;

      if (error) {
        setMsg(error.message);
        return;
      }

      let running = 0;
      let best = -Infinity;
      let worst = Infinity;
      let total = 0;

      const series = (data as any[]).map((r) => {
        const v = asNum(r.total_pnl);
        running += v;
        total += v;
        best = Math.max(best, v);
        worst = Math.min(worst, v);
        return { day: String(r.day).slice(5), value: running };
      });

      setEquity(series);

      // drawdown from equity
      let peak = 0;
      let mdd = 0;
      const dd = series.map((p) => {
        peak = Math.max(peak, p.value);
        const v = p.value - peak; // <= 0
        mdd = Math.min(mdd, v);
        return { day: p.day, value: v };
      });
      setDrawdown(dd);
      setMaxDrawdown(mdd);

      const days = (data as any[]).length;
      setStats({
        total,
        best: best === -Infinity ? 0 : best,
        worst: worst === Infinity ? 0 : worst,
        days,
        avg: days ? total / days : 0,
      });
    };
    load();
  }, [activeAccountId, monthIndex, supabase, user, year]);

  // Expectancy + RR distribution (Pro)
  useEffect(() => {
    const loadRR = async () => {
      if (!user) return;
      if (plan !== "pro") {
        setRrSummary({ expectancy: 0, winRate: 0, avgWin: 0, avgLoss: 0, trades: 0 });
        setRrHist([]);
        return;
      }

      const start = new Date(year, monthIndex, 1);
      const end = new Date(year, monthIndex + 1, 1);

      let q = supabase
        .from("trades")
        .select("pnl,rr")
        .eq("user_id", user.id)
        .gte("opened_at", start.toISOString())
        .lt("opened_at", end.toISOString());

      if (activeAccountId) {
        // @ts-ignore
        q = q.eq("account_id", activeAccountId);
      }

      const { data, error } = await q;
      if (error || !Array.isArray(data)) {
        setRrSummary({ expectancy: 0, winRate: 0, avgWin: 0, avgLoss: 0, trades: 0 });
        setRrHist([]);
        return;
      }

      // Use rr when present; otherwise approximate R with sign(pnl) * 1
      const rs = (data as any[]).map((t) => {
        const pnl = asNum(t.pnl);
        const rr = t.rr === null || t.rr === undefined ? (pnl === 0 ? 0 : pnl > 0 ? 1 : -1) : asNum(t.rr);
        return { pnl, r: rr };
      });

      const wins = rs.filter((x) => x.r > 0);
      const losses = rs.filter((x) => x.r < 0);
      const winRate = rs.length ? wins.length / rs.length : 0;
      const avgWin = wins.length ? wins.reduce((a, b) => a + b.r, 0) / wins.length : 0;
      const avgLossAbs = losses.length ? Math.abs(losses.reduce((a, b) => a + b.r, 0) / losses.length) : 0;
      const expectancy = winRate * avgWin - (1 - winRate) * avgLossAbs;

      setRrSummary({ expectancy, winRate: winRate * 100, avgWin, avgLoss: -avgLossAbs, trades: rs.length });

      // Histogram buckets
      const buckets = [
        { lo: -5, hi: -2, label: "-5 to -2" },
        { lo: -2, hi: -1, label: "-2 to -1" },
        { lo: -1, hi: -0.5, label: "-1 to -0.5" },
        { lo: -0.5, hi: 0, label: "-0.5 to 0" },
        { lo: 0, hi: 0.5, label: "0 to 0.5" },
        { lo: 0.5, hi: 1, label: "0.5 to 1" },
        { lo: 1, hi: 2, label: "1 to 2" },
        { lo: 2, hi: 5, label: "2 to 5" },
      ];
      const counts = buckets.map((b) => ({ bucket: b.label, count: 0 }));
      for (const x of rs) {
        const r = x.r;
        const idx = buckets.findIndex((b) => r >= b.lo && r < b.hi);
        if (idx >= 0) counts[idx].count += 1;
      }
      setRrHist(counts);
    };
    loadRR();
  }, [activeAccountId, monthIndex, plan, supabase, user, year]);

  useEffect(() => {
    const loadMarkets = async () => {
      if (!user) return;
      if (plan === "free") {
        setByMarket([]);
        return;
      }

      const start = new Date(year, monthIndex, 1);
      const end = new Date(year, monthIndex + 1, 1);

      let q = supabase
        .from("trades")
        .select("asset_class,pnl,opened_at")
        .eq("user_id", user.id)
        .gte("opened_at", start.toISOString())
        .lt("opened_at", end.toISOString());

      if (activeAccountId) {
        // @ts-ignore
        q = q.eq("account_id", activeAccountId);
      }

      const { data, error } = await q;

      if (error) {
        // Trades table may not exist yet.
        setByMarket([]);
        return;
      }

      const map = new Map<string, number>();
      for (const r of data as any[]) {
        const k = String(r.asset_class ?? "Other");
        const v = asNum(r.pnl);
        map.set(k, (map.get(k) ?? 0) + v);
      }

      setByMarket(
        Array.from(map.entries())
          .map(([market, pnl]) => ({ market, pnl }))
          .sort((a, b) => Math.abs(b.pnl) - Math.abs(a.pnl))
      );
    };
    loadMarkets();
  }, [activeAccountId, monthIndex, plan, supabase, user, year]);

  // Load strategies (Premium+)
  useEffect(() => {
    const loadStrategies = async () => {
      if (!user) return;
      if (plan === "free") {
        setStrategies([]);
        return;
      }
      const { data } = await supabase
        .from("strategies")
        .select("id,name,description")
        .eq("user_id", user.id)
        .order("name", { ascending: true });
      if (Array.isArray(data)) setStrategies(data as any);
    };
    loadStrategies();
  }, [plan, supabase, user]);

  // Load rules (Pro only)
  useEffect(() => {
    const loadRules = async () => {
      if (!user || !activeAccountId) return;
      if (plan !== "pro") return;

      const { data } = await supabase
        .from("risk_rules")
        .select("max_daily_loss,max_drawdown,profit_target")
        .eq("user_id", user.id)
        .eq("account_id", activeAccountId)
        .maybeSingle();

      if (data) {
        setRules({
          max_daily_loss: data.max_daily_loss ?? "",
          max_drawdown: data.max_drawdown ?? "",
          profit_target: data.profit_target ?? "",
        } as any);
      }
    };
    loadRules();
  }, [activeAccountId, plan, supabase, user]);

  const createStrategy = async () => {
    if (!user) return;
    if (plan === "free") return;
    const name = newStrat.name.trim();
    if (!name) return;
    const { error } = await supabase.from("strategies").insert({
      user_id: user.id,
      name,
      description: newStrat.description.trim() || null,
    });
    if (!error) {
      setNewStrat({ name: "", description: "" });
      const { data } = await supabase
        .from("strategies")
        .select("id,name,description")
        .eq("user_id", user.id)
        .order("name", { ascending: true });
      if (Array.isArray(data)) setStrategies(data as any);
    }
  };

  const saveRules = async () => {
    if (!user || !activeAccountId) return;
    if (plan !== "pro") return;
    setRulesMsg(null);
    const payload: any = {
      user_id: user.id,
      account_id: activeAccountId,
      max_daily_loss: rules.max_daily_loss === "" ? null : Number(rules.max_daily_loss),
      max_drawdown: rules.max_drawdown === "" ? null : Number(rules.max_drawdown),
      profit_target: rules.profit_target === "" ? null : Number(rules.profit_target),
    };
    if ([payload.max_daily_loss, payload.max_drawdown, payload.profit_target].some((v) => v !== null && !Number.isFinite(v))) {
      setRulesMsg("Rules must be numbers (or blank). Example max daily loss: -200");
      return;
    }

    const { error } = await supabase
      .from("risk_rules")
      .upsert(payload, { onConflict: "user_id,account_id" });
    setRulesMsg(error ? error.message : "Saved ✅");
  };

  return (
    <AppShell
      title="ProfitGrid"
      subtitle={user?.email ? `Analytics · ${user.email}` : "Analytics"}
      active="analytics"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-sm text-[rgb(var(--muted))]">{monthLabel(year, monthIndex)} performance</div>
          <div className="mt-1 text-3xl font-semibold">
            <span className={stats.total >= 0 ? "text-[rgba(16,185,129,0.95)]" : "text-[rgba(248,113,113,0.95)]"}>
              {fmtMoney(stats.total)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {plan !== "free" ? (
            <button
              onClick={() => {
                const y = year;
                const m = monthIndex + 1;
                const acc = typeof window !== "undefined" ? localStorage.getItem("pg_active_account") : null;
                const url = `/api/export/pdf?year=${y}&month=${m}${acc ? `&accountId=${acc}` : ""}`;
                window.open(url, "_blank");
              }}
              className="rounded-2xl bg-[rgba(255,185,0,0.18)] px-4 py-2 text-sm font-semibold hover:opacity-90"
            >
              Export PDF
            </button>
          ) : null}

          <div className="text-sm text-[rgb(var(--muted))]">
            Plan: <span className="font-semibold text-[rgb(var(--fg))]">{plan.toUpperCase()}</span>
          </div>
        </div>
      </div>

      {msg ? <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-[rgb(var(--muted))]">{msg}</div> : null}

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <Stat label="Trading days" value={String(stats.days)} />
        <Stat label="Avg / day" value={fmtMoney(stats.avg)} />
        <Stat label="Best day" value={fmtMoney(stats.best)} accent="pos" />
        <Stat label="Worst day" value={fmtMoney(stats.worst)} accent="neg" />
      </div>

      <div className="mt-3 text-sm text-[rgb(var(--muted))]">
        Max drawdown (month): <span className="font-semibold text-[rgba(248,113,113,0.95)]">{fmtMoney(maxDrawdown)}</span>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Equity curve</div>
              <div className="text-xs text-[rgb(var(--muted))]">Cumulative daily totals</div>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[rgb(var(--muted))]">
              Free
            </span>
          </div>
          <div className="mt-4 h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={equity}>
                <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 12 }} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12 }}
                  labelStyle={{ color: "rgba(255,255,255,0.75)" }}
                  formatter={(v: any) => fmtMoney(asNum(v))}
                />
                <Line type="monotone" dataKey="value" stroke="rgba(16,185,129,0.9)" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Drawdown curve</div>
              <div className="text-xs text-[rgb(var(--muted))]">Peak-to-trough (<= 0)</div>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[rgb(var(--muted))]">
              {plan === "pro" ? "Pro" : "Free"}
            </span>
          </div>
          <div className="mt-4 h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={drawdown}>
                <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 12 }} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12 }}
                  labelStyle={{ color: "rgba(255,255,255,0.75)" }}
                  formatter={(v: any) => fmtMoney(asNum(v))}
                />
                <Line type="monotone" dataKey="value" stroke="rgba(248,113,113,0.9)" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">P&L by market</div>
              <div className="text-xs text-[rgb(var(--muted))]">From your trade journal</div>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[rgb(var(--muted))]">
              {plan === "free" ? "Premium" : "Unlocked"}
            </span>
          </div>

          {plan === "free" ? (
            <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-[rgb(var(--muted))]">
              Upgrade to Premium to unlock market breakdowns, strategy tags, and deeper analytics.
            </div>
          ) : (
            <div className="mt-4 h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byMarket}>
                  <XAxis dataKey="market" tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 12 }} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ background: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12 }}
                    labelStyle={{ color: "rgba(255,255,255,0.75)" }}
                    formatter={(v: any) => fmtMoney(asNum(v))}
                  />
                  <Bar dataKey="pnl" fill="rgba(96,165,250,0.85)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Expectancy & R:R distribution</div>
            <div className="text-xs text-[rgb(var(--muted))]">Uses trade R:R when available</div>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[rgb(var(--muted))]">
            {plan === "pro" ? "Unlocked" : "Pro"}
          </span>
        </div>

        {plan !== "pro" ? (
          <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-[rgb(var(--muted))]">
            Upgrade to <span className="font-semibold text-[rgb(var(--fg))]">Pro</span> to unlock expectancy, R distribution, and deeper performance analytics.
          </div>
        ) : (
          <>
            <div className="mt-4 grid gap-4 md:grid-cols-5">
              <Stat label="Trades" value={String(rrSummary.trades)} />
              <Stat label="Win rate" value={`${rrSummary.winRate.toFixed(0)}%`} />
              <Stat label="Avg win (R)" value={rrSummary.avgWin.toFixed(2)} accent="pos" />
              <Stat label="Avg loss (R)" value={rrSummary.avgLoss.toFixed(2)} accent="neg" />
              <Stat label="Expectancy (R)" value={rrSummary.expectancy.toFixed(2)} />
            </div>

            <div className="mt-5 h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rrHist}>
                  <XAxis dataKey="bucket" tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 12 }} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ background: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12 }}
                    labelStyle={{ color: "rgba(255,255,255,0.75)" }}
                  />
                  <Bar dataKey="count" fill="rgba(120,90,255,0.75)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Strategies</div>
              <div className="text-xs text-[rgb(var(--muted))]">Use these on Trades (Premium+)</div>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[rgb(var(--muted))]">
              {plan === "free" ? "Premium" : "Unlocked"}
            </span>
          </div>

          {plan === "free" ? (
            <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-[rgb(var(--muted))]">
              Upgrade to Premium to create strategies and tag trades by setup.
            </div>
          ) : (
            <>
              <div className="mt-4 grid gap-2">
                <input
                  value={newStrat.name}
                  onChange={(e) => setNewStrat((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Strategy name (e.g. ICC OB + FVG)"
                  className="w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none"
                />
                <textarea
                  value={newStrat.description}
                  onChange={(e) => setNewStrat((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Optional notes / rules"
                  className="w-full resize-none rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none"
                  rows={2}
                />
                <button
                  onClick={createStrategy}
                  className="rounded-2xl bg-[rgba(96,165,250,0.22)] px-4 py-3 text-sm font-semibold hover:opacity-90"
                >
                  + Add strategy
                </button>
              </div>

              <div className="mt-4 max-h-[220px] overflow-auto rounded-2xl border border-white/10">
                {strategies.length === 0 ? (
                  <div className="p-4 text-sm text-[rgb(var(--muted))]">No strategies yet.</div>
                ) : (
                  <div className="divide-y divide-white/10">
                    {strategies.map((s) => (
                      <div key={s.id} className="p-4">
                        <div className="font-medium">{s.name}</div>
                        {s.description ? (
                          <div className="mt-1 text-xs text-[rgb(var(--muted))]">{s.description}</div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Rule engine</div>
              <div className="text-xs text-[rgb(var(--muted))]">Daily max loss · drawdown · target (Pro)</div>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[rgb(var(--muted))]">
              {plan === "pro" ? "Unlocked" : "Pro"}
            </span>
          </div>

          {plan !== "pro" ? (
            <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-[rgb(var(--muted))]">
              Upgrade to Pro to set prop-firm style rules and get limit warnings.
            </div>
          ) : (
            <>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                <div>
                  <label className="text-xs text-[rgb(var(--muted))]">Max daily loss</label>
                  <input
                    value={rules.max_daily_loss}
                    onChange={(e) => setRules((p) => ({ ...p, max_daily_loss: e.target.value }))}
                    placeholder="e.g. -200"
                    className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-[rgb(var(--muted))]">Max drawdown</label>
                  <input
                    value={rules.max_drawdown}
                    onChange={(e) => setRules((p) => ({ ...p, max_drawdown: e.target.value }))}
                    placeholder="e.g. 1000"
                    className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-[rgb(var(--muted))]">Profit target</label>
                  <input
                    value={rules.profit_target}
                    onChange={(e) => setRules((p) => ({ ...p, profit_target: e.target.value }))}
                    placeholder="e.g. 2500"
                    className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none"
                  />
                </div>
              </div>
              <button
                onClick={saveRules}
                className="mt-3 w-full rounded-2xl bg-[rgba(255,185,0,0.18)] px-4 py-3 text-sm font-semibold hover:opacity-90"
              >
                Save rules
              </button>
              {rulesMsg ? <div className="mt-2 text-sm text-[rgb(var(--muted))]">{rulesMsg}</div> : null}
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "pos" | "neg";
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs text-[rgb(var(--muted))]">{label}</div>
      <div
        className={
          "mt-1 text-lg font-semibold " +
          (accent === "pos"
            ? "text-[rgba(16,185,129,0.95)]"
            : accent === "neg"
            ? "text-[rgba(248,113,113,0.95)]"
            : "")
        }
      >
        {value}
      </div>
    </div>
  );
}
