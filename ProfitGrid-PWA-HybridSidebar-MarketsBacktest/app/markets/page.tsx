"use client";

import React, { useMemo, useState, useEffect } from "react";
import AppShell from "../components/AppShell";
import Sparkline from "../components/Sparkline";
import CandlesMock from "../components/CandlesMock";
import { Search, Star, Clock, TrendingUp, TrendingDown, Layers, CheckCircle2, ArrowUpRight, Plus, Eye } from "lucide-react";

type Market = {
  symbol: string;
  name: string;
  group: "Forex" | "Gold" | "Indices";
  price: number;
  changePct: number;
  spread: number;
  spark: number[];
};

const seed = {
  EURUSD: [1.08, 1.082, 1.081, 1.085, 1.087, 1.086, 1.089, 1.091, 1.090, 1.092],
  GBPUSD: [1.26, 1.259, 1.261, 1.263, 1.262, 1.264, 1.265, 1.266, 1.268, 1.267],
  USDJPY: [150.1, 150.3, 150.2, 150.6, 150.8, 150.7, 151.0, 150.9, 151.2, 151.1],
  XAUUSD: [2142, 2144, 2141, 2148, 2152, 2149, 2156, 2160, 2157, 2164],
  NAS100: [18690, 18740, 18710, 18790, 18810, 18840, 18810, 18870, 18910, 18940],
  US30: [38920, 38980, 38910, 39040, 39120, 39180, 39130, 39210, 39290, 39240],
  SPX500: [5120, 5135, 5128, 5142, 5150, 5145, 5158, 5162, 5159, 5168],
  GER40: [17820, 17850, 17830, 17890, 17910, 17900, 17940, 17960, 17950, 17980],
  UK100: [7910, 7925, 7915, 7935, 7942, 7938, 7950, 7955, 7951, 7962],
};

const initialMarkets: Market[] = [
  { symbol: "EURUSD", name: "Euro / US Dollar", group: "Forex", price: 1.08961, changePct: 0.92, spread: 0.1, spark: seed.EURUSD },
  { symbol: "GBPUSD", name: "British Pound / US Dollar", group: "Forex", price: 1.261, changePct: -0.14, spread: 0.2, spark: seed.GBPUSD },
  { symbol: "USDJPY", name: "US Dollar / Japanese Yen", group: "Forex", price: 150.25, changePct: 0.31, spread: 0.1, spark: seed.USDJPY },
  { symbol: "XAUUSD", name: "Gold Spot / US Dollar", group: "Gold", price: 2145.8, changePct: 1.31, spread: 0.35, spark: seed.XAUUSD },
  { symbol: "NAS100", name: "Nasdaq 100", group: "Indices", price: 18732.3, changePct: 0.33, spread: 1.2, spark: seed.NAS100 },
  { symbol: "US30", name: "Dow Jones 30", group: "Indices", price: 39821.1, changePct: -0.22, spread: 2.1, spark: seed.US30 },
  { symbol: "SPX500", name: "S&P 500 Index", group: "Indices", price: 5164.2, changePct: 0.45, spread: 0.5, spark: seed.SPX500 },
  { symbol: "GER40", name: "Germany 40 Index", group: "Indices", price: 17970.0, changePct: 0.18, spread: 1.5, spark: seed.GER40 },
  { symbol: "UK100", name: "FTSE 100 Index", group: "Indices", price: 7958.5, changePct: -0.08, spread: 1.0, spark: seed.UK100 },
];

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export default function MarketsPage() {
  const [tab, setTab] = useState<"Forex" | "Gold" | "Indices">("Forex");
  const [query, setQuery] = useState("");
  const [tf, setTf] = useState<"1m" | "5m" | "15m" | "1h" | "4h" | "1D">("5m");
  const [viewMode, setViewMode] = useState<"mini" | "full">("mini");
  const [starred, setStarred] = useState<Record<string, boolean>>({ EURUSD: true, XAUUSD: true, NAS100: true });
  const [watchlistName, setWatchlistName] = useState<string>("Default Watchlist");

  const [markets, setMarkets] = useState<Market[]>(initialMarkets);
  useEffect(() => {
    const interval = setInterval(() => {
      setMarkets((prev) =>
        prev.map((m) => {
          const delta = (Math.random() - 0.49) * (m.price * 0.0004);
          const newPrice = Number((m.price + delta).toFixed(m.symbol.includes("JPY") || m.group === "Indices" ? 2 : 5));
          return { ...m, price: newPrice };
        })
      );
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const st = localStorage.getItem("pg_starred_markets");
      if (st) {
        try {
          setStarred(JSON.parse(st));
        } catch {}
      }
    }
  }, []);

  const toggleStar = (sym: string) => {
    const next = { ...starred, [sym]: !starred[sym] };
    setStarred(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("pg_starred_markets", JSON.stringify(next));
    }
  };

  const filtered = useMemo(() => {
    return markets
      .filter((m) => m.group === tab)
      .filter((m) => (query.trim() ? (m.symbol + " " + m.name).toLowerCase().includes(query.toLowerCase()) : true));
  }, [markets, tab, query]);

  const [selectedSym, setSelectedSym] = useState<string>("EURUSD");
  const selectedMarket = useMemo(() => markets.find((m) => m.symbol === selectedSym) ?? markets[0], [markets, selectedSym]);

  const sessions = useMemo(() => {
    const h = new Date().getUTCHours();
    return [
      { name: "Sydney", active: h >= 22 || h < 7, time: "22:00 - 07:00 UTC" },
      { name: "Tokyo", active: h >= 0 && h < 9, time: "00:00 - 09:00 UTC" },
      { name: "London", active: h >= 7 && h < 16, time: "07:00 - 16:00 UTC" },
      { name: "New York", active: h >= 12 && h < 21, time: "12:00 - 21:00 UTC" },
    ];
  }, []);

  return (
    <AppShell title="Live Markets" subtitle="Forex • Gold • Indices — institutional price engine with session tracking">
      <div className="glass-soft rounded-3xl p-5 border border-white/10 mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4 font-sans">
        {sessions.map((s) => (
          <div key={s.name} className="flex items-center justify-between rounded-2xl bg-white/5 p-3 border border-white/5">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold">
                <span className={`h-2 w-2 rounded-full ${s.active ? "bg-emerald-400 animate-pulse" : "bg-white/20"}`} />
                {s.name} Session
              </div>
              <div className="text-[10px] text-[rgb(var(--muted))] mt-0.5">{s.time}</div>
            </div>
            <span
              className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                s.active ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-white/5 text-[rgb(var(--muted))]"
              }`}
            >
              {s.active ? "OPEN" : "CLOSED"}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 font-sans">
        <section className="glass rounded-3xl p-6 lg:col-span-6 border border-white/10 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold">Watchlists</span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE TICKS
                </span>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={watchlistName}
                  onChange={(e) => setWatchlistName(e.target.value)}
                  className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-semibold outline-none"
                >
                  <option value="Default Watchlist">Default Watchlist</option>
                  <option value="Starred Favorites">Starred Favorites (Pro)</option>
                  <option value="London Open Pairs">London Open Pairs</option>
                  <option value="NY Session Indices">NY Session Indices</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 mt-4">
              <div className="flex items-center gap-1.5">
                {(["Forex", "Gold", "Indices"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={cx(
                      "rounded-xl px-3.5 py-1.5 text-xs font-bold transition",
                      tab === t ? "bg-purple-500/20 border border-purple-500/40 text-purple-200" : "bg-white/5 hover:bg-white/10 text-[rgb(var(--muted))]"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="relative w-40 sm:w-48">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[rgb(var(--muted))]" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Filter pair..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 pl-8 pr-3 py-1.5 text-xs outline-none focus:border-purple-500/40"
                />
              </div>
            </div>

            <div className="mt-4 space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {filtered.map((m) => {
                const up = m.changePct >= 0;
                const isSelected = selectedMarket.symbol === m.symbol;
                return (
                  <div
                    key={m.symbol}
                    onClick={() => setSelectedSym(m.symbol)}
                    className={cx(
                      "flex items-center justify-between rounded-2xl p-3.5 border transition cursor-pointer",
                      isSelected ? "bg-purple-500/15 border-purple-500/40 shadow-md" : "bg-white/5 border-white/5 hover:border-white/15"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStar(m.symbol);
                        }}
                        className="text-[rgb(var(--muted))] hover:text-amber-400 transition"
                      >
                        <Star className={cx("h-4 w-4", starred[m.symbol] ? "fill-amber-400 text-amber-400" : "")} />
                      </button>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">{m.symbol}</span>
                          <span className="text-[10px] rounded bg-white/10 px-1.5 py-0.5 text-[rgb(var(--muted))]">{m.group}</span>
                        </div>
                        <div className="text-[11px] text-[rgb(var(--muted))] mt-0.5">{m.name}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {viewMode === "mini" && (
                        <div className="hidden sm:block w-20">
                          <Sparkline data={m.spark} positive={up} height={26} />
                        </div>
                      )}
                      <div className="text-right">
                        <div className="text-sm font-bold tracking-tight">{m.price}</div>
                        <div className={`text-xs font-semibold flex items-center justify-end gap-1 ${up ? "text-emerald-400" : "text-rose-400"}`}>
                          {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {up ? "+" : ""}
                          {m.changePct}%
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 text-xs text-[rgb(var(--muted))] flex items-center justify-between">
            <span>Spread avg: {selectedMarket.spread} pts</span>
            <span>No crypto pairs active at launch</span>
          </div>
        </section>

        <section className="glass rounded-3xl p-6 lg:col-span-6 border border-white/10 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <div className="text-xs text-[rgb(var(--muted))] uppercase font-semibold">Live Interactive Chart</div>
                <div className="text-xl font-extrabold flex items-center gap-2">
                  {selectedMarket.symbol}{" "}
                  <span className="text-xs font-semibold rounded-full bg-white/10 px-2.5 py-0.5">{selectedMarket.name}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode(viewMode === "mini" ? "full" : "mini")}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold hover:bg-white/10 transition flex items-center gap-1.5"
                >
                  <Eye className="h-3.5 w-3.5 text-purple-400" /> {viewMode === "mini" ? "Full Terminal" : "Mini View"}
                </button>

                <select
                  value={tf}
                  onChange={(e) => setTf(e.target.value as any)}
                  className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-semibold outline-none"
                >
                  {["1m", "5m", "15m", "1h", "4h", "1D"].map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <CandlesMock width={540} height={360} accent="rgba(0,220,255,0.9)" />
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-white/5 p-3.5 border border-white/5 text-center">
                <div className="text-[10px] text-[rgb(var(--muted))] uppercase font-semibold">Live Bid / Ask</div>
                <div className="mt-1 text-sm font-bold text-emerald-400">
                  {selectedMarket.price} / {(selectedMarket.price + selectedMarket.spread * 0.0001).toFixed(5)}
                </div>
              </div>
              <div className="rounded-2xl bg-white/5 p-3.5 border border-white/5 text-center">
                <div className="text-[10px] text-[rgb(var(--muted))] uppercase font-semibold">Daily Spread</div>
                <div className="mt-1 text-sm font-bold">{selectedMarket.spread} pips</div>
              </div>
              <div className="rounded-2xl bg-white/5 p-3.5 border border-white/5 text-center">
                <div className="text-[10px] text-[rgb(var(--muted))] uppercase font-semibold">Session Bias</div>
                <div className="mt-1 text-sm font-bold text-purple-300">Bullish Liquidity</div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs text-[rgb(var(--muted))]">Click any chart level to inspect tick momentum.</span>
            <button
              onClick={() => alert(`Opening backtest simulation for ${selectedMarket.symbol} in Backtest Lab...`)}
              className="rounded-xl bg-purple-500/20 border border-purple-500/30 px-4 py-2 text-xs font-bold text-purple-200 hover:bg-purple-500/30 transition"
            >
              Test {selectedMarket.symbol} in Lab →
            </button>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
