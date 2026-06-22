'use client';
import { useState, useEffect, useCallback } from 'react';
import { Note, NoteColor } from '@/lib/types';
import { uid } from '@/lib/utils';

const KEY = 'na-notes-v1';

function load(): Note[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
  catch { return []; }
}

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setNotes(load());
    setHydrated(true);
  }, []);

  const persist = useCallback((next: Note[]) => {
    setNotes(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  }, []);

  const add = useCallback((partial: { title: string; body?: string; color?: NoteColor; tags?: string[] }): Note => {
    const note: Note = {
      id: uid(),
      title: partial.title,
      body: partial.body ?? '',
      color: partial.color ?? 'default',
      pinned: false,
      tags: partial.tags ?? [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setNotes(prev => {
      const next = [note, ...prev];
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
    return note;
  }, []);

  const update = useCallback((id: string, patch: Partial<Note>) => {
    setNotes(prev => {
      const next = prev.map(n => n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n);
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setNotes(prev => {
      const next = prev.filter(n => n.id !== id);
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const togglePin = useCallback((id: string) => {
    setNotes(prev => {
      const next = prev.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n);
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const sorted = [...notes].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.updatedAt - a.updatedAt;
  });

  return { notes: sorted, hydrated, add, update, remove, togglePin };
}
