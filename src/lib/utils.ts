export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function formatCountdown(ms: number): { text: string; overdue: boolean } {
  if (ms <= 0) return { text: 'OVERDUE', overdue: true };
  const s = Math.floor(ms / 1000);
  if (s < 60) return { text: `${s}s`, overdue: false };
  const m = Math.floor(s / 60);
  if (m < 60) return { text: `${m}m ${s % 60}s`, overdue: false };
  const h = Math.floor(m / 60);
  if (h < 24) return { text: `${h}h ${m % 60}m`, overdue: false };
  const d = Math.floor(h / 24);
  return { text: `${d}d ${h % 24}h`, overdue: false };
}

export function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function urlBase64ToUint8Array(base64: string): ArrayBuffer {
  const pad = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + pad).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr.buffer;
}

export const NOTE_COLORS: Record<string, { bg: string; border: string; label: string; swatch: string }> = {
  default: { bg: '#16162a', border: 'rgba(255,255,255,0.07)', label: 'Default', swatch: '#3b3b5a' },
  purple:  { bg: '#1e1232', border: 'rgba(139,92,246,0.25)',  label: 'Purple',  swatch: '#7c3aed' },
  blue:    { bg: '#0e1e40', border: 'rgba(59,130,246,0.25)',  label: 'Blue',    swatch: '#2563eb' },
  teal:    { bg: '#0c2828', border: 'rgba(20,184,166,0.25)',  label: 'Teal',    swatch: '#0d9488' },
  green:   { bg: '#0e2e1c', border: 'rgba(34,197,94,0.25)',   label: 'Green',   swatch: '#16a34a' },
  amber:   { bg: '#2a1e08', border: 'rgba(245,158,11,0.25)',  label: 'Amber',   swatch: '#d97706' },
  rose:    { bg: '#2a1020', border: 'rgba(244,63,94,0.25)',   label: 'Rose',    swatch: '#e11d48' },
  slate:   { bg: '#141c2c', border: 'rgba(148,163,184,0.2)',  label: 'Slate',   swatch: '#475569' },
};

export const STORM_LEVELS = [
  { label: 'Calm',     color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  emoji: '⏰', delay: 5 * 60000 },
  { label: 'Elevated', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', emoji: '⚡', delay: 4 * 60000 },
  { label: 'Urgent',   color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  emoji: '🔥', delay: 3 * 60000 },
  { label: 'CRITICAL', color: '#ff0033', bg: 'rgba(255,0,51,0.12)',   emoji: '🚨', delay: 2 * 60000 },
];
