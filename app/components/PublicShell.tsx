"use client";

import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import InstallButton from "./InstallButton";

export default function PublicShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[rgb(var(--bg))] text-[rgb(var(--fg))]">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-48 left-1/2 h-[620px] w-[620px] -translate-x-1/2 rounded-full bg-[rgba(120,90,255,0.20)] blur-[130px]" />
        <div className="absolute bottom-[-240px] right-[-240px] h-[640px] w-[640px] rounded-full bg-[rgba(0,220,255,0.16)] blur-[140px]" />
        <div className="absolute top-[25%] left-[-220px] h-[520px] w-[520px] rounded-full bg-[rgba(16,185,129,0.12)] blur-[140px]" />
      </div>

      <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-6 md:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[rgba(255,255,255,0.06)] ring-1 ring-white/10">
            <span className="text-lg">▦</span>
          </div>
          <div>
            <div className="text-xl font-semibold tracking-tight">{title}</div>
            <div className="text-xs text-[rgb(var(--muted))]">PWA-first · Cloud sync · Built for traders</div>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <InstallButton />
          <ThemeToggle />
        </div>
      </header>

      <main className="relative mx-auto w-full max-w-xl px-4 pb-14 md:px-8">
        <div className="glass rounded-3xl p-4 md:p-6">{children}</div>
        <div className="mt-6 text-center text-xs text-[rgb(var(--muted))]">© {new Date().getFullYear()} ProfitGrid</div>
      </main>
    </div>
  );
}
