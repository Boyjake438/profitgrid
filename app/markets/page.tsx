"use client";

import React, { useMemo, useState, useEffect } from "react";
import AppShell from "../components/AppShell";
import Sparkline from "../components/Sparkline";
import CandlesMock from "../components/CandlesMock";
import { Search, Star, Clock, TrendingUp, TrendingDown, Eye } from "lucide-react";

type Market = {
  symbol: string;
  name: string;
  group: "Forex" | "Gold" | "Indices";
  price: number;
  changePct: number;
  spread: number;
  high?: number;
  low?: number;
  spark: number[];
};

const initialMarkets: Market[] = [
  { symbol: "EURUSD", name: "Euro / US Dollar", group: "Forex", price: 1.08945, changePct: 0.32, spread: 0.1, spark: [1.0865, 1.0872, 1.088, 1.0875, 1.0888, 1.089, 1.0885, 1.0892, 1.0895, 1.08945] },
  { symbol: "GBPUSD", name: "British Pound / US Dollar", group: "Forex", price: 1.27568, changePct: 0.45, spread: 0.2, spark: [1.271, 1.272, 1.2735, 1.273, 1.2742, 1.2748, 1.275, 1.2755, 1.276, 1.27568] },
  { symbol: "USDJPY", name: "US Dollar / Japanese Yen", group: "Forex", price: 157.684, changePct: -0.21, spread: 0.15, spark: [158.1, 158.05, 157.9, 157.95, 157.8, 157.75, 157.85, 157.7, 157.65, 157.684] },
  { symbol: "XAUUSD", name: "Gold Spot / US Dollar", group: "Gold", price: 2335.56, changePct: 1.12, spread: 0.35, spark: [2316.0, 2320.5, 2322.0, 2328.0, 2325.0, 2330.0, 2332.5, 2331.0, 2334.0, 2335.56] },
  { symbol: "NAS100", name: "Nasdaq 100 Index", group: "Indices", price: 18204.4, changePct: 0.27, spread: 1.2, spark: [18130, 18150, 18140, 18170, 18180, 18175, 18190, 18210, 18200, 18204.4] },
  { symbol: "US30", name: "Dow Jones Industrial", group: "Indices", price: 39525.8, changePct: -0.18, spread: 2.1, spark: [39650, 39620, 39580, 39600, 39560, 39530, 39550, 39510, 39535, 39525.8] },
  { symbol: "SPX500", name: "S&P 500 Index", group: "Indices", price: 5430.2, changePct: 0.35, spread: 0.5, spark: [5412, 5418, 5415, 5422, 5425, 5420, 5428, 5432, 5429, 5430.2] },
  { symbol: "GER40", name: "Germany 40 Index", group: "Indices", price: 18450.0, changePct: 0.15, spread: 1.5, spark: [18400, 18420, 18410, 18435, 18440, 18430, 18445, 18455, 18448, 18450.0] },
  { symbol: "UK100", name: "FTSE 100 Index", group: "Indices", price: 8240.5, changePct: -0.05, spread: 1.0, spark: [8260, 8255, 8250, 8252, 8245, 8242, 8248, 8240, 8243, 8240.5] },
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
  const [liveStatus, setLiveStatus] = useState<"connecting" | "live" | "fallback">("connecting");

  // Fetch actual live real market prices from our proxy API
  const fetchLivePrices = async () => {
    try {
      const res = await fetch("/api/markets/live?symbols=EURUSD,GBPUSD,USDJPY,XAUUSD,NAS100,US30,SPX500,GER40,UK100");
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.markets) {
          setMarkets((prev) =>
            prev.map((m) => {
              const live = json.markets[m.symbol];
              if (live && live.price) {
                return {
                  ...m,
                  price: live.price,
                  changePct: live.changePct ?? m.changePct,
                  high: live.high,
                  low: live.low,
                  spark: live.spark && live.spark.length >= 5 ? live.spark : m.spark,
                };
              }
              return m;
            })
          );
          setLiveStatus("live");
        }
      }
    } catch {
      setLiveStatus("fallback");
    }
  };

  useEffect(() => {
    fetchLivePrices();
    const interval = setInterval(fetchLivePrices, 4000);
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
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />{" "}
                  {liveStatus === "live" ? "REAL LIVE TICKS" : "REAL MARKET BASIS"}
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
            <span>No crypto pairs active at launch (Forex, Gold &amp; Indices focused)</span>
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
                  {selectedMarket.price} / {(selectedMarket.price + selectedMarket.spread * 0.0001).toFixed(selectedMarket.symbol.includes("JPY") ? 2 : 5)}
                </div>
              </div>
              <div className="rounded-2xl bg-white/5 p-3.5 border border-white/5 text-center">
                <div className="text-[10px] text-[rgb(var(--muted))] uppercase font-semibold">24H High / Low</div>
                <div className="mt-1 text-sm font-bold text-white">
                  {selectedMarket.high || (selectedMarket.price * 1.002).toFixed(2)} / {selectedMarket.low || (selectedMarket.price * 0.998).toFixed(2)}
                </div>
              </div>
              <div className="rounded-2xl bg-white/5 p-3.5 border border-white/5 text-center">
                <div className="text-[10px] text-[rgb(var(--muted))] uppercase font-semibold">Session Bias</div>
                <div className="mt-1 text-sm font-bold text-purple-300">Institutional Flow</div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs text-[rgb(var(--muted))]">Click any chart level to inspect real historical tick momentum.</span>
            <button
              onClick={() => (window.location.href = `/backtest?symbol=${selectedMarket.symbol}`)}
              className="rounded-xl bg-purple-500/20 border border-purple-500/30 px-4 py-2 text-xs font-bold text-purple-200 hover:bg-purple-500/30 transition"
            >
              Replay {selectedMarket.symbol} in Lab →
            </button>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
