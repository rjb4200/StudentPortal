## Context

The admin interface manages content that appears immediately to students, including legal documents, onboarding rules, registration fields, resource documents, messages, help contact information, and the future MOU template. Today, some of these surfaces are editable as soon as they render and the shared reorder control writes every arrow-click directly to Supabase.

The existing system already distinguishes destructive operations through confirmation dialogs and protects signed MOU instances with an immutable body snapshot. This change addresses accidental mutation of *shared configuration*, not authorization: existing RLS policies remain the access boundary.

## Goals / Non-Goals

**Goals:**
- Make shared configuration read-only until the administrator intentionally starts an edit session.
- Keep unsaved edits local to the browser and make save and discard actions unambiguous.
- Give administrators useful impact context before publishing student-facing changes.
- Prevent reorder and activation controls from persisting immediately.
- Apply one visual and behavioral pattern across the identified configuration areas.
- Preserve current database models and completed MOU snapshots.

**Non-Goals:**
- Introduce approvals, multi-person review, draft records, content versioning, or rollback history.
- Change existing admin authorization or RLS policies.
- Put filters, temporary notes, broadcasts, routine registry forms, or other intentionally fast operational interactions behind an edit lock.
- Redesign destructive account, purge, or schedule-cancellation confirmations.

## Decisions

### Reusable protected editor with local drafts

Create a small shared client-side protected-editor primitive that owns whether a configuration section is in viewing or editing state. It will render a read-only view initially, expose an explicit edit action, and provide save and cancel actions only while editing. The consuming component retains its data loading, validation, and persistence logic; the primitive avoids a broad form-framework rewrite.

This is preferred over adding `readOnly` flags separately to each input because it keeps the transition, action labels, keyboard behavior, and discard semantics consistent. It is preferred over server-persisted drafts because no collaborative or approval workflow is currently needed.

### Scope the pattern to shared, student-facing configuration

Adopt the protected editor for MOU template settings, welcome and completion messages, help email, legal documents, quiz rules and options, registration fields, and resource categories and documents. New records require an explicit create action; existing records require an explicit edit action.

The baseline view must display enough content to identify the active configuration without exposing editable fields. Edit controls must have accessible names, and save/cancel controls must be keyboard accessible.

### Explain publication impact where it matters

The MOU editor will state that it affects future agreements only and that signed MOU snapshots remain unchanged. Onboarding content editors will state that saved active content appears in future student flows. Activation/deactivation actions will state their student-facing effect before persistence.

This is preferred over typed confirmations for every save: content configuration is frequently maintained, and explicit edit intent plus a local draft provides a practical safety boundary. Existing destructive-action confirmations remain unchanged.

### Stage reorder changes and make publication explicit

Extend the shared sortable-list behavior to maintain reordered items locally during a reorder session. A user must explicitly save the new order or discard it. Loading errors and failed saves must leave the persisted order intact and present an error without falsely reporting success.

This replaces immediate persistence on arrow clicks. It prevents accidental writes while retaining the existing ordering algorithm and scoped-list behavior.

### Retain current persistence and authorization model

The implementation continues to use the existing admin-only Supabase tables and APIs. No migration is required because the safety model is an interaction boundary, not a new stored state. Existing save validations remain enforced, including quiz activation validation and permanent registration-field constraints.

## Risks / Trade-offs

- [Users expect an arrow click to reorder immediately] → Clearly label the reorder session and provide `Save order` and `Discard order` actions with a visible unsaved-change indicator.
- [Local drafts can be lost on navigation] → Warn before closing or navigating away from an editing section with unsaved changes when practical; cancellation must always restore the loaded value.
- [A generic component could obscure each form's business rules] → Keep validation and database writes in each existing configuration component; centralize only edit-state mechanics and shared presentation.
- [Concurrent administrators can overwrite one another] → The baseline change does not solve concurrent editing; reload after save and leave versioning or optimistic concurrency as a later enhancement.
- [Locking too much slows operational work] → Limit adoption to shared configuration named in this proposal and preserve existing high-risk confirmation workflows.

## Migration Plan

1. Add the reusable protected-editor behavior and focused tests.
2. Convert MOU settings and setup-page settings first, verifying read-only default, save, cancel, and MOU snapshot messaging.
3. Convert the onboarding configuration panels and stage reordering.
4. Run unit tests and the production build.
5. Rollback is a code rollback only; no data migration or transformed stored data is involved.

## Open Questions

- Whether unsaved edit sessions should block page navigation in the initial release or rely on visible cancel controls.
- Whether legal-document changes later need immutable version history tied to individual acceptance records.
- Whether a future release should add revision metadata and audit entries for all configuration publishes.
