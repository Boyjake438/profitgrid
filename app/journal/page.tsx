"use client";

import React, { useEffect, useMemo, useState } from "react";
import AppShell from "../components/AppShell";
import { createClient } from "@/lib/supabase/client";
import { fmtMoney, ymd } from "@/lib/utils";
import {
  Plus,
  Search,
  Filter,
  Tag,
  BookOpen,
  Calendar,
  CheckSquare,
  FileText,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type TradeRow = {
  id: number;
  account_id?: number | null;
  opened_at: string;
  asset_class: string;
  symbol: string;
  side: "BUY" | "SELL";
  entry?: number | null;
  exit?: number | null;
  stop_loss?: number | null;
  take_profit?: number | null;
  size?: number | null;
  pnl: number;
  rr: number | null;
  notes: string | null;
  playbook?: string | null;
  screenshot_url?: string | null;
  tags?: string[];
  created_at: string;
};

const PLAYBOOKS = ["All", "London Sweep", "FVG Entry", "Breakout", "Scalping", "Order Block", "Custom"] as const;
const ASSET_CLASSES = ["All", "Forex", "Gold", "Indices", "Crypto", "Metals"] as const;

export default function JournalPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen grid place-items-center text-sm text-[rgb(var(--muted))] font-sans">Loading Professional Journal Hub…</div>}>
      <JournalPageContent />
    </React.Suspense>
  );
}

function JournalPageContent() {
  const supabase = useMemo(() => createClient(), []);
  const searchParams = useSearchParams();
  const initialModal = searchParams?.get("modal") === "add";

  const [tab, setTab] = useState<"trades" | "playbooks" | "reviews">("trades");
  const [loading, setLoading] = useState(true);
  const [trades, setTrades] = useState<TradeRow[]>([]);
  const [query, setQuery] = useState("");
  const [playbookFilter, setPlaybookFilter] = useState<string>("All");
  const [assetFilter, setAssetFilter] = useState<string>("All");
  const [currency, setCurrency] = useState<string>("USD");
  const [activeAccountId, setActiveAccountId] = useState<number | null>(null);

  const [showAddModal, setShowAddModal] = useState(initialModal);
  const [form, setForm] = useState({
    opened_at: new Date().toISOString().slice(0, 16),
    asset_class: "Forex",
    symbol: "EURUSD",
    side: "BUY" as "BUY" | "SELL",
    entry: "",
    exit: "",
    stop_loss: "",
    take_profit: "",
    size: "1.00",
    pnl: "",
    rr: "2.0",
    playbook: "London Sweep",
    notes: "",
    screenshot_url: "",
  });
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedCurr = localStorage.getItem("pg_currency");
      const storedAcc = localStorage.getItem("pg_active_account");
      if (storedCurr) setCurrency(storedCurr);
      if (storedAcc && !Number.isNaN(Number(storedAcc))) setActiveAccountId(Number(storedAcc));

      const handleStorage = () => {
        const c = localStorage.getItem("pg_currency");
        const a = localStorage.getItem("pg_active_account");
        if (c) setCurrency(c);
        if (a && !Number.isNaN(Number(a))) setActiveAccountId(Number(a));
      };
      window.addEventListener("storage", handleStorage);
      return () => window.removeEventListener("storage", handleStorage);
    }
  }, []);

  const loadTrades = async () => {
    setLoading(true);
    const { data: auth } = await supabase.auth.getUser();
    if (auth.user) {
      let q = supabase
        .from("trades")
        .select("*")
        .eq("user_id", auth.user.id)
        .order("opened_at", { ascending: false })
        .limit(200);

      if (activeAccountId) {
        q = q.eq("account_id", activeAccountId);
      }

      const { data } = await q;
      if (Array.isArray(data)) setTrades(data as any);
    } else {
      setTrades([
        {
          id: 101,
          opened_at: new Date().toISOString(),
          asset_class: "Gold",
          symbol: "XAUUSD",
          side: "BUY",
          entry: 2145.5,
          exit: 2154.2,
          stop_loss: 2142.0,
          take_profit: 2154.2,
          size: 1.5,
          pnl: 435.0,
          rr: 2.5,
          playbook: "London Sweep",
          notes: "Clean liquidity grab at London open + 5m FVG confirmation.",
          screenshot_url: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop",
          tags: ["London Sweep", "Gold"],
          created_at: new Date().toISOString(),
        },
        {
          id: 102,
          opened_at: new Date(Date.now() - 86400000).toISOString(),
          asset_class: "Forex",
          symbol: "EURUSD",
          side: "SELL",
          entry: 1.0895,
          exit: 1.0862,
          stop_loss: 1.091,
          take_profit: 1.086,
          size: 2.0,
          pnl: 660.0,
          rr: 2.2,
          playbook: "FVG Entry",
          notes: "NY session displacement after CPI data release.",
          tags: ["FVG Entry", "Forex"],
          created_at: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 103,
          opened_at: new Date(Date.now() - 86400000 * 2).toISOString(),
          asset_class: "Indices",
          symbol: "NAS100",
          side: "BUY",
          entry: 18720,
          exit: 18680,
          stop_loss: 18680,
          take_profit: 18800,
          size: 1.0,
          pnl: -200.0,
          rr: -1.0,
          playbook: "Breakout",
          notes: "Fakeout at previous day high. Shifter SL too early.",
          tags: ["Breakout", "Loss"],
          created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        },
      ]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTrades();
  }, [supabase, activeAccountId]);

  const filtered = useMemo(() => {
    return trades.filter((t) => {
      const matchQuery =
        !query.trim() ||
        t.symbol.toLowerCase().includes(query.toLowerCase()) ||
        t.notes?.toLowerCase().includes(query.toLowerCase()) ||
        t.playbook?.toLowerCase().includes(query.toLowerCase());
      const matchPlaybook = playbookFilter === "All" || t.playbook === playbookFilter || (t.tags && t.tags.includes(playbookFilter));
      const matchAsset = assetFilter === "All" || t.asset_class === assetFilter;
      return matchQuery && matchPlaybook && matchAsset;
    });
  }, [trades, query, playbookFilter, assetFilter]);

  const playbookStats = useMemo(() => {
    const map: Record<string, { count: number; wins: number; pnl: number }> = {};
    PLAYBOOKS.filter((p) => p !== "All").forEach((p) => {
      map[p] = { count: 0, wins: 0, pnl: 0 };
    });

    trades.forEach((t) => {
      const pb = t.playbook || "Custom";
      if (!map[pb]) map[pb] = { count: 0, wins: 0, pnl: 0 };
      map[pb].count += 1;
      if (Number(t.pnl) > 0) map[pb].wins += 1;
      map[pb].pnl += Number(t.pnl);
    });

    return Object.entries(map).map(([name, s]) => ({
      name,
      count: s.count,
      winRate: s.count > 0 ? Math.round((s.wins / s.count) * 100) : 0,
      pnl: s.pnl,
    }));
  }, [trades]);

  const handleCreateTrade = async () => {
    const pnlNum = Number(form.pnl);
    if (Number.isNaN(pnlNum)) {
      setSaveMsg("Please enter a valid P&L number (e.g. 150 or -50)");
      return;
    }

    const payload: any = {
      opened_at: new Date(form.opened_at).toISOString(),
      asset_class: form.asset_class,
      symbol: form.symbol.toUpperCase().trim() || "EURUSD",
      side: form.side,
      entry: form.entry ? Number(form.entry) : null,
      exit: form.exit ? Number(form.exit) : null,
      stop_loss: form.stop_loss ? Number(form.stop_loss) : null,
      take_profit: form.take_profit ? Number(form.take_profit) : null,
      size: form.size ? Number(form.size) : null,
      pnl: pnlNum,
      rr: form.rr ? Number(form.rr) : null,
      playbook: form.playbook,
      notes: form.notes.trim() || null,
      screenshot_url: form.screenshot_url.trim() || null,
      tags: [form.playbook, form.asset_class],
      account_id: activeAccountId || null,
    };

    const { data: auth } = await supabase.auth.getUser();
    if (auth.user) {
      payload.user_id = auth.user.id;
      const { error } = await supabase.from("trades").insert(payload);
      if (error) {
        setSaveMsg("Error: " + error.message);
        return;
      }
    } else {
      payload.id = Date.now();
      setTrades((prev) => [payload, ...prev]);
    }

    setSaveMsg("Trade logged successfully ✅");
    setShowAddModal(false);
    loadTrades();
  };

  return (
    <AppShell title="Professional Trading Journal" subtitle="Structured trade logging • playbooks • markups • reviews">
      <div className="font-sans">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setTab("trades")}
              className={`rounded-2xl px-5 py-2.5 text-xs font-semibold transition shrink-0 ${
                tab === "trades" ? "bg-purple-500/20 border border-purple-500/40 text-purple-200" : "bg-white/5 hover:bg-white/10 text-[rgb(var(--muted))]"
              }`}
            >
              Trade Log ({filtered.length})
            </button>
            <button
              onClick={() => setTab("playbooks")}
              className={`rounded-2xl px-5 py-2.5 text-xs font-semibold transition shrink-0 ${
                tab === "playbooks" ? "bg-purple-500/20 border border-purple-500/40 text-purple-200" : "bg-white/5 hover:bg-white/10 text-[rgb(var(--muted))]"
              }`}
            >
              Playbook Setups
            </button>
            <button
              onClick={() => setTab("reviews")}
              className={`rounded-2xl px-5 py-2.5 text-xs font-semibold transition shrink-0 ${
                tab === "reviews" ? "bg-purple-500/20 border border-purple-500/40 text-purple-200" : "bg-white/5 hover:bg-white/10 text-[rgb(var(--muted))]"
              }`}
            >
              Structured Reviews
            </button>
            <Link
              href="/calendar"
              className="rounded-2xl bg-white/5 hover:bg-white/10 px-5 py-2.5 text-xs font-semibold text-[rgb(var(--muted))] hover:text-white transition shrink-0 flex items-center gap-1.5"
            >
              <Calendar className="h-3.5 w-3.5 text-amber-400" /> P&amp;L Heatmap
            </Link>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg hover:from-purple-500 hover:to-indigo-500 transition flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" /> Log New Trade
          </button>
        </div>

        {tab === "trades" && (
          <div className="mt-6 space-y-6">
            <div className="glass-soft rounded-3xl p-4 border border-white/10 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3.5 top-3 h-4 w-4 text-[rgb(var(--muted))]" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search pairs, notes, playbooks..."
                    className="w-full rounded-2xl border border-white/10 bg-white/5 pl-10 pr-4 py-2 text-xs outline-none focus:border-purple-500/50"
                  />
                </div>

                <select
                  value={playbookFilter}
                  onChange={(e) => setPlaybookFilter(e.target.value)}
                  className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs outline-none focus:border-purple-500/50"
                >
                  {PLAYBOOKS.map((p) => (
                    <option key={p} value={p}>
                      Playbook: {p}
                    </option>
                  ))}
                </select>

                <select
                  value={assetFilter}
                  onChange={(e) => setAssetFilter(e.target.value)}
                  className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs outline-none focus:border-purple-500/50"
                >
                  {ASSET_CLASSES.map((a) => (
                    <option key={a} value={a}>
                      Asset: {a}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-xs text-[rgb(var(--muted))] flex items-center gap-2">
                <span>Sort: Date (Newest)</span> • <span>Currency: {currency}</span>
              </div>
            </div>

            {loading ? (
              <div className="py-16 text-center text-sm text-[rgb(var(--muted))]">Loading journal entries...</div>
            ) : filtered.length === 0 ? (
              <div className="glass-soft rounded-3xl p-12 text-center border border-white/10">
                <div className="text-base font-semibold">No trades matched your filter</div>
                <div className="mt-1 text-xs text-[rgb(var(--muted))]">Log a trade or adjust your search parameters.</div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-4 rounded-2xl bg-purple-500/20 border border-purple-500/30 px-5 py-2.5 text-xs font-semibold text-purple-200 hover:bg-purple-500/30 transition inline-flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" /> Add Trade
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map((t) => {
                  const isWin = Number(t.pnl) >= 0;
                  return (
                    <div key={t.id} className="glass rounded-3xl p-5 border border-white/10 hover:border-white/20 transition space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-11 w-11 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                              isWin ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400" : "bg-rose-500/15 border-rose-500/30 text-rose-400"
                            }`}
                          >
                            {t.side === "BUY" ? "BUY" : "SELL"}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-base font-bold">{t.symbol}</span>
                              <span className="rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-[10px] font-semibold text-[rgb(var(--muted))]">
                                {t.asset_class}
                              </span>
                              {t.playbook && (
                                <span className="rounded-full bg-purple-500/15 border border-purple-500/30 px-2.5 py-0.5 text-[10px] font-semibold text-purple-300">
                                  ⚡ {t.playbook}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-[rgb(var(--muted))] mt-0.5">
                              {new Date(t.opened_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-white/10">
                          <div className="text-right">
                            <div className="text-[10px] text-[rgb(var(--muted))] uppercase">Lot Size &amp; R:R</div>
                            <div className="text-xs font-bold">
                              {t.size || "1.0"} Lots • {t.rr ? `${t.rr}R` : "—"}
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-[10px] text-[rgb(var(--muted))] uppercase">Result (P&amp;L)</div>
                            <div className={`text-base font-extrabold ${isWin ? "text-emerald-400" : "text-rose-400"}`}>
                              {isWin ? "+" : ""}
                              {fmtMoney(Number(t.pnl))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {(t.entry || t.stop_loss || t.take_profit) && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 rounded-2xl bg-white/5 p-3 text-xs border border-white/5">
                          <div>
                            <span className="text-[rgb(var(--muted))]">Entry Price: </span>
                            <strong className="font-semibold">{t.entry || "—"}</strong>
                          </div>
                          <div>
                            <span className="text-[rgb(var(--muted))]">Exit Price: </span>
                            <strong className="font-semibold">{t.exit || "—"}</strong>
                          </div>
                          <div>
                            <span className="text-[rgb(var(--muted))]">Stop Loss: </span>
                            <strong className="font-semibold text-rose-400">{t.stop_loss || "—"}</strong>
                          </div>
                          <div>
                            <span className="text-[rgb(var(--muted))]">Take Profit: </span>
                            <strong className="font-semibold text-emerald-400">{t.take_profit || "—"}</strong>
                          </div>
                        </div>
                      )}

                      {(t.notes || t.screenshot_url) && (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-white/5 text-xs text-[rgb(var(--muted))]">
                          {t.notes && <p className="italic leading-relaxed">“{t.notes}”</p>}
                          {t.screenshot_url && (
                            <a
                              href={t.screenshot_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-xl bg-purple-500/15 border border-purple-500/30 px-3 py-1.5 text-xs font-semibold text-purple-300 hover:bg-purple-500/25 shrink-0 transition"
                            >
                              <ImageIcon className="h-3.5 w-3.5" /> View Screenshot
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab === "playbooks" && (
          <div className="mt-6 space-y-6">
            <div className="glass-soft rounded-3xl p-6 border border-white/10">
              <div className="text-base font-semibold flex items-center gap-2">
                <Layers className="h-5 w-5 text-purple-400" />
                Strategy &amp; Playbook Performance
              </div>
              <div className="mt-1 text-xs text-[rgb(var(--muted))]">
                ProfitGrid tracks your trade execution by setup type to help you double down on your highest expectancy setups.
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {playbookStats.map((s) => (
                  <div key={s.name} className="rounded-3xl bg-white/5 p-5 border border-white/10 flex flex-col justify-between space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-purple-300 uppercase tracking-wide">{s.name}</span>
                      <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold">{s.count} Trades</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-center pt-2 border-t border-white/5">
                      <div>
                        <div className="text-[10px] text-[rgb(var(--muted))] uppercase font-semibold">Win Rate</div>
                        <div className={`mt-0.5 text-lg font-bold ${s.winRate >= 50 ? "text-emerald-400" : "text-amber-400"}`}>
                          {s.winRate}%
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-[rgb(var(--muted))] uppercase font-semibold">Total P&amp;L</div>
                        <div className={`mt-0.5 text-lg font-bold ${s.pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          {fmtMoney(s.pnl)}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setPlaybookFilter(s.name);
                        setTab("trades");
                      }}
                      className="w-full rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 py-2 text-xs font-semibold text-[rgb(var(--muted))] hover:text-white transition flex items-center justify-center gap-1"
                    >
                      View Setup Trades <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "reviews" && (
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-soft rounded-3xl p-6 border border-white/10 flex flex-col justify-between space-y-4">
                <div>
                  <div className="text-base font-bold text-purple-300">Daily Review</div>
                  <div className="mt-1 text-xs text-[rgb(var(--muted))]">
                    Check off daily psychology rules, London / NY session review, and mistake analysis.
                  </div>
                </div>
                <Link
                  href="/review?type=daily"
                  className="w-full rounded-2xl bg-purple-500/20 border border-purple-500/30 py-3 text-center text-xs font-semibold text-purple-200 hover:bg-purple-500/30 transition block"
                >
                  Start Daily Review
                </Link>
              </div>

              <div className="glass-soft rounded-3xl p-6 border border-white/10 flex flex-col justify-between space-y-4">
                <div>
                  <div className="text-base font-bold text-blue-300">Weekly Review &amp; Report</div>
                  <div className="mt-1 text-xs text-[rgb(var(--muted))]">
                    Identify what worked, what failed, rules followed, and export weekly investor reports.
                  </div>
                </div>
                <Link
                  href="/review?type=weekly"
                  className="w-full rounded-2xl bg-blue-500/20 border border-blue-500/30 py-3 text-center text-xs font-semibold text-blue-200 hover:bg-blue-500/30 transition block"
                >
                  Open Weekly Report
                </Link>
              </div>

              <div className="glass-soft rounded-3xl p-6 border border-white/10 flex flex-col justify-between space-y-4">
                <div>
                  <div className="text-base font-bold text-emerald-300">Monthly Deep Dive</div>
                  <div className="mt-1 text-xs text-[rgb(var(--muted))]">
                    Analyze macro equity growth, profit factors, and strategy expectancy.
                  </div>
                </div>
                <Link
                  href="/analytics"
                  className="w-full rounded-2xl bg-emerald-500/20 border border-emerald-500/30 py-3 text-center text-xs font-semibold text-emerald-200 hover:bg-emerald-500/30 transition block"
                >
                  View Monthly Analytics
                </Link>
              </div>
            </div>
          </div>
        )}

        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto">
            <div className="glass rounded-3xl p-6 border border-white/20 w-full max-w-2xl space-y-4 shadow-2xl my-8 font-sans">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="text-lg font-bold">Log Professional Trade</div>
                <button onClick={() => setShowAddModal(false)} className="text-sm text-[rgb(var(--muted))] hover:text-white">✕</button>
              </div>

              {saveMsg && <div className="rounded-2xl bg-amber-500/20 border border-amber-500/30 p-3 text-xs text-amber-200">{saveMsg}</div>}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-[rgb(var(--muted))]">Asset Class</label>
                  <select
                    value={form.asset_class}
                    onChange={(e) => setForm((p) => ({ ...p, asset_class: e.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none"
                  >
                    <option value="Forex">Forex</option>
                    <option value="Gold">Gold</option>
                    <option value="Indices">Indices</option>
                    <option value="Crypto">Crypto</option>
                    <option value="Metals">Metals</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-[rgb(var(--muted))]">Pair / Symbol</label>
                  <input
                    value={form.symbol}
                    onChange={(e) => setForm((p) => ({ ...p, symbol: e.target.value }))}
                    placeholder="XAUUSD, EURUSD, NAS100"
                    className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-[rgb(var(--muted))]">Side</label>
                  <select
                    value={form.side}
                    onChange={(e) => setForm((p) => ({ ...p, side: e.target.value as any }))}
                    className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none"
                  >
                    <option value="BUY">BUY</option>
                    <option value="SELL">SELL</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs font-medium text-[rgb(var(--muted))]">Entry Price</label>
                  <input
                    type="number"
                    step="any"
                    value={form.entry}
                    onChange={(e) => setForm((p) => ({ ...p, entry: e.target.value }))}
                    placeholder="e.g. 2145.50"
                    className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[rgb(var(--muted))]">Exit Price</label>
                  <input
                    type="number"
                    step="any"
                    value={form.exit}
                    onChange={(e) => setForm((p) => ({ ...p, exit: e.target.value }))}
                    placeholder="e.g. 2154.20"
                    className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-rose-400">Stop Loss</label>
                  <input
                    type="number"
                    step="any"
                    value={form.stop_loss}
                    onChange={(e) => setForm((p) => ({ ...p, stop_loss: e.target.value }))}
                    placeholder="e.g. 2142.00"
                    className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-emerald-400">Take Profit</label>
                  <input
                    type="number"
                    step="any"
                    value={form.take_profit}
                    onChange={(e) => setForm((p) => ({ ...p, take_profit: e.target.value }))}
                    placeholder="e.g. 2154.20"
                    className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs font-medium text-[rgb(var(--muted))]">Lot Size</label>
                  <input
                    type="number"
                    step="any"
                    value={form.size}
                    onChange={(e) => setForm((p) => ({ ...p, size: e.target.value }))}
                    placeholder="1.0"
                    className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[rgb(var(--muted))]">R:R Ratio</label>
                  <input
                    type="number"
                    step="any"
                    value={form.rr}
                    onChange={(e) => setForm((p) => ({ ...p, rr: e.target.value }))}
                    placeholder="2.5"
                    className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[rgb(var(--muted))]">P&amp;L ({currency}) *</label>
                  <input
                    type="number"
                    step="any"
                    value={form.pnl}
                    onChange={(e) => setForm((p) => ({ ...p, pnl: e.target.value }))}
                    placeholder="+435 or -150"
                    className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-bold outline-none border-purple-500/40"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[rgb(var(--muted))]">Playbook Setup</label>
                  <select
                    value={form.playbook}
                    onChange={(e) => setForm((p) => ({ ...p, playbook: e.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none"
                  >
                    {PLAYBOOKS.filter((p) => p !== "All").map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-[rgb(var(--muted))]">Notes &amp; Execution Markup</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                  rows={2}
                  placeholder="Reason for entry, FVG confirmation, emotional state..."
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[rgb(var(--muted))]">Screenshot URL (MT5 / TradingView image link)</label>
                <input
                  value={form.screenshot_url}
                  onChange={(e) => setForm((p) => ({ ...p, screenshot_url: e.target.value }))}
                  placeholder="https://tradingview.com/x/... or image link"
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/10">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 rounded-2xl border border-white/10 bg-white/5 py-3 text-xs font-semibold hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTrade}
                  className="flex-1 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 py-3 text-xs font-semibold text-white hover:from-purple-500 hover:to-indigo-500 shadow-lg"
                >
                  Save &amp; Log Trade
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
