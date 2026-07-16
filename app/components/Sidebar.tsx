"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  LineChart,
  BookOpen,
  FlaskConical,
  NotebookPen,
  BarChart3,
  CalendarDays,
  CheckSquare,
  User,
  Settings,
  Plus,
  ChevronDown,
  CreditCard,
  CheckCircle2,
} from "lucide-react";

const mainNav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/markets", label: "Markets", icon: LineChart },
  { href: "/journal", label: "Journal Hub", icon: NotebookPen },
  { href: "/backtest", label: "Backtest Lab", icon: FlaskConical },
  { href: "/handbook", label: "Handbook", icon: BookOpen },
];

const analyticsNav = [
  { href: "/analytics", label: "Advanced Analytics", icon: BarChart3 },
  { href: "/calendar", label: "P&L Heatmap", icon: CalendarDays },
  { href: "/review", label: "Reviews & Playbooks", icon: CheckSquare },
];

const accountNav = [
  { href: "/profile", label: "Trader Profile", icon: User },
  { href: "/pricing", label: "Plans & Payments", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
];

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export default function Sidebar() {
  const pathname = usePathname();
  const [activeAccount, setActiveAccount] = useState<{ id: number; name: string; currency: string; type: string }>({
    id: 1,
    name: "Main Live Account",
    currency: "USD",
    type: "Live",
  });
  const [accountsList, setAccountsList] = useState([
    { id: 1, name: "Main Live Account", currency: "USD", type: "Live", balance: 10000 },
    { id: 2, name: "FTMO Prop Challenge", currency: "USD", type: "Prop", balance: 100000 },
    { id: 3, name: "Backtest Demo Lab", currency: "EUR", type: "Demo", balance: 50000 },
  ]);
  const [showAccounts, setShowAccounts] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newAccName, setNewAccName] = useState("");
  const [newAccType, setNewAccType] = useState("Prop");
  const [newAccCurr, setNewAccCurr] = useState("USD");
  const [newAccBal, setNewAccBal] = useState("10000");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedAcc = localStorage.getItem("pg_active_account");
      const storedList = localStorage.getItem("pg_accounts_list");

      if (storedList) {
        try {
          const parsed = JSON.parse(storedList);
          if (Array.isArray(parsed) && parsed.length > 0) setAccountsList(parsed);
        } catch {}
      }

      if (storedAcc) {
        const found = accountsList.find((a) => a.id === Number(storedAcc));
        if (found) setActiveAccount(found);
      }
    }
  }, [accountsList.length]);

  const selectAccount = (acc: any) => {
    setActiveAccount(acc);
    setShowAccounts(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("pg_active_account", String(acc.id));
      localStorage.setItem("pg_currency", acc.currency);
      window.dispatchEvent(new Event("storage"));
    }
  };

  const handleCreateAccount = () => {
    if (!newAccName.trim()) return;
    const nextId = Math.max(...accountsList.map((a) => a.id), 0) + 1;
    const created = {
      id: nextId,
      name: newAccName.trim(),
      currency: newAccCurr,
      type: newAccType,
      balance: Number(newAccBal) || 10000,
    };
    const updated = [...accountsList, created];
    setAccountsList(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("pg_accounts_list", JSON.stringify(updated));
    }
    selectAccount(created);
    setShowNewModal(false);
    setNewAccName("");
  };

  return (
    <aside className="hidden md:flex md:w-72 md:flex-col md:gap-4 md:px-5 md:py-6 shrink-0 font-sans">
      <div className="glass rounded-2xl p-4 border border-white/10">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-[rgba(var(--accent),0.18)] border border-[rgba(255,255,255,0.10)] flex items-center justify-center shadow-sm">
            <div className="h-4 w-4 rotate-45 border border-[rgba(255,255,255,0.85)]" />
          </div>
          <div className="leading-tight">
            <div className="font-bold tracking-tight text-base">ProfitGrid</div>
            <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Synced • Online
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-1">
          <div className="px-3 pb-1 text-[10px] font-bold tracking-wider uppercase text-[rgb(var(--muted))]">
            COMMAND CENTER
          </div>
          {mainNav.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cx(
                  "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
                  active
                    ? "bg-[rgba(var(--accent),0.2)] border border-purple-500/30 text-white font-medium"
                    : "hover:bg-white/5 text-[rgb(var(--muted))] hover:text-white"
                )}
              >
                <Icon className={cx("h-4 w-4 shrink-0", active ? "text-purple-300" : "text-[rgb(var(--muted))] group-hover:text-white")} />
                <span>{item.label}</span>
                {active ? <span className="ml-auto h-2 w-2 rounded-full bg-purple-400" /> : null}
              </Link>
            );
          })}

          <div className="mt-4 px-3 pb-1 text-[10px] font-bold tracking-wider uppercase text-[rgb(var(--muted))]">
            ANALYTICS &amp; REVIEWS
          </div>
          {analyticsNav.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cx(
                  "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
                  active
                    ? "bg-[rgba(var(--accent),0.2)] border border-purple-500/30 text-white font-medium"
                    : "hover:bg-white/5 text-[rgb(var(--muted))] hover:text-white"
                )}
              >
                <Icon className={cx("h-4 w-4 shrink-0", active ? "text-purple-300" : "text-[rgb(var(--muted))] group-hover:text-white")} />
                <span>{item.label}</span>
                {active ? <span className="ml-auto h-2 w-2 rounded-full bg-purple-400" /> : null}
              </Link>
            );
          })}

          <div className="mt-4 px-3 pb-1 text-[10px] font-bold tracking-wider uppercase text-[rgb(var(--muted))]">
            ACCOUNT &amp; SETTINGS
          </div>
          {accountNav.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cx(
                  "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
                  active
                    ? "bg-[rgba(var(--accent),0.2)] border border-purple-500/30 text-white font-medium"
                    : "hover:bg-white/5 text-[rgb(var(--muted))] hover:text-white"
                )}
              >
                <Icon className={cx("h-4 w-4 shrink-0", active ? "text-purple-300" : "text-[rgb(var(--muted))] group-hover:text-white")} />
                <span>{item.label}</span>
                {active ? <span className="ml-auto h-2 w-2 rounded-full bg-purple-400" /> : null}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="glass rounded-2xl p-4 border border-white/10 relative">
        <div className="flex items-center justify-between">
          <div className="text-[10px] font-bold tracking-wider uppercase text-[rgb(var(--muted))]">ACTIVE ACCOUNT</div>
          <button
            onClick={() => setShowNewModal(true)}
            className="text-[11px] text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-0.5"
          >
            <Plus className="h-3 w-3" /> New
          </button>
        </div>

        <div
          onClick={() => setShowAccounts(!showAccounts)}
          className="mt-2 glass-soft rounded-xl p-3 border border-white/10 cursor-pointer hover:border-purple-500/40 transition flex items-center justify-between"
        >
          <div>
            <div className="flex items-center gap-1.5">
              <span
                className={cx(
                  "rounded px-1.5 py-0.5 text-[9px] font-bold uppercase",
                  activeAccount.type === "Live"
                    ? "bg-emerald-500/20 text-emerald-300"
                    : activeAccount.type === "Prop"
                    ? "bg-purple-500/20 text-purple-300"
                    : "bg-blue-500/20 text-blue-300"
                )}
              >
                {activeAccount.type}
              </span>
              <span className="text-sm font-semibold truncate max-w-[130px]">{activeAccount.name}</span>
            </div>
            <div className="text-xs text-[rgb(var(--muted))] mt-0.5">
              {activeAccount.currency} • Synced Portfolio
            </div>
          </div>
          <ChevronDown className={cx("h-4 w-4 text-[rgb(var(--muted))] transition", showAccounts ? "rotate-180" : "")} />
        </div>

        {showAccounts && (
          <div className="absolute left-0 right-0 top-full mt-2 z-50 glass rounded-2xl p-2 border border-white/20 shadow-2xl space-y-1">
            <div className="px-2 py-1 text-[10px] text-[rgb(var(--muted))] uppercase font-semibold">Switch Account</div>
            {accountsList.map((acc) => (
              <div
                key={acc.id}
                onClick={() => selectAccount(acc)}
                className={cx(
                  "flex items-center justify-between rounded-xl px-3 py-2 text-xs cursor-pointer transition",
                  activeAccount.id === acc.id ? "bg-purple-500/20 border border-purple-500/30 text-white font-semibold" : "hover:bg-white/5 text-[rgb(var(--muted))]"
                )}
              >
                <div>
                  <div>{acc.name}</div>
                  <div className="text-[10px] text-[rgb(var(--muted))]">{acc.type} • {acc.currency} (${acc.balance?.toLocaleString() || "10,000"})</div>
                </div>
                {activeAccount.id === acc.id && <CheckCircle2 className="h-3.5 w-3.5 text-purple-400 shrink-0" />}
              </div>
            ))}
            <div
              onClick={() => {
                setShowAccounts(false);
                setShowNewModal(true);
              }}
              className="flex items-center justify-center gap-1 rounded-xl bg-purple-500/10 border border-purple-500/20 p-2 text-xs text-purple-300 font-semibold cursor-pointer hover:bg-purple-500/20 mt-2"
            >
              <Plus className="h-3.5 w-3.5" /> Create New Account
            </div>
          </div>
        )}
      </div>

      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="glass rounded-3xl p-6 border border-white/20 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold">Add Trading Account</div>
              <button onClick={() => setShowNewModal(false)} className="text-sm text-[rgb(var(--muted))] hover:text-white">✕</button>
            </div>
            <div className="text-xs text-[rgb(var(--muted))]">
              Manage Live Accounts, Prop Firm Challenges, and Demo Backtest portfolios separately.
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-[rgb(var(--muted))]">Account Name</label>
                <input
                  value={newAccName}
                  onChange={(e) => setNewAccName(e.target.value)}
                  placeholder="e.g. Apex 50k Challenge, IC Markets Live"
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[rgb(var(--muted))]">Account Type</label>
                  <select
                    value={newAccType}
                    onChange={(e) => setNewAccType(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none"
                  >
                    <option value="Live">Live Account</option>
                    <option value="Prop">Prop Firm</option>
                    <option value="Demo">Demo Account</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[rgb(var(--muted))]">Currency</label>
                  <select
                    value={newAccCurr}
                    onChange={(e) => setNewAccCurr(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="GHS">GHS (GH₵)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-[rgb(var(--muted))]">Starting Balance ({newAccCurr})</label>
                <input
                  type="number"
                  value={newAccBal}
                  onChange={(e) => setNewAccBal(e.target.value)}
                  placeholder="10000"
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowNewModal(false)}
                className="flex-1 rounded-2xl border border-white/10 bg-white/5 py-2.5 text-xs font-semibold hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAccount}
                className="flex-1 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 py-2.5 text-xs font-semibold text-white hover:from-purple-500 hover:to-indigo-500"
              >
                Save Account
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
