'use client';
import { useState, useEffect, useRef } from 'react';
import { Note } from '@/lib/types';
import { NOTE_COLORS } from '@/lib/utils';

interface Props {
  note: Note | null;
  onSave: (patch: Partial<Note> & { title: string }) => void;
  onClose: () => void;
}

export function NoteEditorSheet({ note, onSave, onClose }: Props) {
  const [title, setTitle]   = useState('');
  const [body, setBody]     = useState('');
  const [color, setColor]   = useState<Note['color']>('default');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags]     = useState<string[]>([]);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setBody(note.body);
      setColor(note.color);
      setTags(note.tags);
    } else {
      setTitle(''); setBody(''); setColor('default'); setTags([]);
    }
    setTagInput('');
    setTimeout(() => bodyRef.current?.focus(), 100);
  }, [note]);

  function handleSave() {
    if (!title.trim() && !body.trim()) { onClose(); return; }
    onSave({ title: title.trim() || 'Untitled', body, color, tags });
    onClose();
  }

  function addTag(e: React.KeyboardEvent) {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const t = tagInput.trim().replace(/,/g, '');
      if (!tags.includes(t)) setTags(prev => [...prev, t]);
      setTagInput('');
    }
    if (e.key === 'Backspace' && !tagInput && tags.length) {
      setTags(prev => prev.slice(0, -1));
    }
  }

  const theme = NOTE_COLORS[color];

  return (
    <>
      <div className="sheet-overlay" onClick={handleSave} />
      <div className="sheet" style={{ background: theme.bg }}>
        <div className="sheet-handle" />

        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-2 flex-shrink-0">
          <button
            className="text-[#8888aa] text-[14px] px-3 py-1.5 rounded-xl hover:bg-white/5 transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
          <div className="flex gap-1">
            {(Object.keys(NOTE_COLORS) as Note['color'][]).map(c => (
              <button
                key={c}
                className="w-5 h-5 rounded-full transition-all hover:scale-110"
                style={{
                  background: NOTE_COLORS[c].swatch,
                  outline: color === c ? '2px solid rgba(255,255,255,0.8)' : 'none',
                  outlineOffset: '2px',
                }}
                onClick={() => setColor(c)}
                title={NOTE_COLORS[c].label}
              />
            ))}
          </div>
          <button
            className="text-[#8b5cf6] font-semibold text-[14px] px-3 py-1.5 rounded-xl hover:bg-white/5 transition-colors"
            onClick={handleSave}
          >
            Save
          </button>
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-y-auto px-5 pb-4" style={{ WebkitOverflowScrolling: 'touch' }}>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full bg-transparent border-none outline-none text-[22px] font-bold text-[#f0f0ff] placeholder:text-white/20 mb-3"
            autoFocus
          />

          <textarea
            ref={bodyRef}
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Start writing…"
            className="w-full bg-transparent border-none outline-none text-[15px] text-[#ccccee] placeholder:text-white/20 leading-relaxed resize-none min-h-[180px]"
            onInput={e => {
              const t = e.currentTarget;
              t.style.height = 'auto';
              t.style.height = `${t.scrollHeight}px`;
            }}
          />

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 items-center mt-4 pt-4 border-t border-white/5">
            {tags.map(t => (
              <span key={t} className="tag-chip cursor-pointer" onClick={() => setTags(prev => prev.filter(x => x !== t))}>
                {t} ✕
              </span>
            ))}
            <input
              type="text"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={addTag}
              placeholder={tags.length ? '' : 'Add tag…'}
              className="bg-transparent border-none outline-none text-[12px] text-[#8888aa] flex-1 min-w-[80px] placeholder:text-white/20"
            />
          </div>
        </div>
      </div>
    </>
  );
}
