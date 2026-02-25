"use client";

import React, { useMemo, useState } from "react";
import AppShell from "../components/AppShell";
import CandlesMock from "../components/CandlesMock";
import { Play, Pause, FastForward, Rewind, ChevronLeft, ChevronRight, Crosshair, Minus, Slash, Square, Pencil, Trash2, Settings, Wand2, Layers } from "lucide-react";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

const instruments = [
  { value: "EURUSD", label: "EURUSD" },
  { value: "GBPUSD", label: "GBPUSD" },
  { value: "USDJPY", label: "USDJPY" },
  { value: "XAUUSD", label: "XAUUSD (Gold)" },
  { value: "NAS100", label: "NAS100" },
  { value: "US30", label: "US30" },
];

export default function BacktestPage() {
  const [symbol, setSymbol] = useState("XAUUSD");
  const [tf, setTf] = useState<"1m" | "5m" | "15m" | "1h" | "4h">("5m");
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<1 | 2 | 4 | 8>(2);
  const [tool, setTool] = useState<"cursor" | "trend" | "hline" | "zone" | "fib" | "text" | "erase">("cursor");

  const speedLabel = useMemo(() => `${speed}x`, [speed]);

  return (
    <AppShell title="Backtest Lab" subtitle="Purple accent • replay-ready • 1m supported (default 5m)">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Top controls */}
        <section className="glass rounded-2xl p-5 lg:col-span-12">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(120,90,255,0.35)] bg-[rgba(120,90,255,0.10)] px-3 py-1 text-xs text-[rgba(210,190,255,0.95)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[rgba(120,90,255,0.95)]" />
                Replay Mode
              </span>

              <div className="ml-0 flex items-center gap-2 md:ml-3">
                <select
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  className="rounded-xl border border-[rgba(var(--border),0.45)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-sm outline-none"
                >
                  {instruments.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
                </select>

                <select
                  value={tf}
                  onChange={(e) => setTf(e.target.value as any)}
                  className="rounded-xl border border-[rgba(var(--border),0.45)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-sm outline-none"
                >
                  {["1m","5m","15m","1h","4h"].map(v => <option key={v} value={v}>{v}</option>)}
                </select>

                <button className="inline-flex items-center gap-2 rounded-xl border border-[rgba(var(--border),0.45)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-sm hover:bg-[rgba(255,255,255,0.06)]">
                  <Layers className="h-4 w-4 text-[rgba(210,190,255,0.9)]" />
                  Indicators
                </button>

                <button className="inline-flex items-center gap-2 rounded-xl border border-[rgba(var(--border),0.45)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-sm hover:bg-[rgba(255,255,255,0.06)]">
                  <Settings className="h-4 w-4 text-[rgba(210,190,255,0.9)]" />
                  Execution
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setPlaying(p => !p)}
                className="inline-flex items-center gap-2 rounded-xl bg-[rgba(120,90,255,0.18)] px-4 py-2 text-sm font-medium hover:bg-[rgba(120,90,255,0.24)]"
              >
                {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {playing ? "Pause" : "Play"}
              </button>

              <button className="inline-flex items-center gap-2 rounded-xl border border-[rgba(var(--border),0.45)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-sm hover:bg-[rgba(255,255,255,0.06)]">
                <Rewind className="h-4 w-4" /> Prev
              </button>
              <button className="inline-flex items-center gap-2 rounded-xl border border-[rgba(var(--border),0.45)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-sm hover:bg-[rgba(255,255,255,0.06)]">
                <FastForward className="h-4 w-4" /> Next
              </button>

              <div className="ml-0 inline-flex overflow-hidden rounded-xl border border-[rgba(var(--border),0.45)] md:ml-2">
                {[1,2,4,8].map(v => (
                  <button
                    key={v}
                    onClick={() => setSpeed(v as any)}
                    className={cx(
                      "px-3 py-2 text-sm",
                      speed === v ? "bg-[rgba(120,90,255,0.18)] text-white" : "bg-[rgba(255,255,255,0.03)] text-[rgb(var(--muted))] hover:bg-[rgba(255,255,255,0.06)]"
                    )}
                  >
                    {v}x
                  </button>
                ))}
              </div>
              <span className="text-xs text-[rgb(var(--muted))]">Speed: {speedLabel}</span>
            </div>
          </div>
        </section>

        {/* Tools palette */}
        <aside className="glass rounded-2xl p-4 lg:col-span-2">
          <div className="text-xs font-semibold tracking-wide text-[rgba(210,190,255,0.95)]">TOOLS</div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Tool icon={Crosshair} label="Cursor" active={tool==="cursor"} onClick={() => setTool("cursor")} />
            <Tool icon={Slash} label="Trend" active={tool==="trend"} onClick={() => setTool("trend")} />
            <Tool icon={Minus} label="H-Line" active={tool==="hline"} onClick={() => setTool("hline")} />
            <Tool icon={Square} label="Zone" active={tool==="zone"} onClick={() => setTool("zone")} />
            <Tool icon={Wand2} label="Fib" active={tool==="fib"} onClick={() => setTool("fib")} />
            <Tool icon={Pencil} label="Text" active={tool==="text"} onClick={() => setTool("text")} />
            <Tool icon={Trash2} label="Erase" active={tool==="erase"} onClick={() => setTool("erase")} />
          </div>

          <div className="mt-4 rounded-2xl border border-[rgba(120,90,255,0.25)] bg-[rgba(120,90,255,0.08)] p-3 text-xs text-[rgba(210,190,255,0.92)]">
            Tip: drawings + replay + rules HUD = your edge over basic journals.
          </div>
        </aside>

        {/* Chart */}
        <section className="glass rounded-2xl p-4 lg:col-span-7">
          <div className="flex items-center justify-between px-1">
            <div>
              <div className="text-xs text-[rgb(var(--muted))]">Instrument</div>
              <div className="text-lg font-semibold">{symbol} • {tf}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-[rgb(var(--muted))]">Mode</div>
              <div className="text-sm font-medium text-[rgba(210,190,255,0.95)]">Replay / Fog of War</div>
            </div>
          </div>

          <div className="mt-3">
            <CandlesMock width={860} height={420} accent="rgba(120,90,255,0.9)" />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat label="Win Rate (mock)" value="—" />
            <Stat label="Expectancy (mock)" value="—" />
            <Stat label="Max DD (mock)" value="—" />
            <Stat label="Equity Curve (Pro)" value="Locked" accent />
          </div>
        </section>

        {/* Replay + Trade panel */}
        <aside className="glass rounded-2xl p-4 lg:col-span-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Replay Controls</div>
            <div className="inline-flex items-center gap-1 rounded-full border border-[rgba(120,90,255,0.35)] bg-[rgba(120,90,255,0.10)] px-2 py-1 text-xs text-[rgba(210,190,255,0.95)]">
              {playing ? "Playing" : "Paused"}
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            <MiniBtn icon={ChevronLeft} label="Prev" />
            <MiniBtn icon={playing ? Pause : Play} label={playing ? "Pause" : "Play"} onClick={() => setPlaying(p=>!p)} primary />
            <MiniBtn icon={ChevronRight} label="Next" />
          </div>

          <div className="mt-4 rounded-2xl border border-[rgba(var(--border),0.35)] bg-[rgba(255,255,255,0.02)] p-4">
            <div className="text-xs text-[rgb(var(--muted))]">Place Trade (UI)</div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button className="rounded-xl bg-[rgba(68,230,170,0.18)] px-3 py-2 text-sm font-medium hover:bg-[rgba(68,230,170,0.24)]">Buy</button>
              <button className="rounded-xl bg-[rgba(255,90,110,0.18)] px-3 py-2 text-sm font-medium hover:bg-[rgba(255,90,110,0.24)]">Sell</button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <LabeledInput label="Risk %" placeholder="1.0" />
              <LabeledInput label="R:R" placeholder="2.0" />
              <LabeledInput label="SL (pts)" placeholder="—" />
              <LabeledInput label="TP (pts)" placeholder="—" />
            </div>

            <button className="mt-3 w-full rounded-xl bg-[rgba(120,90,255,0.18)] px-3 py-2 text-sm font-medium hover:bg-[rgba(120,90,255,0.24)]">
              Save & Export
            </button>

            <div className="mt-3 text-xs text-[rgb(var(--muted))]">
              Next: realism presets (spread/commission) + session filters + stats.
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

function Tool({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: any;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cx(
        "flex flex-col items-center justify-center gap-1 rounded-xl border px-3 py-3 text-xs transition",
        active
          ? "border-[rgba(120,90,255,0.45)] bg-[rgba(120,90,255,0.16)] text-[rgba(210,190,255,0.95)]"
          : "border-[rgba(var(--border),0.35)] bg-[rgba(255,255,255,0.02)] text-[rgb(var(--muted))] hover:bg-[rgba(255,255,255,0.06)]"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={cx("glass-soft rounded-2xl p-4", accent && "border border-[rgba(120,90,255,0.25)]")}>
      <div className="text-xs text-[rgb(var(--muted))]">{label}</div>
      <div className={cx("mt-1 text-sm font-semibold", accent ? "text-[rgba(210,190,255,0.95)]" : "")}>{value}</div>
    </div>
  );
}

function MiniBtn({
  icon: Icon,
  label,
  onClick,
  primary,
}: {
  icon: any;
  label: string;
  onClick?: () => void;
  primary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cx(
        "flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm",
        primary
          ? "bg-[rgba(120,90,255,0.18)] hover:bg-[rgba(120,90,255,0.24)]"
          : "border border-[rgba(var(--border),0.45)] bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)]"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function LabeledInput({ label, placeholder }: { label: string; placeholder?: string }) {
  return (
    <div>
      <div className="text-xs text-[rgb(var(--muted))]">{label}</div>
      <input
        placeholder={placeholder}
        className="mt-1 w-full rounded-xl border border-[rgba(var(--border),0.45)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-sm outline-none focus:border-[rgba(120,90,255,0.45)]"
      />
    </div>
  );
}
