## Why

Several shared, student-facing configuration surfaces open directly into editable controls or persist changes with a single click. The MOU template is especially sensitive: an administrator can begin altering future legal agreements without first expressing edit intent, and the interface does not clearly expose save or discard actions.

The application needs a consistent accidental-change safeguard for shared configuration while preserving fast, deliberate workflows for routine operational work.

## What Changes

- Introduce a consistent protected-editing experience for persisted shared configuration: view by default, explicit edit intent, isolated draft changes, save, and discard.
- Apply the pattern to the MOU template and onboarding setup message and help-email settings.
- Make configuration forms for legal documents, quiz rules and options, registration fields, and resource-library entries enter editing only through explicit create or edit actions.
- Require explicit review before configuration reordering and activation-state changes are persisted.
- Preserve the existing behavior that MOU bodies are snapshotted when signed, and clearly communicate that template edits affect only newly created agreements.
- Keep routine operational inputs, such as filters, messages, notes, and normal record forms, outside this pattern unless they already require a higher-risk confirmation.

## Capabilities

### New Capabilities
- `protected-shared-configuration`: Consistent draft-based edit safeguards for shared, student-facing configuration and intentional persistence of order and activation changes.

### Modified Capabilities
- `class-mou-electronic-signature`: Protect MOU template editing and communicate its effect on future agreements.
- `admin-onboarding-setup-page`: Protect message and help-contact settings from accidental editing.
- `admin-configurable-legal-documents`: Require explicit edit intent and review for legal-document configuration changes.
- `admin-configurable-onboarding-quiz`: Require explicit edit intent and review for quiz configuration changes.
- `admin-configurable-registration-fields`: Require explicit edit intent and review for registration-field configuration changes.
- `admin-configurable-resource-library`: Require explicit edit intent and review for resource-library configuration changes.
- `sortable-list-reorder`: Require explicit persistence of reorder changes rather than writing on every move.

## Impact

- Affected UI: `MaintenanceArchive`, `/admin/setup`, and the legal, quiz, registration-field, resource-library, and shared sortable-list admin components.
- Affected data access: existing admin-only Supabase configuration writes; no schema change is required for the baseline safeguard.
- Existing completed MOU records and their snapshots remain unchanged.
