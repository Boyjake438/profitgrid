"use client";

import React, { useMemo, useState } from "react";
import AppShell from "../components/AppShell";
import Sparkline from "../components/Sparkline";
import CandlesMock from "../components/CandlesMock";
import { Search, Star, StarOff, Clock, TrendingUp, TrendingDown } from "lucide-react";

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
};

const defaultMarkets: Market[] = [
  { symbol: "EURUSD", name: "Euro / US Dollar", group: "Forex", price: 1.08961, changePct: 0.92, spread: 0.1, spark: seed.EURUSD },
  { symbol: "GBPUSD", name: "British Pound / US Dollar", group: "Forex", price: 1.26100, changePct: -0.14, spread: 0.2, spark: seed.GBPUSD },
  { symbol: "USDJPY", name: "US Dollar / Japanese Yen", group: "Forex", price: 150.25, changePct: 0.31, spread: 0.1, spark: seed.USDJPY },
  { symbol: "XAUUSD", name: "Gold Spot / US Dollar", group: "Gold", price: 2145.80, changePct: 1.31, spread: 0.35, spark: seed.XAUUSD },
  { symbol: "NAS100", name: "Nasdaq 100", group: "Indices", price: 18732.30, changePct: 0.33, spread: 1.2, spark: seed.NAS100 },
  { symbol: "US30", name: "Dow Jones 30", group: "Indices", price: 39821.10, changePct: -0.22, spread: 2.1, spark: seed.US30 },
];

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

function sessionLabel() {
  const h = new Date().getUTCHours();
  if (h >= 22 || h < 7) return "Asia";
  if (h >= 7 && h < 13) return "London";
  return "New York";
}

export default function MarketsPage() {
  const [tab, setTab] = useState<"Forex" | "Gold" | "Indices">("Forex");
  const [query, setQuery] = useState("");
  const [tf, setTf] = useState<"1m" | "5m" | "15m" | "1h" | "4h" | "1D">("5m");
  const [starred, setStarred] = useState<Record<string, boolean>>({ EURUSD: true, XAUUSD: true, NAS100: true });
  const filtered = useMemo(() => {
    return defaultMarkets
      .filter(m => m.group === tab)
      .filter(m => (query.trim() ? (m.symbol + " " + m.name).toLowerCase().includes(query.toLowerCase()) : true));
  }, [tab, query]);

  const selected = filtered[0] ?? defaultMarkets[0];

  return (
    <AppShell title="Markets" subtitle="Forex • Gold • Indices — terminal accents (free-first)">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Watchlist */}
        <section className="glass rounded-2xl p-5 lg:col-span-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <div className="text-sm font-semibold tracking-wide">Markets</div>
              <span className="ml-2 inline-flex items-center gap-2 rounded-full border border-[rgba(0,220,255,0.22)] bg-[rgba(0,220,255,0.08)] px-3 py-1 text-xs text-[rgba(0,220,255,0.95)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[rgba(0,220,255,0.95)]" />
                LIVE (mock)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-[rgb(var(--muted))]" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search symbols…"
                  className="w-full rounded-xl border border-[rgba(var(--border),0.45)] bg-[rgba(255,255,255,0.03)] py-2 pl-9 pr-3 text-sm outline-none focus:border-[rgba(0,220,255,0.45)]"
                />
              </div>

              <select
                value={tf}
                onChange={(e) => setTf(e.target.value as any)}
                className="rounded-xl border border-[rgba(var(--border),0.45)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-sm outline-none"
              >
                {["1m","5m","15m","1h","4h","1D"].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {(["Forex","Gold","Indices"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cx(
                  "rounded-xl px-3 py-2 text-sm transition",
                  tab === t
                    ? "border border-[rgba(0,220,255,0.35)] bg-[rgba(0,220,255,0.10)] text-[rgba(0,220,255,0.95)]"
                    : "border border-[rgba(var(--border),0.45)] bg-[rgba(255,255,255,0.02)] text-[rgb(var(--muted))] hover:bg-[rgba(255,255,255,0.04)]"
                )}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="mt-4 overflow-hidden rounded-2xl border border-[rgba(var(--border),0.35)]">
            <div className="grid grid-cols-12 bg-[rgba(255,255,255,0.02)] px-4 py-3 text-xs text-[rgb(var(--muted))]">
              <div className="col-span-4">Symbol</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-2 text-right">24h%</div>
              <div className="col-span-3 text-right">Mini</div>
              <div className="col-span-1 text-right">★</div>
            </div>

            <div className="divide-y divide-[rgba(var(--border),0.25)]">
              {filtered.map((m) => {
                const pos = m.changePct >= 0;
                return (
                  <button
                    key={m.symbol}
                    className="grid w-full grid-cols-12 items-center px-4 py-3 text-left hover:bg-[rgba(255,255,255,0.03)]"
                  >
                    <div className="col-span-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{m.symbol}</span>
                        <span className="hidden text-xs text-[rgb(var(--muted))] sm:inline">{m.name}</span>
                      </div>
                    </div>
                    <div className="col-span-2 text-right text-sm tabular-nums">
                      {m.price.toLocaleString(undefined, { maximumFractionDigits: 5 })}
                    </div>
                    <div className={cx("col-span-2 text-right text-sm tabular-nums", pos ? "text-emerald-300" : "text-red-300")}>
                      {pos ? "+" : ""}{m.changePct.toFixed(2)}%
                    </div>
                    <div className="col-span-3 flex justify-end">
                      <Sparkline data={m.spark} positive={pos} width={120} height={34} />
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <span
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setStarred(prev => ({ ...prev, [m.symbol]: !prev[m.symbol] }));
                        }}
                        className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-[rgba(var(--border),0.35)] bg-[rgba(255,255,255,0.02)] p-2 hover:bg-[rgba(255,255,255,0.06)]"
                      >
                        {starred[m.symbol] ? <Star className="h-4 w-4 text-[rgba(0,220,255,0.95)]" /> : <StarOff className="h-4 w-4 text-[rgb(var(--muted))]" />}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-[rgb(var(--muted))]">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Session: <span className="text-[rgba(0,220,255,0.95)]">{sessionLabel()}</span>
            </div>
            <div>Free-first • Live feed hookup later</div>
          </div>
        </section>

        {/* Selected Symbol */}
        <section className="glass rounded-2xl p-5 lg:col-span-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm text-[rgb(var(--muted))]">Selected</div>
              <div className="mt-0.5 text-xl font-semibold">{selected.symbol}</div>
              <div className="mt-1 text-xs text-[rgb(var(--muted))]">{selected.name}</div>
            </div>

            <div className="text-right">
              <div className="text-sm text-[rgb(var(--muted))]">Price</div>
              <div className="mt-0.5 text-2xl font-semibold tabular-nums">
                {selected.price.toLocaleString(undefined, { maximumFractionDigits: 5 })}
              </div>
              <div className={cx("mt-1 inline-flex items-center gap-1 text-sm", selected.changePct >= 0 ? "text-emerald-300" : "text-red-300")}>
                {selected.changePct >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {selected.changePct >= 0 ? "+" : ""}{selected.changePct.toFixed(2)}%
              </div>
            </div>
          </div>

          <div className="mt-4">
            <CandlesMock width={520} height={280} accent="rgba(0,220,255,0.85)" />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="glass-soft rounded-2xl p-4">
              <div className="text-xs text-[rgb(var(--muted))]">Day High</div>
              <div className="mt-1 text-sm font-semibold tabular-nums">{(selected.price * 1.003).toLocaleString(undefined, { maximumFractionDigits: 5 })}</div>
            </div>
            <div className="glass-soft rounded-2xl p-4">
              <div className="text-xs text-[rgb(var(--muted))]">Day Low</div>
              <div className="mt-1 text-sm font-semibold tabular-nums">{(selected.price * 0.997).toLocaleString(undefined, { maximumFractionDigits: 5 })}</div>
            </div>
            <div className="glass-soft rounded-2xl p-4">
              <div className="text-xs text-[rgb(var(--muted))]">Spread</div>
              <div className="mt-1 text-sm font-semibold tabular-nums">{selected.spread}</div>
            </div>
            <div className="glass-soft rounded-2xl p-4">
              <div className="text-xs text-[rgb(var(--muted))]">Volatility</div>
              <div className="mt-1 text-sm font-semibold">Medium</div>
            </div>
          </div>

          <div className="mt-4 glass-soft rounded-2xl p-4">
            <div className="text-xs text-[rgb(var(--muted))]">Levels & Notes</div>
            <div className="mt-2 text-sm text-[rgb(var(--muted))]">
              Add key levels, biases, and session plans per symbol (Handbook-style). This becomes a paid differentiator.
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
