'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ReorderButtons } from '@/components/ui/reorder-buttons';
import { useSortableList } from '@/lib/hooks/use-sortable-list';
import { createClient } from '@/lib/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/lib/supabase/database.types';

type LegalDoc = Tables<'legal_documents'>;

const emptyForm = { title: '', body_text: '', require_checkbox: true, sort_order: 0, is_active: false };

export function LegalDocsConfig() {
  const supabase = createClient();
  const { items: docs, loading, error: loadError, reload, moveItem, canMoveUp, canMoveDown, nextSortOrder } = useSortableList<LegalDoc>({ tableName: 'legal_documents' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function startNew() {
    setEditingId(null);
    setForm({ ...emptyForm, sort_order: nextSortOrder() });
    setMessage(null); setError(null);
  }

  function startEdit(doc: LegalDoc) {
    setEditingId(doc.id);
    setForm({ title: doc.title, body_text: doc.body_text, require_checkbox: doc.require_checkbox, sort_order: doc.sort_order, is_active: doc.is_active });
    setMessage(null); setError(null);
  }

  async function save() {
    if (!form.title.trim() || !form.body_text.trim()) { setError('Title and body text are required.'); return; }
    setSaving(true); setError(null);
    const payload: TablesInsert<'legal_documents'> | TablesUpdate<'legal_documents'> = {
      title: form.title.trim(),
      body_text: form.body_text.trim(),
      require_checkbox: form.require_checkbox,
      sort_order: Number(form.sort_order) || 0,
      is_active: form.is_active,
      updated_at: new Date().toISOString(),
    };
    const result = editingId
      ? await supabase.from('legal_documents').update(payload).eq('id', editingId)
      : await supabase.from('legal_documents').insert(payload as TablesInsert<'legal_documents'>);
    if (result.error) setError(result.error.message);
    else { setMessage('Document saved.'); setForm(emptyForm); setEditingId(null); await reload(); }
    setSaving(false);
  }

  async function deleteDoc(doc: LegalDoc) {
    if (!confirm(`Delete "${doc.title}"?`)) return;
    setSaving(true);
    const { error: deleteError } = await supabase.from('legal_documents').delete().eq('id', doc.id);
    if (deleteError) setError(deleteError.message);
    else { setMessage('Document deleted.'); await reload(); }
    setSaving(false);
  }

  const displayError = error || loadError;

  return (
    <Card className="p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-wfd-charcoal">Legal Documents</h3>
          <p className="text-sm text-gray-500">Manage the legal agreements students sign during onboarding.</p>
        </div>
        <Button type="button" size="sm" variant="secondary" onClick={startNew}>New Document</Button>
      </div>

      {(message || displayError) && (
        <div className={`mb-4 rounded-lg border p-3 text-sm font-medium ${displayError ? 'border-wfd-crimson/30 bg-wfd-crimson/10 text-wfd-crimson' : 'border-wfd-sage/30 bg-wfd-sage/10 text-wfd-sage'}`}>
          {displayError ?? message}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {docs.map((doc) => (
              <div key={doc.id} className="rounded-lg border border-gray-200 p-3">
                <div className="flex items-center justify-between gap-2">
                  <ReorderButtons
                    onMoveUp={() => moveItem(doc, -1)}
                    onMoveDown={() => moveItem(doc, 1)}
                    canMoveUp={canMoveUp(doc)}
                    canMoveDown={canMoveDown(doc)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{doc.title}</p>
                    <p className="text-xs text-gray-500">Order {doc.sort_order} | {doc.require_checkbox ? 'Checkbox required' : 'No checkbox'}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${doc.is_active ? 'bg-wfd-sage/15 text-wfd-sage' : 'bg-gray-100 text-gray-500'}`}>
                      {doc.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <Button type="button" size="sm" variant="secondary" onClick={() => startEdit(doc)}>Edit</Button>
                    <Button type="button" size="sm" variant="danger" onClick={() => deleteDoc(doc)}>Del</Button>
                  </div>
                </div>
              </div>
            ))}
            {docs.length === 0 && <p className="text-sm text-gray-500">No legal documents yet.</p>}
          </div>

          <div className="rounded-lg border border-gray-200 p-4">
            <h4 className="mb-3 text-sm font-semibold text-wfd-charcoal">{editingId ? 'Edit Document' : 'Add Document'}</h4>
            <div className="space-y-3">
              <Input label="Title" value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} />
              <label className="block text-sm font-medium text-gray-700">
                Body Text
                <textarea value={form.body_text} onChange={(e) => setForm(f => ({ ...f, body_text: e.target.value }))} className="mt-1 min-h-48 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-wfd-crimson" />
              </label>
              <div className="grid gap-3 sm:grid-cols-3">
                <Input label="Sort Order" type="number" value={form.sort_order} onChange={(e) => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))} />
                <label className="flex items-end gap-2 text-sm font-medium text-gray-700">
                  <input type="checkbox" checked={form.require_checkbox} onChange={(e) => setForm(f => ({ ...f, require_checkbox: e.target.checked }))} className="mb-2 h-4 w-4 rounded border-gray-300 text-wfd-crimson" />
                  <span className="pb-1.5">Checkbox required</span>
                </label>
                <label className="flex items-end gap-2 text-sm font-medium text-gray-700">
                  <input type="checkbox" checked={form.is_active} onChange={(e) => setForm(f => ({ ...f, is_active: e.target.checked }))} className="mb-2 h-4 w-4 rounded border-gray-300 text-wfd-crimson" />
                  <span className="pb-1.5">Active</span>
                </label>
              </div>
              <Button type="button" onClick={save} loading={saving}>Save Document</Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
