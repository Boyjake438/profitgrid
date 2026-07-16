"use client";

import { useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { cn } from "@/lib/utils";

export type CardStyle = "minimal" | "flex";

export type TraderCardData = {
  monthLabel: string;
  currency: string;
  monthTotal: number;
  pctReturn: number | null;
  tradingDays: number;
  bestDay: { day: string; pnl: number } | null;
  worstDay: { day: string; pnl: number } | null;
  // yyyy-mm-dd -> pnl
  dayMap: Record<string, number>;
  // calendar grid cells (yyyy-mm-dd or empty)
  grid: { key: string; dayNum: number | null; inMonth: boolean }[];
};

export default function TraderCardModal({
  open,
  onClose,
  data,
}: {
  open: boolean;
  onClose: () => void;
  data: TraderCardData;
}) {
  const [style, setStyle] = useState<CardStyle>("minimal");
  const [busy, setBusy] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const title = useMemo(() => (style === "flex" ? "Trader Card" : "Monthly Card"), [style]);

  if (!open) return null;

  const exportPng = async () => {
    if (!cardRef.current) return;
    setBusy(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });

      // Try native share (iOS PWA / mobile browsers)
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], `profitgrid-${data.monthLabel.replace(/\s+/g, "-")}.png`, {
        type: "image/png",
      });

      // @ts-ignore
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        // @ts-ignore
        await navigator.share({
          title: "ProfitGrid Trader Card",
          text: "Made with ProfitGrid",
          files: [file],
        });
      } else {
        // fallback: download
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = file.name;
        a.click();
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 w-[94vw] max-w-3xl -translate-x-1/2 -translate-y-1/2">
        <div className="glass rounded-3xl p-4 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-lg font-semibold">{title}</div>
              <div className="text-xs text-[rgb(var(--muted))]">Generate a shareable monthly card (Minimal or Flex).</div>
            </div>

            <div className="flex items-center gap-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-1">
                <button
                  className={cn(
                    "rounded-2xl px-3 py-2 text-xs font-semibold",
                    style === "minimal" ? "bg-white/10" : "text-[rgb(var(--muted))]"
                  )}
                  onClick={() => setStyle("minimal")}
                >
                  Minimal
                </button>
                <button
                  className={cn(
                    "rounded-2xl px-3 py-2 text-xs font-semibold",
                    style === "flex" ? "bg-white/10" : "text-[rgb(var(--muted))]"
                  )}
                  onClick={() => setStyle("flex")}
                >
                  Flex
                </button>
              </div>

              <button
                onClick={exportPng}
                disabled={busy}
                className="rounded-2xl bg-[rgba(255,255,255,0.90)] px-4 py-2 text-xs font-semibold text-black hover:opacity-90 disabled:opacity-60"
              >
                {busy ? "Exporting…" : "Share / Download"}
              </button>
              <button
                onClick={onClose}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs hover:bg-white/10"
              >
                Close
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-[1fr,280px]">
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/20 p-4">
              <div className="mx-auto max-w-[520px]">
                <CardPreview refDiv={cardRef} style={style} data={data} />
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm font-semibold">What gets shared</div>
              <ul className="mt-2 space-y-2 text-xs text-[rgb(var(--muted))]">
                <li>• Month total, % return, streak-friendly stats</li>
                <li>• Mini heatmap (green/red days)</li>
                <li>• Watermark: ProfitGrid</li>
              </ul>
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-[rgb(var(--muted))]">
                Tip: Set your <b>Starting Balance</b> in Accounts so % return shows.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function money(n: number, currency: string) {
  const sign = n > 0 ? "+" : n < 0 ? "-" : "";
  return `${sign}${currency} ${Math.abs(n).toFixed(2)}`;
}

function heatClass(v: number | undefined, maxAbs: number) {
  if (v === undefined) return "bg-white/5 border-white/10";
  if (v === 0) return "bg-white/5 border-white/10";
  const intensity = Math.min(1, Math.sqrt(Math.abs(v) / Math.max(1, maxAbs)));
  const a = 0.10 + 0.35 * intensity;
  return v > 0
    ? `bg-[rgba(16,185,129,${a.toFixed(3)})] border-[rgba(16,185,129,0.25)]`
    : `bg-[rgba(244,63,94,${a.toFixed(3)})] border-[rgba(244,63,94,0.25)]`;
}

function CardPreview({
  refDiv,
  style,
  data,
}: {
  refDiv: any;
  style: CardStyle;
  data: TraderCardData;
}) {
  const maxAbs = useMemo(() => {
    let m = 0;
    for (const v of Object.values(data.dayMap)) m = Math.max(m, Math.abs(Number(v)));
    return m;
  }, [data.dayMap]);

  const isFlex = style === "flex";
  const pct = data.pctReturn;

  return (
    <div
      ref={refDiv}
      className={cn(
        "relative overflow-hidden rounded-[28px] p-6",
        isFlex
          ? "bg-[radial-gradient(900px_circle_at_20%_10%,rgba(16,185,129,0.25),transparent_45%),radial-gradient(900px_circle_at_80%_10%,rgba(255,185,0,0.18),transparent_55%),linear-gradient(180deg,#0b0f19,#080a10)]"
          : "bg-[radial-gradient(900px_circle_at_20%_10%,rgba(120,90,255,0.18),transparent_50%),radial-gradient(900px_circle_at_80%_20%,rgba(0,220,255,0.12),transparent_55%),linear-gradient(180deg,#0b0f19,#0a0c12)]"
      )}
    >
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -top-32 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-white/10 blur-[120px]" />
      </div>

      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs text-white/70">{data.monthLabel}</div>
            <div className={cn("mt-1 font-semibold tracking-tight", isFlex ? "text-4xl" : "text-3xl")}>
              {money(data.monthTotal, data.currency)}
            </div>
            <div className="mt-1 text-xs text-white/70">
              {pct === null ? "Set starting balance to show %" : `${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%`}
              {"  "}·{"  "}
              {data.tradingDays} trading days
            </div>
          </div>

          <div className="rounded-2xl bg-white/10 px-3 py-2 text-xs text-white/80 ring-1 ring-white/10">
            ProfitGrid
          </div>
        </div>

        <div className="mt-5 grid grid-cols-7 gap-2">
          {data.grid.map((c, idx) => {
            const v = c.inMonth ? data.dayMap[c.key] : undefined;
            return (
              <div
                key={`${c.key}-${idx}`}
                className={cn(
                  "h-9 rounded-xl border",
                  c.inMonth ? "" : "opacity-35",
                  heatClass(v, maxAbs)
                )}
              />
            );
          })}
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <StatPill
            label="Best day"
            value={data.bestDay ? money(data.bestDay.pnl, data.currency) : "—"}
            accent="emerald"
          />
          <StatPill
            label="Worst day"
            value={data.worstDay ? money(data.worstDay.pnl, data.currency) : "—"}
            accent="rose"
          />
          <StatPill label="Avg/day" value={money(data.tradingDays ? data.monthTotal / data.tradingDays : 0, data.currency)} />
        </div>

        {isFlex ? (
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/80">
            Keep it consistent. Track it. Share it.
          </div>
        ) : null}

        <div className="mt-5 text-[10px] text-white/55">Made with ProfitGrid</div>
      </div>
    </div>
  );
}

function StatPill({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "emerald" | "rose";
}) {
  const cls =
    accent === "emerald"
      ? "bg-[rgba(16,185,129,0.12)] border-[rgba(16,185,129,0.22)]"
      : accent === "rose"
      ? "bg-[rgba(244,63,94,0.10)] border-[rgba(244,63,94,0.20)]"
      : "bg-white/5 border-white/10";
  return (
    <div className={cn("rounded-2xl border px-3 py-2", cls)}>
      <div className="text-[10px] text-white/60">{label}</div>
      <div className="mt-0.5 text-xs font-semibold text-white/90">{value}</div>
    </div>
  );
}
