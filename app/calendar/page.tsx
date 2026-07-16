"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "../components/AppShell";
import { createClient } from "@/lib/supabase/client";
import { buildMonthGrid, fmtMoney, monthLabel, ymd } from "@/lib/utils";

type SessionUser = { id: string; email?: string };

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

function heatStyle(v: number | undefined, maxAbs: number) {
  if (v === undefined) return "bg-white/0";
  if (v === 0) return "bg-white/5";

  // TradingView-like intensity: scale within the visible month.
  // Use a soft curve so mids show up, but spikes still pop.
  const denom = Math.max(1, maxAbs);
  const mag = Math.min(1, Math.abs(v) / denom);
  const curve = Math.pow(mag, 0.6);
  const alpha = 0.10 + 0.38 * curve;
  if (v > 0) return `bg-[rgba(16,185,129,${alpha})]`;
  return `bg-[rgba(248,113,113,${alpha})]`;
}

export default function CalendarPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [monthIndex, setMonthIndex] = useState(now.getMonth());

  const [pnlMap, setPnlMap] = useState<Record<string, number>>({});
  const [monthTotal, setMonthTotal] = useState(0);
  const [goal, setGoal] = useState<number>(() => {
    const cached = typeof window !== "undefined" ? localStorage.getItem("pg_monthly_goal") : null;
    const v = cached ? Number(cached) : 2000;
    return Number.isFinite(v) ? v : 2000;
  });

  const [editOpen, setEditOpen] = useState(false);
  const [editDay, setEditDay] = useState<string>(ymd(now));
  const [editVal, setEditVal] = useState<string>("");
  const [editStatus, setEditStatus] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        router.push("/login");
        return;
      }
      setUser({ id: data.user.id, email: data.user.email ?? undefined });
      setLoading(false);
    })();
  }, [router, supabase]);

  useEffect(() => {
    const run = async () => {
      if (!user) return;

      const cachedAcc = typeof window !== "undefined" ? localStorage.getItem("pg_active_account") : null;
      const accountId = cachedAcc ? Number(cachedAcc) : NaN;

      const start = new Date(year, monthIndex, 1);
      const end = new Date(year, monthIndex + 1, 1);

      let q = supabase
        .from("daily_pnl")
        .select("day,total_pnl")
        .eq("user_id", user.id)
        .gte("day", ymd(start))
        .lt("day", ymd(end));

      // If you've migrated to v2 schema, filter by account.
      if (Number.isFinite(accountId)) {
        // @ts-ignore
        q = q.eq("account_id", accountId);
      }

      const { data, error } = await q;

      if (error) return;

      const map: Record<string, number> = {};
      let total = 0;
      for (const row of data as any[]) {
        const k = row.day as string;
        const v = Number(row.total_pnl);
        map[k] = v;
        total += v;
      }

      setPnlMap(map);
      setMonthTotal(total);
    };

    run();
  }, [monthIndex, year, supabase, user]);

  const progress = goal <= 0 ? 0 : clamp01(monthTotal / goal);
  const cells = buildMonthGrid(year, monthIndex);

  const maxAbs = useMemo(() => {
    let m = 0;
    for (const v of Object.values(pnlMap)) m = Math.max(m, Math.abs(v));
    return m;
  }, [pnlMap]);

  const openEdit = (day: string) => {
    setEditDay(day);
    setEditVal(pnlMap[day] !== undefined ? String(pnlMap[day]) : "");
    setEditStatus(null);
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!user) return;
    setEditStatus(null);
    const value = Number(editVal);
    if (editVal.trim() === "") {
      // delete
      const { error } = await supabase
        .from("daily_pnl")
        .delete()
        .eq("user_id", user.id)
        .eq("day", editDay);
      if (error) return setEditStatus(error.message);
      setEditOpen(false);
      return;
    }
    if (Number.isNaN(value)) {
      setEditStatus("Enter a number like 250 or -15.5");
      return;
    }

    const { error } = await supabase
      .from("daily_pnl")
      .upsert({ user_id: user.id, day: editDay, total_pnl: value }, { onConflict: "user_id,day" });
    if (error) return setEditStatus(error.message);

    setEditStatus("Saved ✅");
    // Update local map
    setPnlMap((prev) => ({ ...prev, [editDay]: value }));
    setMonthTotal((prev) => prev + (value - (pnlMap[editDay] ?? 0)));
    setTimeout(() => setEditOpen(false), 350);
  };

  const prevMonth = () => {
    const d = new Date(year, monthIndex - 1, 1);
    setYear(d.getFullYear());
    setMonthIndex(d.getMonth());
  };
  const nextMonth = () => {
    const d = new Date(year, monthIndex + 1, 1);
    setYear(d.getFullYear());
    setMonthIndex(d.getMonth());
  };

  return (
    <AppShell
      title="ProfitGrid"
      subtitle={user?.email ? `Calendar · ${user.email}` : "Calendar"}
      active="calendar"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm text-[rgb(var(--muted))]">{monthLabel(year, monthIndex)}</div>
          <div className="mt-1 text-3xl font-semibold">
            <span className={monthTotal >= 0 ? "text-[rgba(16,185,129,0.95)]" : "text-[rgba(248,113,113,0.95)]"}>
              {fmtMoney(monthTotal)}
            </span>
          </div>
        </div>

        <div className="min-w-[260px]">
          <div className="flex items-center justify-between text-xs text-[rgb(var(--muted))]">
            <span>Monthly goal</span>
            <span>{fmtMoney(goal)}</span>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-white/10">
            <div
              className="h-2 rounded-full bg-[rgba(16,185,129,0.65)]"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
          <div className="mt-2 flex gap-2">
            <input
              value={goal}
              onChange={(e) => {
                const v = Number(e.target.value || 0);
                setGoal(v);
                localStorage.setItem("pg_monthly_goal", String(v));
              }}
              type="number"
              className="w-full rounded-2xl border border-white/10 bg-transparent px-3 py-2 text-sm outline-none"
              placeholder="Goal"
            />
            <button onClick={prevMonth} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:opacity-90">
              ←
            </button>
            <button onClick={nextMonth} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:opacity-90">
              →
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="grid grid-cols-7 gap-2 text-[11px] text-[rgb(var(--muted))]">
          {[
            "MON",
            "TUE",
            "WED",
            "THU",
            "FRI",
            "SAT",
            "SUN",
          ].map((d) => (
            <div key={d} className="text-center">
              {d}
            </div>
          ))}
        </div>

        <div className="mt-2 grid grid-cols-7 gap-2">
          {cells.map((c) => {
            const key = ymd(c.date);
            const val = pnlMap[key];
            const todayKey = ymd(new Date());
            const isToday = key === todayKey;
            const inMonth = c.inMonth;

            return (
              <button
                key={key}
                type="button"
                onClick={() => (inMonth ? openEdit(key) : null)}
                className={
                  "relative min-h-[78px] rounded-2xl border p-3 text-left transition active:scale-[0.99] " +
                  (inMonth ? "border-white/10 bg-white/5 hover:bg-white/10" : "border-white/5 bg-white/0 opacity-40") +
                  (isToday ? " ring-2 ring-white/20" : "")
                }
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="text-sm text-[rgb(var(--muted))]">{c.date.getDate()}</div>
                  {val !== undefined ? (
                    <div
                      className={
                        "text-sm font-semibold " +
                        (val > 0
                          ? "text-[rgba(16,185,129,0.95)]"
                          : val < 0
                          ? "text-[rgba(248,113,113,0.95)]"
                          : "text-[rgb(var(--muted))]")
                      }
                    >
                      {fmtMoney(val)}
                    </div>
                  ) : null}
                </div>

                <div
                  className={
                    "mt-3 h-9 w-full rounded-xl border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] " +
                    heatStyle(val, maxAbs)
                  }
                />
              </button>
            );
          })}
        </div>

        {loading ? <div className="mt-6 text-sm text-[rgb(var(--muted))]">Loading…</div> : null}
      </div>

      {editOpen ? (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setEditOpen(false)} />
          <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-white/10 bg-[rgba(0,0,0,0.75)] p-5 backdrop-blur">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-lg font-semibold">Edit day</div>
                <div className="text-sm text-[rgb(var(--muted))]">{editDay}</div>
              </div>
              <button
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:opacity-90"
                onClick={() => setEditOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="mt-4">
              <label className="text-xs text-[rgb(var(--muted))]">Daily P&L</label>
              <input
                value={editVal}
                onChange={(e) => setEditVal(e.target.value)}
                inputMode="decimal"
                placeholder="e.g. 250 or -15.5 (blank deletes)"
                className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>

            {editStatus ? <div className="mt-3 text-sm text-[rgb(var(--muted))]">{editStatus}</div> : null}

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setEditVal("");
                  setEditStatus(null);
                }}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm hover:opacity-90"
              >
                Clear
              </button>
              <button
                onClick={saveEdit}
                className="rounded-2xl bg-[rgba(16,185,129,0.22)] px-4 py-3 text-sm font-semibold hover:opacity-90"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
