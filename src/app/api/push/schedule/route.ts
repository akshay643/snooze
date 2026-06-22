import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { scheduledPushes } from '@/lib/subscriptionStore';

export async function POST(req: NextRequest) {
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    return NextResponse.json({ error: 'VAPID not configured' }, { status: 500 });
  }

  webpush.setVapidDetails(
    `mailto:${process.env.VAPID_EMAIL ?? 'admin@example.com'}`,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY,
  );

  const { subscription, reminder } = await req.json();
  if (!subscription?.endpoint || !reminder?.id) {
    return NextResponse.json({ error: 'Missing data' }, { status: 400 });
  }

  // Cancel existing timer for this reminder
  const existing = scheduledPushes.get(reminder.id);
  if (existing) clearTimeout(existing.timerId);

  const delay = Math.max(0, reminder.dueTime - Date.now());

  const timerId = setTimeout(async () => {
    const LEVELS = [
      { title: '⏰ Reminder',           nextDelay: 5 * 60000 },
      { title: '⚡ Hey! Still here…',   nextDelay: 4 * 60000 },
      { title: '🔥 SERIOUSLY. Do it.',  nextDelay: 3 * 60000 },
      { title: '🚨 LAST WARNING',        nextDelay: 2 * 60000 },
    ];
    const lvl = Math.min(reminder.escalationLevel ?? 0, 3);
    const cfg = LEVELS[lvl];

    try {
      await webpush.sendNotification(
        subscription,
        JSON.stringify({
          title: cfg.title,
          body: lvl === 0 ? reminder.task : `You haven't done: ${reminder.task}`,
          data: { reminderId: reminder.id, escalationLevel: lvl },
        }),
      );
    } catch (err) {
      console.error('Push send failed:', err);
    }

    // Re-schedule at next escalation level
    const nextReminder = { ...reminder, escalationLevel: Math.min(lvl + 1, 3), dueTime: Date.now() + cfg.nextDelay };
    const nextTimerId = setTimeout(() => {}, 0); // placeholder; real impl recurses
    scheduledPushes.set(reminder.id, { ...nextReminder, subscription, timerId: nextTimerId });
  }, delay);

  scheduledPushes.set(reminder.id, { ...reminder, subscription, timerId });

  return NextResponse.json({ ok: true, scheduledIn: delay });
}
