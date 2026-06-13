'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { uploadQuizPhoto } from '@/lib/supabase/storage';
import type { Tables, TablesInsert, TablesUpdate } from '@/lib/supabase/database.types';

type QuizRule = Tables<'quiz_rules'>;
type QuizPhoto = Tables<'quiz_photos'>;

type RuleForm = Pick<QuizRule, 'title' | 'rule_text' | 'instruction' | 'sort_order' | 'is_active'>;
type PhotoForm = Pick<
  QuizPhoto,
  'label' | 'image_url' | 'is_non_compliant' | 'reason' | 'sort_order' | 'is_active'
>;

const emptyRuleForm: RuleForm = {
  title: '',
  rule_text: '',
  instruction: '',
  sort_order: 0,
  is_active: false,
};

const emptyPhotoForm: PhotoForm = {
  label: '',
  image_url: '',
  is_non_compliant: false,
  reason: '',
  sort_order: 0,
  is_active: true,
};

export function QuizConfig() {
  const supabase = createClient();
  const [rules, setRules] = useState<QuizRule[]>([]);
  const [photos, setPhotos] = useState<QuizPhoto[]>([]);
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
  const [ruleForm, setRuleForm] = useState<RuleForm>(emptyRuleForm);
  const [photoForm, setPhotoForm] = useState<PhotoForm>(emptyPhotoForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const selectedRule = rules.find((rule) => rule.id === selectedRuleId) ?? null;
  const selectedPhotos = photos
    .filter((photo) => photo.rule_id === selectedRuleId)
    .sort((a, b) => a.sort_order - b.sort_order || a.label.localeCompare(b.label));

  useEffect(() => {
    loadQuizConfig();
  }, []);

  async function loadQuizConfig() {
    setLoading(true);
    setError(null);

    const [{ data: ruleData, error: ruleError }, { data: photoData, error: photoError }] =
      await Promise.all([
        supabase.from('quiz_rules').select('*').order('sort_order', { ascending: true }),
        supabase.from('quiz_photos').select('*').order('sort_order', { ascending: true }),
      ]);

    if (ruleError || photoError) {
      setError(ruleError?.message ?? photoError?.message ?? 'Unable to load quiz configuration.');
      setLoading(false);
      return;
    }

    setRules(ruleData ?? []);
    setPhotos(photoData ?? []);
    setSelectedRuleId((current) => current ?? ruleData?.[0]?.id ?? null);
    setLoading(false);
  }

  function startNewRule() {
    setEditingRuleId(null);
    setRuleForm({ ...emptyRuleForm, sort_order: (rules.length + 1) * 10 });
    setMessage(null);
    setError(null);
  }

  function startEditRule(rule: QuizRule) {
    setEditingRuleId(rule.id);
    setSelectedRuleId(rule.id);
    setRuleForm({
      title: rule.title,
      rule_text: rule.rule_text,
      instruction: rule.instruction,
      sort_order: rule.sort_order,
      is_active: rule.is_active,
    });
    setMessage(null);
    setError(null);
  }

  function startNewPhoto() {
    setEditingPhotoId(null);
    setPhotoForm({ ...emptyPhotoForm, sort_order: (selectedPhotos.length + 1) * 10 });
    setMessage(null);
    setError(null);
  }

  function startEditPhoto(photo: QuizPhoto) {
    setEditingPhotoId(photo.id);
    setPhotoForm({
      label: photo.label,
      image_url: photo.image_url,
      is_non_compliant: photo.is_non_compliant,
      reason: photo.reason,
      sort_order: photo.sort_order,
      is_active: photo.is_active,
    });
    setMessage(null);
    setError(null);
  }

  function validateRuleActivation(ruleId: string, activePhotos: QuizPhoto[]) {
    if (activePhotos.length < 4) return 'Active rules must have at least 4 active photos.';
    if (activePhotos.length > 6) return 'Active rules cannot have more than 6 active photos.';
    if (!activePhotos.some((photo) => photo.is_non_compliant)) {
      return 'Active rules must have at least one non-compliant photo.';
    }
    return null;
  }

  async function saveRule() {
    const title = ruleForm.title.trim();
    const ruleText = ruleForm.rule_text.trim();
    const instruction = ruleForm.instruction.trim();

    if (!title || !ruleText || !instruction) {
      setError('Rule title, rule text, and instruction are required.');
      return;
    }

    if (ruleForm.is_active && editingRuleId) {
      const validationError = validateRuleActivation(
        editingRuleId,
        photos.filter((photo) => photo.rule_id === editingRuleId && photo.is_active)
      );
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    if (ruleForm.is_active && !editingRuleId) {
      setError('Create the rule as inactive, add 4-6 photos, then activate it.');
      return;
    }

    setSaving(true);
    setError(null);
    const payload: TablesInsert<'quiz_rules'> | TablesUpdate<'quiz_rules'> = {
      title,
      rule_text: ruleText,
      instruction,
      sort_order: Number(ruleForm.sort_order) || 0,
      is_active: ruleForm.is_active,
      updated_at: new Date().toISOString(),
    };

    const result = editingRuleId
      ? await supabase.from('quiz_rules').update(payload).eq('id', editingRuleId)
      : await supabase.from('quiz_rules').insert(payload as TablesInsert<'quiz_rules'>).select('id').single();

    if (result.error) {
      setError(result.error.message);
    } else {
      setMessage('Rule saved.');
      if (!editingRuleId && 'data' in result && result.data) setSelectedRuleId(result.data.id);
      setRuleForm(emptyRuleForm);
      setEditingRuleId(null);
      await loadQuizConfig();
    }
    setSaving(false);
  }

  async function deleteRule(rule: QuizRule) {
    if (!confirm(`Delete quiz rule "${rule.title}" and all of its photos?`)) return;

    setSaving(true);
    setError(null);
    const { error: deleteError } = await supabase.from('quiz_rules').delete().eq('id', rule.id);
    if (deleteError) {
      setError(deleteError.message);
    } else {
      setMessage('Rule deleted.');
      setSelectedRuleId(null);
      await loadQuizConfig();
    }
    setSaving(false);
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const url = await uploadQuizPhoto(file);
      setPhotoForm((form) => ({ ...form, image_url: url }));
      setMessage('Photo uploaded. URL populated.');
    } catch (err: any) {
      setError(err.message || 'Upload failed.');
    }
    setUploading(false);
    e.target.value = '';
  }

  async function savePhoto() {
    if (!selectedRuleId || !selectedRule) {
      setError('Select a rule before adding photos.');
      return;
    }

    const label = photoForm.label.trim();
    const imageUrl = photoForm.image_url.trim();
    const reason = photoForm.reason.trim();

    if (!label || !imageUrl || !reason) {
      setError('Photo label, image URL, and reason are required.');
      return;
    }

    const draftPhoto: QuizPhoto = {
      id: editingPhotoId ?? 'draft',
      rule_id: selectedRuleId,
      label,
      image_url: imageUrl,
      is_non_compliant: photoForm.is_non_compliant,
      reason,
      sort_order: Number(photoForm.sort_order) || 0,
      is_active: photoForm.is_active,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const nextPhotos = editingPhotoId
      ? selectedPhotos.map((photo) => (photo.id === editingPhotoId ? draftPhoto : photo))
      : [...selectedPhotos, draftPhoto];

    if (selectedRule.is_active) {
      const validationError = validateRuleActivation(
        selectedRuleId,
        nextPhotos.filter((photo) => photo.is_active)
      );
      if (validationError) {
        setError(`${validationError} Deactivate the rule before making this change.`);
        return;
      }
    }

    setSaving(true);
    setError(null);
    const payload: TablesInsert<'quiz_photos'> | TablesUpdate<'quiz_photos'> = {
      rule_id: selectedRuleId,
      label,
      image_url: imageUrl,
      is_non_compliant: photoForm.is_non_compliant,
      reason,
      sort_order: Number(photoForm.sort_order) || 0,
      is_active: photoForm.is_active,
      updated_at: new Date().toISOString(),
    };

    const result = editingPhotoId
      ? await supabase.from('quiz_photos').update(payload).eq('id', editingPhotoId)
      : await supabase.from('quiz_photos').insert(payload as TablesInsert<'quiz_photos'>);

    if (result.error) {
      setError(result.error.message);
    } else {
      setMessage('Photo saved.');
      setPhotoForm(emptyPhotoForm);
      setEditingPhotoId(null);
      await loadQuizConfig();
    }
    setSaving(false);
  }

  async function deletePhoto(photo: QuizPhoto) {
    const nextPhotos = selectedPhotos.filter((item) => item.id !== photo.id);
    if (selectedRule?.is_active) {
      const validationError = validateRuleActivation(
        selectedRule.id,
        nextPhotos.filter((item) => item.is_active)
      );
      if (validationError) {
        setError(`${validationError} Deactivate the rule before deleting this photo.`);
        return;
      }
    }

    if (!confirm(`Delete photo "${photo.label}"?`)) return;

    setSaving(true);
    setError(null);
    const { error: deleteError } = await supabase.from('quiz_photos').delete().eq('id', photo.id);
    if (deleteError) {
      setError(deleteError.message);
    } else {
      setMessage('Photo deleted.');
      await loadQuizConfig();
    }
    setSaving(false);
  }

  const activePhotoCount = selectedPhotos.filter((photo) => photo.is_active).length;
  const nonCompliantCount = selectedPhotos.filter(
    (photo) => photo.is_active && photo.is_non_compliant
  ).length;

  return (
    <Card className="p-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-bold text-wfd-charcoal">Onboarding Quiz Configuration</h3>
          <p className="mt-1 text-sm text-gray-500">
            Manage the rule-by-rule photo quiz students complete during onboarding.
          </p>
        </div>
        <Button type="button" size="sm" variant="secondary" onClick={startNewRule}>
          New Rule
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading quiz configuration...</p>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <div className="space-y-3">
            {rules.map((rule) => {
              const rulePhotos = photos.filter((photo) => photo.rule_id === rule.id);
              const activeCount = rulePhotos.filter((photo) => photo.is_active).length;
              return (
                <button
                  key={rule.id}
                  type="button"
                  onClick={() => setSelectedRuleId(rule.id)}
                  className={`w-full rounded-lg border p-3 text-left transition-colors ${
                    selectedRuleId === rule.id
                      ? 'border-wfd-crimson bg-red-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-wfd-charcoal">{rule.title}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        Order {rule.sort_order} | {activeCount}/{rulePhotos.length} active photos
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                        rule.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {rule.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </button>
              );
            })}
            {rules.length === 0 && <p className="text-sm text-gray-500">No quiz rules yet.</p>}
          </div>

          <div className="space-y-5">
            {(message || error) && (
              <div
                className={`rounded-lg border p-3 text-sm font-medium ${
                  error ? 'border-red-200 bg-red-50 text-red-800' : 'border-green-200 bg-green-50 text-green-800'
                }`}
              >
                {error ?? message}
              </div>
            )}

            <div className="rounded-lg border border-gray-200 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h4 className="font-semibold text-wfd-charcoal">
                  {editingRuleId ? 'Edit Rule' : 'Create Rule'}
                </h4>
                {selectedRule && !editingRuleId && (
                  <Button type="button" size="sm" variant="secondary" onClick={() => startEditRule(selectedRule)}>
                    Edit Selected
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                <Input
                  label="Rule Title"
                  value={ruleForm.title}
                  onChange={(event) => setRuleForm((form) => ({ ...form, title: event.target.value }))}
                />
                <label className="block text-sm font-medium text-gray-700">
                  Rule Text
                  <textarea
                    value={ruleForm.rule_text}
                    onChange={(event) => setRuleForm((form) => ({ ...form, rule_text: event.target.value }))}
                    className="mt-1 min-h-24 w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-wfd-crimson"
                  />
                </label>
                <Input
                  label="Question Instruction"
                  value={ruleForm.instruction}
                  onChange={(event) => setRuleForm((form) => ({ ...form, instruction: event.target.value }))}
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    label="Sort Order"
                    type="number"
                    value={ruleForm.sort_order}
                    onChange={(event) =>
                      setRuleForm((form) => ({ ...form, sort_order: Number(event.target.value) }))
                    }
                  />
                  <label className="flex items-end gap-2 text-sm font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={ruleForm.is_active}
                      onChange={(event) =>
                        setRuleForm((form) => ({ ...form, is_active: event.target.checked }))
                      }
                      className="mb-2 h-4 w-4 rounded border-gray-300 text-wfd-crimson"
                    />
                    <span className="pb-1.5">Active for students</span>
                  </label>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" onClick={saveRule} loading={saving}>
                    Save Rule
                  </Button>
                  {selectedRule && (
                    <Button type="button" variant="danger" onClick={() => deleteRule(selectedRule)} disabled={saving}>
                      Delete Selected Rule
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {selectedRule && (
              <div className="rounded-lg border border-gray-200 p-4">
                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h4 className="font-semibold text-wfd-charcoal">Photos for {selectedRule.title}</h4>
                    <p className="text-xs text-gray-500">
                      Active photos: {activePhotoCount}. Non-compliant active photos: {nonCompliantCount}.
                    </p>
                  </div>
                  <Button type="button" size="sm" variant="secondary" onClick={startNewPhoto}>
                    New Photo
                  </Button>
                </div>

                <div className="mb-4 grid gap-3 md:grid-cols-2">
                  {selectedPhotos.map((photo) => (
                    <div key={photo.id} className="rounded-lg border border-gray-200 p-3">
                      <img
                        src={photo.image_url}
                        alt={photo.label}
                        className="mb-2 h-28 w-full rounded bg-gray-100 object-cover"
                        onError={(event) => {
                          event.currentTarget.style.display = 'none';
                        }}
                      />
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-wfd-charcoal">{photo.label}</p>
                          <p className="text-xs text-gray-500">Order {photo.sort_order}</p>
                        </div>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                            photo.is_non_compliant ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {photo.is_non_compliant ? 'Non-compliant' : 'Compliant'}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-gray-600">{photo.reason}</p>
                      <div className="mt-3 flex gap-2">
                        <Button type="button" size="sm" variant="secondary" onClick={() => startEditPhoto(photo)}>
                          Edit
                        </Button>
                        <Button type="button" size="sm" variant="danger" onClick={() => deletePhoto(photo)}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-lg bg-gray-50 p-3">
                  <h5 className="mb-3 text-sm font-semibold text-wfd-charcoal">
                    {editingPhotoId ? 'Edit Photo' : 'Add Photo'}
                  </h5>
                  <div className="space-y-3">
                    <Input
                      label="Photo Label"
                      value={photoForm.label}
                      onChange={(event) => setPhotoForm((form) => ({ ...form, label: event.target.value }))}
                    />
                    <Input
                      label="Image URL"
                      value={photoForm.image_url}
                      onChange={(event) => setPhotoForm((form) => ({ ...form, image_url: event.target.value }))}
                    />
                    <div className="flex items-center gap-2">
                      <label className={`rounded-lg border border-gray-300 px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                        Choose File
                        <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" disabled={uploading} />
                      </label>
                      {uploading && <span className="text-xs text-gray-500">Uploading...</span>}
                    </div>
                    {photoForm.image_url.trim() && (
                      <img
                        src={photoForm.image_url}
                        alt="Preview"
                        className="h-32 w-full rounded border border-gray-200 bg-white object-cover"
                        onError={(event) => {
                          event.currentTarget.alt = 'Image preview failed to load';
                        }}
                      />
                    )}
                    <Input
                      label="Reason / Explanation"
                      value={photoForm.reason}
                      onChange={(event) => setPhotoForm((form) => ({ ...form, reason: event.target.value }))}
                    />
                    <div className="grid gap-3 sm:grid-cols-3">
                      <Input
                        label="Sort Order"
                        type="number"
                        value={photoForm.sort_order}
                        onChange={(event) =>
                          setPhotoForm((form) => ({ ...form, sort_order: Number(event.target.value) }))
                        }
                      />
                      <label className="flex items-end gap-2 text-sm font-medium text-gray-700">
                        <input
                          type="checkbox"
                          checked={photoForm.is_non_compliant}
                          onChange={(event) =>
                            setPhotoForm((form) => ({ ...form, is_non_compliant: event.target.checked }))
                          }
                          className="mb-2 h-4 w-4 rounded border-gray-300 text-wfd-crimson"
                        />
                        <span className="pb-1.5">Non-compliant</span>
                      </label>
                      <label className="flex items-end gap-2 text-sm font-medium text-gray-700">
                        <input
                          type="checkbox"
                          checked={photoForm.is_active}
                          onChange={(event) =>
                            setPhotoForm((form) => ({ ...form, is_active: event.target.checked }))
                          }
                          className="mb-2 h-4 w-4 rounded border-gray-300 text-wfd-crimson"
                        />
                        <span className="pb-1.5">Active</span>
                      </label>
                    </div>
                    <Button type="button" onClick={savePhoto} loading={saving}>
                      Save Photo
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
