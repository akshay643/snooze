'use client';
import { useState } from 'react';
import { useNotes } from '@/hooks/useNotes';
import { NoteCard } from '@/components/NoteCard';
import { NoteEditorSheet } from '@/components/NoteEditorSheet';
import { ToastProvider, toast } from '@/components/Toast';
import { Note } from '@/lib/types';

export default function NotesPage() {
  const { notes, hydrated, add, update, remove, togglePin } = useNotes();
  const [editing, setEditing]   = useState<Note | null | 'new'>(null);
  const [search, setSearch]     = useState('');

  const filtered = search
    ? notes.filter(n =>
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.body.toLowerCase().includes(search.toLowerCase()) ||
        n.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
      )
    : notes;

  function handleSave(patch: Partial<Note> & { title: string }) {
    if (editing === 'new') {
      add(patch);
      toast('Note saved ✓', 'success');
    } else if (editing) {
      update(editing.id, patch);
      toast('Note updated', 'success');
    }
  }

  function handleDelete(id: string) {
    remove(id);
    toast('Deleted', 'info');
  }

  const pinned    = filtered.filter(n => n.pinned);
  const unpinned  = filtered.filter(n => !n.pinned);

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ paddingTop: 'var(--safe-top, 0px)' }}>
      <ToastProvider />

      {/* Header */}
      <div className="flex-shrink-0 px-5 pt-4 pb-3">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-[26px] font-bold tracking-tight text-[#f0f0ff]">
            Notes <span className="text-[#8b5cf6]">✦</span>
          </h1>
          <span className="text-[13px] text-[#555577] font-medium">
            {notes.length} {notes.length === 1 ? 'note' : 'notes'}
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#555577] text-[16px]">🔍</span>
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search notes…"
            className="w-full bg-[rgba(255,255,255,0.05)] border border-white/6 rounded-2xl pl-10 pr-4 py-3 text-[14px] text-[#f0f0ff] outline-none placeholder:text-[#555577] focus:border-[#8b5cf6] transition-colors"
          />
        </div>
      </div>

      {/* Notes grid */}
      <div className="flex-1 scroll-y px-4 pb-24">
        {!hydrated && (
          <div className="flex items-center justify-center h-40">
            <div className="text-[#555577] text-[14px]">Loading…</div>
          </div>
        )}

        {hydrated && notes.length === 0 && (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center gap-4">
            <div className="text-[64px] opacity-30">📝</div>
            <h2 className="text-[20px] font-bold text-[#f0f0ff]">No notes yet</h2>
            <p className="text-[14px] text-[#555577] leading-relaxed max-w-[240px]">
              Tap <strong className="text-[#8b5cf6]">+</strong> to capture your first thought.
            </p>
          </div>
        )}

        {hydrated && search && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 gap-2">
            <div className="text-[32px] opacity-30">🔍</div>
            <p className="text-[14px] text-[#555577]">No results for "{search}"</p>
          </div>
        )}

        {/* Pinned section */}
        {pinned.length > 0 && (
          <>
            <p className="text-[10px] font-bold text-[#555577] uppercase tracking-widest mb-2 mt-1">Pinned</p>
            <div className="notes-grid">
              {pinned.map(n => (
                <NoteCard
                  key={n.id}
                  note={n}
                  onEdit={note => setEditing(note)}
                  onDelete={handleDelete}
                  onTogglePin={togglePin}
                  onColorChange={(id, color) => update(id, { color })}
                />
              ))}
            </div>
            {unpinned.length > 0 && (
              <p className="text-[10px] font-bold text-[#555577] uppercase tracking-widest mb-2 mt-4">Others</p>
            )}
          </>
        )}

        {/* Unpinned section */}
        <div className="notes-grid">
          {unpinned.map(n => (
            <NoteCard
              key={n.id}
              note={n}
              onEdit={note => setEditing(note)}
              onDelete={handleDelete}
              onTogglePin={togglePin}
              onColorChange={(id, color) => update(id, { color })}
            />
          ))}
        </div>
      </div>

      {/* FAB */}
      <button className="fab" onClick={() => setEditing('new')} aria-label="New note">
        ✦
      </button>

      {/* Editor sheet */}
      {editing !== null && (
        <NoteEditorSheet
          note={editing === 'new' ? null : editing}
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
