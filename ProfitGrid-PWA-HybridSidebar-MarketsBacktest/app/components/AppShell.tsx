"use client";

import React from "react";
import Sidebar from "./Sidebar";
import MobileTabBar from "./MobileTabBar";
import ThemeToggle from "./ThemeToggle";

export default function AppShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl md:flex">
        <Sidebar />

        <div className="flex-1">
          {/* Top bar (mobile/desktop) */}
          <header className="mx-auto max-w-5xl px-6 pt-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-semibold tracking-tight">{title}</div>
                {subtitle ? (
                  <div className="mt-1 text-sm text-[rgb(var(--muted))]">{subtitle}</div>
                ) : null}
              </div>

              <div className="glass-soft rounded-xl px-3 py-2">
                <ThemeToggle />
              </div>
            </div>

            <div className="mt-6 hr" />
          </header>

          {/* Main */}
          <main className="mx-auto max-w-5xl px-6 pb-24 pt-10">
            <div className="glass rounded-2xl p-6 md:p-8">{children}</div>
          </main>
        </div>
      </div>

      <MobileTabBar />
    </div>
  );
}
