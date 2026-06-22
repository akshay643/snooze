'use client';
import { useState, useRef } from 'react';
import { Reminder } from '@/lib/types';
import { STORM_LEVELS } from '@/lib/utils';

interface Props {
  reminder: Reminder;
  onComplete: (id: string) => void;
  onSnooze: (id: string) => void;
  onClose: () => void;
}

export function VerifySheet({ reminder: r, onComplete, onSnooze, onClose }: Props) {
  const [keyword, setKeyword]   = useState('');
  const [answer, setAnswer]     = useState('');
  const [photo, setPhoto]       = useState<string | null>(null);
  const [error, setError]       = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const lvl = Math.min(r.escalationLevel, 3);
  const cfg = STORM_LEVELS[lvl];

  const banners = [
    'Prove you did it to clear this storm.',
    'Still here? Show me proof.',
    'This is getting serious. Do it NOW.',
    'FINAL WARNING. Complete immediately.',
  ];

  function verify() {
    setError('');
    if (r.verificationType === 'keyword') {
      const expected = r.verificationData?.trim().toLowerCase();
      if (expected && keyword.trim().toLowerCase() !== expected) {
        setError(`Type exactly: "${r.verificationData}"`);
        return;
      }
      if (!keyword.trim()) { setError('Type the magic word'); return; }
    }
    if (r.verificationType === 'photo' && !photo) {
      setError('Take a photo first 📸');
      return;
    }
    if (r.verificationType === 'question' && !answer.trim()) {
      setError('Answer the question first');
      return;
    }
    onComplete(r.id);
  }

  return (
    <>
      <div className="sheet-overlay" onClick={onClose} />
      <div className="sheet">
        <div className="sheet-handle" />

        {/* Hero */}
        <div className="flex flex-col items-center px-6 pt-4 pb-6 text-center flex-shrink-0">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-4"
            style={{ background: cfg.bg, border: `2px solid ${cfg.color}55` }}
          >
            {cfg.emoji}
          </div>
          <h2 className="text-[20px] font-bold text-[#f0f0ff] mb-1 leading-tight">{r.task}</h2>
          <p className="text-[13px]" style={{ color: cfg.color }}>{banners[lvl]}</p>
        </div>

        {/* Verification input */}
        <div className="flex-1 overflow-y-auto px-5 pb-6 space-y-4">
          {r.verificationType === 'keyword' && (
            <div>
              <label className="block text-[11px] font-bold text-[#8888aa] uppercase tracking-wider mb-2">
                Type the magic word
              </label>
              <input
                type="text"
                className="field-input text-[17px]"
                placeholder={r.verificationData ? `Type: "${r.verificationData}"` : 'Type to confirm…'}
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && verify()}
                autoFocus
                autoCapitalize="off"
                autoCorrect="off"
              />
            </div>
          )}

          {r.verificationType === 'photo' && (
            <div>
              <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden"
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const reader = new FileReader();
                  reader.onload = ev => setPhoto(ev.target?.result as string);
                  reader.readAsDataURL(f);
                }}
              />
              {photo
                ? <img src={photo} alt="proof" className="w-full rounded-2xl max-h-[220px] object-cover cursor-pointer" onClick={() => fileRef.current?.click()} />
                : (
                  <button
                    className="w-full flex flex-col items-center gap-3 py-10 rounded-2xl border-2 border-dashed border-white/10 hover:border-white/20 transition-colors"
                    onClick={() => fileRef.current?.click()}
                  >
                    <span className="text-5xl">📷</span>
                    <span className="text-[13px] text-[#8888aa]">Tap to take a photo as proof</span>
                  </button>
                )}
            </div>
          )}

          {r.verificationType === 'question' && (
            <div>
              <p className="text-[15px] text-[#aaaacc] mb-3 leading-relaxed font-medium">
                {r.verificationData || 'Can you confirm this is done?'}
              </p>
              <input
                type="text"
                className="field-input text-[16px]"
                placeholder="Your answer…"
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && verify()}
                autoFocus
              />
            </div>
          )}

          {/* Error */}
          {error && <p className="text-[13px] text-[#ef4444] font-medium">{error}</p>}

          {/* Actions */}
          <button
            onClick={verify}
            className="w-full py-4 rounded-2xl font-bold text-[16px] text-white transition-all active:scale-[0.97]"
            style={{ background: `linear-gradient(135deg, ${cfg.color}, ${cfg.color}cc)`, boxShadow: `0 8px 24px ${cfg.color}44` }}
          >
            ✓ Mark Complete
          </button>
          <button
            onClick={() => onSnooze(r.id)}
            className="w-full py-3.5 rounded-2xl font-semibold text-[15px] text-[#aaaacc] bg-white/5 hover:bg-white/8 transition-colors"
          >
            💤 Snooze 5 min
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 text-[14px] text-[#666688] hover:text-[#8888aa] transition-colors"
          >
            Not yet
          </button>
        </div>
      </div>
    </>
  );
}
