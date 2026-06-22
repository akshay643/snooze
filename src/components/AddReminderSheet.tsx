'use client';
import { useState } from 'react';
import { VerifyType } from '@/lib/types';

interface Props {
  onAdd: (data: { task: string; dueTime: number; verificationType: VerifyType; verificationData: string }) => void;
  onClose: () => void;
}

const VERIFY_TYPES: { value: VerifyType; icon: string; label: string }[] = [
  { value: 'keyword',  icon: '⌨️', label: 'Keyword'  },
  { value: 'photo',    icon: '📸', label: 'Photo'    },
  { value: 'question', icon: '❓', label: 'Question' },
];

function defaultTime() {
  const d = new Date(Date.now() + 30 * 60000);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export function AddReminderSheet({ onAdd, onClose }: Props) {
  const [task, setTask]   = useState('');
  const [time, setTime]   = useState(defaultTime);
  const [type, setType]   = useState<VerifyType>('keyword');
  const [data, setData]   = useState('');

  const verifyLabel = {
    keyword:  'Magic word to confirm done',
    photo:    null,
    question: 'Question I must answer',
  }[type];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!task.trim() || !time) return;
    const dueTime = new Date(time).getTime();
    if (isNaN(dueTime)) return;
    onAdd({ task: task.trim(), dueTime, verificationType: type, verificationData: data.trim() });
    onClose();
  }

  return (
    <>
      <div className="sheet-overlay" onClick={onClose} />
      <div className="sheet">
        <div className="sheet-handle" />

        <div className="flex items-center justify-between px-5 py-3 flex-shrink-0">
          <button className="text-[#8888aa] text-sm" onClick={onClose}>Cancel</button>
          <h2 className="text-[16px] font-bold">New Storm ⛈️</h2>
          <div className="w-14" />
        </div>

        <form className="flex-1 overflow-y-auto px-5 pb-6 space-y-5" onSubmit={handleSubmit}>
          {/* Task */}
          <div>
            <label className="block text-[11px] font-bold text-[#8888aa] uppercase tracking-wider mb-2">
              What do you need to do?
            </label>
            <textarea
              className="field-input"
              rows={3}
              placeholder="e.g. Call the dentist, Submit the report…"
              value={task}
              onChange={e => setTask(e.target.value)}
              required
              autoFocus
            />
          </div>

          {/* Time */}
          <div>
            <label className="block text-[11px] font-bold text-[#8888aa] uppercase tracking-wider mb-2">
              When should I start bugging you?
            </label>
            <input
              type="datetime-local"
              className="field-input"
              value={time}
              onChange={e => setTime(e.target.value)}
              required
            />
          </div>

          {/* Verification type */}
          <div>
            <label className="block text-[11px] font-bold text-[#8888aa] uppercase tracking-wider mb-2">
              Proof of completion
            </label>
            <div className="grid grid-cols-3 gap-2">
              {VERIFY_TYPES.map(v => (
                <button
                  key={v.value}
                  type="button"
                  onClick={() => setType(v.value)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all ${
                    type === v.value
                      ? 'border-[#8b5cf6] bg-[rgba(139,92,246,0.12)] text-[#a78bfa]'
                      : 'border-white/8 bg-white/3 text-[#8888aa]'
                  }`}
                >
                  <span className="text-2xl">{v.icon}</span>
                  <span className="text-[11px] font-semibold">{v.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Verification data */}
          {verifyLabel && (
            <div>
              <label className="block text-[11px] font-bold text-[#8888aa] uppercase tracking-wider mb-2">
                {verifyLabel}
              </label>
              <input
                type="text"
                className="field-input"
                placeholder={type === 'keyword' ? 'e.g. DONE or SENT or CALLED' : 'e.g. Where did you file it?'}
                value={data}
                onChange={e => setData(e.target.value)}
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full py-4 rounded-2xl font-bold text-[16px] text-white transition-all active:scale-[0.97]"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', boxShadow: '0 8px 24px rgba(139,92,246,0.35)' }}
          >
            ⚡ Set the Storm
          </button>
        </form>
      </div>
    </>
  );
}
