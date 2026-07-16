"use client";

import React, { useMemo } from "react";

export type CandlePoint = {
  open: number;
  close: number;
  high: number;
  low: number;
  time?: string;
};

export type DrawingItem = {
  id: string;
  type: "hline" | "trend" | "zone" | "fib" | "text";
  y1?: number;
  y2?: number;
  x1Idx?: number;
  x2Idx?: number;
  label?: string;
  color?: string;
};

export type IndicatorData = {
  ema?: (number | null)[];
  sma?: (number | null)[];
  vwap?: (number | null)[];
  upperBand?: (number | null)[];
  lowerBand?: (number | null)[];
};

export type TradeMarker = {
  idx: number;
  type: "BUY" | "SELL";
  price: number;
};

export default function CandlesMock({
  width = 860,
  height = 420,
  accent = "rgba(120,90,255,0.9)",
  data,
  drawings = [],
  indicators,
  markers = [],
  onChartClick,
}: {
  width?: number;
  height?: number;
  accent?: string;
  data?: CandlePoint[];
  drawings?: DrawingItem[];
  indicators?: IndicatorData;
  markers?: TradeMarker[];
  onChartClick?: (e: React.MouseEvent<SVGSVGElement>, idx: number, price: number) => void;
}) {
  const candles = useMemo(() => {
    if (data && data.length > 0) return data;
    return Array.from({ length: 64 }).map((_, i) => {
      const base = Math.sin(i / 6) * 18 + i * 0.55 + 2140;
      const open = base + Math.sin(i / 3) * 6;
      const close = base + Math.cos(i / 4) * 6;
      const high = Math.max(open, close) + 8 + Math.sin(i) * 2;
      const low = Math.min(open, close) - 8 - Math.cos(i) * 2;
      return { open, close, high, low };
    });
  }, [data]);

  const min = useMemo(() => Math.min(...candles.map((c) => c.low)), [candles]);
  const max = useMemo(() => Math.max(...candles.map((c) => c.high)), [candles]);
  const range = max - min || 1;

  const scaleY = (v: number) => {
    const t = (v - min) / range;
    return height - t * (height - 36) - 18;
  };

  const inverseY = (y: number) => {
    const t = (height - 18 - y) / (height - 36);
    return min + t * range;
  };

  const candleW = width / candles.length;
  const gridY = 6;
  const gridX = 8;

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!onChartClick) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const idx = Math.max(0, Math.min(candles.length - 1, Math.floor(x / candleW)));
    const price = Number(inverseY(y).toFixed(2));
    onChartClick(e, idx, price);
  };

  const renderIndicatorLine = (points?: (number | null)[], color = "rgba(0,220,255,0.85)", strokeWidth = 2, dash = "") => {
    if (!points || points.length === 0) return null;
    const pts = points
      .map((val, idx) => {
        if (val === null || val === undefined) return null;
        const x = idx * candleW + candleW * 0.5;
        const y = scaleY(val);
        return `${x},${y}`;
      })
      .filter(Boolean)
      .join(" ");
    if (!pts) return null;
    return <polyline points={pts} fill="none" stroke={color} strokeWidth={strokeWidth} strokeDasharray={dash} />;
  };

  return (
    <div className="relative overflow-hidden rounded-2xl glass-soft select-none font-sans">
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        onClick={handleSvgClick}
        className="block cursor-crosshair overflow-visible"
      >
        {Array.from({ length: gridY }).map((_, i) => {
          const y = (i / (gridY - 1)) * (height - 30) + 15;
          const val = inverseY(y);
          return (
            <g key={`gy-${i}`}>
              <line x1="0" x2={width} y1={y} y2={y} stroke="rgba(255,255,255,0.06)" />
              <text x={width - 50} y={y - 4} fill="rgba(255,255,255,0.4)" fontSize="10" textAnchor="start">
                {val >= 1000 ? val.toFixed(1) : val >= 100 ? val.toFixed(2) : val.toFixed(4)}
              </text>
            </g>
          );
        })}
        {Array.from({ length: gridX }).map((_, i) => {
          const x = (i / (gridX - 1)) * width;
          return <line key={`gx-${i}`} y1="0" y2={height} x1={x} x2={x} stroke="rgba(255,255,255,0.04)" />;
        })}

        <defs>
          <radialGradient id="bgGlow" cx="70%" cy="25%" r="75%">
            <stop offset="0%" stopColor={accent} stopOpacity="0.18" />
            <stop offset="70%" stopColor="rgba(0,0,0,0)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width={width} height={height} fill="url(#bgGlow)" />

        {indicators && (
          <>
            {renderIndicatorLine(indicators.ema, "rgba(255,185,0,0.9)", 2)}
            {renderIndicatorLine(indicators.sma, "rgba(120,90,255,0.9)", 2, "4 4")}
            {renderIndicatorLine(indicators.vwap, "rgba(255,90,110,0.85)", 2)}
            {renderIndicatorLine(indicators.upperBand, "rgba(68,230,170,0.4)", 1, "2 2")}
            {renderIndicatorLine(indicators.lowerBand, "rgba(68,230,170,0.4)", 1, "2 2")}
          </>
        )}

        {candles.map((c, i) => {
          const x = i * candleW + candleW * 0.5;
          const yOpen = scaleY(c.open);
          const yClose = scaleY(c.close);
          const yHigh = scaleY(c.high);
          const yLow = scaleY(c.low);

          const up = c.close >= c.open;
          const bodyTop = Math.min(yOpen, yClose);
          const bodyH = Math.max(2, Math.abs(yClose - yOpen));
          const bodyW = Math.max(2, candleW * 0.48);

          const col = up ? "rgba(68,230,170,0.95)" : "rgba(255,90,110,0.95)";
          const wick = up ? "rgba(68,230,170,0.55)" : "rgba(255,90,110,0.55)";

          return (
            <g key={i}>
              <line x1={x} x2={x} y1={yHigh} y2={yLow} stroke={wick} strokeWidth="1.5" />
              <rect x={x - bodyW / 2} y={bodyTop} width={bodyW} height={bodyH} rx="1.5" fill={col} opacity="0.95" />
            </g>
          );
        })}

        {drawings.map((d) => {
          if (d.type === "hline" && d.y1 !== undefined) {
            const y = scaleY(d.y1);
            return (
              <g key={d.id}>
                <line x1="0" x2={width} y1={y} y2={y} stroke={d.color || "rgba(255,185,0,0.9)"} strokeWidth="2" strokeDasharray="6 3" />
                <rect x={10} y={y - 18} width={d.label ? 110 : 70} height={18} rx="4" fill="rgba(0,0,0,0.7)" />
                <text x={16} y={y - 5} fill={d.color || "rgba(255,185,0,0.9)"} fontSize="11" fontWeight="bold">
                  {d.label || `Level: ${d.y1}`}
                </text>
              </g>
            );
          }
          if (d.type === "zone" && d.y1 !== undefined && d.y2 !== undefined) {
            const topY = scaleY(Math.max(d.y1, d.y2));
            const botY = scaleY(Math.min(d.y1, d.y2));
            const zoneH = Math.max(4, Math.abs(botY - topY));
            const startX = ((d.x1Idx ?? 0) + 0.5) * candleW;
            const endX = ((d.x2Idx ?? candles.length - 1) + 0.5) * candleW;
            const zoneW = Math.max(20, Math.abs(endX - startX));
            return (
              <g key={d.id}>
                <rect
                  x={Math.min(startX, endX)}
                  y={topY}
                  width={zoneW}
                  height={zoneH}
                  fill={d.color || "rgba(120,90,255,0.25)"}
                  stroke={d.color || "rgba(120,90,255,0.6)"}
                  strokeWidth="1.5"
                  rx="4"
                />
                {d.label && (
                  <text x={Math.min(startX, endX) + 6} y={topY + 14} fill="#fff" fontSize="11" fontWeight="bold">
                    {d.label}
                  </text>
                )}
              </g>
            );
          }
          if (d.type === "trend" && d.y1 !== undefined && d.y2 !== undefined) {
            const x1 = ((d.x1Idx ?? 0) + 0.5) * candleW;
            const y1 = scaleY(d.y1);
            const x2 = ((d.x2Idx ?? candles.length - 1) + 0.5) * candleW;
            const y2 = scaleY(d.y2);
            return (
              <g key={d.id}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={d.color || "rgba(0,220,255,0.95)"} strokeWidth="2.5" />
                <circle cx={x1} cy={y1} r="4" fill="#fff" />
                <circle cx={x2} cy={y2} r="4" fill="#fff" />
              </g>
            );
          }
          if (d.type === "text" && d.y1 !== undefined) {
            const x = ((d.x1Idx ?? Math.floor(candles.length / 2)) + 0.5) * candleW;
            const y = scaleY(d.y1);
            return (
              <g key={d.id}>
                <rect x={x - 4} y={y - 18} width={140} height={22} rx="6" fill="rgba(18,18,24,0.9)" stroke="rgba(255,255,255,0.2)" />
                <text x={x + 6} y={y - 3} fill="#fff" fontSize="12" fontWeight="bold">
                  📝 {d.label || "Annotation"}
                </text>
              </g>
            );
          }
          return null;
        })}

        {markers.map((m, i) => {
          const x = (m.idx + 0.5) * candleW;
          const y = scaleY(m.price);
          const isBuy = m.type === "BUY";
          return (
            <g key={`marker-${i}`}>
              <circle cx={x} cy={y} r="8" fill={isBuy ? "rgba(68,230,170,0.9)" : "rgba(255,90,110,0.9)"} stroke="#fff" strokeWidth="2" />
              <text x={x} y={y + 3} fill="#000" fontSize="9" fontWeight="900" textAnchor="middle">
                {isBuy ? "B" : "S"}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="absolute bottom-3 left-4 flex items-center gap-3 text-xs text-[rgb(var(--muted))] pointer-events-none">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> Live Price Engine • Interactive Replay &amp; Markups
        </span>
      </div>
    </div>
  );
}
