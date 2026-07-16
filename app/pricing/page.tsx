"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppShell from "../components/AppShell";
import { createClient } from "@/lib/supabase/client";

type Plan = "free" | "premium" | "pro";

export default function PricingPage() {
  const supabase = useMemo(() => createClient(), []);
  const [plan, setPlan] = useState<Plan>("free");
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;
      setUserId(data.user.id);
      setEmail(data.user.email ?? null);
      // Try to read profile plan; if table not created yet, ignore.
      const { data: prof, error } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", data.user.id)
        .maybeSingle();
      if (!error && prof?.plan) setPlan((prof.plan as Plan) ?? "free");
    })();
  }, [supabase]);

  const setDevPlan = async (p: Plan) => {
    if (!userId) {
      setMsg("Sign in to set your plan (dev mode). In production, Stripe will manage this.");
      return;
    }
    setMsg(null);
    const { error } = await supabase.from("profiles").upsert({ id: userId, plan: p }, { onConflict: "id" });
    if (error) {
      setMsg(
        "Profiles table not found yet. Run the SQL in supabase.sql to create profiles + RLS."
      );
      return;
    }
    setPlan(p);
    setMsg(`Plan set to ${p.toUpperCase()} (dev).`);
  };

  const startCheckout = async (p: Exclude<Plan, "free">) => {
    if (!userId) {
      setMsg("Sign in to upgrade.");
      return;
    }
    setMsg(null);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: p, userId, email }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.url) {
      // fallback to dev plan switch
      await setDevPlan(p);
      setMsg(json.error ? `${json.error} (Using dev plan switch instead.)` : "Stripe not configured. Using dev plan switch.");
      return;
    }
    window.location.href = json.url;
  };

  const startConfirmo = async (p: Exclude<Plan, "free">) => {
    if (!userId) {
      setMsg("Sign in to upgrade.");
      return;
    }
    setMsg(null);
    const res = await fetch("/api/pay/confirmo/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: p, userId, email }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.url) {
      setMsg(json.error ?? "Confirmo checkout failed. Configure CONFIRMO_API_KEY.");
      return;
    }
    window.location.href = json.url;
  };

  
const startCoinbase = async (p: Exclude<Plan, "free">) => {
  if (!userId) {
    setMsg("Sign in to upgrade.");
    return;
  }
  setMsg(null);
  const res = await fetch("/api/pay/coinbase/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan: p, userId, email }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.url) {
    setMsg(json.error ?? "Coinbase Commerce checkout failed. Configure COINBASE_COMMERCE_API_KEY.");
    return;
  }
  window.location.href = json.url;
};

const startNowPayments = async (p: Exclude<Plan, "free">) => {
  if (!userId) {
    setMsg("Sign in to upgrade.");
    return;
  }
  setMsg(null);
  const res = await fetch("/api/pay/nowpayments/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan: p, userId, email }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.url) {
    setMsg(json.error ?? "NOWPayments checkout failed. Configure NOWPAYMENTS_API_KEY.");
    return;
  }
  window.location.href = json.url;
};

return (
    <AppShell
      title="ProfitGrid"
      subtitle="Pricing · built to beat generic journals"
      active="pricing"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-3xl font-semibold">Pick your edge</div>
          <div className="mt-2 max-w-2xl text-sm text-[rgb(var(--muted))]">
            ProfitGrid sells at a glance: premium UI, instant clarity, and serious analytics.
            Start free, then unlock your edge.
          </div>
        </div>

        <div className="text-sm text-[rgb(var(--muted))]">
          Current plan: <span className="font-semibold text-[rgb(var(--fg))]">{plan.toUpperCase()}</span>
        </div>
      </div>

      {msg ? <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-[rgb(var(--muted))]">{msg}</div> : null}

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <PlanCard
          name="Free"
          price="$0"
          badge={plan === "free" ? "Current" : ""}
          features={[
            "Daily totals + cloud sync",
            "Calendar heatmap",
            "Basic stats",
            "1 account",
            "PWA install",
          ]}
          cta={userId ? "Use Free" : "Start free"}
          onClick={() => setDevPlan("free")}
          subtle
        />

        <PlanCard
          name="Premium"
          price="$12/mo"
          badge={plan === "premium" ? "Current" : "Most popular"}
          highlight={plan !== "pro"}
          features={[
            "Full trade journal (all markets)",
            "Advanced analytics dashboard",
            "Tags, notes, weekly review",
            "CSV export",
            "Unlimited history",
          ]}
          cta={plan === "premium" ? "Manage" : "Upgrade to Premium"}
          onClick={() => startCheckout("premium")}
        />

        <PlanCard
          name="Pro"
          price="$24/mo"
          badge={plan === "pro" ? "Current" : "Funded traders"}
          features={[
            "Multi-accounts (prop firms)",
            "Rule engine (DD / daily loss alerts)",
            "Expectancy + RR distribution",
            "Equity curve + drawdown",
            "Priority features (imports later)",
          ]}
          cta={plan === "pro" ? "Manage" : "Upgrade to Pro"}
          onClick={() => startCheckout("pro")}
        />
      </div>

      <div className="mt-8 grid gap-3 md:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="text-sm text-[rgb(var(--muted))]">Why people buy</div>
          <div className="mt-2 text-lg font-semibold">Clarity + confidence.</div>
          <ul className="mt-3 list-disc pl-5 text-sm text-[rgb(var(--muted))]">
            <li>Heatmap tells you if you’re consistent.</li>
            <li>Trade journal tells you what setups actually pay.</li>
            <li>Rules engine protects funded accounts.</li>
          </ul>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="text-sm text-[rgb(var(--muted))]">Payments</div>
          <div className="mt-2 text-lg font-semibold">Stripe + Crypto</div>
          <div className="mt-3 text-sm text-[rgb(var(--muted))]">
            Pay by card (Stripe) or crypto (Confirmo). If Stripe keys aren’t set yet, card checkout
            will fall back to a dev plan switch so you can keep building.
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <button
              onClick={() => startConfirmo("premium")}
              className="rounded-2xl border border-white/10 bg-[rgba(16,185,129,0.14)] px-4 py-3 text-sm font-semibold hover:opacity-90"
            >
              Crypto (Confirmo) · Premium
            </button>
            <button
              onClick={() => startConfirmo("pro")}
              className="rounded-2xl border border-white/10 bg-[rgba(120,90,255,0.14)] px-4 py-3 text-sm font-semibold hover:opacity-90"
            >
              Crypto (Confirmo) · Pro
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setDevPlan("free")}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:opacity-90"
            >
              Dev: Free
            </button>
            <button
              onClick={() => setDevPlan("premium")}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:opacity-90"
            >
              Dev: Premium
            </button>
            <button
              onClick={() => setDevPlan("pro")}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:opacity-90"
            >
              Dev: Pro
            </button>
          </div>
          <div className="mt-4">
            <Link className="underline text-sm" href="/">Back to dashboard</Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function PlanCard({
  name,
  price,
  features,
  cta,
  onClick,
  badge,
  highlight,
  subtle,
}: {
  name: string;
  price: string;
  features: string[];
  cta: string;
  onClick: () => void;
  badge?: string;
  highlight?: boolean;
  subtle?: boolean;
}) {
  return (
    <div
      className={
        "rounded-3xl border p-5 " +
        (highlight
          ? "border-[rgba(16,185,129,0.40)] bg-[rgba(16,185,129,0.08)]"
          : subtle
          ? "border-white/10 bg-white/5"
          : "border-white/10 bg-white/5")
      }
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold">{name}</div>
          <div className="mt-1 text-3xl font-semibold">{price}</div>
        </div>
        {badge ? (
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[rgb(var(--muted))]">
            {badge}
          </span>
        ) : null}
      </div>

      <ul className="mt-4 space-y-2 text-sm text-[rgb(var(--muted))]">
        {features.map((f) => (
          <li key={f} className="flex gap-2">
            <span className="mt-[2px]">✓</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={onClick}
        className={
          "mt-5 w-full rounded-2xl px-4 py-3 text-sm font-semibold hover:opacity-90 " +
          (highlight ? "bg-[rgba(16,185,129,0.22)]" : "border border-white/10 bg-white/5")
        }
      >
        {cta}
      </button>
    </div>
  );
}