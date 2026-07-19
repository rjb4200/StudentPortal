import { describe, expect, it } from 'vitest';
import { beginProtectedEdit, createProtectedDraft, discardProtectedDraft, saveProtectedDraft, updateProtectedDraft } from './protected-draft';

describe('protected drafts', () => {
  it('does not enter edit mode until explicitly started', () => {
    expect(createProtectedDraft('published')).toEqual({ editing: false, persisted: 'published', draft: 'published' });
  });

  it('discards local changes without changing the persisted value', () => {
    const editing = updateProtectedDraft(beginProtectedEdit(createProtectedDraft('published')), 'draft');
    expect(discardProtectedDraft(editing)).toEqual({ editing: false, persisted: 'published', draft: 'published' });
  });

  it('makes the draft the persisted value after a successful save', () => {
    const editing = updateProtectedDraft(beginProtectedEdit(createProtectedDraft('published')), 'updated');
    expect(saveProtectedDraft(editing)).toEqual({ editing: false, persisted: 'updated', draft: 'updated' });
  });

  it('keeps an edit session intact when a save is not completed', () => {
    const editing = updateProtectedDraft(beginProtectedEdit(createProtectedDraft('published')), 'draft');
    expect(editing).toEqual({ editing: true, persisted: 'published', draft: 'draft' });
  });
});
