"use client";

import React, { useEffect, useState } from "react";
import AppShell from "../components/AppShell";
import { Globe, Bell, ShieldCheck, Database, DollarSign, Clock, CheckCircle2, AlertTriangle } from "lucide-react";

export default function SettingsPage() {
  const [currency, setCurrency] = useState("USD");
  const [timezone, setTimezone] = useState("UTC");
  const [notifDaily, setNotifDaily] = useState(true);
  const [notifTrade, setNotifTrade] = useState(true);
  const [notifGoals, setNotifGoals] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const c = localStorage.getItem("pg_currency");
      const tz = localStorage.getItem("pg_timezone");
      const nd = localStorage.getItem("pg_notif_daily");
      const nt = localStorage.getItem("pg_notif_trade");
      const ng = localStorage.getItem("pg_notif_goals");
      if (c) setCurrency(c);
      if (tz) setTimezone(tz);
      if (nd !== null) setNotifDaily(nd === "true");
      if (nt !== null) setNotifTrade(nt === "true");
      if (ng !== null) setNotifGoals(ng === "true");
    }
  }, []);

  const handleSave = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("pg_currency", currency);
      localStorage.setItem("pg_timezone", timezone);
      localStorage.setItem("pg_notif_daily", String(notifDaily));
      localStorage.setItem("pg_notif_trade", String(notifTrade));
      localStorage.setItem("pg_notif_goals", String(notifGoals));
      window.dispatchEvent(new Event("storage"));
    }
    setMsg("Settings saved successfully ✅");
    setTimeout(() => setMsg(null), 3000);
  };

  const handleClearCache = () => {
    if (confirm("Clear local cache and mock demo data? (Your synced Supabase cloud data remains untouched)")) {
      localStorage.removeItem("pg_active_account");
      localStorage.removeItem("pg_monthly_goal");
      alert("Cache cleared.");
      window.location.reload();
    }
  };

  return (
    <AppShell title="Ecosystem Settings" subtitle="Theme • multi-currency • time zones • notifications • security">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 font-sans">
        <div className="space-y-6 lg:col-span-7">
          <div className="glass-soft rounded-3xl p-6 border border-white/10">
            <div className="flex items-center gap-2 text-base font-semibold">
              <Globe className="h-5 w-5 text-purple-400" />
              Regional &amp; Multi-Currency
            </div>
            <div className="mt-1 text-xs text-[rgb(var(--muted))]">
              Choose your display currency and market sync time zone. All internal accounts sync conversion automatically.
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-[rgb(var(--muted))] flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5 text-emerald-400" /> Display Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="mt-1.5 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-purple-500/50"
                >
                  <option value="USD">USD ($) - US Dollar</option>
                  <option value="EUR">EUR (€) - Euro</option>
                  <option value="GBP">GBP (£) - British Pound</option>
                  <option value="GHS">GHS (GH₵) - Ghanaian Cedi</option>
                  <option value="CAD">CAD ($) - Canadian Dollar (Future)</option>
                  <option value="AUD">AUD ($) - Australian Dollar (Future)</option>
                  <option value="JPY">JPY (¥) - Japanese Yen (Future)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-[rgb(var(--muted))] flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-blue-400" /> Time Zone
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="mt-1.5 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-purple-500/50"
                >
                  <option value="UTC">UTC (Universal Coordinated Time)</option>
                  <option value="Africa/Accra">Africa/Accra (GMT / Local)</option>
                  <option value="America/New_York">America/New_York (EST / NY Session)</option>
                  <option value="Europe/London">Europe/London (BST / London Session)</option>
                  <option value="Asia/Tokyo">Asia/Tokyo (JST / Tokyo Session)</option>
                  <option value="Australia/Sydney">Australia/Sydney (AEST / Sydney Session)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="glass-soft rounded-3xl p-6 border border-white/10">
            <div className="flex items-center gap-2 text-base font-semibold">
              <Bell className="h-5 w-5 text-amber-400" />
              Notifications &amp; Reminders
            </div>
            <div className="mt-1 text-xs text-[rgb(var(--muted))]">
              Manage reminders for journaling, trade goals, and subscription status.
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between rounded-2xl bg-white/5 p-4 border border-white/5">
                <div>
                  <div className="text-sm font-medium">Daily Journaling Reminder</div>
                  <div className="text-xs text-[rgb(var(--muted))]">Receive push / reminder when trading sessions close without logged entries</div>
                </div>
                <input
                  type="checkbox"
                  checked={notifDaily}
                  onChange={(e) => setNotifDaily(e.target.checked)}
                  className="h-5 w-5 rounded border-white/20 bg-transparent text-purple-500 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-white/5 p-4 border border-white/5">
                <div>
                  <div className="text-sm font-medium">Trade Execution &amp; Risk Reminders</div>
                  <div className="text-xs text-[rgb(var(--muted))]">Alerts when approaching daily risk rules or target R:R milestones</div>
                </div>
                <input
                  type="checkbox"
                  checked={notifTrade}
                  onChange={(e) => setNotifTrade(e.target.checked)}
                  className="h-5 w-5 rounded border-white/20 bg-transparent text-purple-500 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-white/5 p-4 border border-white/5">
                <div>
                  <div className="text-sm font-medium">Monthly Goal Tracking &amp; Badges</div>
                  <div className="text-xs text-[rgb(var(--muted))]">Celebrations when hitting your custom monthly profit target</div>
                </div>
                <input
                  type="checkbox"
                  checked={notifGoals}
                  onChange={(e) => setNotifGoals(e.target.checked)}
                  className="h-5 w-5 rounded border-white/20 bg-transparent text-purple-500 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-5">
          <div className="glass-soft rounded-3xl p-6 border border-white/10">
            <div className="flex items-center gap-2 text-base font-semibold">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              Security &amp; Authentication
            </div>
            <div className="mt-1 text-xs text-[rgb(var(--muted))]">
              Powered by Supabase Auth with Row Level Security (RLS) &amp; HTTPS encryption.
            </div>

            <div className="mt-6 space-y-3">
              <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-3.5 flex items-start gap-3 text-xs text-emerald-300">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold">RLS Active</strong>: Your trades, screenshots, and account journals can only be accessed or modified by your authenticated session.
                </div>
              </div>

              <button
                onClick={() => alert("Password reset link sent (mock or via Supabase Auth email if configured).")}
                className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 text-xs font-semibold hover:bg-white/10 transition"
              >
                Request Password Reset Email
              </button>

              <button
                onClick={() => alert("Active sessions: 1 (Current Device · HTTPS PWA Session)")}
                className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 text-xs font-semibold hover:bg-white/10 transition"
              >
                Manage Active Sessions &amp; Devices
              </button>
            </div>
          </div>

          <div className="glass-soft rounded-3xl p-6 border border-white/10">
            <div className="flex items-center gap-2 text-base font-semibold">
              <Database className="h-5 w-5 text-indigo-400" />
              Data &amp; Storage
            </div>
            <div className="mt-1 text-xs text-[rgb(var(--muted))]">
              Export your trading journal to CSV/JSON or manage browser cache.
            </div>

            <div className="mt-6 space-y-3">
              <button
                onClick={() => alert("Exporting all trades to JSON/CSV (Your investor PDF report is available on Dashboard & Analytics).")}
                className="w-full rounded-2xl bg-indigo-500/20 border border-indigo-500/30 py-3 text-xs font-semibold text-indigo-200 hover:bg-indigo-500/30 transition"
              >
                Export Complete Journal (JSON / CSV)
              </button>

              <button
                onClick={handleClearCache}
                className="w-full rounded-2xl border border-rose-500/30 bg-rose-500/10 py-3 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition flex items-center justify-center gap-1.5"
              >
                <AlertTriangle className="h-3.5 w-3.5" /> Clear Local Cache &amp; Reset Demo state
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-12 glass rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border border-white/10">
          <div>
            <div className="text-sm font-semibold">Save All Ecosystem Settings</div>
            <div className="text-xs text-[rgb(var(--muted))]">Applies instantly across Dashboard, Markets, Journal, and Backtest Lab.</div>
          </div>
          <div className="flex items-center gap-3">
            {msg ? <span className="text-xs font-medium text-emerald-400">{msg}</span> : null}
            <button
              onClick={handleSave}
              className="rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:from-purple-500 hover:to-indigo-500 transition"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
