import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@upstash/qstash';

export async function POST(req: NextRequest) {
  const { subscription, reminder } = await req.json();

  if (!process.env.QSTASH_TOKEN) {
    // QStash not configured — SW will handle locally
    return NextResponse.json({ ok: true, mode: 'sw-only' });
  }

  if (!subscription?.endpoint || !reminder?.id) {
    return NextResponse.json({ error: 'Missing data' }, { status: 400 });
  }

  const delaySec = Math.max(5, Math.floor((reminder.dueTime - Date.now()) / 1000));
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!appUrl) {
    return NextResponse.json({ error: 'NEXT_PUBLIC_APP_URL not set' }, { status: 500 });
  }

  const client = new Client({ token: process.env.QSTASH_TOKEN });

  const result = await client.publishJSON({
    url: `${appUrl}/api/push/deliver`,
    delay: delaySec,
    body: {
      subscription,
      reminderId: reminder.id,
      task: reminder.task,
      escalationLevel: 0,
    },
  });

  return NextResponse.json({ ok: true, messageId: result.messageId });
}
