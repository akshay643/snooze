const CACHE = 'snooze-storm-v1';
const FILES = ['/index.html', '/manifest.json', '/icon.svg'];

// In-memory timers — re-populated by main thread on each open
const timers = new Map();

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});

self.addEventListener('message', e => {
  const { type } = e.data;
  if (type === 'SCHEDULE') scheduleReminder(e.data.reminder);
  else if (type === 'CANCEL' || type === 'COMPLETE') cancelTimer(e.data.id);
  else if (type === 'RESCHEDULE_BATCH') e.data.reminders.forEach(scheduleReminder);
});

function cancelTimer(id) {
  if (timers.has(id)) {
    clearTimeout(timers.get(id));
    timers.delete(id);
  }
}

function scheduleReminder(r) {
  cancelTimer(r.id);
  const delay = Math.max(0, r.dueTime - Date.now());
  timers.set(r.id, setTimeout(() => notify(r), delay));
}

const LEVELS = [
  { title: '⏰ Reminder',          delay: 5 * 60000, vibrate: [200],                           requireInteraction: false },
  { title: '⚡ Hey! Still here…',  delay: 4 * 60000, vibrate: [200, 100, 200],                  requireInteraction: true  },
  { title: '🔥 SERIOUSLY. Do it.', delay: 3 * 60000, vibrate: [300, 100, 300, 100, 300],        requireInteraction: true  },
  { title: '🚨 LAST WARNING',       delay: 2 * 60000, vibrate: [500, 100, 500, 100, 500, 100, 500], requireInteraction: true },
];

const BODIES = [
  t => t,
  t => `You haven't done this: ${t}`,
  t => `Come ON. Just do it: ${t}`,
  t => `DO IT RIGHT NOW: ${t}`,
];

async function notify(r) {
  const lvl = Math.min(r.escalationLevel ?? 0, 3);
  const cfg = LEVELS[lvl];

  try {
    await self.registration.showNotification(cfg.title, {
      body: BODIES[lvl](r.task),
      icon: '/icon.svg',
      badge: '/icon.svg',
      vibrate: cfg.vibrate,
      tag: `ss-${r.id}`,
      renotify: true,
      requireInteraction: cfg.requireInteraction,
      data: { reminderId: r.id, escalationLevel: lvl },
      actions: [
        { action: 'done',  title: '✓ Done' },
        { action: 'snooze', title: '💤 Snooze 5m' },
      ],
    });
  } catch (_) {}

  // Auto-escalate and keep firing
  const next = { ...r, escalationLevel: Math.min(lvl + 1, 3), dueTime: Date.now() + cfg.delay };
  timers.set(r.id, setTimeout(() => notify(next), cfg.delay));
}

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const { reminderId, escalationLevel } = e.notification.data ?? {};

  if (e.action === 'snooze') {
    const snoozed = { id: reminderId, task: e.notification.body, escalationLevel, dueTime: Date.now() + 5 * 60000 };
    scheduleReminder(snoozed);
    self.clients.matchAll({ type: 'window' }).then(clients =>
      clients.forEach(c => c.postMessage({ type: 'SNOOZED', id: reminderId }))
    );
    return;
  }

  // 'done' or tap → open app to verify
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      for (const c of clients) {
        c.postMessage({ type: 'VERIFY', id: reminderId });
        return c.focus();
      }
      return self.clients.openWindow(`/index.html?verify=${reminderId}`);
    })
  );
});
