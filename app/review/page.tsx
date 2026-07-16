"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "../components/AppShell";
import { createClient } from "@/lib/supabase/client";
import { cn, fmtMoney } from "@/lib/utils";

type Plan = "free" | "premium" | "pro";
type SessionUser = { id: string; email?: string };

function weekStart(d: Date) {
  // Monday-start ISO week
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
}

function ymd(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function ReviewPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [plan, setPlan] = useState<Plan>("free");
  const [activeAccountId, setActiveAccountId] = useState<number | null>(null);

  const [week, setWeek] = useState(() => weekStart(new Date()));
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [summary, setSummary] = useState({ total: 0, trades: 0, winRate: 0 });

  const [form, setForm] = useState({
    goals: "",
    what_worked: "",
    what_failed: "",
    rules_followed: "",
    improvements: "",
  });

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        router.push("/login");
        return;
      }
      setUser({ id: data.user.id, email: data.user.email ?? undefined });

      const cachedAcc = typeof window !== "undefined" ? localStorage.getItem("pg_active_account") : null;
      const accId = cachedAcc ? Number(cachedAcc) : NaN;
      setActiveAccountId(Number.isFinite(accId) ? accId : null);

      const { data: prof } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", data.user.id)
        .maybeSingle();
      if (prof?.plan) setPlan((prof.plan as Plan) ?? "free");
    })();
  }, [router, supabase]);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);
      setMsg(null);

      const start = new Date(week);
      const end = new Date(week);
      end.setDate(end.getDate() + 7);

      // Weekly totals from trades
      let tq = supabase
        .from("trades")
        .select("pnl")
        .eq("user_id", user.id)
        .gte("opened_at", start.toISOString())
        .lt("opened_at", end.toISOString());
      if (activeAccountId) {
        // @ts-ignore
        tq = tq.eq("account_id", activeAccountId);
      }
      const { data: trades } = await tq;
      const pnls = (trades as any[] | null)?.map((r) => Number(r.pnl) || 0) ?? [];
      const total = pnls.reduce((a, b) => a + b, 0);
      const wins = pnls.filter((p) => p > 0).length;
      const winRate = pnls.length ? (wins / pnls.length) * 100 : 0;
      setSummary({ total, trades: pnls.length, winRate });

      // Load saved review (if exists)
      if (plan === "free") {
        setForm({ goals: "", what_worked: "", what_failed: "", rules_followed: "", improvements: "" });
        setLoading(false);
        return;
      }

      let rq = supabase
        .from("weekly_reviews")
        .select("goals,what_worked,what_failed,rules_followed,improvements")
        .eq("user_id", user.id)
        .eq("week_start", ymd(start))
        .maybeSingle();
      if (activeAccountId) {
        // @ts-ignore
        rq = rq.eq("account_id", activeAccountId);
      }
      const { data: row, error } = await rq;
      if (error) {
        setMsg(error.message);
      }
      if (row) {
        setForm({
          goals: row.goals ?? "",
          what_worked: row.what_worked ?? "",
          what_failed: row.what_failed ?? "",
          rules_followed: row.rules_followed ?? "",
          improvements: row.improvements ?? "",
        });
      } else {
        setForm({ goals: "", what_worked: "", what_failed: "", rules_followed: "", improvements: "" });
      }

      setLoading(false);
    };
    load();
  }, [activeAccountId, plan, supabase, user, week]);

  const save = async () => {
    if (!user) return;
    if (plan === "free") {
      router.push("/pricing");
      return;
    }
    setMsg(null);
    const payload: any = {
      user_id: user.id,
      account_id: activeAccountId,
      week_start: ymd(week),
      ...form,
    };
    const { error } = await supabase.from("weekly_reviews").upsert(payload, {
      onConflict: "user_id,account_id,week_start",
    });
    setMsg(error ? error.message : "Saved ✅");
  };

  const label = `${week.toLocaleDateString()} – ${new Date(week.getTime() + 6 * 86400000).toLocaleDateString()}`;

  return (
    <AppShell title="ProfitGrid" subtitle={user?.email ? `Weekly Review · ${user.email}` : "Weekly Review"} active="review">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-sm text-[rgb(var(--muted))]">Week</div>
          <div className="mt-1 text-2xl font-semibold">{label}</div>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
            onClick={() => setWeek((w) => weekStart(new Date(w.getTime() - 7 * 86400000)))}
          >
            ← Prev
          </button>
          <button
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
            onClick={() => setWeek((w) => weekStart(new Date(w.getTime() + 7 * 86400000)))}
          >
            Next →
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="text-sm text-[rgb(var(--muted))]">Week P&L</div>
          <div className={cn("mt-1 text-3xl font-semibold", summary.total >= 0 ? "text-[rgba(16,185,129,0.95)]" : "text-[rgba(248,113,113,0.95)]")}>
            {fmtMoney(summary.total)}
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="text-sm text-[rgb(var(--muted))]">Trades</div>
          <div className="mt-1 text-3xl font-semibold">{summary.trades}</div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="text-sm text-[rgb(var(--muted))]">Win rate</div>
          <div className="mt-1 text-3xl font-semibold">{summary.winRate.toFixed(0)}%</div>
        </div>
      </div>

      {plan === "free" ? (
        <div className="mt-6 rounded-3xl border border-white/10 bg-black/20 p-5 text-sm text-[rgb(var(--muted))]">
          Weekly Reviews are a <span className="font-semibold text-[rgb(var(--fg))]">Premium</span> feature.
          <div className="mt-2">Upgrade to unlock guided reflection, rule tracking, and PDF reports.</div>
          <button
            onClick={() => router.push("/pricing")}
            className="mt-4 rounded-2xl bg-[rgba(255,185,0,0.18)] px-4 py-3 text-sm font-semibold hover:opacity-90"
          >
            Upgrade
          </button>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <Panel title="Goals for next week" value={form.goals} onChange={(v) => setForm((p) => ({ ...p, goals: v }))} />
          <Panel title="What worked" value={form.what_worked} onChange={(v) => setForm((p) => ({ ...p, what_worked: v }))} />
          <Panel title="What failed" value={form.what_failed} onChange={(v) => setForm((p) => ({ ...p, what_failed: v }))} />
          <Panel title="Rules followed" value={form.rules_followed} onChange={(v) => setForm((p) => ({ ...p, rules_followed: v }))} />
          <div className="lg:col-span-2">
            <Panel title="Improvements" value={form.improvements} onChange={(v) => setForm((p) => ({ ...p, improvements: v }))} rows={4} />
          </div>

          <div className="lg:col-span-2 flex items-center justify-between">
            <button
              onClick={save}
              disabled={loading}
              className="rounded-2xl bg-[rgba(96,165,250,0.22)] px-5 py-3 text-sm font-semibold hover:opacity-90 disabled:opacity-60"
            >
              Save review
            </button>
            <div className="text-sm text-[rgb(var(--muted))]">{msg ?? ""}</div>
          </div>
        </div>
      )}

      {msg && plan !== "free" ? (
        <div className="mt-4 text-sm text-[rgb(var(--muted))]">{msg}</div>
      ) : null}
    </AppShell>
  );
}

function Panel({ title, value, onChange, rows = 3 }: { title: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <div className="text-sm font-semibold">{title}</div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="mt-3 w-full resize-none rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none"
        placeholder="Write here…"
      />
    </div>
  );
}
