const CACHE = 'note-alert-v1';
const SHELL = ['/', '/notes', '/reminders'];

const timers = new Map();

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// ── Push from server ──────────────────────────────────────
self.addEventListener('push', e => {
  if (!e.data) return;
  let payload;
  try { payload = e.data.json(); }
  catch { payload = { title: '⚡ Reminder', body: e.data.text() }; }

  e.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/icon.svg',
      badge: '/icon.svg',
      vibrate: [300, 100, 300],
      requireInteraction: true,
      tag: `na-${payload.data?.reminderId ?? 'generic'}`,
      renotify: true,
      data: payload.data ?? {},
      actions: [
        { action: 'done',   title: '✓ Done' },
        { action: 'snooze', title: '💤 Snooze 5m' },
      ],
    })
  );
});

// ── Local scheduling (from main thread) ───────────────────
self.addEventListener('message', e => {
  const { type } = e.data;
  if (type === 'SCHEDULE') scheduleLocal(e.data.reminder);
  else if (type === 'CANCEL' || type === 'COMPLETE') cancelLocal(e.data.id);
  else if (type === 'RESCHEDULE_BATCH') e.data.reminders.forEach(scheduleLocal);
});

function cancelLocal(id) {
  if (timers.has(id)) { clearTimeout(timers.get(id)); timers.delete(id); }
}

function scheduleLocal(r) {
  cancelLocal(r.id);
  const delay = Math.max(0, r.dueTime - Date.now());
  timers.set(r.id, setTimeout(() => fireLocal(r), delay));
}

const LEVELS = [
  { title: '⏰ Reminder',           next: 5 * 60000, vibrate: [200],                    ri: false },
  { title: '⚡ Hey! Still here…',   next: 4 * 60000, vibrate: [200, 100, 200],           ri: true  },
  { title: '🔥 SERIOUSLY. Do it.',  next: 3 * 60000, vibrate: [300, 100, 300, 100, 300], ri: true  },
  { title: '🚨 LAST WARNING',        next: 2 * 60000, vibrate: [500, 100, 500, 100, 500, 100, 500], ri: true },
];

const BODIES = [
  t => t,
  t => `You haven't done this: ${t}`,
  t => `Come ON: ${t}`,
  t => `DO IT NOW: ${t}`,
];

async function fireLocal(r) {
  const lvl = Math.min(r.escalationLevel ?? 0, 3);
  const cfg = LEVELS[lvl];

  try {
    await self.registration.showNotification(cfg.title, {
      body: BODIES[lvl](r.task),
      icon: '/icon.svg',
      badge: '/icon.svg',
      vibrate: cfg.vibrate,
      tag: `na-${r.id}`,
      renotify: true,
      requireInteraction: cfg.ri,
      data: { reminderId: r.id, escalationLevel: lvl, task: r.task },
      actions: [
        { action: 'done',   title: '✓ Done' },
        { action: 'snooze', title: '💤 Snooze 5m' },
      ],
    });
  } catch (_) {}

  const next = { ...r, escalationLevel: Math.min(lvl + 1, 3), dueTime: Date.now() + cfg.next };
  timers.set(r.id, setTimeout(() => fireLocal(next), cfg.next));
}

// ── Notification click ────────────────────────────────────
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const { reminderId, escalationLevel, task } = e.notification.data ?? {};

  if (e.action === 'snooze') {
    const snoozed = { id: reminderId, task, escalationLevel, dueTime: Date.now() + 5 * 60000 };
    scheduleLocal(snoozed);
    self.clients.matchAll({ type: 'window' }).then(cs =>
      cs.forEach(c => c.postMessage({ type: 'SNOOZED', id: reminderId }))
    );
    return;
  }

  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      for (const c of clients) {
        c.postMessage({ type: 'VERIFY', id: reminderId });
        return c.focus();
      }
      return self.clients.openWindow(`/reminders?verify=${reminderId}`);
    })
  );
});
