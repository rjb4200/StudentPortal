'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/lib/supabase/database.types';

type ResCategory = Tables<'resource_categories'>;
type ResDoc = Tables<'resource_documents'>;

const emptyCatForm = { name: '', sort_order: 0 };
const emptyDocForm = { name: '', file_url: '', file_type: 'PDF', sort_order: 0, is_active: true };

export function ResourceLibraryConfig() {
  const supabase = createClient();
  const [categories, setCategories] = useState<ResCategory[]>([]);
  const [documents, setDocuments] = useState<ResDoc[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [catEditingId, setCatEditingId] = useState<string | null>(null);
  const [docEditingId, setDocEditingId] = useState<string | null>(null);
  const [catForm, setCatForm] = useState(emptyCatForm);
  const [docForm, setDocForm] = useState(emptyDocForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    const [{ data: catData }, { data: docData }] = await Promise.all([
      supabase.from('resource_categories').select('*').order('sort_order'),
      supabase.from('resource_documents').select('*').order('sort_order'),
    ]);
    setCategories(catData ?? []);
    setDocuments(docData ?? []);
    setSelectedCatId(prev => prev ?? catData?.[0]?.id ?? null);
    setLoading(false);
  }

  const selectedDocs = documents.filter(d => d.category_id === selectedCatId).sort((a, b) => a.sort_order - b.sort_order);

  function startNewCat() { setCatEditingId(null); setCatForm({ ...emptyCatForm, sort_order: (categories.length + 1) * 10 }); setMessage(null); setError(null); }
  function startEditCat(cat: ResCategory) { setCatEditingId(cat.id); setCatForm({ name: cat.name, sort_order: cat.sort_order }); setMessage(null); setError(null); }
  function startNewDoc() { setDocEditingId(null); setDocForm({ ...emptyDocForm, sort_order: (selectedDocs.length + 1) * 10 }); setMessage(null); setError(null); }
  function startEditDoc(doc: ResDoc) { setDocEditingId(doc.id); setDocForm({ name: doc.name, file_url: doc.file_url, file_type: doc.file_type, sort_order: doc.sort_order, is_active: doc.is_active }); setMessage(null); setError(null); }

  async function saveCat() {
    if (!catForm.name.trim()) { setError('Category name is required.'); return; }
    setSaving(true); setError(null);
    const payload: TablesInsert<'resource_categories'> | TablesUpdate<'resource_categories'> = { name: catForm.name.trim(), sort_order: Number(catForm.sort_order) || 0, updated_at: new Date().toISOString() };
    const result = catEditingId
      ? await supabase.from('resource_categories').update(payload).eq('id', catEditingId)
      : await supabase.from('resource_categories').insert(payload as TablesInsert<'resource_categories'>).select('id').single();
    if (result.error) setError(result.error.message);
    else { setMessage('Category saved.'); setCatForm(emptyCatForm); setCatEditingId(null); if (!catEditingId && 'data' in result && result.data) setSelectedCatId(result.data.id); await loadAll(); }
    setSaving(false);
  }

  async function deleteCat(cat: ResCategory) {
    if (!confirm(`Delete category "${cat.name}" and all its documents?`)) return;
    setSaving(true);
    const { error: deleteError } = await supabase.from('resource_categories').delete().eq('id', cat.id);
    if (deleteError) setError(deleteError.message);
    else { setMessage('Category deleted.'); setSelectedCatId(null); await loadAll(); }
    setSaving(false);
  }

  async function saveDoc() {
    if (!selectedCatId) { setError('Select a category first.'); return; }
    if (!docForm.name.trim() || !docForm.file_url.trim()) { setError('Document name and file URL are required.'); return; }
    setSaving(true); setError(null);
    const payload: TablesInsert<'resource_documents'> | TablesUpdate<'resource_documents'> = {
      category_id: selectedCatId, name: docForm.name.trim(), file_url: docForm.file_url.trim(),
      file_type: docForm.file_type, sort_order: Number(docForm.sort_order) || 0,
      is_active: docForm.is_active, updated_at: new Date().toISOString(),
    };
    const result = docEditingId
      ? await supabase.from('resource_documents').update(payload).eq('id', docEditingId)
      : await supabase.from('resource_documents').insert(payload as TablesInsert<'resource_documents'>);
    if (result.error) setError(result.error.message);
    else { setMessage('Document saved.'); setDocForm(emptyDocForm); setDocEditingId(null); await loadAll(); }
    setSaving(false);
  }

  async function deleteDoc(doc: ResDoc) {
    if (!confirm(`Delete document "${doc.name}"?`)) return;
    setSaving(true);
    const { error: deleteError } = await supabase.from('resource_documents').delete().eq('id', doc.id);
    if (deleteError) setError(deleteError.message);
    else { setMessage('Document deleted.'); await loadAll(); }
    setSaving(false);
  }

  return (
    <Card className="p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-wfd-charcoal">Resource Library</h3>
          <p className="text-sm text-gray-500">Manage onboarding resource categories and downloadable documents.</p>
        </div>
        <Button type="button" size="sm" variant="secondary" onClick={startNewCat}>New Category</Button>
      </div>

      {(message || error) && (
        <div className={`mb-4 rounded-lg border p-3 text-sm font-medium ${error ? 'border-red-200 bg-red-50 text-red-800' : 'border-green-200 bg-green-50 text-green-800'}`}>
          {error ?? message}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            {categories.map(cat => (
              <button key={cat.id} type="button" onClick={() => setSelectedCatId(cat.id)}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${selectedCatId === cat.id ? 'border-wfd-crimson bg-red-50 text-wfd-crimson' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'}`}>
                {cat.name}
              </button>
            ))}
            {categories.length === 0 && <p className="text-sm text-gray-500">No categories yet.</p>}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-gray-200 p-3">
              <h4 className="mb-2 text-sm font-semibold text-wfd-charcoal">{catEditingId ? 'Edit Category' : 'Add Category'}</h4>
              <div className="flex gap-2">
                <Input label="" placeholder="Category name" value={catForm.name} onChange={(e) => setCatForm(f => ({ ...f, name: e.target.value }))} />
                <Input label="" type="number" placeholder="Order" value={catForm.sort_order} onChange={(e) => setCatForm(f => ({ ...f, sort_order: Number(e.target.value) }))} className="w-20" />
                <Button type="button" size="sm" onClick={saveCat} loading={saving}>Save</Button>
                {selectedCatId && <Button type="button" size="sm" variant="danger" onClick={() => { const c = categories.find(x => x.id === selectedCatId); if (c) deleteCat(c); }}>Del Cat</Button>}
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 p-3">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-wfd-charcoal">Documents{selectedCatId ? ` - ${categories.find(c => c.id === selectedCatId)?.name ?? ''}` : ''}</h4>
                {selectedCatId && <Button type="button" size="sm" variant="secondary" onClick={startNewDoc}>New Doc</Button>}
              </div>

              {selectedDocs.map(doc => (
                <div key={doc.id} className="mb-2 rounded border border-gray-100 p-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{doc.name}</p>
                      <p className="text-xs text-gray-500">{doc.file_type} | Order {doc.sort_order} | {doc.file_url.substring(0, 40)}...</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${doc.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{doc.is_active ? 'On' : 'Off'}</span>
                      <Button type="button" size="sm" variant="secondary" onClick={() => startEditDoc(doc)}>Edit</Button>
                      <Button type="button" size="sm" variant="danger" onClick={() => deleteDoc(doc)}>Del</Button>
                    </div>
                  </div>
                </div>
              ))}
              {selectedDocs.length === 0 && selectedCatId && <p className="text-sm text-gray-500">No documents in this category.</p>}
            </div>
          </div>

          {selectedCatId && (
            <div className="mt-4 rounded-lg bg-gray-50 p-3">
              <h5 className="mb-2 text-sm font-semibold text-wfd-charcoal">{docEditingId ? 'Edit Document' : 'Add Document'}</h5>
              <div className="grid gap-2 sm:grid-cols-2">
                <Input label="Name" value={docForm.name} onChange={(e) => setDocForm(f => ({ ...f, name: e.target.value }))} />
                <Input label="File URL" value={docForm.file_url} onChange={(e) => setDocForm(f => ({ ...f, file_url: e.target.value }))} />
                <Input label="File Type" value={docForm.file_type} onChange={(e) => setDocForm(f => ({ ...f, file_type: e.target.value }))} />
                <Input label="Sort Order" type="number" value={docForm.sort_order} onChange={(e) => setDocForm(f => ({ ...f, sort_order: Number(e.target.value) }))} />
                <label className="flex items-end gap-2 text-sm font-medium text-gray-700">
                  <input type="checkbox" checked={docForm.is_active} onChange={(e) => setDocForm(f => ({ ...f, is_active: e.target.checked }))} className="mb-2 h-4 w-4 rounded border-gray-300 text-wfd-crimson" />
                  <span className="pb-1.5">Active</span>
                </label>
              </div>
              <Button type="button" onClick={saveDoc} loading={saving} className="mt-2">Save Document</Button>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
