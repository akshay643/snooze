'use client';
import { useState } from 'react';
import { useNotes } from '@/hooks/useNotes';
import { NoteCard } from '@/components/NoteCard';
import { NoteEditorSheet } from '@/components/NoteEditorSheet';
import { ToastProvider, toast } from '@/components/Toast';
import { Note } from '@/lib/types';

export default function NotesPage() {
  const { notes, hydrated, add, update, remove, togglePin } = useNotes();
  const [editing, setEditing] = useState<Note | null | 'new'>(null);
  const [search, setSearch]   = useState('');

  const filtered = search
    ? notes.filter(n =>
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.body.toLowerCase().includes(search.toLowerCase()) ||
        n.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
      )
    : notes;

  const pinned   = filtered.filter(n => n.pinned);
  const unpinned = filtered.filter(n => !n.pinned);

  function handleSave(patch: Partial<Note> & { title: string }) {
    if (editing === 'new') { add(patch);               toast('Saved ✓', 'success'); }
    else if (editing)      { update(editing.id, patch); toast('Updated', 'success'); }
  }

  return (
    /* Full-height flex column filling the <main> */
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <ToastProvider />

      {/* ── Header ── */}
      <div style={{ flexShrink: 0, padding: 'calc(var(--safe-top) + 18px) 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px', color: '#f0f0ff', lineHeight: 1 }}>
              Notes
              <span style={{ color: '#8b5cf6', marginLeft: '6px' }}>✦</span>
            </h1>
            <p style={{ fontSize: '12px', color: '#44445a', marginTop: '3px' }}>
              {hydrated ? `${notes.length} note${notes.length !== 1 ? 's' : ''}` : '…'}
            </p>
          </div>
          <button
            onClick={() => setEditing('new')}
            style={{
              width: '40px', height: '40px', borderRadius: '50%',
              background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)',
              border: 'none', color: '#fff', fontSize: '22px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(139,92,246,0.4)',
            }}
            aria-label="New note"
          >
            +
          </button>
        </div>

        {/* Search bar */}
        <div style={{ position: 'relative', marginBottom: '14px' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '15px', color: '#44445a' }}>
            🔍
          </span>
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search notes…"
            style={{
              width: '100%', padding: '11px 14px 11px 36px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '14px', color: '#f0f0ff', fontSize: '15px',
              outline: 'none', WebkitAppearance: 'none', appearance: 'none',
            }}
          />
        </div>
      </div>

      {/* ── Scrollable grid ── */}
      <div
        className="scroll-y"
        style={{
          flex: 1,
          minHeight: 0,
          padding: '0 14px',
          paddingBottom: 'calc(var(--nav-h) + var(--safe-bot) + 80px)',
        }}
      >
        {/* Loading skeleton */}
        {!hydrated && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '4px' }}>
            {[120, 80, 150].map((h, i) => (
              <div key={i} style={{ height: `${h}px`, borderRadius: '16px', background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.5s ease-in-out infinite' }} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {hydrated && notes.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '55vh', gap: '14px', textAlign: 'center' }}>
            <div style={{ fontSize: '64px', opacity: 0.2 }}>📝</div>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#f0f0ff', marginBottom: '6px' }}>No notes yet</h2>
              <p style={{ fontSize: '14px', color: '#44445a', lineHeight: 1.5 }}>
                Tap <strong style={{ color: '#8b5cf6' }}>+</strong> to capture your first thought.
              </p>
            </div>
          </div>
        )}

        {/* Search empty */}
        {hydrated && search && filtered.length === 0 && (
          <div style={{ textAlign: 'center', paddingTop: '60px', color: '#44445a', fontSize: '14px' }}>
            No results for "{search}"
          </div>
        )}

        {/* Pinned */}
        {pinned.length > 0 && (
          <>
            <p style={{ fontSize: '10px', fontWeight: 700, color: '#44445a', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '8px', marginTop: '4px' }}>
              Pinned
            </p>
            <div className="notes-grid">
              {pinned.map(n => (
                <NoteCard key={n.id} note={n}
                  onEdit={setEditing}
                  onDelete={id => { remove(id); toast('Deleted', 'info'); }}
                  onTogglePin={togglePin}
                  onColorChange={(id, color) => update(id, { color })}
                />
              ))}
            </div>
            {unpinned.length > 0 && (
              <p style={{ fontSize: '10px', fontWeight: 700, color: '#44445a', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '8px', marginTop: '16px' }}>
                Others
              </p>
            )}
          </>
        )}

        {/* Unpinned */}
        <div className="notes-grid">
          {unpinned.map(n => (
            <NoteCard key={n.id} note={n}
              onEdit={setEditing}
              onDelete={id => { remove(id); toast('Deleted', 'info'); }}
              onTogglePin={togglePin}
              onColorChange={(id, color) => update(id, { color })}
            />
          ))}
        </div>
      </div>

      {/* FAB — fixed, positioned above nav */}
      <button className="fab" onClick={() => setEditing('new')} aria-label="New note">✦</button>

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
