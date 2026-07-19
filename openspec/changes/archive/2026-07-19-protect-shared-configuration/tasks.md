## 1. Shared Protected Editing

- [x] 1.1 Add a reusable protected-editor UI primitive that provides read-only, editing, saving, and discarded-draft states with accessible controls.
- [x] 1.2 Add focused unit tests for explicit edit entry, local draft discard, successful save transition, and save-failure behavior.

## 2. MOU And Setup Settings

- [x] 2.1 Convert the MOU template configuration to the protected-editor pattern with explicit edit, save, and discard actions.
- [x] 2.2 Display MOU impact guidance that template changes apply only to future class MOUs and preserve signed snapshots.
- [x] 2.3 Convert welcome message, completion message, and help-email settings on `/admin/setup` to protected edit sessions.
- [x] 2.4 Add test coverage for MOU and onboarding setup drafts, save behavior, and cancellation.

## 3. Onboarding Content Configuration

- [x] 3.1 Convert legal-document create and edit workflows to explicit editing sessions while retaining existing validation and delete confirmation.
- [x] 3.2 Convert quiz rule and answer-option create and edit workflows to explicit editing sessions while retaining active-content validation.
- [x] 3.3 Convert registration-field create and edit workflows to explicit editing sessions and require deliberate activation-state persistence.
- [x] 3.4 Convert resource category and document create and edit workflows to explicit editing sessions while retaining upload behavior and delete confirmation.

## 4. Intentional Reordering

- [x] 4.1 Update `useSortableList` to stage item moves locally and expose save-order, discard-order, and pending-order state.
- [x] 4.2 Update shared reorder controls and each consuming configuration panel with visible save-order and discard-order actions.
- [x] 4.3 Add tests confirming reorder moves do not persist until saved, discard restores persisted order, and scoped lists retain their scope.

## 5. Validation And Release Checks

- [x] 5.1 Confirm all modified configuration surfaces default to read-only for existing records and preserve current admin authorization and validation behavior.
- [x] 5.2 Run `npm run test` and `npm run build`.
