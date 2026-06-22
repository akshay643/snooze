'use client';
import { useState, useEffect } from 'react';
import { useReminders } from '@/hooks/useReminders';
import { usePush } from '@/hooks/usePush';
import { ReminderCard } from '@/components/ReminderCard';
import { AddReminderSheet } from '@/components/AddReminderSheet';
import { VerifySheet } from '@/components/VerifySheet';
import { ToastProvider, toast } from '@/components/Toast';
import { Reminder } from '@/lib/types';

export default function RemindersPage() {
  const { active, done, hydrated, add, complete, snooze, remove, get } = useReminders();
  const { granted, subscribe, loading: pushLoading, scheduleServerPush } = usePush();

  const [addOpen, setAddOpen]     = useState(false);
  const [verifying, setVerifying] = useState<Reminder | null>(null);
  const [showDone, setShowDone]   = useState(false);

  // Listen for SW → VERIFY messages
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    const handler = (e: MessageEvent) => {
      if (e.data.type === 'VERIFY') {
        const r = get(e.data.id);
        if (r && !r.completed) setVerifying(r);
      }
    };
    navigator.serviceWorker.addEventListener('message', handler);
    return () => navigator.serviceWorker.removeEventListener('message', handler);
  }, [get]);

  // Handle ?verify= URL param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('verify');
    if (id) {
      history.replaceState({}, '', location.pathname);
      const r = get(id);
      if (r && !r.completed) setVerifying(r);
    }
  }, [hydrated, get]);

  async function handleAdd(data: Parameters<typeof add>[0]) {
    if (!granted) {
      const ok = await subscribe();
      if (!ok) toast('Notifications disabled — reminder saved locally', 'error');
    }
    const r = add(data);
    await scheduleServerPush(r);
    toast('Storm set ⛈️ — I\'ll keep bugging you', 'success');
  }

  function handleComplete(id: string) {
    complete(id);
    setVerifying(null);
    toast('Storm cleared ✓', 'success');
  }

  function handleSnooze(id: string) {
    snooze(id);
    setVerifying(null);
    toast('Snoozed 5 min 💤 — I\'ll be back', 'info');
  }

  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isStandalone = typeof window !== 'undefined' &&
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  const showInstallHint = isIOS && !isStandalone && !granted;

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ paddingTop: 'var(--safe-top, 0px)' }}>
      <ToastProvider />

      {/* Header */}
      <div className="flex-shrink-0 px-5 pt-4 pb-3">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-[26px] font-bold tracking-tight text-[#f0f0ff]">
            Storms <span className="text-[#ef4444]">⛈️</span>
          </h1>
          <span className="text-[13px] text-[#555577] font-medium">
            {active.length} active
          </span>
        </div>
        <p className="text-[13px] text-[#555577]">Reminders that refuse to be ignored.</p>
      </div>

      {/* Notification permission banner */}
      {!granted && (
        <div className="mx-4 mb-3 rounded-2xl p-4 flex items-center gap-3"
          style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)' }}>
          <span className="text-xl flex-shrink-0">🔔</span>
          <div className="flex-1">
            <p className="text-[13px] font-semibold text-[#f0f0ff] mb-0.5">Enable notifications</p>
            <p className="text-[11px] text-[#8888aa]">
              {showInstallHint
                ? 'Add to Home Screen first (Share → Add to Home Screen), then allow notifications.'
                : 'Allow notifications so Snooze Storm can actually storm you.'}
            </p>
          </div>
          {!showInstallHint && (
            <button
              className="flex-shrink-0 px-3 py-2 rounded-xl text-[12px] font-bold text-white transition-all active:scale-95"
              style={{ background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)' }}
              onClick={subscribe}
              disabled={pushLoading}
            >
              {pushLoading ? '…' : 'Allow'}
            </button>
          )}
        </div>
      )}

      {/* List */}
      <div className="flex-1 scroll-y px-4 pb-24">
        {!hydrated && (
          <div className="flex items-center justify-center h-40">
            <div className="text-[#555577] text-sm">Loading…</div>
          </div>
        )}

        {hydrated && active.length === 0 && (
          <div className="flex flex-col items-center justify-center h-[50vh] text-center gap-4">
            <div className="text-[64px] opacity-25">🌤️</div>
            <h2 className="text-[20px] font-bold text-[#f0f0ff]">All clear</h2>
            <p className="text-[14px] text-[#555577] leading-relaxed max-w-[240px]">
              No active storms. Tap <strong className="text-[#8b5cf6]">+</strong> to set a reminder that won't take no for an answer.
            </p>
          </div>
        )}

        {active.map(r => (
          <ReminderCard
            key={r.id}
            reminder={r}
            onTap={rem => setVerifying(rem)}
            onDelete={id => { remove(id); toast('Reminder removed', 'info'); }}
          />
        ))}

        {/* Done section */}
        {done.length > 0 && (
          <div className="mt-4">
            <button
              className="flex items-center gap-2 text-[11px] font-bold text-[#555577] uppercase tracking-wider mb-3"
              onClick={() => setShowDone(v => !v)}
            >
              {showDone ? '▾' : '▸'} Completed ({done.length})
            </button>
            {showDone && done.slice(0, 10).map(r => (
              <ReminderCard
                key={r.id}
                reminder={r}
                onTap={() => {}}
                onDelete={id => { remove(id); toast('Removed', 'info'); }}
              />
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button className="fab" onClick={() => setAddOpen(true)} aria-label="New reminder">
        +
      </button>

      {/* Add sheet */}
      {addOpen && (
        <AddReminderSheet onAdd={handleAdd} onClose={() => setAddOpen(false)} />
      )}

      {/* Verify sheet */}
      {verifying && (
        <VerifySheet
          reminder={verifying}
          onComplete={handleComplete}
          onSnooze={handleSnooze}
          onClose={() => setVerifying(null)}
        />
      )}
    </div>
  );
}
