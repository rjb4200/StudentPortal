'use client';

import { type ReactNode } from 'react';
import { Button } from './button';

interface ProtectedEditorProps {
  title: string;
  description?: ReactNode;
  editing: boolean;
  saving?: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  editLabel?: string;
  saveLabel?: string;
  children: ReactNode;
}

export function ProtectedEditor({
  title,
  description,
  editing,
  saving = false,
  onEdit,
  onCancel,
  onSave,
  editLabel = 'Edit',
  saveLabel = 'Save changes',
  children,
}: ProtectedEditorProps) {
  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h4 className="font-semibold text-wfd-charcoal">{title}</h4>
          {description && <div className="mt-1 text-sm text-gray-500">{description}</div>}
        </div>
        {!editing && <Button type="button" size="sm" variant="secondary" onClick={onEdit}>{editLabel}</Button>}
      </div>
      {children}
      {editing && (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-200 pt-4">
          <Button type="button" onClick={onSave} loading={saving}>{saveLabel}</Button>
          <Button type="button" variant="secondary" onClick={onCancel} disabled={saving}>Discard changes</Button>
        </div>
      )}
    </div>
  );
}
