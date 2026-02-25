"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PublicShell from "../components/PublicShell";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setErr(error.message);
    router.push("/");
    router.refresh();
  }

  return (
    <PublicShell title="ProfitGrid">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-semibold">Sign in</div>
          <div className="mt-1 text-sm text-[rgb(var(--muted))]">Sync your P&L across laptop + iPhone.</div>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[rgb(var(--muted))]">
          PWA
        </span>
      </div>

      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <div>
          <label className="text-xs text-[rgb(var(--muted))]">Email</label>
          <input
            className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-white/20"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>

        <div>
          <label className="text-xs text-[rgb(var(--muted))]">Password</label>
          <input
            className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-white/20"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete="current-password"
          />
        </div>

        {err ? <div className="text-sm text-red-300">{err}</div> : null}

        <button
          disabled={loading}
          className="w-full rounded-2xl bg-[rgba(16,185,129,0.22)] px-4 py-3 text-sm font-semibold hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <div className="mt-4 text-sm text-[rgb(var(--muted))]">
        New here?{" "}
        <Link className="underline" href="/register">
          Create an account
        </Link>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-[rgb(var(--muted))]">
        <div className="font-medium text-[rgb(var(--fg))]">Tip</div>
        Add ProfitGrid to your Home Screen (iPhone Safari → Share → Add to Home Screen) for the full app feel.
      </div>
    </PublicShell>
  );
}
