// Module-level singletons — survive across API requests in the same process.
// For production deploy, replace with a database (Vercel KV, Upstash, etc.)

export const subscriptions = new Map<string, PushSubscriptionJSON>();

interface ScheduledEntry {
  id: string;
  task: string;
  dueTime: number;
  escalationLevel: number;
  subscription: PushSubscriptionJSON;
  timerId: ReturnType<typeof setTimeout>;
}

export const scheduledPushes = new Map<string, ScheduledEntry>();
