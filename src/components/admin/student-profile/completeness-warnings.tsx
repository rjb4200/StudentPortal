'use client';

import { Alert } from '@/components/ui';

interface CompletenessWarningsProps {
  warnings: string[];
}

export function CompletenessWarnings({ warnings }: CompletenessWarningsProps) {
  if (warnings.length === 0) return null;

  return (
    <Alert title="Data Completeness Warnings" tone="warning">
      <div className="flex items-center gap-2 mb-2">
        <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <ul className="space-y-1">
        {warnings.map((warning, i) => (
          <li key={i} className="text-sm text-amber-700 flex items-start gap-2">
            <span className="text-amber-500 mt-0.5 flex-shrink-0">•</span>
            {warning}
          </li>
        ))}
      </ul>
    </Alert>
  );
}
