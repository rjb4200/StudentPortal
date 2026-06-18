'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ReorderButtons } from '@/components/ui/reorder-buttons';
import { useSortableList } from '@/lib/hooks/use-sortable-list';
import { createClient } from '@/lib/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/lib/supabase/database.types';

type RegField = Tables<'registration_fields'>;

const FIELD_TYPES = ['text', 'email', 'tel', 'textarea', 'select'] as const;

const emptyForm = {
  field_key: '',
  label: '',
  field_type: 'text' as string,
  is_required: false,
  placeholder: '',
  options: '',
  sort_order: 0,
  is_active: true,
};

export function RegistrationFieldsConfig() {
  const supabase = createClient();
  const { items: fields, loading, error: loadError, reload, moveItem, canMoveUp, canMoveDown, nextSortOrder } = useSortableList<RegField>({ tableName: 'registration_fields' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function startNew() {
    setEditingId(null);
    setForm({ ...emptyForm, sort_order: nextSortOrder() });
    setMessage(null);
    setError(null);
  }

  function startEdit(field: RegField) {
    setEditingId(field.id);
    setForm({
      field_key: field.field_key,
      label: field.label,
      field_type: field.field_type,
      is_required: field.is_required,
      placeholder: field.placeholder ?? '',
      options: field.options ?? '',
      sort_order: field.sort_order,
      is_active: field.is_active,
    });
    setMessage(null);
    setError(null);
  }

  async function save() {
    const key = form.field_key.trim();
    const label = form.label.trim();
    if (!key || !label) {
      setError('Field key and label are required.');
      return;
    }

    setSaving(true);
    setError(null);
    const payload: TablesInsert<'registration_fields'> | TablesUpdate<'registration_fields'> = {
      field_key: key,
      label,
      field_type: form.field_type,
      is_required: form.is_required,
      placeholder: form.placeholder || null,
      options: form.field_type === 'select' ? form.options : null,
      sort_order: Number(form.sort_order) || 0,
      is_active: form.is_active,
      updated_at: new Date().toISOString(),
    };

    const result = editingId
      ? await supabase.from('registration_fields').update(payload).eq('id', editingId)
      : await supabase.from('registration_fields').insert(payload as TablesInsert<'registration_fields'>);

    if (result.error) {
      setError(result.error.message);
    } else {
      setMessage('Field saved.');
      setForm(emptyForm);
      setEditingId(null);
      await reload();
    }
    setSaving(false);
  }

  async function deleteField(field: RegField) {
    if (field.is_permanent) {
      setError('Permanent fields cannot be deleted.');
      return;
    }
    if (!confirm(`Delete field "${field.label}"?`)) return;

    setSaving(true);
    const { error: deleteError } = await supabase.from('registration_fields').delete().eq('id', field.id);
    if (deleteError) setError(deleteError.message);
    else { setMessage('Field deleted.'); await reload(); }
    setSaving(false);
  }

  async function toggleActive(field: RegField) {
    if (!field.is_active && field.is_permanent) {
      setError('Permanent fields cannot be deactivated.');
      return;
    }
    const { error: updateError } = await supabase
      .from('registration_fields')
      .update({ is_active: !field.is_active, updated_at: new Date().toISOString() })
      .eq('id', field.id);
    if (updateError) setError(updateError.message);
    else await reload();
  }

  const displayError = error || loadError;

  return (
    <Card className="p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-wfd-charcoal">Registration Fields</h3>
          <p className="text-sm text-gray-500">Customize the student registration form fields.</p>
        </div>
        <Button type="button" size="sm" variant="secondary" onClick={startNew}>New Field</Button>
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
            {fields.map((field) => (
              <div key={field.id} className={`rounded-lg border p-3 ${field.is_permanent ? 'bg-gray-50' : ''}`}>
                <div className="flex items-center justify-between gap-2">
                  <ReorderButtons
                    onMoveUp={() => moveItem(field, -1)}
                    onMoveDown={() => moveItem(field, 1)}
                    canMoveUp={canMoveUp(field)}
                    canMoveDown={canMoveDown(field)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{field.label}</p>
                    <p className="text-xs text-gray-500">{field.field_key} | {field.field_type} {field.is_required ? '| required' : ''}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => toggleActive(field)} className={`rounded-full px-2 py-0.5 text-xs font-bold ${field.is_active ? 'bg-wfd-sage/15 text-wfd-sage' : 'bg-gray-100 text-gray-500'}`}>
                      {field.is_active ? 'Active' : 'Off'}
                    </button>
                    <Button type="button" size="sm" variant="secondary" onClick={() => startEdit(field)}>Edit</Button>
                    {!field.is_permanent && <Button type="button" size="sm" variant="danger" onClick={() => deleteField(field)}>Del</Button>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-gray-200 p-4">
            <h4 className="mb-3 text-sm font-semibold text-wfd-charcoal">{editingId ? 'Edit Field' : 'Add Field'}</h4>
            <div className="space-y-3">
              <Input label="Field Key (snake_case)" value={form.field_key} onChange={(e) => setForm(f => ({ ...f, field_key: e.target.value }))} disabled={!!editingId} />
              <Input label="Label" value={form.label} onChange={(e) => setForm(f => ({ ...f, label: e.target.value }))} />
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm font-medium text-gray-700">
                  Field Type
                  <select value={form.field_type} onChange={(e) => setForm(f => ({ ...f, field_type: e.target.value }))} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-wfd-crimson">
                    {FIELD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </label>
                <Input label="Sort Order" type="number" value={form.sort_order} onChange={(e) => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))} />
              </div>
              {form.field_type === 'select' && (
                <Input label="Options (comma-separated)" value={form.options} onChange={(e) => setForm(f => ({ ...f, options: e.target.value }))} placeholder="Option 1, Option 2, Option 3" />
              )}
              <Input label="Placeholder" value={form.placeholder} onChange={(e) => setForm(f => ({ ...f, placeholder: e.target.value }))} />
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.is_required} onChange={(e) => setForm(f => ({ ...f, is_required: e.target.checked }))} className="h-4 w-4 rounded border-gray-300 text-wfd-crimson" /> Required
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.is_active} onChange={(e) => setForm(f => ({ ...f, is_active: e.target.checked }))} className="h-4 w-4 rounded border-gray-300 text-wfd-crimson" /> Active
                </label>
              </div>
              <Button type="button" onClick={save} loading={saving}>Save Field</Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
