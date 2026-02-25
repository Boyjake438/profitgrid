"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PublicShell from "../components/PublicShell";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
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

    const { data, error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) return setErr(error.message);

    // If email confirmation is disabled, we can route to app immediately.
    if (data.user) {
      router.push("/");
      router.refresh();
      return;
    }

    router.push("/login");
    router.refresh();
  }

  return (
    <PublicShell title="ProfitGrid">
      <div>
        <div className="text-2xl font-semibold">Create account</div>
        <div className="mt-1 text-sm text-[rgb(var(--muted))]">Start free. Upgrade when you’re ready.</div>
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
            autoComplete="new-password"
          />
          <div className="mt-2 text-xs text-[rgb(var(--muted))]">Use 8+ characters for best security.</div>
        </div>

        {err ? <div className="text-sm text-red-300">{err}</div> : null}

        <button
          disabled={loading}
          className="w-full rounded-2xl bg-[rgba(16,185,129,0.22)] px-4 py-3 text-sm font-semibold hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Creating…" : "Create account"}
        </button>
      </form>

      <div className="mt-4 text-sm text-[rgb(var(--muted))]">
        Already have an account?{" "}
        <Link className="underline" href="/login">
          Sign in
        </Link>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-[rgb(var(--muted))]">
        <div className="font-medium text-[rgb(var(--fg))]">Heads up</div>
        If Supabase email confirmation is enabled, you’ll need to confirm before first sign-in.
      </div>
    </PublicShell>
  );
}
