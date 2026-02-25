"use client";

import React from "react";

/**
 * Lightweight candlestick mock for UI polish.
 * Replace with real charting later (TradingView / Lightweight Charts).
 */
export default function CandlesMock({
  width = 640,
  height = 320,
  accent = "rgba(120,90,255,0.9)",
}: {
  width?: number;
  height?: number;
  accent?: string;
}) {
  const candles = Array.from({ length: 64 }).map((_, i) => {
    const base = Math.sin(i / 6) * 18 + i * 0.55;
    const open = base + (Math.sin(i / 3) * 6);
    const close = base + (Math.cos(i / 4) * 6);
    const high = Math.max(open, close) + 8 + Math.sin(i) * 2;
    const low = Math.min(open, close) - 8 - Math.cos(i) * 2;
    return { open, close, high, low };
  });

  const min = Math.min(...candles.map(c => c.low));
  const max = Math.max(...candles.map(c => c.high));
  const scaleY = (v: number) => {
    const t = (v - min) / (max - min || 1);
    return height - (t * (height - 24)) - 12;
  };

  const candleW = width / candles.length;
  const gridY = 6;
  const gridX = 8;

  return (
    <div className="relative overflow-hidden rounded-2xl glass-soft">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="block">
        {/* grid */}
        {Array.from({ length: gridY }).map((_, i) => (
          <line
            key={`gy-${i}`}
            x1="0"
            x2={width}
            y1={(i / (gridY - 1)) * height}
            y2={(i / (gridY - 1)) * height}
            stroke="rgba(255,255,255,0.06)"
          />
        ))}
        {Array.from({ length: gridX }).map((_, i) => (
          <line
            key={`gx-${i}`}
            y1="0"
            y2={height}
            x1={(i / (gridX - 1)) * width}
            x2={(i / (gridX - 1)) * width}
            stroke="rgba(255,255,255,0.04)"
          />
        ))}

        {/* glow gradient behind */}
        <defs>
          <radialGradient id="bgGlow" cx="70%" cy="25%" r="75%">
            <stop offset="0%" stopColor={accent} stopOpacity="0.18" />
            <stop offset="70%" stopColor="rgba(0,0,0,0)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width={width} height={height} fill="url(#bgGlow)" />

        {/* candles */}
        {candles.map((c, i) => {
          const x = i * candleW + candleW * 0.5;
          const yOpen = scaleY(c.open);
          const yClose = scaleY(c.close);
          const yHigh = scaleY(c.high);
          const yLow = scaleY(c.low);

          const up = c.close >= c.open;
          const bodyTop = Math.min(yOpen, yClose);
          const bodyH = Math.max(2, Math.abs(yClose - yOpen));
          const bodyW = Math.max(2, candleW * 0.46);

          const col = up ? "rgba(68,230,170,0.95)" : "rgba(255,90,110,0.95)";
          const wick = up ? "rgba(68,230,170,0.55)" : "rgba(255,90,110,0.55)";

          return (
            <g key={i}>
              <line x1={x} x2={x} y1={yHigh} y2={yLow} stroke={wick} strokeWidth="2" />
              <rect
                x={x - bodyW / 2}
                y={bodyTop}
                width={bodyW}
                height={bodyH}
                rx="2"
                fill={col}
                opacity="0.95"
              />
            </g>
          );
        })}
      </svg>

      {/* footer hint */}
      <div className="absolute bottom-3 left-4 text-xs text-[rgb(var(--muted))]">
        Mock chart • replay-ready UI
      </div>
    </div>
  );
}
