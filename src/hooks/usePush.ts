'use client';
import { useState, useEffect, useCallback } from 'react';
import { urlBase64ToUint8Array } from '@/lib/utils';

export function usePush() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!('Notification' in window)) return;
    setPermission(Notification.permission);
    if (Notification.permission === 'granted') checkSubscription();
  }, []);

  async function checkSubscription() {
    if (!('serviceWorker' in navigator)) return;
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    setSubscription(sub);
  }

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false;
    setLoading(true);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== 'granted') return false;

      const res = await fetch('/api/push/vapid-key');
      const { publicKey } = await res.json();

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
      setSubscription(sub);

      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub }),
      });
      return true;
    } catch (err) {
      console.error('Push subscribe failed:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const scheduleServerPush = useCallback(async (reminder: {
    id: string; task: string; dueTime: number; escalationLevel: number;
  }) => {
    if (!subscription) return;
    try {
      await fetch('/api/push/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription, reminder }),
      });
    } catch {}
  }, [subscription]);

  const granted = permission === 'granted';

  return { permission, granted, subscription, loading, subscribe, scheduleServerPush };
}
