"use client";

import React, { useEffect, useMemo, useState } from "react";
import AppShell from "../components/AppShell";
import { createClient } from "@/lib/supabase/client";
import { User, Award, Shield, Trophy, CheckCircle2, ArrowUpRight } from "lucide-react";
import Link from "next/link";

type SessionUser = { id: string; email?: string };

export default function ProfilePage() {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [plan, setPlan] = useState<string>("free");
  const [tradingStyle, setTradingStyle] = useState<string>("Day Trader");
  const [primaryMarket, setPrimaryMarket] = useState<string>("Forex");
  const [bio, setBio] = useState<string>("Disciplined price action & FVG trader. Focused on risk management.");
  const [msg, setMsg] = useState<string | null>(null);
  const [stats, setStats] = useState({ totalTrades: 24, winRate: 68, totalPnl: 4280 });

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUser({ id: data.user.id, email: data.user.email ?? "trader@profitgrid.app" });
        const { data: prof } = await supabase
          .from("profiles")
          .select("plan")
          .eq("id", data.user.id)
          .maybeSingle();
        if (prof?.plan) setPlan(String(prof.plan));

        const { data: trds } = await supabase
          .from("trades")
          .select("pnl")
          .eq("user_id", data.user.id);
        if (Array.isArray(trds) && trds.length > 0) {
          const wins = trds.filter((t) => Number(t.pnl) > 0).length;
          const total = trds.reduce((acc, t) => acc + Number(t.pnl), 0);
          setStats({
            totalTrades: trds.length,
            winRate: Math.round((wins / trds.length) * 100),
            totalPnl: total,
          });
        }
      } else {
        setUser({ id: "demo", email: "demo-trader@profitgrid.app" });
      }

      if (typeof window !== "undefined") {
        const ts = localStorage.getItem("pg_prof_style");
        const pm = localStorage.getItem("pg_prof_market");
        const pb = localStorage.getItem("pg_prof_bio");
        if (ts) setTradingStyle(ts);
        if (pm) setPrimaryMarket(pm);
        if (pb) setBio(pb);
      }
    })();
  }, [supabase]);

  const handleSave = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("pg_prof_style", tradingStyle);
      localStorage.setItem("pg_prof_market", primaryMarket);
      localStorage.setItem("pg_prof_bio", bio);
    }
    setMsg("Profile saved successfully ✅");
    setTimeout(() => setMsg(null), 3000);
  };

  return (
    <AppShell title="Trader Profile" subtitle="Account details • badges • trading style • subscription">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 font-sans">
        <div className="glass-soft rounded-3xl p-6 lg:col-span-5 flex flex-col justify-between border border-white/10">
          <div>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center text-2xl font-bold">
                {user?.email ? user.email[0].toUpperCase() : "P"}
              </div>
              <div>
                <div className="text-lg font-semibold">{user?.email?.split("@")[0] || "ProfitGrid Trader"}</div>
                <div className="text-xs text-[rgb(var(--muted))]">{user?.email || "Synced Trader"}</div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="rounded-full bg-purple-500/20 border border-purple-500/30 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-300">
                    {plan} PLAN
                  </span>
                  <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Verified
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-white/10 pt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-2xl bg-white/5 p-3 border border-white/5">
                <div className="text-xs text-[rgb(var(--muted))]">Trades</div>
                <div className="mt-1 text-lg font-bold">{stats.totalTrades}</div>
              </div>
              <div className="rounded-2xl bg-white/5 p-3 border border-white/5">
                <div className="text-xs text-[rgb(var(--muted))]">Win Rate</div>
                <div className="mt-1 text-lg font-bold text-emerald-400">{stats.winRate}%</div>
              </div>
              <div className="rounded-2xl bg-white/5 p-3 border border-white/5">
                <div className="text-xs text-[rgb(var(--muted))]">Total P&amp;L</div>
                <div className={`mt-1 text-lg font-bold ${stats.totalPnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  ${stats.totalPnl}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--muted))]">Achievements &amp; Badges</div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 rounded-2xl border border-purple-500/20 bg-purple-500/10 p-3">
                  <Trophy className="h-6 w-6 text-purple-400 shrink-0" />
                  <div>
                    <div className="text-xs font-semibold">7-Day Streak</div>
                    <div className="text-[10px] text-[rgb(var(--muted))]">Logged trades daily</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-3">
                  <Award className="h-6 w-6 text-blue-400 shrink-0" />
                  <div>
                    <div className="text-xs font-semibold">Prop Ready</div>
                    <div className="text-[10px] text-[rgb(var(--muted))]">RR &gt; 2.0 avg</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                  <Shield className="h-6 w-6 text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-xs font-semibold">Risk Guardian</div>
                    <div className="text-[10px] text-[rgb(var(--muted))]">0 max daily breaches</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3">
                  <User className="h-6 w-6 text-amber-400 shrink-0" />
                  <div>
                    <div className="text-xs font-semibold">Backtest Lab</div>
                    <div className="text-[10px] text-[rgb(var(--muted))]">Replay veteran</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="text-[rgb(var(--muted))]">Member since Feb 2026</span>
            <Link href="/pricing" className="text-purple-400 hover:underline flex items-center gap-1">
              Upgrade Plan <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        <div className="glass-soft rounded-3xl p-6 lg:col-span-7 border border-white/10 flex flex-col justify-between">
          <div>
            <div className="text-lg font-semibold">Trader Preferences &amp; Identity</div>
            <div className="mt-1 text-xs text-[rgb(var(--muted))]">
              Customize how your profile appears on exported Trader Cards &amp; reports.
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-[rgb(var(--muted))]">Trading Style</label>
                <select
                  value={tradingStyle}
                  onChange={(e) => setTradingStyle(e.target.value)}
                  className="mt-1.5 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-purple-500/50"
                >
                  <option value="Day Trader">Day Trader (Intraday &amp; Sessions)</option>
                  <option value="Swing Trader">Swing Trader (Multi-day Holds)</option>
                  <option value="Scalper">Scalper (1m - 5m Execution)</option>
                  <option value="Position Trader">Position Trader (Long-term Macro)</option>
                  <option value="Algorithmic / Quant">Algorithmic / Quant Trader</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-[rgb(var(--muted))]">Primary Market Focus</label>
                <select
                  value={primaryMarket}
                  onChange={(e) => setPrimaryMarket(e.target.value)}
                  className="mt-1.5 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-purple-500/50"
                >
                  <option value="Forex">Forex Majors &amp; Minors</option>
                  <option value="Gold">Gold Spot (XAUUSD) &amp; Metals</option>
                  <option value="Indices">Indices (NAS100, US30, SPX500)</option>
                  <option value="Crypto">Crypto Assets (BTC, ETH, Solana)</option>
                  <option value="Multi-Asset">Multi-Asset Ecosystem</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-[rgb(var(--muted))]">Trader Bio &amp; Philosophy</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="mt-1.5 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-purple-500/50"
                  placeholder="Describe your trading rules and edge..."
                />
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold">Subscription &amp; Billing</div>
                    <div className="text-xs text-[rgb(var(--muted))]">
                      Currently on <strong className="text-purple-300 uppercase">{plan}</strong> tier. Supports Crypto (USDT/BTC) &amp; Cards.
                    </div>
                  </div>
                  <Link
                    href="/pricing"
                    className="rounded-xl bg-purple-500/20 border border-purple-500/30 px-3.5 py-2 text-xs font-semibold text-purple-200 hover:bg-purple-500/30 transition"
                  >
                    Manage Subscription
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between pt-4 border-t border-white/10">
            {msg ? <span className="text-xs font-medium text-emerald-400">{msg}</span> : <span />}
            <button
              onClick={handleSave}
              className="rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:from-purple-500 hover:to-indigo-500 transition"
            >
              Save Profile Preferences
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
