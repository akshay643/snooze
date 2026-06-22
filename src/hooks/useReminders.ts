'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Reminder, VerifyType } from '@/lib/types';
import { uid } from '@/lib/utils';

const KEY = 'na-reminders-v1';

function load(): Reminder[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
  catch { return []; }
}

export function useReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const swRef = useRef<ServiceWorker | null>(null);

  useEffect(() => {
    setReminders(load());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const setup = async () => {
      if (!('serviceWorker' in navigator)) return;
      const reg = await navigator.serviceWorker.ready;
      swRef.current = reg.active;

      navigator.serviceWorker.addEventListener('message', e => {
        if (e.data.type === 'SNOOZED') {
          setReminders(prev => {
            const next = prev.map(r => r.id === e.data.id
              ? { ...r, dueTime: Date.now() + 5 * 60000, snoozedCount: r.snoozedCount + 1 }
              : r);
            localStorage.setItem(KEY, JSON.stringify(next));
            return next;
          });
        }
      });

      // Reschedule all active reminders on mount
      const active = load().filter(r => !r.completed);
      if (active.length && reg.active) {
        reg.active.postMessage({ type: 'RESCHEDULE_BATCH', reminders: active });
      }
    };
    setup();
  }, [hydrated]);

  const postSW = useCallback((msg: object) => {
    if (navigator.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage(msg);
    }
  }, []);

  const persist = useCallback((next: Reminder[]) => {
    setReminders(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  }, []);

  const add = useCallback((data: {
    task: string;
    dueTime: number;
    verificationType: VerifyType;
    verificationData: string;
  }): Reminder => {
    const r: Reminder = {
      id: uid(),
      ...data,
      escalationLevel: 0,
      completed: false,
      completedAt: null,
      createdAt: Date.now(),
      snoozedCount: 0,
    };
    setReminders(prev => {
      const next = [r, ...prev];
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
    postSW({ type: 'SCHEDULE', reminder: r });
    return r;
  }, [postSW]);

  const complete = useCallback((id: string) => {
    setReminders(prev => {
      const next = prev.map(r => r.id === id
        ? { ...r, completed: true, completedAt: Date.now() } : r);
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
    postSW({ type: 'COMPLETE', id });
  }, [postSW]);

  const snooze = useCallback((id: string, ms = 5 * 60000) => {
    setReminders(prev => {
      const next = prev.map(r => r.id === id
        ? { ...r, dueTime: Date.now() + ms, snoozedCount: r.snoozedCount + 1 } : r);
      localStorage.setItem(KEY, JSON.stringify(next));
      const updated = next.find(r => r.id === id);
      if (updated) postSW({ type: 'SCHEDULE', reminder: updated });
      return next;
    });
  }, [postSW]);

  const remove = useCallback((id: string) => {
    postSW({ type: 'CANCEL', id });
    setReminders(prev => {
      const next = prev.filter(r => r.id !== id);
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, [postSW]);

  const get = useCallback((id: string) => reminders.find(r => r.id === id), [reminders]);

  return {
    reminders,
    active: reminders.filter(r => !r.completed).sort((a, b) => a.dueTime - b.dueTime),
    done: reminders.filter(r => r.completed).sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0)),
    hydrated,
    add, complete, snooze, remove, get,
  };
}
