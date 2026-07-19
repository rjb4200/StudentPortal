'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ReorderButtons } from '@/components/ui/reorder-buttons';
import { useSortableList } from '@/lib/hooks/use-sortable-list';
import { createClient } from '@/lib/supabase/client';
import { uploadQuizPhoto } from '@/lib/supabase/storage';
import type { Tables, TablesInsert, TablesUpdate } from '@/lib/supabase/database.types';

type QuizRule = Tables<'quiz_rules'>;
type QuizPhoto = Tables<'quiz_photos'>;
type QuestionType = 'photo_grid' | 'text_choice';

type RuleForm = Pick<QuizRule, 'title' | 'rule_text' | 'instruction' | 'sort_order' | 'is_active'> & {
  question_type: QuestionType;
};
type PhotoForm = Pick<
  QuizPhoto,
  'label' | 'image_url' | 'option_text' | 'is_non_compliant' | 'reason' | 'sort_order' | 'is_active'
>;

const emptyRuleForm: RuleForm = {
  title: '',
  rule_text: '',
  instruction: '',
  question_type: 'photo_grid',
  sort_order: 0,
  is_active: false,
};

const emptyPhotoForm: PhotoForm = {
  label: '',
  image_url: '',
  option_text: '',
  is_non_compliant: false,
  reason: '',
  sort_order: 0,
  is_active: true,
};

export function QuizConfig() {
  const supabase = createClient();
  const {
    items: rules,
    loading: rulesLoading,
    error: rulesError,
    reload: reloadRules,
    moveItem: moveRule,
    saveOrder: saveRuleOrder,
    discardOrder: discardRuleOrder,
    hasPendingOrder: hasPendingRuleOrder,
    canMoveUp: canMoveRuleUp,
    canMoveDown: canMoveRuleDown,
    nextSortOrder: nextRuleSortOrder,
  } = useSortableList<QuizRule>({ tableName: 'quiz_rules' });

  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
  const [creatingRule, setCreatingRule] = useState(false);
  const [creatingPhoto, setCreatingPhoto] = useState(false);
  const [ruleForm, setRuleForm] = useState<RuleForm>(emptyRuleForm);
  const [photoForm, setPhotoForm] = useState<PhotoForm>(emptyPhotoForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const {
    items: photos,
    loading: photosLoading,
    error: photosError,
    reload: reloadPhotos,
    moveItem: movePhoto,
    saveOrder: savePhotoOrder,
    discardOrder: discardPhotoOrder,
    hasPendingOrder: hasPendingPhotoOrder,
    canMoveUp: canMovePhotoUp,
    canMoveDown: canMovePhotoDown,
    nextSortOrder: nextPhotoSortOrder,
  } = useSortableList<QuizPhoto>({
    tableName: 'quiz_photos',
    filter: selectedRuleId ? { column: 'rule_id', value: selectedRuleId } : { column: 'rule_id', value: '__no_match__' },
  });

  useEffect(() => {
    if (rules.length > 0 && !selectedRuleId) {
      setSelectedRuleId(rules[0].id);
    }
  }, [rules, selectedRuleId]);

  const selectedRule = rules.find((rule) => rule.id === selectedRuleId) ?? null;
  const selectedPhotos = photos;
  const selectedRuleType = (selectedRule?.question_type ?? 'photo_grid') as QuestionType;
  const selectedRuleUsesTextOptions = selectedRuleType === 'text_choice';

  const loading = rulesLoading || (selectedRuleId ? photosLoading : false);
  const displayError = error || rulesError || photosError;

  function startNewRule() {
    setEditingRuleId(null);
    setCreatingRule(true);
    setRuleForm({ ...emptyRuleForm, sort_order: nextRuleSortOrder() });
    setMessage(null);
    setError(null);
  }

  function startEditRule(rule: QuizRule) {
    setEditingRuleId(rule.id);
    setCreatingRule(false);
    setSelectedRuleId(rule.id);
    setRuleForm({
      title: rule.title,
      rule_text: rule.rule_text,
      instruction: rule.instruction,
      question_type: (rule.question_type ?? 'photo_grid') as QuestionType,
      sort_order: rule.sort_order,
      is_active: rule.is_active,
    });
    setMessage(null);
    setError(null);
  }

  function startNewPhoto() {
    setEditingPhotoId(null);
    setCreatingPhoto(true);
    setPhotoForm({ ...emptyPhotoForm, sort_order: nextPhotoSortOrder() });
    setMessage(null);
    setError(null);
  }

  function startEditPhoto(photo: QuizPhoto) {
    setEditingPhotoId(photo.id);
    setCreatingPhoto(false);
    setPhotoForm({
      label: photo.label,
      image_url: photo.image_url ?? '',
      option_text: photo.option_text ?? '',
      is_non_compliant: photo.is_non_compliant,
      reason: photo.reason,
      sort_order: photo.sort_order,
      is_active: photo.is_active,
    });
    setMessage(null);
    setError(null);
  }

  function validateRuleActivation(ruleType: QuestionType, activeOptions: QuizPhoto[]) {
    if (ruleType === 'text_choice') {
      if (activeOptions.length < 2) return 'Active text questions must have at least 2 active answer options.';
      if (activeOptions.some((option) => !(option.option_text ?? option.label).trim())) {
        return 'Active text answer options must include answer text.';
      }
      if (!activeOptions.some((option) => option.is_non_compliant)) {
        return 'Active text questions must have at least one correct answer option.';
      }
      return null;
    }

    if (activeOptions.length < 4) return 'Active photo rules must have at least 4 active photos.';
    if (activeOptions.length > 6) return 'Active photo rules cannot have more than 6 active photos.';
    if (activeOptions.some((option) => !option.image_url?.trim())) {
      return 'Active photo options must include an image URL.';
    }
    if (!activeOptions.some((photo) => photo.is_non_compliant)) {
      return 'Active photo rules must have at least one non-compliant photo.';
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
        ruleForm.question_type,
        photos.filter((photo) => photo.rule_id === editingRuleId && photo.is_active)
      );
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    if (ruleForm.is_active && !editingRuleId) {
      setError('Create the rule as inactive, add answer options, then activate it.');
      return;
    }

    setSaving(true);
    setError(null);
    const payload: TablesInsert<'quiz_rules'> | TablesUpdate<'quiz_rules'> = {
      title,
      rule_text: ruleText,
      instruction,
      question_type: ruleForm.question_type,
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
      setCreatingRule(false);
      await reloadRules();
    }
    setSaving(false);
  }

  async function deleteRule(rule: QuizRule) {
    if (!confirm(`Delete quiz rule "${rule.title}" and all of its answer options?`)) return;

    setSaving(true);
    setError(null);
    const { error: deleteError } = await supabase.from('quiz_rules').delete().eq('id', rule.id);
    if (deleteError) {
      setError(deleteError.message);
    } else {
      setMessage('Rule deleted.');
      setSelectedRuleId(null);
      await reloadRules();
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
      setError('Select a rule before adding answer options.');
      return;
    }

    const label = photoForm.label.trim();
    const imageUrl = photoForm.image_url?.trim() ?? '';
    const optionText = photoForm.option_text?.trim() ?? '';
    const reason = photoForm.reason.trim();
    const optionLabel = selectedRuleUsesTextOptions ? optionText : label;

    if (!optionLabel || !reason || (!selectedRuleUsesTextOptions && !imageUrl)) {
      setError(
        selectedRuleUsesTextOptions
          ? 'Answer text and explanation are required.'
          : 'Photo label, image URL, and reason are required.'
      );
      return;
    }

    const draftPhoto: QuizPhoto = {
      id: editingPhotoId ?? 'draft',
      rule_id: selectedRuleId,
      label: optionLabel,
      image_url: selectedRuleUsesTextOptions ? null : imageUrl,
      option_text: selectedRuleUsesTextOptions ? optionText : null,
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
        selectedRuleType,
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
      label: optionLabel,
      image_url: selectedRuleUsesTextOptions ? null : imageUrl,
      option_text: selectedRuleUsesTextOptions ? optionText : null,
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
      setCreatingPhoto(false);
      await reloadPhotos();
    }
    setSaving(false);
  }

  async function deletePhoto(photo: QuizPhoto) {
    const nextPhotos = selectedPhotos.filter((item) => item.id !== photo.id);
    if (selectedRule?.is_active) {
      const validationError = validateRuleActivation(
        selectedRuleType,
        nextPhotos.filter((item) => item.is_active)
      );
      if (validationError) {
        setError(`${validationError} Deactivate the rule before deleting this photo.`);
        return;
      }
    }

    if (!confirm(`Delete answer option "${photo.option_text ?? photo.label}"?`)) return;

    setSaving(true);
    setError(null);
    const { error: deleteError } = await supabase.from('quiz_photos').delete().eq('id', photo.id);
    if (deleteError) {
      setError(deleteError.message);
    } else {
      setMessage('Photo deleted.');
      await reloadPhotos();
    }
    setSaving(false);
  }

  const activePhotoCount = selectedPhotos.filter((photo) => photo.is_active).length;
  const nonCompliantCount = selectedPhotos.filter(
    (photo) => photo.is_active && photo.is_non_compliant
  ).length;
  const optionNoun = selectedRuleUsesTextOptions ? 'answer options' : 'photos';
  const correctLabel = selectedRuleUsesTextOptions ? 'Correct' : 'Non-compliant';
  const incorrectLabel = selectedRuleUsesTextOptions ? 'Incorrect' : 'Compliant';
  const ruleEditorOpen = creatingRule || Boolean(editingRuleId);
  const photoEditorOpen = creatingPhoto || Boolean(editingPhotoId);

  return (
    <Card className="p-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-bold text-wfd-charcoal">Onboarding Quiz Configuration</h3>
          <p className="mt-1 text-sm text-gray-500">
            Manage the rule-by-rule onboarding quiz students complete during onboarding.
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
              const ruleType = (rule.question_type ?? 'photo_grid') as QuestionType;
              return (
                <div key={rule.id} className="flex items-stretch gap-2">
                  <div className="flex items-center">
                    <ReorderButtons
                      onMoveUp={() => moveRule(rule, -1)}
                      onMoveDown={() => moveRule(rule, 1)}
                      canMoveUp={canMoveRuleUp(rule)}
                      canMoveDown={canMoveRuleDown(rule)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedRuleId(rule.id)}
                    className={`flex-1 rounded-lg border p-3 text-left transition-colors ${
                      selectedRuleId === rule.id
                        ? 'border-wfd-crimson bg-wfd-crimson/5'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-wfd-charcoal">{rule.title}</p>
                        <p className="mt-1 text-xs text-gray-500">
                          Order {rule.sort_order} | {ruleType === 'text_choice' ? 'Text choice' : 'Photo grid'} | {activeCount}/{rulePhotos.length} active options
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                          rule.is_active ? 'bg-wfd-sage/15 text-wfd-sage' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {rule.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </button>
                </div>
              );
            })}
            {rules.length === 0 && <p className="text-sm text-gray-500">No quiz rules yet.</p>}
            {hasPendingRuleOrder && <div className="flex flex-wrap items-center gap-2 rounded-lg bg-wfd-gold/10 p-2 text-xs text-wfd-charcoal"><span className="font-semibold">Rule order changes are not live.</span><Button type="button" size="sm" onClick={() => void saveRuleOrder()}>Save order</Button><Button type="button" size="sm" variant="secondary" onClick={discardRuleOrder}>Discard order</Button></div>}
          </div>

          <div className="space-y-5">
            {(message || displayError) && (
              <div
                className={`rounded-lg border p-3 text-sm font-medium ${
                  displayError ? 'border-wfd-crimson/30 bg-wfd-crimson/10 text-wfd-crimson' : 'border-wfd-sage/30 bg-wfd-sage/10 text-wfd-sage'
                }`}
              >
                {displayError ?? message}
              </div>
            )}

            <div className="rounded-lg border border-gray-200 p-4">
              {!ruleEditorOpen ? <div className="flex items-center justify-between gap-3"><p className="text-sm text-gray-500">{selectedRule ? `${selectedRule.title} is read-only until you select Edit Selected.` : 'Select New Rule to create quiz content.'}</p>{selectedRule && <Button type="button" size="sm" variant="secondary" onClick={() => startEditRule(selectedRule)}>Edit Selected</Button>}</div> : <><div className="mb-3 flex items-center justify-between gap-3">
                <h4 className="font-semibold text-wfd-charcoal">
                  {editingRuleId ? 'Edit Rule' : 'Create Rule'}
                </h4>
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
                <label className="block text-sm font-medium text-gray-700">
                  Question Type
                  <select
                    value={ruleForm.question_type}
                    onChange={(event) =>
                      setRuleForm((form) => ({ ...form, question_type: event.target.value as QuestionType }))
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-wfd-crimson"
                  >
                    <option value="photo_grid">Photo grid</option>
                    <option value="text_choice">Text choice</option>
                  </select>
                </label>
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
                  <Button type="button" variant="secondary" onClick={() => { setCreatingRule(false); setEditingRuleId(null); setRuleForm(emptyRuleForm); }}>
                    Discard changes
                  </Button>
                </div>
              </div>
              </>}
            </div>

            {selectedRule && (
              <div className="rounded-lg border border-gray-200 p-4">
                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h4 className="font-semibold text-wfd-charcoal">
                      {selectedRuleUsesTextOptions ? 'Answer Options' : 'Photos'} for {selectedRule.title}
                    </h4>
                    <p className="text-xs text-gray-500">
                      Active {optionNoun}: {activePhotoCount}. {correctLabel} active {optionNoun}: {nonCompliantCount}.
                    </p>
                  </div>
                  <Button type="button" size="sm" variant="secondary" onClick={startNewPhoto}>
                    {selectedRuleUsesTextOptions ? 'New Answer Option' : 'New Photo'}
                  </Button>
                </div>
                {hasPendingPhotoOrder && <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg bg-wfd-gold/10 p-2 text-xs text-wfd-charcoal"><span className="font-semibold">Option order changes are not live.</span><Button type="button" size="sm" onClick={() => void savePhotoOrder()}>Save order</Button><Button type="button" size="sm" variant="secondary" onClick={discardPhotoOrder}>Discard order</Button></div>}

                <div className="mb-4 grid gap-3 md:grid-cols-2">
                  {selectedPhotos.map((photo) => (
                    <div key={photo.id} className="rounded-lg border border-gray-200 p-3">
                      {selectedRuleUsesTextOptions ? (
                        <div className="mb-2 rounded bg-gray-50 p-3 text-sm font-medium text-wfd-charcoal">
                          {photo.option_text ?? photo.label}
                        </div>
                      ) : (
                        photo.image_url && (
                          <img
                            src={photo.image_url}
                            alt={photo.label}
                            className="mb-2 h-28 w-full rounded bg-gray-100 object-cover"
                            onError={(event) => {
                              event.currentTarget.style.display = 'none';
                            }}
                          />
                        )
                      )}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2">
                          <ReorderButtons
                            onMoveUp={() => movePhoto(photo, -1)}
                            onMoveDown={() => movePhoto(photo, 1)}
                            canMoveUp={canMovePhotoUp(photo)}
                            canMoveDown={canMovePhotoDown(photo)}
                          />
                          <div>
                            <p className="text-sm font-semibold text-wfd-charcoal">
                              {selectedRuleUsesTextOptions ? photo.option_text ?? photo.label : photo.label}
                            </p>
                            <p className="text-xs text-gray-500">Order {photo.sort_order}</p>
                          </div>
                        </div>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                            photo.is_non_compliant ? 'bg-wfd-crimson/15 text-wfd-crimson' : 'bg-wfd-sage/15 text-wfd-sage'
                          }`}
                        >
                          {photo.is_non_compliant ? correctLabel : incorrectLabel}
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
                  {!photoEditorOpen ? <p className="text-sm text-gray-500">Select New {selectedRuleUsesTextOptions ? 'Answer Option' : 'Photo'} or Edit to change this quiz content.</p> : <><h5 className="mb-3 text-sm font-semibold text-wfd-charcoal">
                    {editingPhotoId
                      ? selectedRuleUsesTextOptions ? 'Edit Answer Option' : 'Edit Photo'
                      : selectedRuleUsesTextOptions ? 'Add Answer Option' : 'Add Photo'}
                  </h5>
                  <div className="space-y-3">
                    {selectedRuleUsesTextOptions ? (
                      <Input
                        label="Answer Option Text"
                        value={photoForm.option_text ?? ''}
                        onChange={(event) => setPhotoForm((form) => ({ ...form, option_text: event.target.value }))}
                      />
                    ) : (
                      <>
                        <Input
                          label="Photo Label"
                          value={photoForm.label}
                          onChange={(event) => setPhotoForm((form) => ({ ...form, label: event.target.value }))}
                        />
                        <Input
                          label="Image URL"
                          value={photoForm.image_url ?? ''}
                          onChange={(event) => setPhotoForm((form) => ({ ...form, image_url: event.target.value }))}
                        />
                        <div className="flex items-center gap-2">
                          <label className={`rounded-lg border border-gray-300 px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                            Choose File
                            <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" disabled={uploading} />
                          </label>
                          {uploading && <span className="text-xs text-gray-500">Uploading...</span>}
                        </div>
                      </>
                    )}
                    {!selectedRuleUsesTextOptions && photoForm.image_url?.trim() && (
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
                        <span className="pb-1.5">{correctLabel}</span>
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
                    <Button type="button" variant="secondary" onClick={() => { setCreatingPhoto(false); setEditingPhotoId(null); setPhotoForm(emptyPhotoForm); }}>
                      Discard changes
                    </Button>
                  </div>
                  </>}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
