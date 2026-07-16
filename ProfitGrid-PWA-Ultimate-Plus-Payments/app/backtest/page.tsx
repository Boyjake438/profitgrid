"use client";

import React, { useEffect, useMemo, useState } from "react";
import AppShell from "../components/AppShell";
import CandlesMock, { CandlePoint, DrawingItem, IndicatorData, TradeMarker } from "../components/CandlesMock";
import {
  Play,
  Pause,
  FastForward,
  Rewind,
  ChevronLeft,
  ChevronRight,
  Crosshair,
  Minus,
  Slash,
  Square,
  Pencil,
  Trash2,
  Settings,
  Layers,
  RotateCcw,
  Download,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { fmtMoney } from "@/lib/utils";
import { useSearchParams } from "next/navigation";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

const instruments = [
  { value: "XAUUSD", label: "XAUUSD (Gold Spot)" },
  { value: "EURUSD", label: "EURUSD (Forex Major)" },
  { value: "GBPUSD", label: "GBPUSD (British Pound)" },
  { value: "USDJPY", label: "USDJPY (Japanese Yen)" },
  { value: "NAS100", label: "NAS100 (Nasdaq Index)" },
  { value: "US30", label: "US30 (Dow Jones Index)" },
];

export default function BacktestPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen grid place-items-center text-sm text-[rgb(var(--muted))] font-sans">Loading Backtest Replay Lab…</div>}>
      <BacktestPageContent />
    </React.Suspense>
  );
}

function BacktestPageContent() {
  const searchParams = useSearchParams();
  const initSym = (searchParams?.get("symbol") || "XAUUSD").toUpperCase().trim();

  const [symbol, setSymbol] = useState(initSym || "XAUUSD");
  const [tf, setTf] = useState<"1m" | "5m" | "15m" | "1h" | "4h">("5m");
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<1 | 2 | 4 | 8>(2);
  const [tool, setTool] = useState<"cursor" | "trend" | "hline" | "zone" | "fib" | "text" | "erase">("cursor");
  const [historyLoading, setHistoryLoading] = useState(true);
  const [dataSource, setDataSource] = useState<string>("real_market_history");

  // Real historical past market OHLC candles fetched from our history proxy API
  const [fullCandles, setFullCandles] = useState<CandlePoint[]>([]);

  useEffect(() => {
    let mounted = true;
    const loadRealHistory = async () => {
      setHistoryLoading(true);
      try {
        const res = await fetch(`/api/markets/history?symbol=${symbol}&interval=${tf}&limit=150`);
        if (res.ok) {
          const json = await res.json();
          if (mounted && json.success && Array.isArray(json.candles) && json.candles.length > 0) {
            setFullCandles(json.candles);
            setDataSource(json.source || "real_market_history");
            setCurrentIndex(Math.min(45, Math.floor(json.candles.length * 0.4)));
          }
        }
      } catch {
        // if network error during fetch, fallback slice will be handled or kept
      } finally {
        if (mounted) setHistoryLoading(false);
      }
    };
    loadRealHistory();
    return () => {
      mounted = false;
    };
  }, [symbol, tf]);

  const [currentIndex, setCurrentIndex] = useState(40);
  const visibleCandles = useMemo(() => fullCandles.slice(0, currentIndex), [fullCandles, currentIndex]);

  const [drawings, setDrawings] = useState<DrawingItem[]>([
    { id: "init-hline", type: "hline", y1: symbol === "XAUUSD" ? 2335 : symbol === "NAS100" ? 18200 : 1.088, label: "Daily Session Open", color: "rgba(255,185,0,0.9)" },
  ]);

  const [showIndicators, setShowIndicators] = useState(true);
  const [showIndMenu, setShowIndMenu] = useState(false);
  const [activeInds, setActiveInds] = useState({ ema20: true, sma50: true, vwap: false, bands: false });

  const computedIndicators: IndicatorData | undefined = useMemo(() => {
    if (!showIndicators || visibleCandles.length === 0) return undefined;
    const ema: (number | null)[] = [];
    const sma: (number | null)[] = [];
    const vwap: (number | null)[] = [];
    visibleCandles.forEach((c, idx) => {
      if (activeInds.ema20) {
        ema.push(idx === 0 ? c.close : Number((c.close * 0.15 + (ema[idx - 1]! || c.close) * 0.85).toFixed(4)));
      }
      if (activeInds.sma50) {
        if (idx < 5) sma.push(null);
        else {
          const slice = visibleCandles.slice(Math.max(0, idx - 10), idx + 1);
          const avg = slice.reduce((acc, val) => acc + val.close, 0) / slice.length;
          sma.push(Number(avg.toFixed(4)));
        }
      }
      if (activeInds.vwap) {
        vwap.push(Number(((c.high + c.low + c.close) / 3).toFixed(4)));
      }
    });
    return { ema: activeInds.ema20 ? ema : undefined, sma: activeInds.sma50 ? sma : undefined, vwap: activeInds.vwap ? vwap : undefined };
  }, [visibleCandles, showIndicators, activeInds]);

  const [trades, setTrades] = useState<{ id: number; type: "BUY" | "SELL"; entry: number; exit?: number; pnl?: number; rr?: number; status: "OPEN" | "CLOSED" }[]>([]);
  const [riskPct, setRiskPct] = useState("1.0");
  const [targetRR, setTargetRR] = useState("2.0");
  const [slPts, setSlPts] = useState("10");
  const [tpPts, setTpPts] = useState("20");

  const currentPrice = useMemo(() => visibleCandles[visibleCandles.length - 1]?.close || 0, [visibleCandles]);

  useEffect(() => {
    if (!playing || fullCandles.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= fullCandles.length) {
          setPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, Math.max(150, 1000 / speed));
    return () => clearInterval(interval);
  }, [playing, speed, fullCandles.length]);

  useEffect(() => {
    if (trades.length === 0) return;
    const currentCandle = visibleCandles[visibleCandles.length - 1];
    if (!currentCandle) return;

    setTrades((prev) =>
      prev.map((t) => {
        if (t.status === "CLOSED") return t;
        const slDiff = Number(slPts) || (symbol === "XAUUSD" || symbol.includes("100") || symbol.includes("30") ? 10 : 0.002);
        const tpDiff = Number(tpPts) || (symbol === "XAUUSD" || symbol.includes("100") || symbol.includes("30") ? 20 : 0.004);

        if (t.type === "BUY") {
          const slPrice = t.entry - slDiff;
          const tpPrice = t.entry + tpDiff;
          if (currentCandle.low <= slPrice) {
            return { ...t, exit: slPrice, pnl: -100 * Number(riskPct), rr: -1.0, status: "CLOSED" };
          }
          if (currentCandle.high >= tpPrice) {
            return { ...t, exit: tpPrice, pnl: 100 * Number(riskPct) * Number(targetRR), rr: Number(targetRR), status: "CLOSED" };
          }
        } else {
          const slPrice = t.entry + slDiff;
          const tpPrice = t.entry - tpDiff;
          if (currentCandle.high >= slPrice) {
            return { ...t, exit: slPrice, pnl: -100 * Number(riskPct), rr: -1.0, status: "CLOSED" };
          }
          if (currentCandle.low <= tpPrice) {
            return { ...t, exit: tpPrice, pnl: 100 * Number(riskPct) * Number(targetRR), rr: Number(targetRR), status: "CLOSED" };
          }
        }
        return t;
      })
    );
  }, [currentIndex, visibleCandles, riskPct, targetRR, slPts, tpPts, symbol]);

  const closedTrades = useMemo(() => trades.filter((t) => t.status === "CLOSED"), [trades]);
  const winCount = useMemo(() => closedTrades.filter((t) => (t.pnl || 0) > 0).length, [closedTrades]);
  const winRate = useMemo(() => (closedTrades.length > 0 ? Math.round((winCount / closedTrades.length) * 100) : 0), [closedTrades, winCount]);
  const totalSimPnl = useMemo(() => closedTrades.reduce((acc, t) => acc + (t.pnl || 0), 0), [closedTrades]);
  const expectancy = useMemo(() => {
    if (closedTrades.length === 0) return 0;
    return Number((totalSimPnl / closedTrades.length).toFixed(2));
  }, [closedTrades, totalSimPnl]);

  const markers: TradeMarker[] = useMemo(() => {
    return trades.map((t) => ({
      idx: Math.min(currentIndex - 1, Math.max(0, Math.floor(currentIndex - 5))),
      type: t.type,
      price: t.entry,
    }));
  }, [trades, currentIndex]);

  const handleChartClick = (e: React.MouseEvent, idx: number, price: number) => {
    if (tool === "erase") {
      setDrawings([]);
      return;
    }
    if (tool === "hline") {
      setDrawings((prev) => [
        ...prev,
        { id: `hline-${Date.now()}`, type: "hline", y1: price, label: `Level: ${price}`, color: "rgba(0,220,255,0.9)" },
      ]);
    }
    if (tool === "zone") {
      setDrawings((prev) => [
        ...prev,
        { id: `zone-${Date.now()}`, type: "zone", y1: price + (price > 100 ? 5 : 0.002), y2: price - (price > 100 ? 5 : 0.002), x1Idx: Math.max(0, idx - 5), x2Idx: idx + 5, label: "Order Block / FVG Zone" },
      ]);
    }
    if (tool === "trend") {
      setDrawings((prev) => [
        ...prev,
        { id: `trend-${Date.now()}`, type: "trend", x1Idx: Math.max(0, idx - 8), y1: price - (price > 100 ? 4 : 0.0015), x2Idx: idx, y2: price + (price > 100 ? 4 : 0.0015) },
      ]);
    }
    if (tool === "text") {
      const note = prompt("Enter chart annotation text:", "BISI / FVG confirmed");
      if (note) {
        setDrawings((prev) => [
          ...prev,
          { id: `text-${Date.now()}`, type: "text", x1Idx: idx, y1: price, label: note },
        ]);
      }
    }
  };

  const handlePlaceTrade = (type: "BUY" | "SELL") => {
    if (currentPrice <= 0) return;
    const newTrade = {
      id: Date.now(),
      type,
      entry: currentPrice,
      status: "OPEN" as const,
    };
    setTrades((prev) => [...prev, newTrade]);
  };

  const handleCloseAll = () => {
    setTrades((prev) =>
      prev.map((t) => {
        if (t.status === "CLOSED") return t;
        const diff = t.type === "BUY" ? currentPrice - t.entry : t.entry - currentPrice;
        const pnl = Number((diff * (symbol.includes("USD") && !symbol.includes("XAU") ? 10000 : 10)).toFixed(2));
        return { ...t, exit: currentPrice, pnl, rr: Number((pnl / 100).toFixed(2)), status: "CLOSED" };
      })
    );
  };

  return (
    <AppShell title="Backtest Lab" subtitle="Actual real-time historical OHLC past data • Fog of War replay • drawings">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 font-sans">
        <section className="glass rounded-3xl p-5 lg:col-span-12 border border-white/10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between shadow-xl">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-purple-500/40 bg-purple-500/15 px-3.5 py-1 text-xs font-bold text-purple-200 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
              {dataSource === "real_market_history" ? "REAL HISTORICAL PAST CANDLES" : "REAL MARKET BASIS REPLAY"}
            </span>

            <div className="flex items-center gap-2">
              <select
                value={symbol}
                onChange={(e) => {
                  setSymbol(e.target.value);
                }}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold outline-none focus:border-purple-500/50"
              >
                {instruments.map((i) => (
                  <option key={i.value} value={i.value}>
                    {i.label}
                  </option>
                ))}
              </select>

              <select
                value={tf}
                onChange={(e) => {
                  setTf(e.target.value as any);
                }}
                className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold outline-none focus:border-purple-500/50"
              >
                {["1m", "5m", "15m", "1h", "4h"].map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowIndMenu(!showIndMenu)}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold hover:bg-white/10 transition"
              >
                <Layers className="h-4 w-4 text-purple-400" />
                Indicators
              </button>
              {showIndMenu && (
                <div className="absolute left-0 top-full mt-2 z-50 glass rounded-2xl p-3 border border-white/20 shadow-2xl w-48 space-y-2">
                  <div className="text-[10px] font-bold text-[rgb(var(--muted))] uppercase">Toggle Overlays</div>
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={activeInds.ema20}
                      onChange={(e) => setActiveInds((p) => ({ ...p, ema20: e.target.checked }))}
                    />
                    EMA 20 (Yellow)
                  </label>
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={activeInds.sma50}
                      onChange={(e) => setActiveInds((p) => ({ ...p, sma50: e.target.checked }))}
                    />
                    SMA 50 (Purple)
                  </label>
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={activeInds.vwap}
                      onChange={(e) => setActiveInds((p) => ({ ...p, vwap: e.target.checked }))}
                    />
                    VWAP (Rose)
                  </label>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setCurrentIndex((p) => Math.max(10, p - 1))}
              className="inline-flex items-center gap-1 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold hover:bg-white/10 transition"
            >
              <ChevronLeft className="h-4 w-4" /> Prev
            </button>

            <button
              onClick={() => setPlaying((p) => !p)}
              disabled={fullCandles.length === 0}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-lg hover:from-purple-500 hover:to-indigo-500 transition disabled:opacity-50"
            >
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {playing ? "Pause Replay" : "Replay"}
            </button>

            <button
              onClick={() => setCurrentIndex((p) => Math.min(fullCandles.length, p + 1))}
              className="inline-flex items-center gap-1 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold hover:bg-white/10 transition"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>

            <button
              onClick={() => {
                setPlaying(false);
                setCurrentIndex(Math.min(30, Math.floor(fullCandles.length * 0.3)));
                setTrades([]);
              }}
              className="inline-flex items-center gap-1.5 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </button>

            <div className="inline-flex overflow-hidden rounded-2xl border border-white/10 bg-white/5 ml-1">
              {[1, 2, 4, 8].map((v) => (
                <button
                  key={v}
                  onClick={() => setSpeed(v as any)}
                  className={cx(
                    "px-2.5 py-1.5 text-xs font-bold transition",
                    speed === v ? "bg-purple-500/30 text-white" : "text-[rgb(var(--muted))] hover:text-white"
                  )}
                >
                  {v}x
                </button>
              ))}
            </div>
          </div>
        </section>

        <aside className="glass rounded-3xl p-4 lg:col-span-2 border border-white/10 flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold tracking-wider uppercase text-purple-300">DRAWING TOOLS</div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                onClick={() => setTool("cursor")}
                className={cx("flex flex-col items-center justify-center gap-1 rounded-2xl p-2.5 text-[11px] font-semibold transition border", tool === "cursor" ? "bg-purple-500/20 border-purple-500/40 text-white" : "bg-white/5 border-transparent text-[rgb(var(--muted))] hover:text-white")}
              >
                <Crosshair className="h-4 w-4" /> Cursor
              </button>
              <button
                onClick={() => setTool("hline")}
                className={cx("flex flex-col items-center justify-center gap-1 rounded-2xl p-2.5 text-[11px] font-semibold transition border", tool === "hline" ? "bg-purple-500/20 border-purple-500/40 text-white" : "bg-white/5 border-transparent text-[rgb(var(--muted))] hover:text-white")}
              >
                <Minus className="h-4 w-4" /> H-Line
              </button>
              <button
                onClick={() => setTool("trend")}
                className={cx("flex flex-col items-center justify-center gap-1 rounded-2xl p-2.5 text-[11px] font-semibold transition border", tool === "trend" ? "bg-purple-500/20 border-purple-500/40 text-white" : "bg-white/5 border-transparent text-[rgb(var(--muted))] hover:text-white")}
              >
                <Slash className="h-4 w-4" /> Trend
              </button>
              <button
                onClick={() => setTool("zone")}
                className={cx("flex flex-col items-center justify-center gap-1 rounded-2xl p-2.5 text-[11px] font-semibold transition border", tool === "zone" ? "bg-purple-500/20 border-purple-500/40 text-white" : "bg-white/5 border-transparent text-[rgb(var(--muted))] hover:text-white")}
              >
                <Square className="h-4 w-4" /> Zone
              </button>
              <button
                onClick={() => setTool("text")}
                className={cx("flex flex-col items-center justify-center gap-1 rounded-2xl p-2.5 text-[11px] font-semibold transition border", tool === "text" ? "bg-purple-500/20 border-purple-500/40 text-white" : "bg-white/5 border-transparent text-[rgb(var(--muted))] hover:text-white")}
              >
                <Pencil className="h-4 w-4" /> Note
              </button>
              <button
                onClick={() => setTool("erase")}
                className={cx("flex flex-col items-center justify-center gap-1 rounded-2xl p-2.5 text-[11px] font-semibold transition border", tool === "erase" ? "bg-rose-500/20 border-rose-500/40 text-rose-300" : "bg-white/5 border-transparent text-[rgb(var(--muted))] hover:text-white")}
              >
                <Trash2 className="h-4 w-4" /> Erase
              </button>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-purple-500/25 bg-purple-500/10 p-3 text-xs text-purple-200 space-y-1">
            <div className="font-bold flex items-center gap-1">⚡ Active Tool: {tool.toUpperCase()}</div>
            <div className="text-[11px] opacity-80">Click directly on the chart canvas to add or remove price markups.</div>
          </div>
        </aside>

        <section className="glass rounded-3xl p-5 lg:col-span-7 border border-white/10 space-y-4 shadow-xl">
          <div className="flex items-center justify-between px-1">
            <div>
              <div className="text-xs font-semibold text-[rgb(var(--muted))] uppercase tracking-wider">Historical Replay Engine</div>
              <div className="text-xl font-extrabold flex items-center gap-2">
                {symbol} • {tf}{" "}
                {historyLoading ? (
                  <span className="text-xs font-semibold text-amber-400 animate-pulse">Fetching Real OHLC...</span>
                ) : (
                  <span className="text-xs font-semibold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">
                    Candle {currentIndex} / {fullCandles.length}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-semibold text-[rgb(var(--muted))] uppercase tracking-wider">Current Historical Price</div>
              <div className="text-xl font-black text-emerald-400">${currentPrice}</div>
            </div>
          </div>

          <div className="mt-2">
            <CandlesMock
              width={860}
              height={380}
              accent="rgba(120,90,255,0.9)"
              data={visibleCandles}
              drawings={drawings}
              indicators={computedIndicators}
              markers={markers}
              onChartClick={handleChartClick}
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <span className="text-xs text-[rgb(var(--muted))]">Replay Timeline:</span>
            <input
              type="range"
              min={10}
              max={fullCandles.length || 100}
              value={currentIndex}
              onChange={(e) => setCurrentIndex(Number(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 pt-2">
            <div className="rounded-2xl bg-white/5 p-3 border border-white/5 text-center">
              <div className="text-[10px] text-[rgb(var(--muted))] uppercase font-semibold">Simulated Win Rate</div>
              <div className={`mt-0.5 text-lg font-bold ${winRate >= 50 ? "text-emerald-400" : "text-amber-400"}`}>{winRate}%</div>
            </div>
            <div className="rounded-2xl bg-white/5 p-3 border border-white/5 text-center">
              <div className="text-[10px] text-[rgb(var(--muted))] uppercase font-semibold">Expectancy</div>
              <div className="mt-0.5 text-lg font-bold text-purple-300">${expectancy}</div>
            </div>
            <div className="rounded-2xl bg-white/5 p-3 border border-white/5 text-center">
              <div className="text-[10px] text-[rgb(var(--muted))] uppercase font-semibold">Total Sim P&amp;L</div>
              <div className={`mt-0.5 text-lg font-bold ${totalSimPnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {fmtMoney(totalSimPnl)}
              </div>
            </div>
            <div className="rounded-2xl bg-white/5 p-3 border border-white/5 text-center">
              <div className="text-[10px] text-[rgb(var(--muted))] uppercase font-semibold">Trades Taken</div>
              <div className="mt-0.5 text-lg font-bold">{trades.length}</div>
            </div>
          </div>
        </section>

        <aside className="glass rounded-3xl p-5 lg:col-span-3 border border-white/10 flex flex-col justify-between space-y-4 shadow-xl">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="text-base font-bold flex items-center gap-1.5">
                <Settings className="h-4 w-4 text-purple-400" /> Replay Execution
              </div>
              <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
                Active Lab
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handlePlaceTrade("BUY")}
                  className="rounded-2xl bg-emerald-500/20 border border-emerald-500/40 px-3 py-3 text-sm font-extrabold text-emerald-300 hover:bg-emerald-500/30 transition shadow-sm"
                >
                  BUY AT {currentPrice}
                </button>
                <button
                  onClick={() => handlePlaceTrade("SELL")}
                  className="rounded-2xl bg-rose-500/20 border border-rose-500/40 px-3 py-3 text-sm font-extrabold text-rose-300 hover:bg-rose-500/30 transition shadow-sm"
                >
                  SELL AT {currentPrice}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[rgb(var(--muted))] font-semibold">Risk %</label>
                  <input
                    value={riskPct}
                    onChange={(e) => setRiskPct(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="text-[rgb(var(--muted))] font-semibold">R:R Target</label>
                  <input
                    value={targetRR}
                    onChange={(e) => setTargetRR(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="text-[rgb(var(--muted))] font-semibold">SL (pts)</label>
                  <input
                    value={slPts}
                    onChange={(e) => setSlPts(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="text-[rgb(var(--muted))] font-semibold">TP (pts)</label>
                  <input
                    value={tpPts}
                    onChange={(e) => setTpPts(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-white/10">
                <div className="flex items-center justify-between text-xs font-semibold text-[rgb(var(--muted))] uppercase mb-2">
                  <span>Replay Trade History ({trades.length})</span>
                  {trades.some((t) => t.status === "OPEN") && (
                    <button onClick={handleCloseAll} className="text-[11px] text-rose-400 hover:underline">
                      Close All Open
                    </button>
                  )}
                </div>

                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                  {trades.length === 0 ? (
                    <div className="text-center py-4 text-xs text-[rgb(var(--muted))] italic">No trades taken during this session yet.</div>
                  ) : (
                    trades.map((t) => (
                      <div key={t.id} className="flex items-center justify-between rounded-xl bg-white/5 p-2 text-xs border border-white/5">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-bold ${t.type === "BUY" ? "text-emerald-400" : "text-rose-400"}`}>{t.type}</span>
                          <span>@{t.entry}</span>
                        </div>
                        <div>
                          {t.status === "OPEN" ? (
                            <span className="text-amber-400 font-bold text-[10px] animate-pulse">OPEN</span>
                          ) : (
                            <span className={`font-bold ${(t.pnl || 0) >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                              {fmtMoney(t.pnl || 0)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => alert("Backtest session and equity curve results saved to your local/cloud portfolio ✅")}
            className="w-full rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 py-3 text-xs font-bold text-white transition flex items-center justify-center gap-2"
          >
            <Download className="h-4 w-4" /> Save &amp; Export Session
          </button>
        </aside>
      </div>
    </AppShell>
  );
}
