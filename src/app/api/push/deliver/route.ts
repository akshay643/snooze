import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { Client } from '@upstash/qstash';

const TITLES = [
  '⏰ Reminder',
  '⚡ Hey! Still here…',
  '🔥 SERIOUSLY. Do it.',
  '🚨 LAST WARNING',
];
const BODIES = [
  (t: string) => t,
  (t: string) => `You haven't done this: ${t}`,
  (t: string) => `Come ON: ${t}`,
  (t: string) => `DO IT RIGHT NOW: ${t}`,
];
const NEXT_DELAY = [300, 240, 180, 120]; // seconds between escalations

export async function POST(req: NextRequest) {
  // Verify QStash signature when keys are configured
  const sigKey = process.env.QSTASH_CURRENT_SIGNING_KEY;
  const nextKey = process.env.QSTASH_NEXT_SIGNING_KEY;

  if (sigKey && nextKey) {
    const { Receiver } = await import('@upstash/qstash');
    const receiver = new Receiver({ currentSigningKey: sigKey, nextSigningKey: nextKey });
    const body = await req.text();
    const sig  = req.headers.get('Upstash-Signature') ?? '';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';

    const valid = await receiver.verify({ signature: sig, body, url: `${appUrl}/api/push/deliver` })
      .catch(() => false);

    if (!valid) return NextResponse.json({ error: 'Bad signature' }, { status: 401 });

    return handlePayload(JSON.parse(body));
  }

  // QStash not yet configured — still work for manual/test calls
  const payload = await req.json();
  return handlePayload(payload);
}

async function handlePayload(payload: {
  subscription: webpush.PushSubscription;
  reminderId: string;
  task: string;
  escalationLevel: number;
}) {
  const { subscription, reminderId, task, escalationLevel } = payload;

  webpush.setVapidDetails(
    `mailto:${process.env.VAPID_EMAIL ?? 'admin@notealert.app'}`,
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );

  const lvl = Math.min(escalationLevel ?? 0, 3);

  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: TITLES[lvl],
        body: BODIES[lvl](task),
        data: { reminderId, escalationLevel: lvl },
      }),
    );
  } catch (err: unknown) {
    const code = (err as { statusCode?: number }).statusCode;
    if (code === 404 || code === 410) {
      return NextResponse.json({ ok: true, stopped: 'expired-subscription' });
    }
    console.error('Push failed:', err);
  }

  // Re-queue next escalation via QStash
  const qToken  = process.env.QSTASH_TOKEN;
  const appUrl  = process.env.NEXT_PUBLIC_APP_URL;
  if (qToken && appUrl) {
    const client  = new Client({ token: qToken });
    const nextLvl = Math.min(lvl + 1, 3);
    await client.publishJSON({
      url: `${appUrl}/api/push/deliver`,
      delay: NEXT_DELAY[lvl],
      body: { subscription, reminderId, task, escalationLevel: nextLvl },
    });
  }

  return NextResponse.json({ ok: true });
}
