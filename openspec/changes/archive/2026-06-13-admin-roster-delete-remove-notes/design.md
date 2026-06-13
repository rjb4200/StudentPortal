## Context

The Student Roster in Daily Ops currently has 5 columns: Student, Status, No-Shows, Notes, Actions. The Notes column is an inline text input per row that has been underused. The Actions column only has a Blacklist toggle. Admins need a way to permanently delete students (e.g., test accounts, mistaken registrations).

## Goals / Non-Goals

**Goals:**
- Add Delete button to Actions column with 2-stage confirmation.
- Delete cascades to related tables via existing FK constraints.
- Attempt to clean up Supabase Auth user if one exists.
- Remove Notes column UI.

**Non-Goals:**
- Adding a recycle bin or soft-delete.
- Redesigning the Notes system (it will be re-added later).
- Affecting the `admin_notes` table or its data.
- Adding bulk delete.

## Decisions

### 1. 2-stage confirmation with `confirm()`, not a custom modal

Two sequential `confirm()` calls:
1. "Are you sure you want to permanently delete {full_name} ({email})? This will remove their student record, schedules, evaluations, and messages. This cannot be undone."
2. "FINAL WARNING: All data for {full_name} will be permanently deleted. Proceed?"

**Rationale:** Consistent with the existing Purge Data confirmation pattern in `maintenance-archive.tsx`. Simple, no new modal component needed.

### 2. Delete from `students` table with FK cascade

A single `DELETE FROM students WHERE id = student.id` removes the row and cascades to `schedules`, `evaluations`, `messages`, `admin_notes`, and `student_field_values` via existing `ON DELETE CASCADE` foreign keys.

**Rationale:** No need to delete from each child table individually. The schema already has cascade deletes.

**Before deleting from students:** Try `supabase.auth.admin.deleteUser(student.id)` to clean up the Supabase Auth user. Use the admin client (`createAdminClient`). Catch and ignore errors (auth user may not exist for pending students or students with mismatched IDs).

### 3. Notes column removed completely from render, not hidden

No `showNotes` toggle or conditional rendering. The column is removed from the table markup entirely.

**Rationale:** The user said "for now remove" — they want it gone, not toggled. The `admin_notes` table stays.

## Risks / Trade-offs

- **[Risk] Deleting a student with a mismatched auth user ID leaves an orphan auth account** → Mitigation: The admin client attempts `deleteUser`. If it fails (no such user or ID mismatch), it logs the error and continues with the cascade delete. Orphan cleanup is manual via Supabase dashboard.
- **[Risk] Accidental deletion of a real student** → Mitigation: 2-stage confirmation with the student's name and email clearly displayed in both prompts.

## Migration Plan

1. Add `handleDeleteStudent` function to DailyOps.
2. Add Delete button to Actions column.
3. Remove Notes column (th, td, state, function).
4. Run build and verify.

Rollback: Revert the file. No data is lost from the `admin_notes` table.
