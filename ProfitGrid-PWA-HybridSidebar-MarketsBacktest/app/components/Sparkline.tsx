"use client";

import React from "react";

export default function Sparkline({
  data,
  width = 120,
  height = 32,
  positive = true,
}: {
  data: number[];
  width?: number;
  height?: number;
  positive?: boolean;
}) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * (width - 2) + 1;
      const y = height - ((v - min) / range) * (height - 2) - 1;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  const stroke = positive ? "rgba(0,220,255,0.95)" : "rgba(248,113,113,0.95)";
  const glow = positive ? "rgba(0,220,255,0.35)" : "rgba(248,113,113,0.25)";

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="block">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2.8" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={glow} />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </linearGradient>
      </defs>
      <polyline points={pts} fill="none" stroke={stroke} strokeWidth="2" filter="url(#glow)" />
      <polygon
        points={`${pts} ${width - 1},${height - 1} 1,${height - 1}`}
        fill="url(#fill)"
        opacity="0.55"
      />
    </svg>
  );
}
