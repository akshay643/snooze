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

  const [addOpen,   setAddOpen]   = useState(false);
  const [verifying, setVerifying] = useState<Reminder | null>(null);
  const [showDone,  setShowDone]  = useState(false);

  // SW message: open verify sheet
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

  // Handle ?verify= query param (from notification tap)
  useEffect(() => {
    if (!hydrated) return;
    const id = new URLSearchParams(location.search).get('verify');
    if (id) {
      history.replaceState({}, '', location.pathname);
      const r = get(id);
      if (r && !r.completed) setVerifying(r);
    }
  }, [hydrated, get]);

  async function handleAdd(data: Parameters<typeof add>[0]) {
    if (!granted) {
      const ok = await subscribe();
      if (!ok) { toast('Notifications off — reminder saved locally only', 'error'); }
    }
    const r = add(data);
    await scheduleServerPush(r);
    toast('Storm set ⛈️', 'success');
  }

  function handleComplete(id: string) {
    complete(id);
    setVerifying(null);
    toast('Storm cleared ✓', 'success');
  }

  function handleSnooze(id: string) {
    snooze(id);
    setVerifying(null);
    toast('Snoozed 5 min 💤', 'info');
  }

  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isStandalone = typeof window !== 'undefined' && (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <ToastProvider />

      {/* ── Header ── */}
      <div style={{ flexShrink: 0, padding: 'calc(var(--safe-top) + 18px) 20px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px', color: '#f0f0ff', lineHeight: 1 }}>
              Storms <span style={{ fontSize: '24px' }}>⛈️</span>
            </h1>
            <p style={{ fontSize: '12px', color: '#44445a', marginTop: '3px' }}>
              {active.length} active · reminders that won't quit
            </p>
          </div>
          <button
            onClick={() => setAddOpen(true)}
            style={{
              width: '40px', height: '40px', borderRadius: '50%',
              background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)',
              border: 'none', color: '#fff', fontSize: '22px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(139,92,246,0.4)',
            }}
            aria-label="New reminder"
          >
            +
          </button>
        </div>

        {/* Notification banner */}
        {!granted && hydrated && (
          <div style={{
            marginTop: '14px', padding: '12px 14px',
            background: 'rgba(139,92,246,0.1)',
            border: '1px solid rgba(139,92,246,0.22)',
            borderRadius: '16px',
            display: 'flex', alignItems: 'center', gap: '12px',
          }}>
            <span style={{ fontSize: '20px', flexShrink: 0 }}>🔔</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#f0f0ff', marginBottom: '2px' }}>
                {isIOS && !isStandalone ? 'Add to Home Screen first' : 'Enable notifications'}
              </p>
              <p style={{ fontSize: '11px', color: '#666688', lineHeight: 1.4 }}>
                {isIOS && !isStandalone
                  ? 'Share → Add to Home Screen, then reopen and allow notifications (iOS 16.4+)'
                  : 'Required for alerts when the app is closed.'}
              </p>
            </div>
            {(!isIOS || isStandalone) && (
              <button
                onClick={subscribe}
                disabled={pushLoading}
                style={{
                  flexShrink: 0, padding: '8px 14px', borderRadius: '12px',
                  background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)',
                  border: 'none', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                }}
              >
                {pushLoading ? '…' : 'Allow'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── List ── */}
      <div
        className="scroll-y"
        style={{
          flex: 1,
          minHeight: 0,
          padding: '0 16px',
          paddingBottom: 'calc(var(--nav-h) + var(--safe-bot) + 80px)',
        }}
      >
        {/* Loading */}
        {!hydrated && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ height: '80px', borderRadius: '18px', background: 'rgba(255,255,255,0.04)' }} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {hydrated && active.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh', gap: '14px', textAlign: 'center' }}>
            <div style={{ fontSize: '64px', opacity: 0.2 }}>🌤️</div>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#f0f0ff', marginBottom: '6px' }}>All clear</h2>
              <p style={{ fontSize: '14px', color: '#44445a', lineHeight: 1.5 }}>
                No active storms. Tap <strong style={{ color: '#8b5cf6' }}>+</strong> to set a reminder<br />that absolutely won't leave you alone.
              </p>
            </div>
          </div>
        )}

        {/* Active reminders */}
        {active.map(r => (
          <ReminderCard
            key={r.id}
            reminder={r}
            onTap={rem => setVerifying(rem)}
            onDelete={id => { remove(id); toast('Removed', 'info'); }}
          />
        ))}

        {/* Done section */}
        {done.length > 0 && (
          <div style={{ marginTop: '8px' }}>
            <button
              onClick={() => setShowDone(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                fontSize: '11px', fontWeight: 700, color: '#44445a',
                letterSpacing: '0.6px', textTransform: 'uppercase',
                background: 'none', border: 'none', cursor: 'pointer', marginBottom: '10px',
              }}
            >
              {showDone ? '▾' : '▸'} Completed ({done.length})
            </button>
            {showDone && done.slice(0, 8).map(r => (
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
      <button className="fab" onClick={() => setAddOpen(true)} aria-label="New reminder">+</button>

      {addOpen   && <AddReminderSheet onAdd={handleAdd} onClose={() => setAddOpen(false)} />}
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
