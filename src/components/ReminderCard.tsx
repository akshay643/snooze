'use client';
import { useEffect, useState } from 'react';
import { Reminder } from '@/lib/types';
import { formatCountdown, STORM_LEVELS } from '@/lib/utils';

interface Props {
  reminder: Reminder;
  onTap: (r: Reminder) => void;
  onDelete: (id: string) => void;
}

export function ReminderCard({ reminder: r, onTap, onDelete }: Props) {
  const [countdown, setCountdown] = useState(() => formatCountdown(r.dueTime - Date.now()));
  const lvl = Math.min(r.escalationLevel, 3);
  const cfg = STORM_LEVELS[lvl];

  useEffect(() => {
    if (r.completed) return;
    const tick = setInterval(() => setCountdown(formatCountdown(r.dueTime - Date.now())), 1000);
    return () => clearInterval(tick);
  }, [r.dueTime, r.completed]);

  return (
    <div
      className={`relative rounded-2xl p-4 mb-3 border cursor-pointer transition-all duration-150 active:scale-[0.98] ${
        lvl === 3 && !r.completed ? 'storm-critical' : ''
      } ${r.completed ? 'opacity-40' : ''}`}
      style={{ background: r.completed ? '#16162a' : cfg.bg, borderColor: r.completed ? 'rgba(255,255,255,0.06)' : cfg.color + '33' }}
      onClick={() => !r.completed && onTap(r)}
    >
      <div className="flex items-start gap-3">
        {/* Level emoji */}
        <div
          className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-xl"
          style={{ background: r.completed ? 'rgba(255,255,255,0.06)' : cfg.bg, border: `1.5px solid ${r.completed ? 'rgba(255,255,255,0.1)' : cfg.color + '55'}` }}
        >
          {r.completed ? '✅' : cfg.emoji}
        </div>

        <div className="flex-1 min-w-0">
          <p className={`text-[15px] font-semibold text-[#f0f0ff] leading-snug ${r.completed ? 'line-through' : ''}`}>
            {r.task}
          </p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {/* Level badge */}
            {!r.completed && (
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}44` }}
              >
                {cfg.label}
              </span>
            )}
            {/* Countdown */}
            <span className={`text-[12px] font-mono font-medium ${countdown.overdue && !r.completed ? 'text-[#ef4444]' : 'text-[#8888aa]'}`}>
              {r.completed
                ? `✓ ${new Date(r.completedAt!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : countdown.overdue ? `⚠ ${countdown.text}` : `⏱ in ${countdown.text}`}
            </span>
            {/* Verify type */}
            <span className="text-[11px] text-[#555577] ml-auto">
              { { keyword: '⌨️', photo: '📸', question: '❓' }[r.verificationType] }
            </span>
          </div>
          {/* Snoozed count */}
          {r.snoozedCount > 0 && !r.completed && (
            <p className="text-[11px] text-[#555577] mt-1">💤 snoozed {r.snoozedCount}×</p>
          )}
        </div>

        <button
          className="text-[16px] text-[#555577] hover:text-[#ef4444] transition-colors pl-2 flex-shrink-0"
          onClick={e => { e.stopPropagation(); onDelete(r.id); }}
          aria-label="Delete"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
