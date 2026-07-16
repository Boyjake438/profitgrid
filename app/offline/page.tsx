export default function OfflinePage() {
  return (
    <div className="min-h-screen grid place-items-center bg-[rgb(var(--bg))] text-[rgb(var(--fg))]">
      <div className="glass rounded-3xl p-6 text-center max-w-md">
        <div className="text-2xl font-semibold">You’re offline</div>
        <div className="mt-2 text-sm text-[rgb(var(--muted))]">
          ProfitGrid needs an internet connection to sync. Your last cached pages may still work.
        </div>
        <div className="mt-5 text-xs text-[rgb(var(--muted))]">Reconnect and reload.</div>
      </div>
    </div>
  );
}
