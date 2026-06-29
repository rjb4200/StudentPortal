'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface AdminNote {
  id: string;
  note_text: string;
  priority: 'normal' | 'high_accessibility';
  created_at: string;
}

interface AdminNotesSectionProps {
  notes: AdminNote[];
  studentId: string;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function AdminNotesSection({ notes: initialNotes, studentId }: AdminNotesSectionProps) {
  const [notes, setNotes] = useState<AdminNote[]>(initialNotes);
  const [text, setText] = useState('');
  const [priority, setPriority] = useState<'normal' | 'high_accessibility'>('normal');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function addNote() {
    if (!text.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/students/${studentId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note_text: text.trim(), priority }),
      });
      if (res.ok) {
        const newNote = await res.json();
        setNotes((prev) => [newNote, ...prev]);
        setText('');
      }
    } finally {
      setSaving(false);
    }
  }

  async function deleteNote(noteId: string) {
    if (!confirm('Delete this note?')) return;
    setDeleting(noteId);
    try {
      const res = await fetch(`/api/admin/students/${studentId}/notes?noteId=${noteId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setNotes((prev) => prev.filter((n) => n.id !== noteId));
      }
    } finally {
      setDeleting(null);
    }
  }

  return (
    <>
      <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200 print:hidden">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Add a note..."
              rows={2}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-wfd-crimson focus:border-transparent resize-none"
            />
          </div>
          <div className="flex flex-col gap-2">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'normal' | 'high_accessibility')}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white"
            >
              <option value="normal">Normal</option>
              <option value="high_accessibility">High Priority</option>
            </select>
            <Button size="sm" onClick={addNote} loading={saving} disabled={!text.trim()}>
              Add Note
            </Button>
          </div>
        </div>
      </div>

      {notes.length === 0 ? (
        <p className="text-sm text-gray-400 py-2">No admin notes</p>
      ) : (
        <div className="space-y-2">
          {notes.map((note) => (
            <div key={note.id} className="flex items-start justify-between gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm hover:border-gray-200 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <Badge variant={note.priority === 'high_accessibility' ? 'orange' : 'blue'}>
                    {note.priority === 'high_accessibility' ? 'High' : 'Normal'}
                  </Badge>
                  <span className="text-xs text-gray-400">{formatDate(note.created_at)}</span>
                </div>
                <p className="text-wfd-charcoal whitespace-pre-wrap leading-relaxed">{note.note_text}</p>
              </div>
              <button
                onClick={() => deleteNote(note.id)}
                disabled={deleting === note.id}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 print:hidden font-medium"
              >
                {deleting === note.id ? '...' : 'Delete'}
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
