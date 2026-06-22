import { NextRequest, NextResponse } from 'next/server';
import { subscriptions } from '@/lib/subscriptionStore';

export async function POST(req: NextRequest) {
  const { subscription } = await req.json();
  if (!subscription?.endpoint) {
    return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
  }
  subscriptions.set(subscription.endpoint, subscription);
  return NextResponse.json({ ok: true });
}
