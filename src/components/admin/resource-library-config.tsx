'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ReorderButtons } from '@/components/ui/reorder-buttons';
import { useSortableList } from '@/lib/hooks/use-sortable-list';
import { createClient } from '@/lib/supabase/client';
import { uploadResourceDoc } from '@/lib/supabase/storage';
import type { Tables, TablesInsert, TablesUpdate } from '@/lib/supabase/database.types';

type ResCategory = Tables<'resource_categories'>;
type ResDoc = Tables<'resource_documents'>;

const emptyCatForm = { name: '', sort_order: 0 };
const emptyDocForm = { name: '', file_url: '', file_type: 'PDF', sort_order: 0, is_active: true, map_embed_url: '' };

export function ResourceLibraryConfig() {
  const supabase = createClient();
  const {
    items: categories,
    loading: catsLoading,
    error: catsError,
    reload: reloadCats,
    moveItem: moveCat,
    canMoveUp: canMoveCatUp,
    canMoveDown: canMoveCatDown,
    nextSortOrder: nextCatSortOrder,
  } = useSortableList<ResCategory>({ tableName: 'resource_categories' });

  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [catEditingId, setCatEditingId] = useState<string | null>(null);
  const [docEditingId, setDocEditingId] = useState<string | null>(null);
  const [catForm, setCatForm] = useState(emptyCatForm);
  const [docForm, setDocForm] = useState(emptyDocForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const {
    items: documents,
    loading: docsLoading,
    error: docsError,
    reload: reloadDocs,
    moveItem: moveDoc,
    canMoveUp: canMoveDocUp,
    canMoveDown: canMoveDocDown,
    nextSortOrder: nextDocSortOrder,
  } = useSortableList<ResDoc>({
    tableName: 'resource_documents',
    filter: selectedCatId ? { column: 'category_id', value: selectedCatId } : { column: 'category_id', value: '__no_match__' },
  });

  useEffect(() => {
    if (categories.length > 0 && !selectedCatId) {
      setSelectedCatId(categories[0].id);
    }
  }, [categories, selectedCatId]);

  const selectedDocs = documents;
  const loading = catsLoading || (selectedCatId ? docsLoading : false);
  const displayError = error || catsError || docsError;

  function startNewCat() { setCatEditingId(null); setCatForm({ ...emptyCatForm, sort_order: nextCatSortOrder() }); setMessage(null); setError(null); }
  function startEditCat(cat: ResCategory) { setCatEditingId(cat.id); setCatForm({ name: cat.name, sort_order: cat.sort_order }); setMessage(null); setError(null); }
  function startNewDoc() { setDocEditingId(null); setDocForm({ ...emptyDocForm, sort_order: nextDocSortOrder() }); setMessage(null); setError(null); }
  function startEditDoc(doc: ResDoc) { setDocEditingId(doc.id); setDocForm({ name: doc.name, file_url: doc.file_url ?? '', file_type: doc.file_type, sort_order: doc.sort_order, is_active: doc.is_active, map_embed_url: doc.map_embed_url ?? '' }); setMessage(null); setError(null); }

  async function saveCat() {
    if (!catForm.name.trim()) { setError('Category name is required.'); return; }
    setSaving(true); setError(null);
    const payload: TablesInsert<'resource_categories'> | TablesUpdate<'resource_categories'> = { name: catForm.name.trim(), sort_order: Number(catForm.sort_order) || 0, updated_at: new Date().toISOString() };
    const result = catEditingId
      ? await supabase.from('resource_categories').update(payload).eq('id', catEditingId)
      : await supabase.from('resource_categories').insert(payload as TablesInsert<'resource_categories'>).select('id').single();
    if (result.error) setError(result.error.message);
    else { setMessage('Category saved.'); setCatForm(emptyCatForm); setCatEditingId(null); if (!catEditingId && 'data' in result && result.data) setSelectedCatId(result.data.id); await reloadCats(); }
    setSaving(false);
  }

  async function deleteCat(cat: ResCategory) {
    if (!confirm(`Delete category "${cat.name}" and all its documents?`)) return;
    setSaving(true);
    const { error: deleteError } = await supabase.from('resource_categories').delete().eq('id', cat.id);
    if (deleteError) setError(deleteError.message);
    else { setMessage('Category deleted.'); setSelectedCatId(null); await reloadCats(); }
    setSaving(false);
  }

  async function handleDocUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const url = await uploadResourceDoc(file);
      setDocForm((form) => ({ ...form, file_url: url }));
      setMessage('File uploaded. URL populated.');
    } catch (err: any) {
      setError(err.message || 'Upload failed.');
    }
    setUploading(false);
    e.target.value = '';
  }

  async function saveDoc() {
    if (!selectedCatId) { setError('Select a category first.'); return; }
    if (!docForm.name.trim() || (!docForm.file_url.trim() && !docForm.map_embed_url.trim())) { setError('Document name and at least one of File URL or Map Embed URL are required.'); return; }
    setSaving(true); setError(null);
    const payload: TablesInsert<'resource_documents'> | TablesUpdate<'resource_documents'> = {
      category_id: selectedCatId, name: docForm.name.trim(),
      file_url: docForm.file_url.trim() || null,
      file_type: docForm.file_type, sort_order: Number(docForm.sort_order) || 0,
      is_active: docForm.is_active, map_embed_url: docForm.map_embed_url.trim() || null,
      updated_at: new Date().toISOString(),
    };
    const result = docEditingId
      ? await supabase.from('resource_documents').update(payload).eq('id', docEditingId)
      : await supabase.from('resource_documents').insert(payload as TablesInsert<'resource_documents'>);
    if (result.error) setError(result.error.message);
    else { setMessage('Document saved.'); setDocForm(emptyDocForm); setDocEditingId(null); await reloadDocs(); }
    setSaving(false);
  }

  async function deleteDoc(doc: ResDoc) {
    if (!confirm(`Delete document "${doc.name}"?`)) return;
    setSaving(true);
    const { error: deleteError } = await supabase.from('resource_documents').delete().eq('id', doc.id);
    if (deleteError) setError(deleteError.message);
    else { setMessage('Document deleted.'); await reloadDocs(); }
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

      {(message || displayError) && (
        <div className={`mb-4 rounded-lg border p-3 text-sm font-medium ${displayError ? 'border-wfd-crimson/30 bg-wfd-crimson/10 text-wfd-crimson' : 'border-wfd-sage/30 bg-wfd-sage/10 text-wfd-sage'}`}>
          {displayError ?? message}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap gap-2 items-center">
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center gap-1">
                <ReorderButtons
                  onMoveUp={() => moveCat(cat, -1)}
                  onMoveDown={() => moveCat(cat, 1)}
                  canMoveUp={canMoveCatUp(cat)}
                  canMoveDown={canMoveCatDown(cat)}
                />
                <button type="button" onClick={() => setSelectedCatId(cat.id)}
                  className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${selectedCatId === cat.id ? 'border-wfd-crimson bg-wfd-crimson/5 text-wfd-crimson' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'}`}>
                  {cat.name}
                </button>
              </div>
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
                    <ReorderButtons
                      onMoveUp={() => moveDoc(doc, -1)}
                      onMoveDown={() => moveDoc(doc, 1)}
                      canMoveUp={canMoveDocUp(doc)}
                      canMoveDown={canMoveDocDown(doc)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{doc.name}</p>
                      <p className="text-xs text-gray-500">{doc.file_type} | Order {doc.sort_order} | {doc.file_url?.substring(0, 40) ?? ''}...</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${doc.is_active ? 'bg-wfd-sage/15 text-wfd-sage' : 'bg-gray-100 text-gray-500'}`}>{doc.is_active ? 'On' : 'Off'}</span>
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
                <Input label="Map Embed URL (optional)" value={docForm.map_embed_url} onChange={(e) => setDocForm(f => ({ ...f, map_embed_url: e.target.value }))} placeholder="Google Maps embed URL" />
                <div className="flex items-center gap-2">
                  <label className={`rounded-lg border border-gray-300 px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    Choose File
                    <input type="file" accept=".pdf,.doc,.docx,.txt" onChange={handleDocUpload} className="hidden" disabled={uploading} />
                  </label>
                  {uploading && <span className="text-xs text-gray-500">Uploading...</span>}
                </div>
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
