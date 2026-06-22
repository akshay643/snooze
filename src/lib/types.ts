export type NoteColor =
  | 'default' | 'purple' | 'blue' | 'teal'
  | 'green'   | 'amber'  | 'rose' | 'slate';

export interface Note {
  id: string;
  title: string;
  body: string;
  color: NoteColor;
  pinned: boolean;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export type VerifyType = 'keyword' | 'photo' | 'question';

export interface Reminder {
  id: string;
  task: string;
  dueTime: number;
  verificationType: VerifyType;
  verificationData: string;
  escalationLevel: number;
  completed: boolean;
  completedAt: number | null;
  createdAt: number;
  snoozedCount: number;
}

export interface ScheduledPush {
  id: string;
  subscription: PushSubscriptionJSON;
  task: string;
  dueTime: number;
  escalationLevel: number;
}
