## Why

Admins need the ability to permanently delete student records from the Admin Command Center. The current Student Roster only has a Blacklist toggle. Additionally, the inline Notes column in the roster is being removed — notes may return later in a different form, but the current inline text input per row is cluttered and underused.

## What Changes

- Add a Delete button to the Actions column of the Student Roster with 2-stage confirmation (warning modal → final warning modal).
- Delete cascades to schedules, evaluations, messages, and admin_notes via existing foreign key constraints.
- Attempt to delete the Supabase Auth user if one exists; fail silently if not.
- Remove the Notes column from the Student Roster table, including state variables (`noteText`, `notePriority`), the `handleAddNote` function, and the per-row notes form.
- Keep the `admin_notes` table intact — only the inline UI is removed.

## Capabilities

### New Capabilities
- `admin-roster-delete`: Admin ability to permanently delete student records from the Student Roster.

### Modified Capabilities
*(None — the Notes UI removal is a design change, not a requirement-level behavior change.)*

## Impact

- Modified: `src/components/admin/daily-ops.tsx` — remove Notes column, add Delete button + handler.
- No new files. No database changes. No migration.
