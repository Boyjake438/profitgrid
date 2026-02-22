"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "../components/AppShell";
import { createClient } from "@/lib/supabase/client";
import { fmtMoney } from "@/lib/utils";
import { uploadTradeScreenshot } from "@/lib/supabase/storage";

type SessionUser = { id: string; email?: string };

type StrategyRow = { id: number; name: string };

type TradeRow = {
  id: number;
  account_id?: number | null;
  opened_at: string;
  asset_class: string;
  symbol: string;
  side: "BUY" | "SELL";
  strategy_id?: number | null;
  tags?: string[];
  pnl: number;
  rr: number | null;
  notes: string | null;
  created_at: string;
};

const ASSET_CLASSES = ["Forex", "Crypto", "Indices", "Stocks", "Metals", "Futures"] as const;

export default function TradesPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<TradeRow[]>([]);
  const [filter, setFilter] = useState<string>("All");

  const [plan, setPlan] = useState<string>("free");
  const [strategies, setStrategies] = useState<StrategyRow[]>([]);
  const [activeAccountId, setActiveAccountId] = useState<number | null>(null);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    opened_at: new Date().toISOString().slice(0, 16),
    asset_class: "Forex",
    symbol: "",
    side: "BUY" as "BUY" | "SELL",
    pnl: "",
    rr: "",
    strategy_id: "",
    tags: "",
    notes: "",
  });
  const [files, setFiles] = useState<File[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        router.push("/login");
        return;
      }
      setUser({ id: data.user.id, email: data.user.email ?? undefined });

      // active account
      const cachedAcc = typeof window !== "undefined" ? localStorage.getItem("pg_active_account") : null;
      const accId = cachedAcc ? Number(cachedAcc) : NaN;
      setActiveAccountId(Number.isFinite(accId) ? accId : null);

      // plan (best-effort)
      const { data: prof } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", data.user.id)
        .maybeSingle();
      if (prof?.plan) setPlan(String(prof.plan));

      // strategies (best-effort)
      const { data: strat } = await supabase
        .from("strategies")
        .select("id,name")
        .order("name", { ascending: true });
      if (Array.isArray(strat)) setStrategies(strat as any);

      setLoading(false);
    })();
  }, [router, supabase]);

  const loadTrades = async () => {
    if (!user) return;
    let q = supabase
      .from("trades")
      .select("id,account_id,opened_at,asset_class,symbol,side,strategy_id,tags,pnl,rr,notes,created_at")
      .eq("user_id", user.id)
      .order("opened_at", { ascending: false })
      .limit(300);

    if (activeAccountId) {
      // @ts-ignore
      q = q.eq("account_id", activeAccountId);
    }

    const { data, error } = await q;
    if (error) {
      setMsg(
        "Trades table not found yet. Run the SQL in supabase.sql to create it (trades + RLS)."
      );
      setRows([]);
      return;
    }
    setRows(
      (data as any[]).map((r) => ({
        ...r,
        pnl: Number(r.pnl),
        rr: r.rr === null ? null : Number(r.rr),
        tags: Array.isArray(r.tags) ? r.tags : [],
      }))
    );
  };

  useEffect(() => {
    if (!user) return;
    loadTrades();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, activeAccountId]);

  const filtered = filter === "All" ? rows : rows.filter((r) => r.asset_class === filter);
  const total = filtered.reduce((a, r) => a + r.pnl, 0);
  const wins = filtered.filter((r) => r.pnl > 0).length;
  const losses = filtered.filter((r) => r.pnl < 0).length;
  const winRate = filtered.length ? Math.round((wins / filtered.length) * 100) : 0;

  const addTrade = async () => {
    if (!user) return;
    setMsg(null);

    const premium = plan === "premium" || plan === "pro";

    const pnl = Number(form.pnl);
    const rr = form.rr.trim() === "" ? null : Number(form.rr);
    if (!Number.isFinite(pnl)) {
      setMsg("Enter a valid P&L number.");
      return;
    }
    if (rr !== null && !Number.isFinite(rr)) {
      setMsg("R:R must be a number (or blank).");
      return;
    }

    const strategyId = form.strategy_id.trim() === "" ? null : Number(form.strategy_id);
    const tags = premium
      ? form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
          .slice(0, 20)
      : [];

    if (!premium && (form.tags.trim() || form.strategy_id.trim() || files.length)) {
      setMsg("Strategy, tags, and screenshots are Premium features. Upgrade on Pricing.");
      return;
    }

    const { data, error } = await supabase
      .from("trades")
      .insert({
      user_id: user.id,
      account_id: activeAccountId,
      opened_at: new Date(form.opened_at).toISOString(),
      asset_class: form.asset_class,
      symbol: form.symbol.trim() || "—",
      side: form.side,
      pnl,
      rr,
      strategy_id: strategyId,
      tags,
      notes: form.notes.trim() || null,
    })
      .select("id")
      .maybeSingle();

    if (error) {
      setMsg(error.message);
      return;
    }

    const tradeId = data?.id as number | undefined;

    // Upload screenshots (Premium)
    if (tradeId && files.length) {
      try {
        for (const f of files.slice(0, 5)) {
          const { path } = await uploadTradeScreenshot({ userId: user.id, tradeId, file: f });
          await supabase.from("trade_attachments").insert({ user_id: user.id, trade_id: tradeId, path });
        }
      } catch (e: any) {
        setMsg(`Trade saved, but screenshot upload failed: ${e?.message ?? e}`);
      }
    }

    setOpen(false);
    setFiles([]);
    setForm((p) => ({ ...p, symbol: "", pnl: "", rr: "", strategy_id: "", tags: "", notes: "" }));
    await loadTrades();
  };

  return (
    <AppShell
      title="ProfitGrid"
      subtitle={user?.email ? `Trades · ${user.email}` : "Trades"}
      active="trades"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-sm text-[rgb(var(--muted))]">Trade journal</div>
          <div className="mt-1 text-3xl font-semibold">
            <span className={total >= 0 ? "text-[rgba(16,185,129,0.95)]" : "text-[rgba(248,113,113,0.95)]"}>
              {fmtMoney(total)}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-[rgb(var(--muted))]">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Trades: {filtered.length}</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Win rate: {winRate}%</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">W/L: {wins}/{losses}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-2xl border border-white/10 bg-transparent px-3 py-2 text-sm outline-none"
          >
            <option value="All">All markets</option>
            {ASSET_CLASSES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-2xl bg-[rgba(16,185,129,0.22)] px-4 py-2 text-sm font-semibold hover:opacity-90"
          >
            + Add trade
          </button>
        </div>
      </div>

      {msg ? <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-[rgb(var(--muted))]">{msg}</div> : null}

      <div className="mt-6 overflow-hidden rounded-3xl border border-white/10">
        <div className="grid grid-cols-7 gap-2 bg-white/5 px-4 py-3 text-xs text-[rgb(var(--muted))]">
          <div className="col-span-2">Trade</div>
          <div>Side</div>
          <div>P&L</div>
          <div>R:R</div>
          <div>Tags</div>
          <div>Date</div>
        </div>

        <div className="divide-y divide-white/10">
          {loading ? (
            <div className="p-4 text-sm text-[rgb(var(--muted))]">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="p-4 text-sm text-[rgb(var(--muted))]">No trades yet. Add your first trade.</div>
          ) : (
            filtered.map((r) => (
              <div key={r.id} className="grid grid-cols-7 gap-2 px-4 py-3 text-sm">
                <div className="col-span-2">
                  <div className="font-medium">{r.symbol}</div>
                  <div className="text-xs text-[rgb(var(--muted))]">{r.asset_class}</div>
                </div>
                <div className="text-[rgb(var(--muted))]">{r.side}</div>
                <div className={r.pnl >= 0 ? "text-[rgba(16,185,129,0.95)] font-semibold" : "text-[rgba(248,113,113,0.95)] font-semibold"}>
                  {fmtMoney(r.pnl)}
                </div>
                <div className="text-[rgb(var(--muted))]">{r.rr === null ? "—" : r.rr.toFixed(2)}</div>
                <div className="text-[rgb(var(--muted))] truncate">{r.tags?.length ? r.tags.join(", ") : "—"}</div>
                <div className="text-[rgb(var(--muted))]">{new Date(r.opened_at).toLocaleDateString()}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-white/10 bg-[rgba(0,0,0,0.75)] p-5 backdrop-blur">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-lg font-semibold">Add trade</div>
                <div className="text-sm text-[rgb(var(--muted))]">Fast logging. Deep analytics later.</div>
              </div>
              <button
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:opacity-90"
                onClick={() => setOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs text-[rgb(var(--muted))]">Date & time</label>
                <input
                  type="datetime-local"
                  value={form.opened_at}
                  onChange={(e) => setForm((p) => ({ ...p, opened_at: e.target.value }))}
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-[rgb(var(--muted))]">Market</label>
                <select
                  value={form.asset_class}
                  onChange={(e) => setForm((p) => ({ ...p, asset_class: e.target.value }))}
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none"
                >
                  {ASSET_CLASSES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-[rgb(var(--muted))]">Symbol</label>
                <input
                  value={form.symbol}
                  onChange={(e) => setForm((p) => ({ ...p, symbol: e.target.value }))}
                  placeholder="e.g. XAUUSD, BTCUSD, NAS100"
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-[rgb(var(--muted))]">Side</label>
                <select
                  value={form.side}
                  onChange={(e) => setForm((p) => ({ ...p, side: e.target.value as any }))}
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none"
                >
                  <option value="BUY">BUY</option>
                  <option value="SELL">SELL</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-[rgb(var(--muted))]">P&L (required)</label>
                <input
                  value={form.pnl}
                  onChange={(e) => setForm((p) => ({ ...p, pnl: e.target.value }))}
                  placeholder="e.g. 120 or -35"
                  inputMode="decimal"
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-[rgb(var(--muted))]">R:R (optional)</label>
                <input
                  value={form.rr}
                  onChange={(e) => setForm((p) => ({ ...p, rr: e.target.value }))}
                  placeholder="e.g. 2.5"
                  inputMode="decimal"
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-[rgb(var(--muted))]">Strategy (Premium)</label>
                <select
                  value={form.strategy_id}
                  onChange={(e) => setForm((p) => ({ ...p, strategy_id: e.target.value }))}
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none"
                >
                  <option value="">—</option>
                  {strategies.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs text-[rgb(var(--muted))]">Tags (Premium, comma-separated)</label>
                <input
                  value={form.tags}
                  onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
                  placeholder="e.g. ICC, OB, FVG, NY open"
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none"
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="text-xs text-[rgb(var(--muted))]">Screenshots (Premium, max 5)</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setFiles(Array.from(e.target.files ?? []).slice(0, 5))}
                className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none"
              />
              {files.length ? (
                <div className="mt-2 text-xs text-[rgb(var(--muted))]">Selected: {files.map((f) => f.name).join(", ")}</div>
              ) : null}
            </div>

            <div className="mt-3">
              <label className="text-xs text-[rgb(var(--muted))]">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                placeholder="Setup, mistake, emotion, lesson…"
                className="mt-1 w-full resize-none rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none"
                rows={3}
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm hover:opacity-90"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
              <button
                className="rounded-2xl bg-[rgba(16,185,129,0.22)] px-4 py-3 text-sm font-semibold hover:opacity-90"
                onClick={addTrade}
              >
                Save trade
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
