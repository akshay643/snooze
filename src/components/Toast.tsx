'use client';
import { useEffect, useState } from 'react';

export interface ToastMsg {
  id: number;
  text: string;
  type?: 'success' | 'error' | 'info';
}

let _push: ((msg: Omit<ToastMsg, 'id'>) => void) | null = null;
export function toast(text: string, type: ToastMsg['type'] = 'info') {
  _push?.({ text, type });
}

export function ToastProvider() {
  const [toasts, setToasts] = useState<ToastMsg[]>([]);

  useEffect(() => {
    _push = msg => {
      const id = Date.now();
      setToasts(p => [...p, { id, ...msg }]);
      setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3200);
    };
    return () => { _push = null; };
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] flex flex-col items-center gap-2 pt-[calc(var(--safe-top,0px)+12px)] pointer-events-none max-w-[480px] mx-auto">
      {toasts.map(t => (
        <div
          key={t.id}
          className="pointer-events-auto px-5 py-3 rounded-2xl text-[13px] font-semibold shadow-2xl"
          style={{
            background: '#1e1e32',
            border: `1px solid ${t.type === 'success' ? 'rgba(52,211,153,.35)' : t.type === 'error' ? 'rgba(239,68,68,.35)' : 'rgba(255,255,255,.1)'}`,
            color: t.type === 'success' ? '#34d399' : t.type === 'error' ? '#ef4444' : '#f0f0ff',
            animation: 'toastIn 0.25s ease',
          }}
        >
          {t.text}
        </div>
      ))}
    </div>
  );
}
