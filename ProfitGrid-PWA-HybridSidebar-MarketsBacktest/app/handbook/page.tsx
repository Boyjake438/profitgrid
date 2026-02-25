import AppShell from "../components/AppShell";

export default function HandbookPage() {
  return (
    <AppShell title="Handbook" subtitle="Playbooks • checklists • rules • psychology">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="glass-soft rounded-2xl p-5">
          <div className="text-sm text-[rgb(var(--muted))]">Playbooks</div>
          <div className="mt-1 text-lg font-semibold">Build your setups</div>
          <div className="mt-3 text-sm text-[rgb(var(--muted))]">
            Save example trades, checklists, and “when to use / avoid” rules.
          </div>
        </div>
        <div className="glass-soft rounded-2xl p-5">
          <div className="text-sm text-[rgb(var(--muted))]">Rules</div>
          <div className="mt-1 text-lg font-semibold">Your trading constitution</div>
          <div className="mt-3 text-sm text-[rgb(var(--muted))]">
            Risk rules, prop firm rules, and psychology tools — all in one place.
          </div>
        </div>
      </div>
    </AppShell>
  );
}
