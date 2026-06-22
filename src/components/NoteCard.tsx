'use client';
import { useState } from 'react';
import { Note } from '@/lib/types';
import { NOTE_COLORS, relativeTime } from '@/lib/utils';

interface Props {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  onColorChange: (id: string, color: Note['color']) => void;
}

export function NoteCard({ note, onEdit, onDelete, onTogglePin, onColorChange }: Props) {
  const [menu, setMenu] = useState(false);
  const theme = NOTE_COLORS[note.color];

  return (
    <div className="note-item group relative">
      <div
        className="rounded-2xl p-4 transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.97]"
        style={{ background: theme.bg, border: `1px solid ${theme.border}` }}
        onClick={() => !menu && onEdit(note)}
      >
        {/* Pin indicator */}
        {note.pinned && (
          <div className="absolute top-3 right-3 text-[#f59e0b] text-sm opacity-80">📌</div>
        )}

        {/* Title */}
        {note.title && (
          <h3 className="text-[15px] font-semibold text-[#f0f0ff] mb-2 leading-tight pr-5 line-clamp-2">
            {note.title}
          </h3>
        )}

        {/* Body preview */}
        {note.body && (
          <p className="text-[13px] text-[#aaaacc] leading-relaxed line-clamp-6 whitespace-pre-line">
            {note.body}
          </p>
        )}

        {/* Tags */}
        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {note.tags.slice(0, 3).map(t => (
              <span key={t} className="tag-chip">{t}</span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5">
          <span className="text-[11px] text-[#666688]">{relativeTime(note.updatedAt)}</span>
          <button
            className="text-[18px] opacity-0 group-hover:opacity-70 hover:!opacity-100 transition-opacity"
            onClick={e => { e.stopPropagation(); setMenu(v => !v); }}
            aria-label="More options"
          >
            ⋯
          </button>
        </div>
      </div>

      {/* Context menu */}
      {menu && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setMenu(false)} />
          <div
            className="absolute right-0 bottom-full mb-1 z-20 rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: '#1e1e32', border: '1px solid rgba(255,255,255,0.1)', minWidth: '180px' }}
          >
            {/* Color swatches */}
            <div className="p-3 border-b border-white/5">
              <div className="text-[10px] text-[#666688] uppercase tracking-wider mb-2">Color</div>
              <div className="flex gap-1.5 flex-wrap">
                {(Object.keys(NOTE_COLORS) as Note['color'][]).map(c => (
                  <button
                    key={c}
                    className="w-5 h-5 rounded-full transition-transform hover:scale-110"
                    style={{
                      background: NOTE_COLORS[c].swatch,
                      outline: note.color === c ? '2px solid #f0f0ff' : 'none',
                      outlineOffset: '2px',
                    }}
                    onClick={e => { e.stopPropagation(); onColorChange(note.id, c); setMenu(false); }}
                    title={NOTE_COLORS[c].label}
                  />
                ))}
              </div>
            </div>
            {/* Actions */}
            {[
              { label: note.pinned ? '📌 Unpin' : '📌 Pin', action: () => { onTogglePin(note.id); setMenu(false); } },
              { label: '✏️ Edit', action: () => { onEdit(note); setMenu(false); } },
              { label: '🗑️ Delete', action: () => { onDelete(note.id); setMenu(false); }, danger: true },
            ].map(item => (
              <button
                key={item.label}
                className={`w-full text-left px-4 py-3 text-[14px] hover:bg-white/5 transition-colors ${item.danger ? 'text-[#ef4444]' : 'text-[#f0f0ff]'}`}
                onClick={e => { e.stopPropagation(); item.action(); }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
